import {
  ArrowLeft, ArrowRight, SealCheck as BadgeCheck, CalendarBlank, ChartBar as BarChart3, Check, CheckCircle as CheckCircle2,
  CurrencyCircleDollar as CircleDollarSign, Stack as Layers3, Books as Library, LockKey as LockKeyhole,
  DotsThreeVertical, Info, Medal, Plus, ShieldCheck, Sparkle, Target, TiktokLogo, Trophy, UserCheck, UserPlus, Users, UsersThree,
  Wallet as WalletCards, Storefront, Heart, X,
} from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  Avatar, Callout, CheckRow, ContentBadge, EmptyState, MetricCard, OpportunityCard, PageHeader,
  Panel, ProgressBar, SegmentedTabs, StatusBadge,
} from '../components'
import {
  calculateAllocation, formatCurrency, formatDate, formatNumber, getCommunityCampaignMetrics,
  getOpportunityMetrics, useApp,
} from '../store'
import { madridPromotions } from '../madridPromotions'
import { madridCampaigns } from '../madridCampaigns'
import type { Community, CommunityCampaign, CommunityClaim } from '../types'
import { BrandCampaignDetail } from './BrandPages'

function useLeaderContext() {
  const app = useApp()
  const community = app.state.communities.find((item) => item.leaderId === app.state.activeLeaderId) ?? app.state.communities[0]
  const memberIds = new Set(app.state.members.filter((item) => item.communityId === community.id).map((item) => item.id))
  const claims = app.state.claims.filter((item) => item.communityId === community.id)
  const campaigns = app.state.communityCampaigns.filter((item) => item.communityId === community.id)
  const assignments = app.state.assignments.filter((item) => memberIds.has(item.memberId))
  const contents = app.state.contents.filter((item) => memberIds.has(item.memberId))
  return { ...app, community, claims, campaigns, assignments, contents }
}

function claimRemaining(state: ReturnType<typeof useApp>['state'], claim: CommunityClaim) {
  const campaigns = state.communityCampaigns.filter((item) => item.claimId === claim.id)
  return {
    content: claim.contentQuota - campaigns.reduce((sum, item) => sum + item.contentQuota, 0),
    budget: claim.budgetAllocation - campaigns.reduce((sum, item) => sum + item.rewardBudget, 0),
  }
}

function campaignDurationLabel(start: string, end: string) {
  const durationDays = Math.max(1, Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1)
  const months = Math.max(1, Math.ceil(durationDays / 30))
  return `${months} ${months === 1 ? 'month' : 'months'}`
}

const dashboardCampaigns = [
  { id: 'madrid-tech-recruitment', title: 'Tech Recruitment', image: '/assets/campaign-tech-recruitment.png', pool: 150000, deadline: '13 weeks', creators: 62, participation: 69 },
  { id: 'madrid-internship-cohort-3', title: 'Internship Cohort 3', image: '/assets/campaign-internship-cohort-3.png', pool: 150000, deadline: '8 weeks left', creators: 48, participation: 53 },
  { id: 'madrid-spm-dubai-hiring', title: 'SPM Dubai Hiring', image: '/assets/campaign-spm-dubai-hiring.png', pool: 300000, deadline: '40 weeks left', creators: 31, participation: 42 },
  { id: 'madrid-pitx-job-fair', title: 'PITX Job Fair', image: '/assets/campaign-pitx-job-fair-new.png', pool: 600000, deadline: '40 weeks left', creators: 74, participation: 81 },
] as const

const dashboardCreators = {
  angel: { name: 'angelmechure', community: 'Madrid HR', avatar: '/assets/madrid-performer-1.jpeg' },
  loida: { name: 'Loida Erguiza', community: 'Madrid PH', avatar: '/assets/madrid-performer-2.jpeg' },
  ian: { name: 'Ian Madrid', community: 'Madrid Field', avatar: '/assets/user-portrait.png' },
  roseann: { name: 'Roseann Sta. Agata', community: "Cloud's VIPs", avatar: '/assets/madrid-rider-1.jpeg' },
  sean: { name: 'seanrnp', community: 'TICP', avatar: '/assets/madrid-rider-2.jpeg' },
} as const

const dashboardSubmissions = [
  { creator: dashboardCreators.angel, thumbnail: '/assets/tiktok-preview-01.png', campaign: 'Tech Recruitment', time: '2 min ago' },
  { creator: dashboardCreators.loida, thumbnail: '/assets/tiktok-preview-03.png', campaign: 'Internship Cohort 3', time: '8 min ago' },
  { creator: dashboardCreators.roseann, thumbnail: '/assets/tiktok-preview-06.png', campaign: 'SPM Dubai Hiring', time: '21 min ago' },
  { creator: dashboardCreators.sean, thumbnail: '/assets/tiktok-preview-08.png', campaign: 'PITX Job Fair', time: '43 min ago' },
] as const

const dashboardLeaderboard = [
  { creator: dashboardCreators.angel, submissions: 38, earnings: 28400 },
  { creator: dashboardCreators.loida, submissions: 34, earnings: 24900 },
  { creator: dashboardCreators.roseann, submissions: 29, earnings: 22100 },
  { creator: dashboardCreators.sean, submissions: 25, earnings: 19600 },
  { creator: dashboardCreators.ian, submissions: 21, earnings: 17200 },
] as const

const dashboardRewards = [
  { creator: dashboardCreators.angel, campaign: dashboardCampaigns[0], amount: 4800, time: '12 min ago' },
  { creator: dashboardCreators.loida, campaign: dashboardCampaigns[1], amount: 3500, time: '1 hr ago' },
  { creator: dashboardCreators.roseann, campaign: dashboardCampaigns[2], amount: 6200, time: 'Yesterday' },
] as const

const dashboardNewMembers = [
  dashboardCreators.ian,
  dashboardCreators.sean,
  dashboardCreators.angel,
  dashboardCreators.loida,
  dashboardCreators.roseann,
] as const

