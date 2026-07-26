import type {
  AppState,
  CampaignOpportunity,
  Community,
  CommunityCampaign,
  CommunityClaim,
  CommunityMember,
  ContentRecord,
  ContentStatus,
  MemberAssignment,
  MemberReward,
  OpportunityDraft,
  Product,
} from './types'

export const emptyOpportunityDraft: OpportunityDraft = {
  step: 1,
  name: '',
  productId: 'product-niacinamide',
  platform: 'TikTok',
  objective: 'Published content volume',
  preparationDays: 14,
  liveDays: 45,
  preparationStart: '2026-09-01',
  preparationEnd: '2026-09-14',
  liveStart: '2026-09-15',
  liveEnd: '2026-10-29',
  requiredContent: 300,
  totalBudget: 150000,
  priorityMessages: ['Gentle enough for an everyday routine', 'Designed for healthy-looking, hydrated skin'],
  contentDirection: 'Show the product in a real skincare routine. Keep the story personal, useful, and grounded in your own experience.',
  hashtags: ['#Dermorepubliq', '#RealSkinRealRoutine'],
  mentions: ['@dermorepubliq'],
}

export const products: Product[] = [
  {
    id: 'product-niacinamide',
    name: '1% Niacinamide + Hyaluronic Acid Serum',
    category: 'Skincare',
    description: 'A lightweight daily serum formulated to support hydrated, healthy-looking skin and a balanced routine.',
    keyBenefits: ['Lightweight daily hydration', 'Layers easily with a simple routine', 'Made for everyday use'],
    usage: 'Apply 2–3 drops after cleansing and before moisturizer. Use sunscreen during the day.',
    productUrl: 'dermorepubliq.com/products/niacinamide-ha',
    active: true,
  },
  {
    id: 'product-barrier-cream',
    name: 'Ceramide Barrier Repair Cream',
    category: 'Skincare',
    description: 'A comforting moisturizer made for simple barrier-first routines.',
    keyBenefits: ['Barrier-supporting moisture', 'Comfortable non-greasy finish', 'AM and PM use'],
    usage: 'Massage a pea-sized amount onto clean skin after serum.',
    productUrl: 'dermorepubliq.com/products/barrier-cream',
    active: true,
  },
  {
    id: 'product-sunscreen',
    name: 'Daily Defense Sunscreen SPF 50',
    category: 'Sun care',
    description: 'A lightweight broad-spectrum sunscreen for daily wear.',
    keyBenefits: ['Broad-spectrum SPF 50', 'No heavy finish', 'Works under makeup'],
    usage: 'Apply generously as the final morning skincare step and reapply as needed.',
    productUrl: 'dermorepubliq.com/products/daily-defense',
    active: true,
  },
]

export const communities: Community[] = [
  {
    id: 'community-skintok', name: 'SkinTok PH', initials: 'SP', leaderId: 'leader-mara', leaderName: 'Mara Villanueva',
    leaderType: 'External', verifiedSize: 150, location: 'Nationwide, Philippines',
    description: 'Practical skincare creators who turn daily routines into useful short-form stories.',
  },
  {
    id: 'community-glow', name: 'Glow Circle Manila', initials: 'GC', leaderId: 'leader-nico', leaderName: 'Nico Ramos',
    leaderType: 'Internal', verifiedSize: 100, location: 'Metro Manila',
    description: 'A city-based beauty community focused on accessible routines and product education.',
  },
  {
    id: 'community-campus', name: 'Campus Beauty Collective', initials: 'CB', leaderId: 'leader-isa', leaderName: 'Isa Flores',
    leaderType: 'External', verifiedSize: 50, location: 'Cebu and Davao',
    description: 'Student creators sharing affordable beauty discoveries and honest campus routines.',
  },
]

