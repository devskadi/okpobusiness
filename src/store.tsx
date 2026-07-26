/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { emptyOpportunityDraft, initialState } from './data'
import type {
  AllocationPreview,
  AppState,
  BrandProfile,
  Community,
  CommunityCampaign,
  CommunityCampaignStatus,
  ContentMetrics,
  OpportunityDraft,
  Product,
  ProfileRole,
  RewardStatus,
} from './types'

const STORAGE_KEY = 'okpo-community-marketplace-v3'
const statusOrder: CommunityCampaignStatus[] = ['Draft', 'Preparation', 'Ready', 'Live', 'Completion Review', 'Completed']

export type AppAction =
  | { type: 'SET_ROLE'; role: ProfileRole }
  | { type: 'UPDATE_BRAND'; brand: BrandProfile }
  | { type: 'UPSERT_PRODUCT'; product: Product }
  | { type: 'SAVE_OPPORTUNITY_DRAFT'; draft: OpportunityDraft }
  | { type: 'CREATE_OPPORTUNITY'; mode: 'draft' | 'post' }
  | { type: 'POST_OPPORTUNITY'; opportunityId: string }
  | { type: 'CLAIM_OPPORTUNITY'; opportunityId: string; communityId: string }
  | { type: 'UPDATE_COMMUNITY'; community: Community }
  | { type: 'CREATE_COMMUNITY_CAMPAIGN'; payload: Omit<CommunityCampaign, 'id' | 'status' | 'preparation' | 'createdAt'> }
  | { type: 'ADVANCE_COMMUNITY_CAMPAIGN'; communityCampaignId: string }
  | { type: 'TOGGLE_PREPARATION'; communityCampaignId: string; key: keyof CommunityCampaign['preparation'] }
  | { type: 'SET_MEMBER_ACTIVE'; memberId: string; active: boolean; newlyRecruited?: boolean }
  | { type: 'ASSIGN_MEMBER'; communityCampaignId: string; memberId: string; requiredContent: number }
  | { type: 'ACCEPT_ASSIGNMENT'; assignmentId: string }
  | { type: 'START_CONTENT'; contentId: string }
  | { type: 'MARK_CONTENT_PUBLISHED'; contentId: string }
  | { type: 'RECORD_CONTENT'; contentId: string; publishedUrl: string }
  | { type: 'VALIDATE_AND_COUNT_CONTENT'; contentId: string }
  | { type: 'SET_REWARD_STATUS'; rewardId: string; status: RewardStatus }
  | { type: 'RESET_DEMO' }

function nowId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function activity(state: AppState, event: AppState['activity'][number]): AppState['activity'] {
  return [{ ...event, id: nowId('activity'), timestamp: 'Just now' }, ...state.activity]
}

function allocateWhole(total: number, weights: number[], tieKeys: string[]) {
  const weightTotal = weights.reduce((sum, value) => sum + value, 0)
  if (total <= 0 || weightTotal <= 0) return weights.map(() => 0)
  const raw = weights.map((weight) => total * weight / weightTotal)
  const base = raw.map(Math.floor)
  let remainder = total - base.reduce((sum, value) => sum + value, 0)
  const priority = raw
    .map((value, index) => ({ index, fraction: value - base[index], key: tieKeys[index] }))
    .sort((a, b) => b.fraction - a.fraction || a.key.localeCompare(b.key))
  for (let index = 0; index < remainder; index += 1) base[priority[index % priority.length].index] += 1
  remainder = 0
  return base
}