export function LeaderDashboard() {
  const { state } = useLeaderContext()
  const communityEarnings = madridPromotions.reduce((sum, promotion) => sum + promotion.earnings, 0)
  const weeklySubmissions = state.contents.filter((content) => Boolean(content.publishedAt)).length
  return <div className="page-stack leader-dashboard-page">
    <header className="leader-dashboard-header">
      <div><h1>Good morning, Ian.</h1></div>
    </header>

    <section className="leader-dashboard-summary" aria-labelledby="whats-up-title">
      <h2 id="whats-up-title">What's Up?</h2>
      <div className="leader-dashboard-kpis" aria-label="Community performance">
        <article><span>Community Earnings</span><strong>{formatCurrency(communityEarnings)}</strong><CircleDollarSign className="kpi-corner-icon" size={66} weight="duotone" aria-hidden="true" /></article>
        <article><span>Submissions This Week</span><strong>{formatNumber(weeklySubmissions)}</strong><TiktokLogo className="kpi-corner-icon kpi-corner-icon--glitch" size={66} weight="duotone" aria-hidden="true" /></article>
        <article><span>Ongoing Missions</span><strong>{dashboardCampaigns.length}</strong><Trophy className="kpi-corner-icon" size={66} weight="duotone" aria-hidden="true" /></article>
        <article><span>Members</span><strong>{state.members.length}</strong><UsersThree className="kpi-corner-icon" size={66} weight="duotone" aria-hidden="true" /></article>
      </div>
    </section>

    <section className="leader-dashboard-section featured-campaign-section" aria-labelledby="featured-campaigns-title">
      <header><div><h2 id="featured-campaigns-title">Active Campaigns</h2></div><Link to="/leader/campaigns">View all <ArrowRight size={15} /></Link></header>
      <div className="featured-campaign-grid">
        {dashboardCampaigns.map((campaign, index) => <Link className={index === 0 ? 'featured-campaign-card primary' : 'featured-campaign-card'} to="/leader/campaigns" key={campaign.id}>
          <img src={campaign.image} alt="" />
          <span className="featured-live-badge"><i />Active</span>
          <span className="featured-deadline"><CalendarBlank size={13} />{campaign.deadline}</span>
          <div className="featured-campaign-overlay">
            <span>Prize pool</span><strong>{formatCurrency(campaign.pool)}</strong>
            <h3>{campaign.title}</h3>
            <div><span><UsersThree size={14} />{campaign.creators} creators</span><span>{campaign.participation}% participating</span></div>
          </div>
        </Link>)}
      </div>
    </section>

    <section className="leader-dashboard-section" aria-labelledby="recent-submissions-title">
      <header><div><h2 id="recent-submissions-title">Recent Submissions</h2></div><Link to="/leader/analytics">See all <ArrowRight size={15} /></Link></header>
      <div className="dashboard-submission-grid">
        {dashboardSubmissions.map((submission) => <article key={submission.creator.name}>
          <div className="submission-media"><img src={submission.thumbnail} alt="" /><span><TiktokLogo size={14} weight="fill" /></span></div>
          <div className="submission-creator"><img src={submission.creator.avatar} alt="" /><div><strong>{submission.creator.name}</strong><small>{submission.creator.community}</small></div></div>
          <p>{submission.campaign}</p><time>{submission.time}</time>
        </article>)}
      </div>
    </section>

    <div className="leader-dashboard-social-grid">
      <section className="leader-dashboard-section dashboard-leaderboard" aria-labelledby="live-leaderboard-title">
        <header><div><span className="eyebrow">TOP PERFORMERS</span><h2 id="live-leaderboard-title">Live leaderboard</h2></div><Medal size={22} /></header>
        <div>{dashboardLeaderboard.map((entry, index) => <article key={entry.creator.name}>
          <b>{index + 1}</b><img src={entry.creator.avatar} alt="" /><div><strong>{entry.creator.name}</strong><small>{entry.creator.community}</small></div><span><strong>{formatCurrency(entry.earnings)}</strong><small>{entry.submissions} submissions</small></span>
        </article>)}</div>
      </section>

      <section className="leader-dashboard-section dashboard-rewards" aria-labelledby="recent-rewards-title">
        <header><div><span className="eyebrow">SOCIAL PROOF</span><h2 id="recent-rewards-title">Recent rewards earned</h2></div><Sparkle size={22} weight="fill" /></header>
        <div>{dashboardRewards.map((reward) => <article key={reward.creator.name}>
          <div className="reward-creator-art"><img src={reward.creator.avatar} alt="" /><Sparkle size={14} weight="fill" /></div>
          <div><strong>{reward.creator.name}</strong><small>{reward.campaign.title} · {reward.time}</small></div>
          <img className="reward-campaign-art" src={reward.campaign.image} alt="" />
          <b>+{formatCurrency(reward.amount)}</b>
        </article>)}</div>
      </section>
    </div>

    <section className="leader-dashboard-section dashboard-new-members" aria-labelledby="new-members-title">
      <header><div><span className="eyebrow">GROWING COMMUNITY</span><h2 id="new-members-title">New members joining</h2></div><Link to="/leader/communities">View communities <ArrowRight size={15} /></Link></header>
      <div>{dashboardNewMembers.map((member) => <article key={member.name}><img src={member.avatar} alt="" /><strong>{member.name}</strong><span>{member.community}</span></article>)}</div>
    </section>
  </div>
}

export function LeaderOpportunities() {
  const { state, community, claims } = useLeaderContext()
  const open = state.opportunities.filter((item) => ['Open', 'Partially Claimed'].includes(item.status) && !claims.some((claim) => claim.opportunityId === item.id))
  const claimed = claims.map((claim) => state.opportunities.find((item) => item.id === claim.opportunityId)).filter(Boolean)
  return <div className="page-stack"><PageHeader eyebrow="CAMPAIGN MARKETPLACE" title="Campaigns your community can power" description={`Every preview uses ${community.name}’s verified size of ${community.verifiedSize} creators. No applications or negotiation.`} /><Callout title="Claim means confirmed">Review the fixed dates, remaining capacity, content quota, and budget allocation. Confirmation creates the allocation immediately—brands do not approve or reject claims.</Callout><Panel title="Open for claiming" description={`${open.length} campaigns currently have capacity.`}><div className="opportunity-grid">{open.map((opportunity) => { const product = state.products.find((item) => item.id === opportunity.productId)!; const preview = calculateAllocation(state, opportunity.id, community.id); return <OpportunityCard key={opportunity.id} id={opportunity.id} name={opportunity.name} product={product.name} platform={opportunity.platform} status={opportunity.status} content={`${preview.contentQuota} content allocation`} budget={formatCurrency(preview.budgetAllocation)} dates={`${formatDate(opportunity.liveStart)} – ${formatDate(opportunity.liveEnd)}`} to={`/leader/opportunities/${opportunity.id}`} /> })}{open.length === 0 ? <EmptyState icon={Library} title="No claimable campaigns" description="This community has claimed every currently available campaign." /> : null}</div></Panel><Panel title="Claimed by your community" description="Allocations are fixed and ready to turn into promotions."><div className="claimed-list">{claimed.map((opportunity) => { const claim = claims.find((item) => item.opportunityId === opportunity!.id)!; return <Link key={opportunity!.id} to={`/leader/opportunities/${opportunity!.id}`}><span className="claim-check"><Check size={15} /></span><div><strong>{opportunity!.name}</strong><p>{claim.contentQuota} contents · {formatCurrency(claim.budgetAllocation)} · claimed {claim.claimedAt}</p></div><StatusBadge status={opportunity!.status} /><ArrowRight size={16} /></Link> })}</div></Panel></div>
}

