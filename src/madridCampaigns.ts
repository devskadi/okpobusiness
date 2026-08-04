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
  remainingWeeks?: number
}

export const madridCampaigns: readonly MadridCampaign[] = [
  {
    id: 'okpo-five-day-public-challenge',
    name: 'OkPo 5-day Public Challenge',
    src: '/assets/campaign-okpo-five-day-public-challenge.png',
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
    id: 'madrid-tech-recruitment',
    name: 'Tech Recruitment',
    src: '/assets/campaign-tech-recruitment.png',
    budget: 150000,
    spent: 0,
    target: 90,
    published: 0,
    weeks: 13,
    currentWeek: 1,
    goal: 'Recruit qualified technology candidates through practical, creator-led content that highlights open roles, the application process, and clear next steps.',
  },
  {
    id: 'madrid-internship-cohort-3',
    name: 'Internship Cohort 3',
    src: '/assets/campaign-internship-cohort-3.png',
    budget: 150000,
    spent: 50000,
    target: 90,
    published: 30,
    weeks: 13,
    currentWeek: 5,
    remainingWeeks: 8,
    goal: 'Invite students to join Madrid Philippines’ third internship cohort through approachable content about learning opportunities, practical experience, and how to apply.',
  },
  {
    id: 'madrid-spm-dubai-hiring',
    name: 'SPM Dubai Hiring',
    src: '/assets/campaign-spm-dubai-hiring.png',
    budget: 300000,
    spent: 50000,
    target: 180,
    published: 0,
    weeks: 26,
    currentWeek: 2,
    remainingWeeks: 40,
    goal: 'Reach qualified call center candidates for Dubai-based opportunities and clearly communicate the role, location, requirements, and application process.',
  },
  {
    id: 'madrid-pitx-job-fair',
    name: 'PITX Job Fair',
    src: '/assets/campaign-pitx-job-fair-new.png',
    budget: 600000,
    spent: 350000,
    target: 360,
    published: 0,
    weeks: 52,
    currentWeek: 7,
    remainingWeeks: 40,
    goal: 'Drive awareness and registrations for the PITX onsite job fair with clear role information, practical application guidance, and a direct invitation to attend.',
  },
]

export const legacyDemoOpportunityIds = new Set([
  'opportunity-real-skin',
  'opportunity-barrier-reset',
  'opportunity-daily-defense',
  'opportunity-glass-skin',
  'opportunity-night-routine',
  'opportunity-tech-recruitment',
  'opportunity-spm-dubai',
  'opportunity-pitx-job-fair',
  'opportunity-kcp-networking',
])