const memberSeed = [
  ['member-maya', 'community-skintok', 'Maya Reyes', '@mayareyes', 'TikTok', false],
  ['member-jules', 'community-skintok', 'Jules Aquino', '@julesaquino', 'TikTok', false],
  ['member-niko', 'community-skintok', 'Niko Santos', '@nikosantos', 'Instagram', true],
  ['member-bea', 'community-skintok', 'Bea Lim', '@bealim', 'TikTok', false],
  ['member-sofia', 'community-glow', 'Sofia Cruz', '@sofiacruz', 'TikTok', false],
  ['member-paolo', 'community-glow', 'Paolo Mendoza', '@paolomendoza', 'Instagram', false],
  ['member-rina', 'community-glow', 'Rina Garcia', '@rinagarcia', 'TikTok', true],
  ['member-enzo', 'community-glow', 'Enzo Flores', '@enzoflores', 'TikTok', false],
  ['member-camille', 'community-campus', 'Camille Navarro', '@camillenavarro', 'TikTok', false],
  ['member-luis', 'community-campus', 'Luis Dela Rosa', '@luisdelarosa', 'Instagram', true],
  ['member-toni', 'community-campus', 'Toni Ramos', '@toniramos', 'TikTok', false],
  ['member-gab', 'community-campus', 'Gab Yu', '@gabyu', 'TikTok', false],
] as const

export const members: CommunityMember[] = memberSeed.map(([id, communityId, name, handle, platform, newlyRecruited], index) => ({
  id, communityId, name, handle, platform, newlyRecruited, initials: name.split(' ').map((word) => word[0]).join('').slice(0, 2),
  joinedAt: `Jul ${4 + index}, 2026`, active: true,
}))

export const opportunities: CampaignOpportunity[] = [
  {
    id: 'opportunity-real-skin', name: 'Real Skin, Real Routine', productId: 'product-niacinamide', platform: 'TikTok',
    objective: 'Published content volume', preparationDays: 14, liveDays: 48,
    preparationStart: '2026-07-01', preparationEnd: '2026-07-14', liveStart: '2026-07-15', liveEnd: '2026-08-31',
    requiredContent: 300, totalBudget: 150000,
    priorityMessages: ['Gentle enough for an everyday routine', 'Hydration that fits real life'],
    contentDirection: 'Show the serum as part of a real routine. Use your own voice, demonstrate texture or application, and avoid guaranteed results.',
    hashtags: ['#Dermorepubliq', '#RealSkinRealRoutine'], mentions: ['@dermorepubliq'], status: 'Live',
    createdAt: 'Jun 18, 2026', postedAt: 'Jun 20, 2026', secondaryViews: 2840000, secondaryEngagement: 218400,
  },
  {
    id: 'opportunity-barrier-reset', name: 'Barrier Reset Week', productId: 'product-barrier-cream', platform: 'TikTok + Instagram',
    objective: 'Published content volume', preparationDays: 10, liveDays: 30,
    preparationStart: '2026-09-01', preparationEnd: '2026-09-10', liveStart: '2026-09-11', liveEnd: '2026-10-10',
    requiredContent: 120, totalBudget: 120000,
    priorityMessages: ['A simple moisturizer for barrier-first routines', 'Comfortable morning and evening use'],
    contentDirection: 'Create a practical barrier-reset diary grounded in your actual routine. Do not make medical claims.',
    hashtags: ['#BarrierResetWeek', '#Dermorepubliq'], mentions: ['@dermorepubliq'], status: 'Open',
    createdAt: 'Jul 18, 2026', postedAt: 'Jul 20, 2026', secondaryViews: 0, secondaryEngagement: 0,
  },
  {
    id: 'opportunity-daily-defense', name: 'Everyday Sun Defense', productId: 'product-sunscreen', platform: 'TikTok',
    objective: 'Published content volume', preparationDays: 12, liveDays: 35,
    preparationStart: '2026-08-05', preparationEnd: '2026-08-16', liveStart: '2026-08-17', liveEnd: '2026-09-20',
    requiredContent: 180, totalBudget: 180000,
    priorityMessages: ['Daily sunscreen is the final morning step', 'Comfortable for everyday wear'],
    contentDirection: 'Show where sunscreen fits in a real morning routine. Avoid implying guaranteed protection or health outcomes.',
    hashtags: ['#EverydaySunDefense'], mentions: ['@dermorepubliq'], status: 'Partially Claimed',
    createdAt: 'Jul 10, 2026', postedAt: 'Jul 12, 2026', secondaryViews: 0, secondaryEngagement: 0,
  },
  {
    id: 'opportunity-glass-skin', name: 'Hydration, Your Way', productId: 'product-niacinamide', platform: 'TikTok',
    objective: 'Published content volume', preparationDays: 10, liveDays: 28,
    preparationStart: '2026-04-01', preparationEnd: '2026-04-10', liveStart: '2026-04-11', liveEnd: '2026-05-08',
    requiredContent: 90, totalBudget: 90000,
    priorityMessages: ['Every routine is personal', 'Simple hydration for everyday use'],
    contentDirection: 'Share a personal hydration routine with clear, honest product use.',
    hashtags: ['#HydrationYourWay'], mentions: ['@dermorepubliq'], status: 'Completed',
    createdAt: 'Mar 12, 2026', postedAt: 'Mar 14, 2026', secondaryViews: 910000, secondaryEngagement: 74400,
  },
  {
    id: 'opportunity-night-routine', name: 'Night Routine Notes', productId: 'product-barrier-cream', platform: 'Instagram Reels',
    objective: 'Published content volume', preparationDays: 14, liveDays: 30,
    preparationStart: '2026-10-01', preparationEnd: '2026-10-14', liveStart: '2026-10-15', liveEnd: '2026-11-13',
    requiredContent: 150, totalBudget: 135000,
    priorityMessages: ['Wind down with a simple routine'], contentDirection: 'Show a calm, useful evening routine.',
    hashtags: ['#NightRoutineNotes'], mentions: ['@dermorepubliq'], status: 'Draft', createdAt: 'Today',
    secondaryViews: 0, secondaryEngagement: 0,
  },
]