export function calculateAllocation(state: AppState, opportunityId: string, communityId: string): AllocationPreview {
  const opportunity = state.opportunities.find((item) => item.id === opportunityId)
  const community = state.communities.find((item) => item.id === communityId)
  if (!opportunity || !community) {
    return { contentQuota: 0, budgetAllocation: 0, remainingContentBeforeClaim: 0, remainingBudgetBeforeClaim: 0, verifiedSize: 0, totalVerifiedSize: 0 }
  }
  const orderedCommunities = [...state.communities].sort((a, b) => a.id.localeCompare(b.id))
  const weights = orderedCommunities.map((item) => item.verifiedSize)
  const keys = orderedCommunities.map((item) => item.id)
  const plannedQuotas = allocateWhole(opportunity.requiredContent, weights, keys)
  const plannedBudgets = allocateWhole(opportunity.totalBudget, plannedQuotas, keys)
  const targetIndex = orderedCommunities.findIndex((item) => item.id === communityId)
  const existingClaims = state.claims.filter((item) => item.opportunityId === opportunityId)
  const remainingContent = Math.max(0, opportunity.requiredContent - existingClaims.reduce((sum, item) => sum + item.contentQuota, 0))
  const remainingBudget = Math.max(0, opportunity.totalBudget - existingClaims.reduce((sum, item) => sum + item.budgetAllocation, 0))
  return {
    contentQuota: Math.min(plannedQuotas[targetIndex] ?? 0, remainingContent),
    budgetAllocation: Math.min(plannedBudgets[targetIndex] ?? 0, remainingBudget),
    remainingContentBeforeClaim: remainingContent,
    remainingBudgetBeforeClaim: remainingBudget,
    verifiedSize: community.verifiedSize,
    totalVerifiedSize: weights.reduce((sum, value) => sum + value, 0),
  }
}

export function getOpportunityMetrics(state: AppState, opportunityId: string): ContentMetrics {
  const opportunity = state.opportunities.find((item) => item.id === opportunityId)
  if (!opportunity) return { required: 0, allocated: 0, published: 0, recorded: 0, validated: 0, counted: 0, remaining: 0, completionPercentage: 0 }
  const claims = state.claims.filter((item) => item.opportunityId === opportunityId)
  const content = state.contents.filter((item) => item.opportunityId === opportunityId)
  const atLeast = (statuses: string[]) => content.filter((item) => statuses.includes(item.status)).length
  const counted = atLeast(['Counted'])
  return {
    required: opportunity.requiredContent,
    allocated: claims.reduce((sum, item) => sum + item.contentQuota, 0),
    published: atLeast(['Published', 'Recorded', 'Validated', 'Counted']),
    recorded: atLeast(['Recorded', 'Validated', 'Counted']),
    validated: atLeast(['Validated', 'Counted']),
    counted,
    remaining: Math.max(0, opportunity.requiredContent - counted),
    completionPercentage: opportunity.requiredContent ? Math.round(counted / opportunity.requiredContent * 100) : 0,
  }
}