export function LeaderOpportunityDetail() {
  const { state, dispatch, community, claims } = useLeaderContext()
  const { opportunityId } = useParams()
  const opportunity = state.opportunities.find((item) => item.id === opportunityId)
  const [confirmed, setConfirmed] = useState(false)
  const [missionModalOpen, setMissionModalOpen] = useState(false)
  const [missionMenuId, setMissionMenuId] = useState<string | null>(null)
  const [allocationInfoOpen, setAllocationInfoOpen] = useState(false)
  useEffect(() => {
    if (!allocationInfoOpen) return
    function closeOnEscape(event: KeyboardEvent) { if (event.key === 'Escape') setAllocationInfoOpen(false) }
    const root = document.documentElement
    const body = document.body
    const previousRootOverflow = root.style.overflow
    const previousBodyOverflow = body.style.overflow
    const previousOverscrollBehavior = body.style.overscrollBehavior
    root.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.overscrollBehavior = 'none'
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      root.style.overflow = previousRootOverflow
      body.style.overflow = previousBodyOverflow
      body.style.overscrollBehavior = previousOverscrollBehavior
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [allocationInfoOpen])
  if (!opportunity) return <EmptyState title="Campaign not found" description="Return to the campaign marketplace." />
  const existingClaim = claims.find((item) => item.opportunityId === opportunity.id)
  const preview = calculateAllocation(state, opportunity.id, community.id)
  const opportunityMetrics = getOpportunityMetrics(state, opportunity.id)
  const claimOpportunityId = opportunity.id
  function claim() { dispatch({ type: 'CLAIM_OPPORTUNITY', opportunityId: claimOpportunityId, communityId: community.id }); setConfirmed(true) }
  const currentClaim = existingClaim ?? (confirmed ? { contentQuota: preview.contentQuota, budgetAllocation: preview.budgetAllocation, claimedAt: 'Just now' } : null)
  const campaignIdByOpportunity: Record<string, string> = {
    'opportunity-barrier-reset': 'madrid-internship-cohort-3',
    'opportunity-tech-recruitment': 'madrid-tech-recruitment',
    'opportunity-spm-dubai': 'madrid-spm-dubai-hiring',
    'opportunity-pitx-job-fair': 'madrid-pitx-job-fair',
  }
  const campaignId = campaignIdByOpportunity[opportunity.id] ?? 'madrid-internship-cohort-3'
  const displayedCampaign = madridCampaigns.find((campaign) => campaign.id === campaignId)
  const allocatedBudget = currentClaim?.budgetAllocation ?? preview.budgetAllocation
  const contentTarget = currentClaim?.contentQuota ?? preview.contentQuota
  const ongoingMissions = existingClaim
    ? state.communityCampaigns.filter((campaign) => campaign.claimId === existingClaim.id && campaign.status !== 'Completed').length
    : 0
  const selectedMission = missionMenuId ? state.communityCampaigns.find((campaign) => campaign.id === missionMenuId) : null
  const missionSection = existingClaim ? <>
    <section className="campaign-standalone-missions" aria-labelledby="campaign-standalone-missions-title">
      <header><h2 id="campaign-standalone-missions-title">Missions</h2><Link className="campaign-missions-view-all" to="/leader/missions">View all <ArrowRight size={15} /></Link></header>
      <div className="campaign-standalone-mission-list">
        {state.communityCampaigns.filter((campaign) => campaign.claimId === existingClaim.id && campaign.status !== 'Completed').slice(0, 3).map((mission, missionIndex) => {
          const metrics = getCommunityCampaignMetrics(state, mission.id)
          const releasedPool = state.rewards.filter((reward) => reward.communityCampaignId === mission.id && ['Approved', 'Completed'].includes(reward.status)).reduce((sum, reward) => sum + reward.amount, 0)
          return <article key={mission.id}>
            <div className="campaign-mission-card-main"><div className="campaign-mission-thumbnail"><img src={`/assets/tiktok-preview-${String((missionIndex + 3) % 9 + 1).padStart(2, '0')}.png`} alt="" /></div><div className="campaign-mission-card-copy"><div className="campaign-mission-title-row"><h3>{mission.title}</h3><span className="campaign-mission-status">{mission.status}</span><button type="button" aria-label={`Options for ${mission.title}`} onClick={() => setMissionMenuId(mission.id)}><DotsThreeVertical size={22} weight="bold" /></button></div><p>{mission.instructions}</p>
            <dl><div><dt>Submissions</dt><dd>{metrics.counted}</dd></div><div><dt>Prizes remaining</dt><dd>{formatCurrency(Math.max(0, mission.rewardBudget - releasedPool))}</dd></div></dl></div></div>
          </article>
        })}
      </div>
    </section>
    {selectedMission ? createPortal(<div className="campaign-mission-drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setMissionMenuId(null) }}>
      <aside className="campaign-mission-drawer" role="dialog" aria-modal="true" aria-labelledby="campaign-mission-drawer-title">
        <header><div><span className="campaign-mission-status">{selectedMission.status}</span><h2 id="campaign-mission-drawer-title">{selectedMission.title}</h2></div><button type="button" aria-label="Close mission menu" onClick={() => setMissionMenuId(null)}><X size={22} /></button></header>
        <p>{selectedMission.instructions}</p>
        <Link className="button button-primary button-block" to={`/leader/campaigns/${selectedMission.id}`} onClick={() => setMissionMenuId(null)}>Open mission workspace <ArrowRight size={16} /></Link>
      </aside>
    </div>, document.body) : null}
  </> : null
  const claimRewardsRemaining = existingClaim ? claimRemaining(state, existingClaim).budget : preview.budgetAllocation
  const budgetDisplay = {
    remaining: claimRewardsRemaining,
    total: opportunity.totalBudget,
    remainingLabel: existingClaim ? 'Rewards remaining' : 'Remaining claimable',
  }
  const campaignAction = <>
    <aside className="campaign-claim-footer" aria-label="Campaign allocation">
      <div className="campaign-claim-allocation">
        <div><strong>{currentClaim ? `${ongoingMissions} ongoing missions` : formatCurrency(allocatedBudget)}</strong>{!currentClaim ? <button type="button" aria-label="About this allocation" onClick={() => setAllocationInfoOpen(true)}><Info size={18} /></button> : null}</div>
        <span>{currentClaim ? `${displayedCampaign?.published ?? opportunityMetrics.published} submissions` : `${contentTarget} content target`}</span>
      </div>
      <button type="button" onClick={currentClaim ? () => setMissionModalOpen(true) : claim} disabled={!currentClaim && preview.contentQuota <= 0}>{currentClaim ? 'ADD MISSION' : 'CLAIM'}</button>
    </aside>
    {missionModalOpen && existingClaim ? createPortal(<CreateCommunityCampaignModal claim={existingClaim} onClose={() => setMissionModalOpen(false)} />, document.body) : null}
    {allocationInfoOpen ? createPortal(<div className="allocation-info-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setAllocationInfoOpen(false) }}>
      <section className="allocation-info-modal" role="dialog" aria-modal="true" aria-labelledby="allocation-info-title">
        <button className="allocation-info-close" type="button" aria-label="Close allocation information" onClick={() => setAllocationInfoOpen(false)}><X size={20} /></button>
        <h2 id="allocation-info-title">Your community allocation</h2>
        <p><strong>{formatCurrency(allocatedBudget)}</strong> is the total amount {community.name} can claim for this campaign.</p>
        <p>This allocation is calculated automatically based on your community size of <strong>{preview.verifiedSize} verified creators</strong>.</p>
        <button className="allocation-info-done" type="button" onClick={() => setAllocationInfoOpen(false)}>Got it</button>
      </section>
    </div>, document.body) : null}
  </>
  return <BrandCampaignDetail campaignId={campaignId} backTo="/leader/campaigns" communitiesTo="/leader/communities" showBack={false} hideMissions readOnlySubmissions showLeaderTabIcons budgetDisplay={budgetDisplay} standaloneSection={missionSection} campaignAction={campaignAction} />
}

export function LeaderMissions() {
  const { state, community } = useLeaderContext()
  const missions = state.communityCampaigns.filter((mission) => mission.communityId === community.id)
  return <div className="page-stack mission-directory-page">
    <PageHeader eyebrow="COMMUNITY MISSIONS" title="All missions" description={`Every mission currently managed by ${community.name}.`} />
    <section className="mission-directory-grid" aria-label="All community missions">
      {missions.map((mission, index) => {
        const metrics = getCommunityCampaignMetrics(state, mission.id)
        const releasedPool = state.rewards.filter((reward) => reward.communityCampaignId === mission.id && ['Approved', 'Completed'].includes(reward.status)).reduce((sum, reward) => sum + reward.amount, 0)
        return <Link className="mission-directory-card" to={`/leader/campaigns/${mission.id}`} key={mission.id}>
          <div className="mission-directory-thumbnail"><img src={`/assets/tiktok-preview-${String((index + 4) % 9 + 1).padStart(2, '0')}.png`} alt="" /><span>MISSION {String(index + 1).padStart(2, '0')}</span></div>
          <div><span className="campaign-mission-status">{mission.status}</span><h2>{mission.title}</h2><p>{mission.instructions}</p><dl><div><dt>Submissions</dt><dd>{metrics.counted}</dd></div><div><dt>Prizes remaining</dt><dd>{formatCurrency(Math.max(0, mission.rewardBudget - releasedPool))}</dd></div></dl></div><ArrowRight size={18} />
        </Link>
      })}
    </section>
  </div>
}

export function LeaderCampaigns() {
  const { state, community, claims } = useLeaderContext()
  const [filter, setFilter] = useState<'available' | 'claimed'>('available')
  const [recentPage, setRecentPage] = useState(0)
  const recentGestureRef = useRef<{ pointerId: number; x: number; y: number; time: number } | null>(null)
  const recentSwipeUntilRef = useRef(0)
  const popularTrackRef = useRef<HTMLDivElement>(null)
  const [popularScroll, setPopularScroll] = useState({ atStart: true, atEnd: false })
  const artwork: Record<string, string> = {
    'opportunity-real-skin': '/assets/campaign-tech-recruitment.png',
    'opportunity-barrier-reset': '/assets/campaign-internship-cohort-3.png',
    'opportunity-daily-defense': '/assets/campaign-pitx-job-fair-new.png',
    'opportunity-glass-skin': '/assets/campaign-spm-dubai-hiring.png',
    'opportunity-night-routine': '/assets/campaign-okpo-five-day-public-challenge.png',
    'opportunity-tech-recruitment': '/assets/campaign-tech-recruitment.png',
    'opportunity-spm-dubai': '/assets/campaign-spm-dubai-hiring.png',
    'opportunity-pitx-job-fair': '/assets/campaign-pitx-job-fair-new.png',
    'opportunity-kcp-networking': '/assets/campaign-kcp-networking.png',
  }
  const available = state.opportunities.filter((opportunity) => ['Open', 'Partially Claimed'].includes(opportunity.status) && !claims.some((claim) => claim.opportunityId === opportunity.id))
  const claimed = state.opportunities.filter((opportunity) => claims.some((claim) => claim.opportunityId === opportunity.id))
  const recentPageCount = Math.ceil(available.length / 3)
  const recentCampaignPages = Array.from({ length: recentPageCount }, (_, page) => available.slice(page * 3, page * 3 + 3))
  const campaignOverlay: Record<string, { action: string; detail: string }> = {
    'opportunity-barrier-reset': { action: 'Apply today', detail: 'Join the next internship cohort.' },
    'opportunity-night-routine': { action: 'Take the challenge', detail: 'Complete five daily creator missions.' },
    'opportunity-tech-recruitment': { action: 'Find your role', detail: 'Explore open technology careers.' },
    'opportunity-spm-dubai': { action: 'Work in Dubai', detail: 'See roles and relocation details.' },
    'opportunity-pitx-job-fair': { action: 'Get hired onsite', detail: 'Register for the PITX job fair.' },
    'opportunity-kcp-networking': { action: 'Grow your network', detail: 'Meet entrepreneurs and professionals.' },
  }
  const campaignBadge: Record<string, string> = {
    'opportunity-barrier-reset': 'COMMUNITY FAVORITE',
    'opportunity-night-routine': 'POPULAR TODAY',
    'opportunity-tech-recruitment': 'POPULAR WITH SMALL COMMUNITIES',
    'opportunity-spm-dubai': 'LAST CYCLE ONGOING',
    'opportunity-pitx-job-fair': 'POPULAR TODAY',
    'opportunity-kcp-networking': 'POPULAR WITH SMALL COMMUNITIES',
  }
  function updatePopularScroll() {
    const track = popularTrackRef.current
    if (!track) return
    setPopularScroll({ atStart: track.scrollLeft <= 1, atEnd: track.scrollLeft + track.clientWidth >= track.scrollWidth - 1 })
  }
  function scrollPopular(direction: -1 | 1) {
    const track = popularTrackRef.current
    const card = track?.querySelector<HTMLElement>('.marketplace-card')
    if (!track || !card) return
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0
    track.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: 'smooth' })
  }
  function startRecentSwipe(event: React.PointerEvent<HTMLDivElement>) {
    if (recentGestureRef.current) return
    event.currentTarget.setPointerCapture(event.pointerId)
    recentGestureRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, time: Date.now() }
  }
  function finishRecentSwipe(event: React.PointerEvent<HTMLDivElement>) {
    const start = recentGestureRef.current
    if (!start || start.pointerId !== event.pointerId) return
    recentGestureRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    const deltaX = event.clientX - start.x
    const deltaY = event.clientY - start.y
    const distance = Math.abs(deltaX)
    const velocity = distance / Math.max(1, Date.now() - start.time)
    const isHorizontalSwipe = distance > Math.abs(deltaY) * 1.2 && (distance >= 40 || (distance >= 20 && velocity > .3))
    if (!isHorizontalSwipe) return
    recentSwipeUntilRef.current = Date.now() + 400
    setRecentPage((page) => deltaX < 0 ? Math.min(recentPageCount - 1, page + 1) : Math.max(0, page - 1))
  }

  return <div className="page-stack campaign-marketplace-page">
    <section className="marketplace-tab-shell" aria-label="Campaign views">
      <div className="marketplace-tabs">{([['available', 'Campaigns'], ['claimed', 'Claimed']] as const).map(([id, label]) => <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}</button>)}</div>
    </section>

    {filter === 'available' ? <>
      <section className="marketplace-recent" aria-labelledby="recently-viewed-title"><header><h2 id="recently-viewed-title">Recently Viewed</h2><div className="marketplace-recent-controls"><button onClick={() => setRecentPage((page) => Math.max(0, page - 1))} disabled={recentPage === 0} aria-label="Previous recently viewed campaigns"><ArrowLeft size={17} /></button><button onClick={() => setRecentPage((page) => Math.min(recentPageCount - 1, page + 1))} disabled={recentPage >= recentPageCount - 1} aria-label="Next recently viewed campaigns"><ArrowRight size={17} /></button></div></header><div className="marketplace-recent-track" onPointerDown={startRecentSwipe} onPointerUp={finishRecentSwipe} onPointerCancel={() => { recentGestureRef.current = null }} onClickCapture={(event) => { if (Date.now() < recentSwipeUntilRef.current) event.preventDefault() }}><div className="marketplace-recent-slider" style={{ transform: `translateX(-${recentPage * 100}%)` }}>{recentCampaignPages.map((page, pageIndex) => <div className="marketplace-recent-page" key={pageIndex}>{page.map((opportunity) => <Link to={`/leader/campaigns/claim/${opportunity.id}`} key={opportunity.id}><img src={artwork[opportunity.id]} alt="" /><strong>{opportunity.name}</strong><small><b>{formatCurrency(opportunity.totalBudget)}</b><span>for {campaignDurationLabel(opportunity.preparationStart, opportunity.liveEnd)}</span></small></Link>)}</div>)}</div></div></section>
      <section className="marketplace-results marketplace-popular" aria-labelledby="popular-campaigns-title">
        <header><h2 id="popular-campaigns-title">Popular Campaigns</h2><div className="marketplace-popular-actions"><div className="marketplace-recent-controls"><button onClick={() => scrollPopular(-1)} disabled={popularScroll.atStart} aria-label="Previous popular campaign"><ArrowLeft size={17} /></button><button onClick={() => scrollPopular(1)} disabled={popularScroll.atEnd || available.length <= 1} aria-label="Next popular campaign"><ArrowRight size={17} /></button></div></div></header>
        <div className="marketplace-grid marketplace-popular-track" ref={popularTrackRef} onScroll={updatePopularScroll}>{available.map((opportunity) => {
        const preview = calculateAllocation(state, opportunity.id, community.id)
        const overlay = campaignOverlay[opportunity.id] ?? { action: 'Join the campaign', detail: 'Create content with your community.' }
        return <article className="marketplace-card" key={opportunity.id}>
          <Link className="marketplace-card-art" to={`/leader/campaigns/claim/${opportunity.id}`} aria-label={`View ${opportunity.name}`}><img src={artwork[opportunity.id]} alt="" /><span className="marketplace-favorite"><Heart size={13} weight="fill" /> {campaignBadge[opportunity.id] ?? 'COMMUNITY FAVORITE'}</span><span className="marketplace-campaign-overlay"><small>BIG CAMPAIGN</small><strong>{overlay.action}</strong><span>{overlay.detail}</span></span></Link>
          <div className="marketplace-card-body"><span className="marketplace-brand">{opportunity.id === 'opportunity-night-routine' ? 'OKPO' : 'MADRID PHILIPPINES'}</span><h3>{opportunity.name}</h3><p>{opportunity.contentDirection}</p><dl><div><dt>Content allocation</dt><dd>{preview.contentQuota} <small>posts</small></dd></div><div><dt>Earnings pool</dt><dd>{formatCurrency(preview.budgetAllocation)}</dd></div></dl></div>
          <div className="marketplace-mobile-claim">
            <img src={opportunity.id === 'opportunity-night-routine' ? '/assets/okpo-logo.png' : '/assets/madrid-philippines-logo.png'} alt="" />
            <div><strong>{opportunity.name}</strong><small>{formatCurrency(preview.budgetAllocation)} allocated prize pool</small></div>
            <Link to={`/leader/campaigns/claim/${opportunity.id}`}>Claim</Link>
          </div>
        </article>
        })}</div>
        {available.length === 0 ? <EmptyState icon={Storefront} title="No campaigns available" description="New campaigns will appear here when brands open them for claiming." /> : null}
      </section>
    </> : <section className="marketplace-results marketplace-popular marketplace-claimed" aria-labelledby="claimed-campaigns-title"><header><h2 id="claimed-campaigns-title">Claimed Campaigns</h2></header><div className="marketplace-grid marketplace-popular-track">{claimed.map((opportunity) => { const product = state.products.find((item) => item.id === opportunity.productId)!; const existingClaim = claims.find((claim) => claim.opportunityId === opportunity.id)!; return <article className="marketplace-card" key={opportunity.id}><Link className="marketplace-card-art" to={`/leader/campaigns/claim/${opportunity.id}`} aria-label={`View ${opportunity.name}`}><img src={artwork[opportunity.id]} alt="" /><span className="marketplace-status claimed"><Check size={12} /> Claimed</span><span className="marketplace-campaign-overlay"><strong>{opportunity.name}</strong><span>{opportunity.contentDirection}</span></span></Link><div className="marketplace-card-body"><span className="marketplace-brand">DERMOREPUBLIQ · {product.category}</span><h3>{opportunity.name}</h3><p>{opportunity.contentDirection}</p><dl><div><dt>Content allocation</dt><dd>{existingClaim.contentQuota} <small>posts</small></dd></div><div><dt>Earnings pool</dt><dd>{formatCurrency(existingClaim.budgetAllocation)}</dd></div></dl><Link className="marketplace-secondary-button" to={`/leader/campaigns/claim/${opportunity.id}`}>View claimed campaign <ArrowRight size={16} /></Link></div><div className="marketplace-mobile-claim"><img src="/assets/madrid-philippines-logo.png" alt="" /><div><strong>{opportunity.name}</strong><small>{formatCurrency(existingClaim.budgetAllocation)} allocated prize pool</small></div><Link to={`/leader/campaigns/claim/${opportunity.id}`}>View</Link></div></article> })}</div></section>}
  </div>
}

