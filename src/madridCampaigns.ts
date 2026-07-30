export type MadridCampaign = {
  id: string
  name: string
  src: string
  budget: number
  spent: number
  target: number
  published: number
  weeks: number
  currentWeek: number
  goal: string
  status?: 'Upcoming'
  postedBy?: string
  durationLabel?: string
}

export const madridCampaigns: readonly MadridCampaign[] = [
  {
    id: 'okpo-five-day-public-challenge',
    name: 'OkPo 5-day Public Challenge',
    src: '/assets/campaign-blank.svg',
    budget: 10000,
    spent: 0,
    target: 0,
    published: 0,
    weeks: 1,
    currentWeek: 0,
    goal: 'Join daily content challenges, complete fun missions, and earn rewards from the ₱10,000 prize pool. Open to everyone for 5 days only. Let’s go! 🚀',
    status: 'Upcoming',
    postedBy: 'OkPo',
    durationLabel: '5 days',
  },
  {
    id: 'madrid-solutions-job-fair',
    name: 'Solutions Job Fair',
    src: '/assets/campaign-solutions-job-fair.png',
    budget: 150000,
    spent: 93000,
    target: 300,
    published: 186,
    weeks: 8,
    currentWeek: 5,
    goal: 'Drive qualified applicants to the Solutions Job Fair through creator-led career content. Prioritize practical application guidance, local event awareness, and clear calls to register or attend.',
  },
  {
    id: 'madrid-field-rider-cebu',
    name: 'Field Rider Cebu',
    src: '/assets/campaign-field-rider-cebu.png',
    budget: 90000,
    spent: 55800,
    target: 180,
    published: 112,
    weeks: 6,
    currentWeek: 3,
    goal: 'Recruit field riders in Cebu through trusted local creator communities. Content should make the role feel accessible, explain where and when to apply, and encourage qualified candidates to register for the onsite job fair.',
  },
  {
    id: 'madrid-pitx-onsite-job-fair',
    name: 'PITX Onsite Job Fair',
    src: '/assets/campaign-pitx-job-fair.png',
    budget: 120000,
    spent: 74400,
    target: 150,
    published: 93,
    weeks: 5,
    currentWeek: 2,
    goal: 'Generate awareness and registrations for the PITX onsite recruitment event. Use relatable creator stories to clarify the available role, event schedule, location, and next step for interested applicants.',
  },
  {
    id: 'madrid-makati-hiring',
    name: 'Makati Hiring',
    src: '/assets/campaign-makati-hiring.png',
    budget: 80000,
    spent: 49600,
    target: 120,
    published: 74,
    weeks: 4,
    currentWeek: 2,
    goal: 'Reach call center candidates near Makati through location-relevant creator content. Emphasize Tagalog account opportunities, the accessible onsite process, and a direct invitation to register before the event.',
  },
  {
    id: 'madrid-mag-cash-out',
    name: 'Mag Cash Out Ka Na',
    src: '/assets/campaign-mag-cashout.png',
    budget: 180000,
    spent: 111600,
    target: 220,
    published: 136,
    weeks: 10,
    currentWeek: 6,
    goal: 'Build awareness and adoption for the cash-out offer through creator demonstrations. Show the use case in a simple, credible way and guide viewers toward the intended action without making financial guarantees.',
  },
  {
    id: 'madrid-kcp-networking-night',
    name: 'KCP Networking Night',
    src: '/assets/campaign-kcp-networking.png',
    budget: 70000,
    spent: 43400,
    target: 90,
    published: 56,
    weeks: 3,
    currentWeek: 1,
    goal: 'Invite technology professionals and creators to KCP Networking Night. Position the event as a focused opportunity to meet peers, exchange ideas, and build useful professional connections.',
  },
]

export const legacyDemoOpportunityIds = new Set([
  'opportunity-real-skin',
  'opportunity-barrier-reset',
  'opportunity-daily-defense',
  'opportunity-glass-skin',
  'opportunity-night-routine',
])
