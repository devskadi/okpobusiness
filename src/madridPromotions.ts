export type MadridPromotion = {
  id: string
  campaignId: string
  name: string
  manager: string
  src: string
  views: number
  clicks: number
  engagement: number
  earnings: number
}

export const madridPromotions: readonly MadridPromotion[] = [
  { id: 'promo-solutions-ready', campaignId: 'madrid-solutions-job-fair', name: 'Job Fair Ready', manager: 'Madrid Performers', src: '/assets/campaign-solutions-job-fair.png', views: 48200, clicks: 4310, engagement: 6800, earnings: 18400 },
  { id: 'promo-solutions-guide', campaignId: 'madrid-solutions-job-fair', name: 'Application Day Guide', manager: 'Field Riders', src: '/assets/campaign-makati-hiring.png', views: 36700, clicks: 2980, engagement: 5100, earnings: 14600 },
  { id: 'promo-cebu-riders', campaignId: 'madrid-field-rider-cebu', name: 'Cebu Rider Stories', manager: 'Field Riders', src: '/assets/campaign-field-rider-cebu.png', views: 44100, clicks: 3720, engagement: 6200, earnings: 16800 },
  { id: 'promo-cebu-day', campaignId: 'madrid-field-rider-cebu', name: 'A Day on the Road', manager: 'Madrid Performers', src: '/assets/campaign-pitx-job-fair.png', views: 32900, clicks: 2610, engagement: 4700, earnings: 12100 },
  { id: 'promo-pitx-tips', campaignId: 'madrid-pitx-onsite-job-fair', name: 'PITX Career Tips', manager: 'Assessmate Mentors', src: '/assets/campaign-pitx-job-fair.png', views: 42100, clicks: 3540, engagement: 5900, earnings: 15500 },
  { id: 'promo-pitx-route', campaignId: 'madrid-pitx-onsite-job-fair', name: 'Your Route to PITX', manager: 'Field Riders', src: '/assets/campaign-field-rider-cebu.png', views: 29400, clicks: 2320, engagement: 4100, earnings: 10900 },
  { id: 'promo-makati-ready', campaignId: 'madrid-makati-hiring', name: 'Makati Interview Ready', manager: 'Madrid Performers', src: '/assets/campaign-makati-hiring.png', views: 39800, clicks: 3280, engagement: 5500, earnings: 14200 },
  { id: 'promo-makati-path', campaignId: 'madrid-makati-hiring', name: 'Your BPO Career Path', manager: 'Assessmate Mentors', src: '/assets/campaign-solutions-job-fair.png', views: 27100, clicks: 2080, engagement: 3700, earnings: 9800 },
  { id: 'promo-cashout-demo', campaignId: 'madrid-mag-cash-out', name: 'Cash Out Demo', manager: 'Madrid Performers', src: '/assets/campaign-mag-cashout.png', views: 53600, clicks: 4860, engagement: 7900, earnings: 21300 },
  { id: 'promo-cashout-guide', campaignId: 'madrid-mag-cash-out', name: 'Everyday Cash Out', manager: 'Field Riders', src: '/assets/campaign-pitx-job-fair.png', views: 34800, clicks: 2870, engagement: 4800, earnings: 12900 },
  { id: 'promo-kcp-network', campaignId: 'madrid-kcp-networking-night', name: 'Networking Night', manager: 'Assessmate Mentors', src: '/assets/campaign-kcp-networking.png', views: 24100, clicks: 1810, engagement: 3400, earnings: 8700 },
  { id: 'promo-kcp-people', campaignId: 'madrid-kcp-networking-night', name: 'People to Meet', manager: 'Madrid Performers', src: '/assets/campaign-kcp-networking.png', views: 21800, clicks: 1640, engagement: 3100, earnings: 7900 },
]