function CreateCommunityCampaignModal({ claim, onClose }: { claim: CommunityClaim; onClose: () => void }) {
  const { state, dispatch } = useApp()
  const opportunity = state.opportunities.find((item) => item.id === claim.opportunityId)!
  const remaining = claimRemaining(state, claim)
  const [form, setForm] = useState({ title: '', themes: 'Real routines, Product application', instructions: '', memberRequirements: '', deadline: opportunity.liveEnd, contentQuota: Math.min(remaining.content, 20), rewardBudget: Math.min(remaining.budget, 20000) })
  const valid = form.title.trim() && form.contentQuota > 0 && form.contentQuota <= remaining.content && form.rewardBudget >= 0 && form.rewardBudget <= remaining.budget
  function submit(event: React.FormEvent) { event.preventDefault(); if (!valid) return; dispatch({ type: 'CREATE_COMMUNITY_CAMPAIGN', payload: { claimId: claim.id, opportunityId: claim.opportunityId, communityId: claim.communityId, title: form.title, themes: form.themes.split(',').map((item) => item.trim()).filter(Boolean), instructions: form.instructions, memberRequirements: form.memberRequirements, deadline: form.deadline, contentQuota: form.contentQuota, rewardBudget: form.rewardBudget } }); onClose() }
  return <div className="modal-backdrop"><form className="modal-card form-modal" onSubmit={submit}><header><div><span className="eyebrow">UNDER {opportunity.name.toUpperCase()}</span><h2>Create promotion</h2></div><button type="button" className="icon-button" onClick={onClose}>×</button></header><div className="available-allocation"><div><span>Available content</span><strong>{remaining.content}</strong></div><div><span>Available earnings</span><strong>{formatCurrency(remaining.budget)}</strong></div><LockKeyhole size={20} /></div><div className="form-grid form-grid-two"><label className="field full"><span>Promotion title</span><input aria-label="Promotion title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. 7-Day Barrier Diaries" /></label><label className="field full"><span>Content themes</span><input value={form.themes} onChange={(event) => setForm({ ...form, themes: event.target.value })} /><small>Separate themes with commas.</small></label><label className="field full"><span>Publishing instructions</span><textarea rows={3} value={form.instructions} onChange={(event) => setForm({ ...form, instructions: event.target.value })} /></label><label className="field full"><span>Creator content requirements</span><textarea rows={3} value={form.memberRequirements} onChange={(event) => setForm({ ...form, memberRequirements: event.target.value })} /></label><label className="field"><span>Internal deadline</span><input type="date" min={opportunity.liveStart} max={opportunity.liveEnd} value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} /></label><span /><label className="field"><span>Content quota</span><input aria-label="Promotion content quota" type="number" min="1" max={remaining.content} value={form.contentQuota} onChange={(event) => setForm({ ...form, contentQuota: Number(event.target.value) })} /><small>Maximum {remaining.content}</small></label><label className="field"><span>Earnings allocation</span><div className="money-input"><span>₱</span><input aria-label="Promotion earnings allocation" type="number" min="0" max={remaining.budget} value={form.rewardBudget} onChange={(event) => setForm({ ...form, rewardBudget: Number(event.target.value) })} /></div><small>Maximum {formatCurrency(remaining.budget)}</small></label></div><Callout tone="neutral" title="Allocation guardrail">OkPo blocks content and earnings totals above this community’s assigned quota and pool.</Callout><footer><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={!valid}>Create draft promotion</button></footer></form></div>
}

