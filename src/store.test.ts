import { describe, expect, it } from 'vitest'
import { emptyOpportunityDraft, initialState } from './data'
import { appReducer, calculateAllocation, getOpportunityMetrics } from './store'

function freshState() {
  return structuredClone(initialState)
}

describe('OkPo community campaign marketplace', () => {
  it('seeds all three profiles, realistic active data, and verified communities', () => {
    expect(initialState.activeRole).toBe('brand')
    expect(initialState.communities.map((item) => item.verifiedSize)).toEqual([150, 100, 50])
    expect(initialState.opportunities.some((item) => item.status === 'Live')).toBe(true)
    expect(initialState.opportunities.some((item) => item.status === 'Completed')).toBe(true)
    expect(initialState.contents.length).toBeGreaterThan(300)
  })

  it('allocates the 300-content and ₱150,000 example proportionally in whole numbers', () => {
    const state = freshState()
    state.claims = state.claims.filter((item) => item.opportunityId !== 'opportunity-real-skin')
    state.opportunities = state.opportunities.map((item) => item.id === 'opportunity-real-skin' ? { ...item, status: 'Open' } : item)
    expect(calculateAllocation(state, 'opportunity-real-skin', 'community-skintok')).toMatchObject({ contentQuota: 150, budgetAllocation: 75000 })
    expect(calculateAllocation(state, 'opportunity-real-skin', 'community-glow')).toMatchObject({ contentQuota: 100, budgetAllocation: 50000 })
    expect(calculateAllocation(state, 'opportunity-real-skin', 'community-campus')).toMatchObject({ contentQuota: 50, budgetAllocation: 25000 })
  })

  it('caps an allocation at remaining content and budget without over-allocation', () => {
    const state = freshState()
    state.claims = state.claims.filter((item) => item.opportunityId !== 'opportunity-real-skin')
    state.claims.push({ id: 'near-capacity', opportunityId: 'opportunity-real-skin', communityId: 'community-glow', leaderId: 'leader-nico', contentQuota: 290, budgetAllocation: 145000, claimedAt: 'Now' })
    expect(calculateAllocation(state, 'opportunity-real-skin', 'community-skintok')).toMatchObject({
      contentQuota: 10,
      budgetAllocation: 5000,
      remainingContentBeforeClaim: 10,
      remainingBudgetBeforeClaim: 5000,
    })
  })

  it('confirms a Community Leader claim immediately and updates campaign capacity', () => {
    const before = freshState()
    const after = appReducer(before, { type: 'CLAIM_OPPORTUNITY', opportunityId: 'opportunity-barrier-reset', communityId: 'community-skintok' })
    const claim = after.claims.find((item) => item.opportunityId === 'opportunity-barrier-reset' && item.communityId === 'community-skintok')
    expect(claim).toMatchObject({ contentQuota: 60, budgetAllocation: 60000 })
    expect(after.opportunities.find((item) => item.id === 'opportunity-barrier-reset')?.status).toBe('Partially Claimed')
    expect(after.activity[0].title).toBe('Allocation created automatically')
  })

  it('allows community campaigns within allocation and blocks excess quota or budget', () => {
    const state = freshState()
    const payload = {
      claimId: 'claim-sun-skintok', opportunityId: 'opportunity-daily-defense', communityId: 'community-skintok',
      title: 'Sun Smart Stories', themes: ['Morning routine'], instructions: 'Publish a routine.',
      memberRequirements: 'One public video.', deadline: '2026-09-10', contentQuota: 20, rewardBudget: 20000,
    }
    const valid = appReducer(state, { type: 'CREATE_COMMUNITY_CAMPAIGN', payload })
    expect(valid.communityCampaigns).toHaveLength(state.communityCampaigns.length + 1)
    const excessive = appReducer(state, { type: 'CREATE_COMMUNITY_CAMPAIGN', payload: { ...payload, contentQuota: 31, rewardBudget: 31000 } })
    expect(excessive.communityCampaigns).toHaveLength(state.communityCampaigns.length)
    const outsideTimeline = appReducer(state, { type: 'CREATE_COMMUNITY_CAMPAIGN', payload: { ...payload, deadline: '2026-10-01' } })
    expect(outsideTimeline.communityCampaigns).toHaveLength(state.communityCampaigns.length)
  })

  it('creates assignments, content slots, and a reward without exceeding campaign quota', () => {
    const state = freshState()
    const after = appReducer(state, { type: 'ASSIGN_MEMBER', communityCampaignId: 'cc-sun-prep', memberId: 'member-maya', requiredContent: 2 })
    const assignment = after.assignments.find((item) => item.communityCampaignId === 'cc-sun-prep' && item.memberId === 'member-maya')
    expect(assignment?.requiredContent).toBe(2)
    expect(after.contents.filter((item) => item.assignmentId === assignment?.id)).toHaveLength(2)
    expect(after.rewards.some((item) => item.assignmentId === assignment?.id)).toBe(true)
  })

  it('records and validates published content so it contributes to Brand fulfillment', () => {
    const state = freshState()
    const target = state.contents.find((item) => item.memberId === 'member-maya' && item.status === 'Published')!
    const before = getOpportunityMetrics(state, target.opportunityId).counted
    const recorded = appReducer(state, { type: 'RECORD_CONTENT', contentId: target.id, publishedUrl: 'https://tiktok.com/@mayareyes/video/demo' })
    expect(recorded.contents.find((item) => item.id === target.id)?.status).toBe('Recorded')
    const counted = appReducer(recorded, { type: 'VALIDATE_AND_COUNT_CONTENT', contentId: target.id })
    expect(counted.contents.find((item) => item.id === target.id)?.status).toBe('Counted')
    expect(getOpportunityMetrics(counted, target.opportunityId).counted).toBe(before + 1)
  })

  it('creates draft and posted opportunities from the Brand wizard', () => {
    const state = appReducer(freshState(), { type: 'SAVE_OPPORTUNITY_DRAFT', draft: { ...emptyOpportunityDraft, name: 'Creator Evidence Week' } })
    const draft = appReducer(state, { type: 'CREATE_OPPORTUNITY', mode: 'draft' })
    expect(draft.opportunities[0]).toMatchObject({ name: 'Creator Evidence Week', status: 'Draft' })
    const posted = appReducer(state, { type: 'CREATE_OPPORTUNITY', mode: 'post' })
    expect(posted.opportunities[0]).toMatchObject({ name: 'Creator Evidence Week', status: 'Open' })
  })

  it('resets all interactions to the deterministic seed', () => {
    const changed = appReducer(freshState(), { type: 'SET_ROLE', role: 'member' })
    expect(appReducer(changed, { type: 'RESET_DEMO' })).toEqual(initialState)
  })
})