export const claims: CommunityClaim[] = [
  { id: 'claim-real-skintok', opportunityId: 'opportunity-real-skin', communityId: 'community-skintok', leaderId: 'leader-mara', contentQuota: 150, budgetAllocation: 75000, claimedAt: 'Jun 21, 2026 · 9:14 AM' },
  { id: 'claim-real-glow', opportunityId: 'opportunity-real-skin', communityId: 'community-glow', leaderId: 'leader-nico', contentQuota: 100, budgetAllocation: 50000, claimedAt: 'Jun 21, 2026 · 10:08 AM' },
  { id: 'claim-real-campus', opportunityId: 'opportunity-real-skin', communityId: 'community-campus', leaderId: 'leader-isa', contentQuota: 50, budgetAllocation: 25000, claimedAt: 'Jun 22, 2026 · 2:31 PM' },
  { id: 'claim-sun-skintok', opportunityId: 'opportunity-daily-defense', communityId: 'community-skintok', leaderId: 'leader-mara', contentQuota: 90, budgetAllocation: 90000, claimedAt: 'Jul 14, 2026 · 11:20 AM' },
  { id: 'claim-complete-skintok', opportunityId: 'opportunity-glass-skin', communityId: 'community-skintok', leaderId: 'leader-mara', contentQuota: 45, budgetAllocation: 45000, claimedAt: 'Mar 15, 2026' },
  { id: 'claim-complete-glow', opportunityId: 'opportunity-glass-skin', communityId: 'community-glow', leaderId: 'leader-nico', contentQuota: 30, budgetAllocation: 30000, claimedAt: 'Mar 15, 2026' },
  { id: 'claim-complete-campus', opportunityId: 'opportunity-glass-skin', communityId: 'community-campus', leaderId: 'leader-isa', contentQuota: 15, budgetAllocation: 15000, claimedAt: 'Mar 16, 2026' },
]