export function LeaderCampaignWorkspace() {
  const { state, dispatch, community } = useLeaderContext()
  const { communityCampaignId } = useParams()
  const [params, setParams] = useSearchParams()
  const campaign = state.communityCampaigns.find((item) => item.id === communityCampaignId)
  const tab = params.get('tab') ?? 'overview'
  const [assigning, setAssigning] = useState(false)
  if (!campaign || campaign.communityId !== community.id) return <EmptyState title="Promotion not found" description="Return to your promotions." />
  const opportunity = state.opportunities.find((item) => item.id === campaign.opportunityId)!
  const claim = state.claims.find((item) => item.id === campaign.claimId)!
  const metrics = getCommunityCampaignMetrics(state, campaign.id)
  const assignments = state.assignments.filter((item) => item.communityCampaignId === campaign.id)
  const content = state.contents.filter((item) => item.communityCampaignId === campaign.id)
  const tabs = [{ id: 'overview', label: 'Overview' }, { id: 'preparation', label: 'Preparation' }, { id: 'members', label: 'My creators', count: metrics.members }, { id: 'content', label: 'Content', count: metrics.recorded }, { id: 'budget', label: 'Earnings' }]
  return <div className="page-stack workspace-page"><Link className="back-link" to="/leader/campaigns"><ArrowLeft size={15} />My promotions</Link><header className="workspace-header"><div className="workspace-mark mint-mark">PR</div><div><div className="workspace-title-line"><h1>{campaign.title}</h1><StatusBadge status={campaign.status} /></div><p>{opportunity.name}</p><span>{community.name} · deadline {formatDate(campaign.deadline)}</span></div><div className="workspace-actions">{campaign.status !== 'Completed' ? <button className="button button-primary" onClick={() => dispatch({ type: 'ADVANCE_COMMUNITY_CAMPAIGN', communityCampaignId: campaign.id })}>Advance to next phase <ArrowRight size={16} /></button> : null}</div></header><SegmentedTabs tabs={tabs} active={tab} onChange={(id) => setParams({ tab: id })} />
    {tab === 'overview' ? <div className="tab-stack"><section className="metrics-grid metrics-grid-four"><MetricCard label="Content quota" value={campaign.contentQuota} detail={`of ${claim.contentQuota} community allocation`} icon={Target} /><MetricCard label="Assigned" value={metrics.assigned} detail={`${Math.max(0, campaign.contentQuota - metrics.assigned)} slots available`} icon={Users} /><MetricCard label="Counted" value={metrics.counted} detail={`${metrics.completionPercentage}% complete`} icon={CheckCircle2} tone="yellow" /><MetricCard label="Earnings allocation" value={formatCurrency(campaign.rewardBudget)} detail={`within ${formatCurrency(claim.budgetAllocation)}`} icon={CircleDollarSign} /></section><Panel title="Delivery against quota"><div className="commitment-head"><div><h2>{metrics.counted} of {campaign.contentQuota} counted</h2><p>Content contributes after the creator publishes and records the public link.</p></div><strong>{metrics.completionPercentage}%</strong></div><ProgressBar value={metrics.completionPercentage} tone="black" /></Panel><div className="two-column-layout"><Panel title="Operational brief"><h3>Content themes</h3><div className="tag-row">{campaign.themes.map((item) => <span key={item}>{item}</span>)}</div><h3>Publishing instructions</h3><p className="body-copy">{campaign.instructions}</p><h3>Creator requirements</h3><p className="body-copy">{campaign.memberRequirements}</p></Panel><Panel title="Fixed Brand foundation"><dl className="summary-list"><div><dt>Platform</dt><dd>{opportunity.platform}</dd></div><div><dt>Live dates</dt><dd>{formatDate(opportunity.liveStart)} – {formatDate(opportunity.liveEnd)}</dd></div><div><dt>Brand target</dt><dd>{opportunity.requiredContent} contents</dd></div><div><dt>Community quota</dt><dd>{claim.contentQuota} contents</dd></div></dl><div className="locked-note"><LockKeyhole size={16} /><span>Timeline, Brand expectations, and allocation are fixed.</span></div></Panel></div></div> : null}
    {tab === 'preparation' ? <div className="tab-stack"><Callout title="Preparation is separate from live delivery">These readiness tasks happen before publishing begins and do not count toward the content commitment.</Callout><Panel title="Launch readiness" description="Complete each operational check before the promotion goes live."><div className="preparation-grid">{([
      ['membersActivated', 'Community creators activated', 'Creators are active and ready to accept assignments.'],
      ['productAssignmentsReady', 'Product assignments ready', 'Creators know which product they will feature.'],
      ['instructionsPublished', 'Campaign instructions published', 'The complete brief is available to assigned creators.'],
      ['contentThemesPrepared', 'Content themes prepared', 'Operational themes have been divided clearly.'],
      ['monitoringReady', 'Monitoring ready', 'Published-link recording and campaign tracking are ready.'],
      ['readyToLaunch', 'Promotion ready to launch', 'Final readiness confirmation.'],
    ] as const).map(([key, label, description]) => <CheckRow key={key} checked={campaign.preparation[key]} onClick={() => dispatch({ type: 'TOGGLE_PREPARATION', communityCampaignId: campaign.id, key })}><strong>{label}</strong><small>{description}</small></CheckRow>)}</div><div className="readiness-footer"><ProgressBar value={Math.round(Object.values(campaign.preparation).filter(Boolean).length / 6 * 100)} label="Preparation progress" /><span>{Object.values(campaign.preparation).filter(Boolean).length} of 6 ready</span></div></Panel></div> : null}
    {tab === 'members' ? <div className="tab-stack"><Panel title="Assigned creators" description={`${metrics.assigned} of ${campaign.contentQuota} content requirements assigned.`} action={<button className="button button-primary button-small" onClick={() => setAssigning(true)} disabled={metrics.assigned >= campaign.contentQuota}><UserPlus size={15} />Assign creator</button>}><div className="table-wrap"><table><thead><tr><th>Creator</th><th>Joined</th><th>Required content</th><th>Accepted</th><th>Recorded</th><th>Counted</th></tr></thead><tbody>{assignments.map((assignment) => { const member = state.members.find((item) => item.id === assignment.memberId)!; const rows = content.filter((item) => item.assignmentId === assignment.id); return <tr key={assignment.id}><td><div className="person-cell"><Avatar initials={member.initials} size="sm" /><span><strong>{member.name}</strong><small>{member.handle}{member.newlyRecruited ? ' · Newly recruited' : ''}</small></span></div></td><td>{assignment.assignedAt}</td><td>{assignment.requiredContent}</td><td>{assignment.accepted ? <span className="yes-cell"><Check size={14} />Accepted</span> : <StatusBadge status="Invited" />}</td><td>{rows.filter((item) => ['Recorded', 'Validated', 'Counted'].includes(item.status)).length}</td><td>{rows.filter((item) => item.status === 'Counted').length}</td></tr> })}</tbody></table></div>{assignments.length === 0 ? <EmptyState icon={Users} title="No creators assigned" description="Activate community creators and divide this campaign’s content requirements." /> : null}</Panel>{assigning ? <AssignMemberModal campaign={campaign} onClose={() => setAssigning(false)} /> : null}</div> : null}
    {tab === 'content' ? <LeaderContentTable campaignId={campaign.id} /> : null}
    {tab === 'budget' ? <CampaignBudget campaign={campaign} /> : null}
  </div>
}