export function getCommunityCampaignMetrics(state: AppState, communityCampaignId: string) {
  const campaign = state.communityCampaigns.find((item) => item.id === communityCampaignId)
  const content = state.contents.filter((item) => item.communityCampaignId === communityCampaignId)
  const counted = content.filter((item) => item.status === 'Counted').length
  const recorded = content.filter((item) => ['Recorded', 'Validated', 'Counted'].includes(item.status)).length
  const assigned = state.assignments.filter((item) => item.communityCampaignId === communityCampaignId)
  return {
    required: campaign?.contentQuota ?? 0,
    assigned: assigned.reduce((sum, item) => sum + item.requiredContent, 0),
    recorded,
    counted,
    remaining: Math.max(0, (campaign?.contentQuota ?? 0) - counted),
    completionPercentage: campaign?.contentQuota ? Math.round(counted / campaign.contentQuota * 100) : 0,
    members: new Set(assigned.map((item) => item.memberId)).size,
  }
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, activeRole: action.role }
    case 'UPDATE_BRAND':
      return { ...state, brand: action.brand }
    case 'UPSERT_PRODUCT': {
      const exists = state.products.some((item) => item.id === action.product.id)
      return { ...state, products: exists ? state.products.map((item) => item.id === action.product.id ? action.product : item) : [action.product, ...state.products] }
    }
    case 'SAVE_OPPORTUNITY_DRAFT':
      return { ...state, opportunityDraft: action.draft }
    case 'CREATE_OPPORTUNITY': {
      const draft = state.opportunityDraft
      const opportunityId = nowId('opportunity')
      const opportunity = {
        id: opportunityId,
        name: draft.name || 'Untitled campaign',
        productId: draft.productId,
        platform: draft.platform,
        objective: draft.objective,
        preparationDays: draft.preparationDays,
        liveDays: draft.liveDays,
        preparationStart: draft.preparationStart,
        preparationEnd: draft.preparationEnd,
        liveStart: draft.liveStart,
        liveEnd: draft.liveEnd,
        requiredContent: draft.requiredContent,
        totalBudget: draft.totalBudget,
        priorityMessages: draft.priorityMessages,
        contentDirection: draft.contentDirection,
        hashtags: draft.hashtags,
        mentions: draft.mentions,
        status: action.mode === 'post' ? 'Open' as const : 'Draft' as const,
        createdAt: 'Today',
        postedAt: action.mode === 'post' ? 'Just now' : undefined,
        secondaryViews: 0,
        secondaryEngagement: 0,
      }
      return {
        ...state,
        opportunities: [opportunity, ...state.opportunities],
        opportunityDraft: emptyOpportunityDraft,
        activity: activity(state, { id: '', role: 'brand', title: action.mode === 'post' ? 'Campaign posted' : 'Draft saved', detail: opportunity.name, timestamp: '', opportunityId }),
      }
    }
    case 'POST_OPPORTUNITY':
      return {
        ...state,
        opportunities: state.opportunities.map((item) => item.id === action.opportunityId && item.status === 'Draft' ? { ...item, status: 'Open', postedAt: 'Just now' } : item),
        activity: activity(state, { id: '', role: 'brand', title: 'Campaign posted', detail: 'Community Leaders can now claim an automatic allocation.', timestamp: '', opportunityId: action.opportunityId }),
      }
    case 'CLAIM_OPPORTUNITY': {
      const opportunity = state.opportunities.find((item) => item.id === action.opportunityId)
      const community = state.communities.find((item) => item.id === action.communityId)
      const alreadyClaimed = state.claims.some((item) => item.opportunityId === action.opportunityId && item.communityId === action.communityId)
      if (!opportunity || !community || alreadyClaimed || !['Open', 'Partially Claimed'].includes(opportunity.status)) return state
      const preview = calculateAllocation(state, action.opportunityId, action.communityId)
      if (preview.contentQuota <= 0 || preview.budgetAllocation <= 0) return state
      const claim = {
        id: nowId('claim'), opportunityId: opportunity.id, communityId: community.id, leaderId: community.leaderId,
        contentQuota: preview.contentQuota, budgetAllocation: preview.budgetAllocation, claimedAt: 'Just now',
      }
      const allocatedAfter = opportunity.requiredContent - preview.remainingContentBeforeClaim + preview.contentQuota
      const status = allocatedAfter >= opportunity.requiredContent ? 'Fully Claimed' as const : 'Partially Claimed' as const
      return {
        ...state,
        claims: [...state.claims, claim],
        opportunities: state.opportunities.map((item) => item.id === opportunity.id ? { ...item, status } : item),
        activity: activity(state, { id: '', role: 'system', title: 'Allocation created automatically', detail: `${community.name} received ${preview.contentQuota} contents and ${formatCurrency(preview.budgetAllocation)} immediately.`, timestamp: '', opportunityId: opportunity.id }),
        notifications: [{ id: nowId('note'), role: 'leader', title: 'Claim confirmed', detail: `${preview.contentQuota} contents · ${formatCurrency(preview.budgetAllocation)}`, time: 'Just now', read: false }, ...state.notifications],
      }
    }
    case 'UPDATE_COMMUNITY':
      return { ...state, communities: state.communities.map((item) => item.id === action.community.id ? action.community : item) }
    case 'CREATE_COMMUNITY_CAMPAIGN': {
      const claim = state.claims.find((item) => item.id === action.payload.claimId)
      const opportunity = state.opportunities.find((item) => item.id === action.payload.opportunityId)
      if (!claim || !opportunity || action.payload.deadline < opportunity.liveStart || action.payload.deadline > opportunity.liveEnd) return state
      const existing = state.communityCampaigns.filter((item) => item.claimId === claim.id)
      const contentUsed = existing.reduce((sum, item) => sum + item.contentQuota, 0)
      const budgetUsed = existing.reduce((sum, item) => sum + item.rewardBudget, 0)
      if (action.payload.contentQuota <= 0 || action.payload.rewardBudget < 0 || contentUsed + action.payload.contentQuota > claim.contentQuota || budgetUsed + action.payload.rewardBudget > claim.budgetAllocation) return state
      const campaign: CommunityCampaign = {
        ...action.payload,
        id: nowId('community-campaign'),
        status: 'Draft',
        preparation: { membersActivated: false, productAssignmentsReady: false, instructionsPublished: false, contentThemesPrepared: false, monitoringReady: false, readyToLaunch: false },
        createdAt: 'Today',
      }
      return { ...state, communityCampaigns: [campaign, ...state.communityCampaigns], activity: activity(state, { id: '', role: 'leader', title: 'Promotion created', detail: `${campaign.title} reserves ${campaign.contentQuota} contents and ${formatCurrency(campaign.rewardBudget)}.`, timestamp: '', opportunityId: campaign.opportunityId, communityCampaignId: campaign.id }) }
    }
    case 'ADVANCE_COMMUNITY_CAMPAIGN': {
      const target = state.communityCampaigns.find((item) => item.id === action.communityCampaignId)
      if (!target) return state
      const index = statusOrder.indexOf(target.status)
      if (index < 0 || index === statusOrder.length - 1) return state
      const next = statusOrder[index + 1]
      return { ...state, communityCampaigns: state.communityCampaigns.map((item) => item.id === target.id ? { ...item, status: next } : item), activity: activity(state, { id: '', role: 'leader', title: `Promotion moved to ${next}`, detail: target.title, timestamp: '', opportunityId: target.opportunityId, communityCampaignId: target.id }) }
    }
    case 'TOGGLE_PREPARATION': {
      return { ...state, communityCampaigns: state.communityCampaigns.map((item) => {
        if (item.id !== action.communityCampaignId) return item
        const preparation = { ...item.preparation, [action.key]: !item.preparation[action.key] }
        const allReady = Object.values(preparation).every(Boolean)
        return { ...item, preparation, status: allReady && item.status === 'Preparation' ? 'Ready' : item.status }
      }) }
    }
    case 'SET_MEMBER_ACTIVE':
      return { ...state, members: state.members.map((item) => item.id === action.memberId ? { ...item, active: action.active, newlyRecruited: action.newlyRecruited ?? item.newlyRecruited } : item) }
    case 'ASSIGN_MEMBER': {
      const campaign = state.communityCampaigns.find((item) => item.id === action.communityCampaignId)
      const member = state.members.find((item) => item.id === action.memberId)
      if (!campaign || !member || member.communityId !== campaign.communityId || action.requiredContent <= 0) return state
      const assigned = state.assignments.filter((item) => item.communityCampaignId === campaign.id).reduce((sum, item) => sum + item.requiredContent, 0)
      if (assigned + action.requiredContent > campaign.contentQuota) return state
      const assignmentId = nowId('assignment')
      const assignment = { id: assignmentId, communityCampaignId: campaign.id, memberId: member.id, requiredContent: action.requiredContent, accepted: false, assignedAt: 'Just now' }
      const newContents = Array.from({ length: action.requiredContent }, (_, index) => ({
        id: `${assignmentId}-content-${index + 1}`, opportunityId: campaign.opportunityId, communityCampaignId: campaign.id,
        assignmentId, memberId: member.id, slot: index + 1, status: 'Assigned' as const, views: 0, engagement: 0,
      }))
      const rewardAmount = Math.round(campaign.rewardBudget * action.requiredContent / campaign.contentQuota)
      return {
        ...state,
        assignments: [...state.assignments, assignment],
        contents: [...state.contents, ...newContents],
        rewards: [...state.rewards, { id: nowId('reward'), communityCampaignId: campaign.id, assignmentId, memberId: member.id, amount: rewardAmount, status: 'Pending' }],
        activity: activity(state, { id: '', role: 'leader', title: 'Member assigned', detail: `${member.name} received ${action.requiredContent} content requirement${action.requiredContent === 1 ? '' : 's'}.`, timestamp: '', opportunityId: campaign.opportunityId, communityCampaignId: campaign.id }),
      }
    }
    case 'ACCEPT_ASSIGNMENT':
      return { ...state, assignments: state.assignments.map((item) => item.id === action.assignmentId ? { ...item, accepted: true } : item) }
    case 'START_CONTENT':
      return { ...state, contents: state.contents.map((item) => item.id === action.contentId && item.status === 'Assigned' ? { ...item, status: 'In Progress' } : item) }
    case 'MARK_CONTENT_PUBLISHED':
      return { ...state, contents: state.contents.map((item) => item.id === action.contentId && ['Assigned', 'In Progress'].includes(item.status) ? { ...item, status: 'Published', publishedAt: 'Today' } : item) }
    case 'RECORD_CONTENT': {
      const target = state.contents.find((item) => item.id === action.contentId)
      if (!target || !action.publishedUrl.trim() || !['Published', 'In Progress', 'Assigned'].includes(target.status)) return state
      const member = state.members.find((item) => item.id === target.memberId)
      return {
        ...state,
        contents: state.contents.map((item) => item.id === target.id ? { ...item, status: 'Recorded', publishedUrl: action.publishedUrl.trim(), publishedAt: item.publishedAt ?? 'Today', recordedAt: 'Just now' } : item),
        activity: activity(state, { id: '', role: 'member', title: 'Published content recorded', detail: `${member?.name ?? 'A member'} added a public content link.`, timestamp: '', opportunityId: target.opportunityId, communityCampaignId: target.communityCampaignId }),
      }
    }
    case 'VALIDATE_AND_COUNT_CONTENT': {
      const target = state.contents.find((item) => item.id === action.contentId)
      if (!target || !['Recorded', 'Validated'].includes(target.status)) return state
      return {
        ...state,
        contents: state.contents.map((item) => item.id === target.id ? { ...item, status: 'Counted', validatedAt: 'Just now', countedAt: 'Just now' } : item),
        activity: activity(state, { id: '', role: 'leader', title: 'Content validated and counted', detail: 'The recorded post now contributes to the Brand commitment.', timestamp: '', opportunityId: target.opportunityId, communityCampaignId: target.communityCampaignId }),
      }
    }
    case 'SET_REWARD_STATUS':
      return { ...state, rewards: state.rewards.map((item) => item.id === action.rewardId ? { ...item, status: action.status } : item) }
    case 'RESET_DEMO':
      return initialState
    default:
      return state
  }
}

function loadState(): AppState {
  if (typeof window === 'undefined') return initialState
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    const parsed = JSON.parse(raw) as AppState
    return parsed.version === initialState.version ? parsed : initialState
  } catch {
    return initialState
  }
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value)
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-PH', { notation: value >= 100000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(value)
}

export function formatDate(value: string) {
  if (!value) return 'Not set'
  const parsed = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }).format(parsed)
}

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  getOpportunity: (id: string | undefined) => AppState['opportunities'][number] | undefined
  getCommunityCampaign: (id: string | undefined) => CommunityCampaign | undefined
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadState)
  useEffect(() => { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }, [state])
  const value = useMemo(() => ({
    state,
    dispatch,
    getOpportunity: (id: string | undefined) => state.opportunities.find((item) => item.id === id),
    getCommunityCampaign: (id: string | undefined) => state.communityCampaigns.find((item) => item.id === id),
  }), [state])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