const readyPreparation = {
  membersActivated: true, productAssignmentsReady: true, instructionsPublished: true,
  contentThemesPrepared: true, monitoringReady: true, readyToLaunch: true,
}

export const communityCampaigns: CommunityCampaign[] = [
  { id: 'cc-skin-routines', claimId: 'claim-real-skintok', opportunityId: 'opportunity-real-skin', communityId: 'community-skintok', title: 'Morning Routine Diaries', themes: ['Morning routines', 'Texture and application'], instructions: 'Publish a 20–35 second routine story in your own voice.', memberRequirements: 'Show application, mention everyday hydration, include required tags.', deadline: '2026-08-20', contentQuota: 90, rewardBudget: 45000, status: 'Live', preparation: readyPreparation, createdAt: 'Jun 22, 2026' },
  { id: 'cc-skin-reset', claimId: 'claim-real-skintok', opportunityId: 'opportunity-real-skin', communityId: 'community-skintok', title: 'Real-Life Skin Resets', themes: ['After-work reset', 'Simple night routine'], instructions: 'Make the content useful, personal, and visually clear.', memberRequirements: 'One product-use moment and one honest routine insight.', deadline: '2026-08-25', contentQuota: 60, rewardBudget: 30000, status: 'Live', preparation: readyPreparation, createdAt: 'Jun 23, 2026' },
  { id: 'cc-glow-city', claimId: 'claim-real-glow', opportunityId: 'opportunity-real-skin', communityId: 'community-glow', title: 'City Skin Stories', themes: ['Commute routines', 'On-the-go hydration'], instructions: 'Show how the serum fits a busy city day.', memberRequirements: 'Vertical video, required tags, real product use.', deadline: '2026-08-24', contentQuota: 60, rewardBudget: 30000, status: 'Live', preparation: readyPreparation, createdAt: 'Jun 23, 2026' },
  { id: 'cc-glow-weekend', claimId: 'claim-real-glow', opportunityId: 'opportunity-real-skin', communityId: 'community-glow', title: 'Weekend Glow Notes', themes: ['Weekend reset', 'Shelf routine'], instructions: 'Share one approachable weekend routine.', memberRequirements: '15–30 second video with required tags.', deadline: '2026-08-26', contentQuota: 40, rewardBudget: 20000, status: 'Live', preparation: readyPreparation, createdAt: 'Jun 24, 2026' },
  { id: 'cc-campus-budget', claimId: 'claim-real-campus', opportunityId: 'opportunity-real-skin', communityId: 'community-campus', title: 'Campus Routine Check', themes: ['Dorm routines', 'Before-class skincare'], instructions: 'Keep the story practical for student life.', memberRequirements: 'Show application and state that routines vary by person.', deadline: '2026-08-27', contentQuota: 50, rewardBudget: 25000, status: 'Live', preparation: readyPreparation, createdAt: 'Jun 24, 2026' },
  { id: 'cc-sun-prep', claimId: 'claim-sun-skintok', opportunityId: 'opportunity-daily-defense', communityId: 'community-skintok', title: 'Morning SPF Check', themes: ['Morning routine', 'Daily defense'], instructions: 'Show sunscreen as the final morning step.', memberRequirements: 'One short-form video with required tags.', deadline: '2026-09-12', contentQuota: 60, rewardBudget: 60000, status: 'Preparation', preparation: { ...readyPreparation, monitoringReady: false, readyToLaunch: false }, createdAt: 'Jul 15, 2026' },
  { id: 'cc-complete-skin', claimId: 'claim-complete-skintok', opportunityId: 'opportunity-glass-skin', communityId: 'community-skintok', title: 'SkinTok Hydration Diaries', themes: ['Hydration routines'], instructions: 'Completed campaign.', memberRequirements: 'One recorded video.', deadline: '2026-05-04', contentQuota: 45, rewardBudget: 45000, status: 'Completed', preparation: readyPreparation, createdAt: 'Mar 16, 2026' },
  { id: 'cc-complete-glow', claimId: 'claim-complete-glow', opportunityId: 'opportunity-glass-skin', communityId: 'community-glow', title: 'Glow Circle Hydration', themes: ['Everyday hydration'], instructions: 'Completed campaign.', memberRequirements: 'One recorded video.', deadline: '2026-05-04', contentQuota: 30, rewardBudget: 30000, status: 'Completed', preparation: readyPreparation, createdAt: 'Mar 16, 2026' },
  { id: 'cc-complete-campus', claimId: 'claim-complete-campus', opportunityId: 'opportunity-glass-skin', communityId: 'community-campus', title: 'Campus Hydration', themes: ['Simple routines'], instructions: 'Completed campaign.', memberRequirements: 'One recorded video.', deadline: '2026-05-04', contentQuota: 15, rewardBudget: 15000, status: 'Completed', preparation: readyPreparation, createdAt: 'Mar 17, 2026' },
]