function AssignMemberModal({ campaign, onClose }: { campaign: CommunityCampaign; onClose: () => void }) {
  const { state, dispatch } = useApp()
  const metrics = getCommunityCampaignMetrics(state, campaign.id)
  const eligible = state.members.filter((item) => item.communityId === campaign.communityId && item.active && !state.assignments.some((assignment) => assignment.communityCampaignId === campaign.id && assignment.memberId === item.id))
  const [memberId, setMemberId] = useState(eligible[0]?.id ?? '')
  const [quantity, setQuantity] = useState(1)
  const remaining = campaign.contentQuota - metrics.assigned
  function submit(event: React.FormEvent) { event.preventDefault(); if (!memberId || quantity < 1 || quantity > remaining) return; dispatch({ type: 'ASSIGN_MEMBER', communityCampaignId: campaign.id, memberId, requiredContent: quantity }); onClose() }
  return <div className="modal-backdrop"><form className="modal-card compact-modal" onSubmit={submit}><header><div><span className="eyebrow">CREATOR ASSIGNMENT</span><h2>Assign content requirements</h2></div><button type="button" className="icon-button" onClick={onClose}>×</button></header><div className="form-grid"><label className="field"><span>Community creator</span><select aria-label="Community creator" value={memberId} onChange={(event) => setMemberId(event.target.value)}>{eligible.map((member) => <option key={member.id} value={member.id}>{member.name} · {member.handle}</option>)}</select></label><label className="field"><span>Required content</span><input aria-label="Assigned content quantity" type="number" min="1" max={remaining} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} /><small>{remaining} unassigned content slots remain.</small></label></div><footer><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={!memberId || quantity > remaining}>Assign creator</button></footer></form></div>
}

