export type ProfileRole = 'brand' | 'leader' | 'member'

export type OpportunityStatus =
  | 'Draft'
  | 'Open'
  | 'Partially Claimed'
  | 'Fully Claimed'
  | 'Preparation'
  | 'Live'
  | 'Completion Review'
  | 'Completed'

export type CommunityCampaignStatus =
  | 'Draft'
  | 'Preparation'
  | 'Ready'
  | 'Live'
  | 'Completion Review'
  | 'Completed'

export type ContentStatus = 'Assigned' | 'In Progress' | 'Published' | 'Recorded' | 'Validated' | 'Counted'
export type RewardStatus = 'Pending' | 'Approved' | 'Completed'

export interface BrandProfile {
  id: string
  name: string
  initials: string
  website: string
  industry: string
  location: string
  description: string
  contactName: string
  contactEmail: string
}

export interface Product {
  id: string
  name: string
  category: string
  description: string
  keyBenefits: string[]
  usage: string
  productUrl: string
  active: boolean
}

export interface Community {
  id: string
  name: string
  initials: string
  leaderId: string
  leaderName: string
  leaderType: 'Internal' | 'External'
  verifiedSize: number
  location: string
  description: string
}

export interface CommunityMember {
  id: string
  communityId: string
  name: string
  initials: string
  handle: string
  platform: string
  joinedAt: string
  newlyRecruited: boolean
  active: boolean
}

export interface PreparationChecklist {
  membersActivated: boolean
  productAssignmentsReady: boolean
  instructionsPublished: boolean
  contentThemesPrepared: boolean
  monitoringReady: boolean
  readyToLaunch: boolean
}

export interface CampaignOpportunity {
  id: string
  name: string
  productId: string
  platform: string
  objective: string
  preparationDays: number
  liveDays: number
  preparationStart: string
  preparationEnd: string
  liveStart: string
  liveEnd: string
  requiredContent: number
  totalBudget: number
  priorityMessages: string[]
  contentDirection: string
  hashtags: string[]
  mentions: string[]
  status: OpportunityStatus
  createdAt: string
  postedAt?: string
  secondaryViews: number
  secondaryEngagement: number
}

export interface CommunityClaim {
  id: string
  opportunityId: string
  communityId: string
  leaderId: string
  contentQuota: number
  budgetAllocation: number
  claimedAt: string
}

export interface CommunityCampaign {
  id: string
  claimId: string
  opportunityId: string
  communityId: string
  title: string
  themes: string[]
  instructions: string
  memberRequirements: string
  deadline: string
  contentQuota: number
  rewardBudget: number
  status: CommunityCampaignStatus
  preparation: PreparationChecklist
  createdAt: string
}

export interface MemberAssignment {
  id: string
  communityCampaignId: string
  memberId: string
  requiredContent: number
  accepted: boolean
  assignedAt: string
}

export interface ContentRecord {
  id: string
  opportunityId: string
  communityCampaignId: string
  assignmentId: string
  memberId: string
  slot: number
  status: ContentStatus
  publishedUrl?: string
  publishedAt?: string
  recordedAt?: string
  validatedAt?: string
  countedAt?: string
  views: number
  engagement: number
}

export interface MemberReward {
  id: string
  communityCampaignId: string
  assignmentId: string
  memberId: string
  amount: number
  status: RewardStatus
}

export interface ActivityEvent {
  id: string
  role: ProfileRole | 'system'
  title: string
  detail: string
  timestamp: string
  opportunityId?: string
  communityCampaignId?: string
}

export interface Notification {
  id: string
  role: ProfileRole
  title: string
  detail: string
  time: string
  read: boolean
}

export interface OpportunityDraft {
  step: number
  name: string
  productId: string
  platform: string
  objective: string
  preparationDays: number
  liveDays: number
  preparationStart: string
  preparationEnd: string
  liveStart: string
  liveEnd: string
  requiredContent: number
  totalBudget: number
  priorityMessages: string[]
  contentDirection: string
  hashtags: string[]
  mentions: string[]
}

export interface AppState {
  version: number
  activeRole: ProfileRole
  activeLeaderId: string
  activeMemberId: string
  brand: BrandProfile
  products: Product[]
  communities: Community[]
  members: CommunityMember[]
  opportunities: CampaignOpportunity[]
  claims: CommunityClaim[]
  communityCampaigns: CommunityCampaign[]
  assignments: MemberAssignment[]
  contents: ContentRecord[]
  rewards: MemberReward[]
  activity: ActivityEvent[]
  notifications: Notification[]
  opportunityDraft: OpportunityDraft
}

export interface AllocationPreview {
  contentQuota: number
  budgetAllocation: number
  remainingContentBeforeClaim: number
  remainingBudgetBeforeClaim: number
  verifiedSize: number
  totalVerifiedSize: number
}

export interface ContentMetrics {
  required: number
  allocated: number
  published: number
  recorded: number
  validated: number
  counted: number
  remaining: number
  completionPercentage: number
}