const assignmentSeed = [
  ['assign-maya', 'cc-skin-routines', 'member-maya', 45], ['assign-jules', 'cc-skin-routines', 'member-jules', 45],
  ['assign-niko', 'cc-skin-reset', 'member-niko', 30], ['assign-bea', 'cc-skin-reset', 'member-bea', 30],
  ['assign-sofia', 'cc-glow-city', 'member-sofia', 30], ['assign-paolo', 'cc-glow-city', 'member-paolo', 30],
  ['assign-rina', 'cc-glow-weekend', 'member-rina', 20], ['assign-enzo', 'cc-glow-weekend', 'member-enzo', 20],
  ['assign-camille', 'cc-campus-budget', 'member-camille', 15], ['assign-luis', 'cc-campus-budget', 'member-luis', 15],
  ['assign-toni', 'cc-campus-budget', 'member-toni', 10], ['assign-gab', 'cc-campus-budget', 'member-gab', 10],
  ['assign-complete-skin', 'cc-complete-skin', 'member-maya', 45],
  ['assign-complete-glow', 'cc-complete-glow', 'member-sofia', 30],
  ['assign-complete-campus', 'cc-complete-campus', 'member-camille', 15],
] as const

export const assignments: MemberAssignment[] = assignmentSeed.map(([id, communityCampaignId, memberId, requiredContent]) => ({
  id, communityCampaignId, memberId, requiredContent, accepted: true, assignedAt: 'Jul 2, 2026',
}))

const statusForHeroIndex = (index: number): ContentStatus => {
  if (index < 188) return 'Counted'
  if (index < 217) return 'Validated'
  if (index < 243) return 'Recorded'
  if (index < 265) return 'Published'
  if (index < 283) return 'In Progress'
  return 'Assigned'
}