function LeaderContentTable({ campaignId }: { campaignId?: string }) {
  const { state, dispatch, community } = useLeaderContext()
  const [recordingId, setRecordingId] = useState<string | null>(null)
  const [recordingUrl, setRecordingUrl] = useState('')
  const campaignIds = new Set(state.communityCampaigns.filter((item) => item.communityId === community.id && (!campaignId || item.id === campaignId)).map((item) => item.id))
  const rows = [...state.contents].reverse().filter((item) => campaignIds.has(item.communityCampaignId) && ['Published', 'Recorded', 'Validated', 'Counted'].includes(item.status)).sort((a, b) => {
    const priority = (status: string) => ['Recorded', 'Validated'].includes(status) ? 0 : status === 'Published' ? 1 : 2
    return priority(a.status) - priority(b.status)
  }).slice(0, 60)
  function recordPublishedLink() {
    if (!recordingId || !recordingUrl.trim()) return
    dispatch({ type: 'RECORD_CONTENT', contentId: recordingId, publishedUrl: recordingUrl })
    setRecordingId(null)
  }
  return <><Panel title="Published content monitoring" description="Record published links; OkPo counts eligible content automatically."><div className="table-wrap"><table><thead><tr><th>Creator</th><th>Promotion</th><th>Status</th><th>Public link</th><th>Published</th><th>Supporting reach</th><th /></tr></thead><tbody>{rows.map((content) => { const member = state.members.find((item) => item.id === content.memberId)!; const campaign = state.communityCampaigns.find((item) => item.id === content.communityCampaignId)!; return <tr key={content.id}><td><div className="person-cell"><Avatar initials={member.initials} size="sm" /><span><strong>{member.name}</strong><small>Content {content.slot}</small></span></div></td><td>{campaign.title}</td><td><ContentBadge status={content.status} /></td><td>{content.publishedUrl ? <a className="table-link" href={content.publishedUrl} target="_blank" rel="noreferrer">Inspect post ↗</a> : '—'}</td><td>{content.publishedAt ?? '—'}</td><td>{formatNumber(content.views)} views</td><td>{['Recorded', 'Validated'].includes(content.status) ? <span className="yes-cell"><Check size={14} />Counting automatically</span> : content.status === 'Published' ? <button className="button button-secondary button-small" onClick={() => { setRecordingId(content.id); setRecordingUrl(content.publishedUrl ?? '') }}>Record link</button> : content.status === 'Counted' ? <span className="yes-cell"><Check size={14} />Counted</span> : <span className="muted">Waiting for publication</span>}</td></tr> })}</tbody></table></div></Panel>{recordingId ? <div className="modal-backdrop"><div className="modal-card compact-modal"><header><div><span className="eyebrow">COMMUNITY MANAGER CONTENT RECORD</span><h2>Record the published link</h2></div><button className="icon-button" onClick={() => setRecordingId(null)}>×</button></header><Callout tone="neutral" title="Published externally">Use the public post URL supplied by the creator. Recording does not publish or sync analytics.</Callout><label className="field"><span>Published-content URL</span><input aria-label="Manager published-content URL" value={recordingUrl} onChange={(event) => setRecordingUrl(event.target.value)} /></label><footer><button className="button button-secondary" onClick={() => setRecordingId(null)}>Cancel</button><button className="button button-primary" disabled={!recordingUrl.trim()} onClick={recordPublishedLink}>Record link</button></footer></div></div> : null}</>
}

function CampaignBudget({ campaign }: { campaign: CommunityCampaign }) {
  const { state, dispatch } = useApp()
  const rewards = state.rewards.filter((item) => item.communityCampaignId === campaign.id)
  const approved = rewards.filter((item) => ['Approved', 'Completed'].includes(item.status)).reduce((sum, item) => sum + item.amount, 0)
  return <div className="tab-stack"><section className="metrics-grid metrics-grid-three"><MetricCard label="Promotion earnings pool" value={formatCurrency(campaign.rewardBudget)} detail="fixed within community allocation" icon={WalletCards} /><MetricCard label="Approved or completed" value={formatCurrency(approved)} detail="simulated earnings status" icon={CheckCircle2} /><MetricCard label="Available" value={formatCurrency(Math.max(0, campaign.rewardBudget - approved))} detail="not yet released" icon={CircleDollarSign} /></section><Panel title="Creator earnings" description="Prototype statuses only—no payments are processed."><div className="table-wrap"><table><thead><tr><th>Creator</th><th>Content requirement</th><th>Earnings</th><th>Status</th><th /></tr></thead><tbody>{rewards.map((reward) => { const member = state.members.find((item) => item.id === reward.memberId)!; const assignment = state.assignments.find((item) => item.id === reward.assignmentId)!; return <tr key={reward.id}><td><div className="person-cell"><Avatar initials={member.initials} size="sm" /><strong>{member.name}</strong></div></td><td>{assignment.requiredContent}</td><td><strong>{formatCurrency(reward.amount)}</strong></td><td><StatusBadge status={reward.status} /></td><td>{reward.status === 'Pending' ? <button className="button button-secondary button-small" onClick={() => dispatch({ type: 'SET_REWARD_STATUS', rewardId: reward.id, status: 'Approved' })}>Approve earnings</button> : reward.status === 'Approved' ? <button className="button button-secondary button-small" onClick={() => dispatch({ type: 'SET_REWARD_STATUS', rewardId: reward.id, status: 'Completed' })}>Mark completed</button> : <span className="yes-cell"><Check size={14} />Complete</span>}</td></tr> })}</tbody></table></div></Panel></div>
}