function generateContents(): ContentRecord[] {
  const result: ContentRecord[] = []
  let heroIndex = 0
  assignments.forEach((assignment) => {
    const campaign = communityCampaigns.find((item) => item.id === assignment.communityCampaignId)!
    const completed = campaign.opportunityId === 'opportunity-glass-skin'
    for (let slot = 1; slot <= assignment.requiredContent; slot += 1) {
      const mayaDemoStatuses: ContentStatus[] = ['Counted', 'Recorded', 'Published', 'In Progress', 'Assigned']
      const status = completed ? 'Counted' : assignment.id === 'assign-maya' && slot <= mayaDemoStatuses.length ? mayaDemoStatuses[slot - 1] : statusForHeroIndex(heroIndex)
      if (!completed) heroIndex += 1
      const published = ['Published', 'Recorded', 'Validated', 'Counted'].includes(status)
      const recorded = ['Recorded', 'Validated', 'Counted'].includes(status)
      const validated = ['Validated', 'Counted'].includes(status)
      result.push({
        id: `content-${assignment.id}-${slot}`,
        opportunityId: campaign.opportunityId,
        communityCampaignId: campaign.id,
        assignmentId: assignment.id,
        memberId: assignment.memberId,
        slot,
        status,
        publishedUrl: published ? `https://tiktok.com/@creator/video/${assignment.id.replace('assign-', '')}${slot}` : undefined,
        publishedAt: published ? `2026-07-${15 + (slot % 6)}` : undefined,
        recordedAt: recorded ? `2026-07-${16 + (slot % 6)}` : undefined,
        validatedAt: validated ? `2026-07-${17 + (slot % 6)}` : undefined,
        countedAt: status === 'Counted' ? `2026-07-${18 + (slot % 6)}` : undefined,
        views: published ? 3200 + ((slot * 947 + heroIndex * 83) % 21000) : 0,
        engagement: published ? 180 + ((slot * 73 + heroIndex * 11) % 1300) : 0,
      })
    }
  })
  return result
}

export const contents = generateContents()

export const rewards: MemberReward[] = assignments.map((assignment) => {
  const campaign = communityCampaigns.find((item) => item.id === assignment.communityCampaignId)!
  return {
    id: `reward-${assignment.id}`,
    communityCampaignId: campaign.id,
    assignmentId: assignment.id,
    memberId: assignment.memberId,
    amount: Math.round(campaign.rewardBudget * assignment.requiredContent / campaign.contentQuota),
    status: campaign.status === 'Completed' ? 'Completed' : 'Pending',
  }
})

export const initialState: AppState = {
  version: 3,
  activeRole: 'brand',
  activeLeaderId: 'leader-mara',
  activeMemberId: 'member-maya',
  brand: {
    id: 'brand-dermorepubliq', name: 'Dermorepubliq', initials: 'DR', website: 'https://dermorepubliq.com',
    industry: 'Skincare & beauty', location: 'Philippines',
    description: 'Science-led, accessible skincare designed for straightforward everyday routines.',
    contactName: 'Alexis Tan', contactEmail: 'alexis@dermorepubliq.com',
  },
  products,
  communities,
  members,
  opportunities,
  claims,
  communityCampaigns,
  assignments,
  contents,
  rewards,
  activity: [
    { id: 'activity-1', role: 'leader', title: 'Content validated and counted', detail: 'SkinTok PH added 12 recorded posts to Real Skin, Real Routine.', timestamp: '12 min ago', opportunityId: 'opportunity-real-skin' },
    { id: 'activity-2', role: 'member', title: 'Published content recorded', detail: 'Maya Reyes recorded a TikTok link.', timestamp: '34 min ago', opportunityId: 'opportunity-real-skin' },
    { id: 'activity-3', role: 'system', title: 'Allocation created automatically', detail: 'SkinTok PH received 90 contents and ₱90,000 for Everyday Sun Defense.', timestamp: 'Yesterday', opportunityId: 'opportunity-daily-defense' },
    { id: 'activity-4', role: 'brand', title: 'Campaign posted', detail: 'Barrier Reset Week is open for community claims.', timestamp: 'Yesterday', opportunityId: 'opportunity-barrier-reset' },
  ],
  notifications: [
    { id: 'note-brand-1', role: 'brand', title: 'Real Skin is 63% fulfilled', detail: '188 of 300 contents are counted.', time: '12 min ago', read: false },
    { id: 'note-leader-1', role: 'leader', title: '26 links ready for validation', detail: 'Real Skin, Real Routine', time: '34 min ago', read: false },
    { id: 'note-member-1', role: 'member', title: 'One post needs its published link', detail: 'Morning Routine Diaries', time: '1 hr ago', read: false },
  ],
  opportunityDraft: emptyOpportunityDraft,
}