export function LeaderMembers() {
  const { state, dispatch, community, campaigns } = useLeaderContext()
  const members = state.members.filter((item) => item.communityId === community.id)
  return <div className="page-stack"><PageHeader eyebrow="MY CREATORS" title="Activate and assign your creators" description={`${community.verifiedSize} verified creators underpin allocations; this prototype shows the active operational cohort.`} /><section className="metrics-grid metrics-grid-three"><MetricCard label="Verified community size" value={community.verifiedSize} detail="allocation basis" icon={BadgeCheck} /><MetricCard label="Active creators" value={members.filter((item) => item.active).length} detail={`${members.filter((item) => item.newlyRecruited).length} newly recruited`} icon={UserCheck} /><MetricCard label="Active promotions" value={campaigns.filter((item) => ['Preparation', 'Ready', 'Live'].includes(item.status)).length} detail="ready for assignments" icon={Layers3} /></section><Panel title="Creator roster"><div className="table-wrap"><table><thead><tr><th>Creator</th><th>Platform</th><th>Creator type</th><th>Assignments</th><th>Counted content</th><th>Status</th></tr></thead><tbody>{members.map((member) => { const assignments = state.assignments.filter((item) => item.memberId === member.id); const counted = state.contents.filter((item) => item.memberId === member.id && item.status === 'Counted').length; return <tr key={member.id}><td><div className="person-cell"><Avatar initials={member.initials} /><span><strong>{member.name}</strong><small>{member.handle}</small></span></div></td><td>{member.platform}</td><td><button className={member.newlyRecruited ? 'new-label member-type-button' : 'member-type-button'} onClick={() => dispatch({ type: 'SET_MEMBER_ACTIVE', memberId: member.id, active: member.active, newlyRecruited: !member.newlyRecruited })}>{member.newlyRecruited ? 'New recruit' : 'Mark as new recruit'}</button></td><td>{assignments.length}</td><td>{counted}</td><td><button className={`activation-toggle ${member.active ? 'active' : ''}`} onClick={() => dispatch({ type: 'SET_MEMBER_ACTIVE', memberId: member.id, active: !member.active })}><i />{member.active ? 'Active' : 'Inactive'}</button></td></tr> })}</tbody></table></div></Panel></div>
}

export function LeaderContent() {
  const { contents } = useLeaderContext()
  const counted = contents.filter((item) => item.status === 'Counted').length
  return <div className="page-stack"><PageHeader eyebrow="CONTENT MONITORING" title="From published link to counted delivery" description="Monitor your creators’ published content; OkPo handles counting automatically." /><section className="metrics-grid metrics-grid-two"><MetricCard label="Counted content" value={counted} detail="contributes to brand commitments" icon={CheckCircle2} tone="yellow" /><MetricCard label="Available views" value={formatNumber(contents.reduce((sum, item) => sum + item.views, 0))} detail="supporting metric only" icon={BarChart3} /></section><LeaderContentTable /></div>
}

export function LeaderBudget() {
  const { state, claims, campaigns } = useLeaderContext()
  const total = claims.reduce((sum, item) => sum + item.budgetAllocation, 0)
  const divided = campaigns.reduce((sum, item) => sum + item.rewardBudget, 0)
  const completedRewards = state.rewards.filter((reward) => campaigns.some((campaign) => campaign.id === reward.communityCampaignId) && reward.status === 'Completed').reduce((sum, item) => sum + item.amount, 0)
  return <div className="page-stack"><PageHeader eyebrow="COMMUNITY EARNINGS" title="Earnings across every promotion" description="Track earned, pending, and available community rewards. No real payments are processed." /><section className="metrics-grid metrics-grid-three"><MetricCard label="Total community earnings" value={formatCurrency(completedRewards)} detail="simulated completed rewards" icon={CircleDollarSign} tone="yellow" /><MetricCard label="Pending earnings" value={formatCurrency(Math.max(0, divided - completedRewards))} detail="across active promotions" icon={WalletCards} /><MetricCard label="Available campaign pool" value={formatCurrency(Math.max(0, total - divided))} detail={`${claims.length} campaign allocations`} icon={Layers3} /></section><Panel title="Earnings by campaign"><div className="table-wrap"><table><thead><tr><th>Brand campaign</th><th>Content quota</th><th>Allocated</th><th>Promotion earnings pool</th><th>Available</th></tr></thead><tbody>{claims.map((claim) => { const opportunity = state.opportunities.find((item) => item.id === claim.opportunityId)!; const related = campaigns.filter((item) => item.claimId === claim.id); const assigned = related.reduce((sum, item) => sum + item.rewardBudget, 0); return <tr key={claim.id}><td><strong>{opportunity.name}</strong><small className="table-subline">Claimed {claim.claimedAt}</small></td><td>{claim.contentQuota}</td><td><strong>{formatCurrency(claim.budgetAllocation)}</strong></td><td>{formatCurrency(assigned)}</td><td>{formatCurrency(claim.budgetAllocation - assigned)}</td></tr> })}</tbody></table></div></Panel></div>
}

export function LeaderCommunityProfile() {
  const { dispatch, community } = useLeaderContext()
  const [form, setForm] = useState<Community>(community)
  const [saved, setSaved] = useState(false)
  function submit(event: React.FormEvent) { event.preventDefault(); dispatch({ type: 'UPDATE_COMMUNITY', community: form }); setSaved(true) }
  return <div className="page-stack settings-page"><PageHeader eyebrow="COMMUNITY PROFILE" title="Your verified campaign community" description="Brands see this profile, while verified size powers automatic allocation." /><form className="panel profile-form" onSubmit={submit}><div className="profile-identity"><Avatar initials={form.initials} size="lg" tone="mint" /><div><strong>{form.name}</strong><span><BadgeCheck size={14} />Verified community</span></div><div className="profile-verified"><strong>{form.verifiedSize}</strong><small>verified creators</small></div></div><Callout tone="neutral" title="Verified size is read-only">OkPo’s internal administration verifies community size. Community Managers cannot edit the allocation basis in this prototype.</Callout><div className="form-grid form-grid-two"><label className="field"><span>Community name</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label className="field"><span>Location</span><input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></label><label className="field"><span>Community Manager name</span><input value={form.leaderName} onChange={(event) => setForm({ ...form, leaderName: event.target.value })} /></label><label className="field"><span>Manager classification</span><select value={form.leaderType} onChange={(event) => setForm({ ...form, leaderType: event.target.value as Community['leaderType'] })}><option>Internal</option><option>External</option></select></label><label className="field full"><span>Community description</span><textarea rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label></div><footer className="form-footer">{saved ? <span className="saved-message"><CheckCircle2 size={16} />Saved to this prototype</span> : <span />}<button className="button button-primary">Save community profile</button></footer></form></div>
}
