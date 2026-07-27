import {
  ArrowLeft, ArrowRight, BarChart3, Boxes, CalendarDays, Check, CheckCircle2, ChevronDown,
  Eye, FileCheck2, Flag, Hash, Layers3, MousePointerClick, Package, Percent,
  Minus, Pencil, Plus, Send, Sparkles, Target, Users, WalletCards,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Avatar, Callout, ContentBadge, EmptyState, InfoToast, MetricCard, PageHeader, Panel, ProgressBar,
  SegmentedTabs, StatusBadge,
} from '../components'
import { legacyDemoOpportunityIds, madridCampaigns, type MadridCampaign } from '../madridCampaigns'
import { madridPromotions, type MadridPromotion } from '../madridPromotions'
import { formatCurrency, formatDate, formatNumber, getCommunityCampaignMetrics, getOpportunityMetrics, useApp } from '../store'
import type { OpportunityDraft, Product } from '../types'

function opportunityBudgetUsed(state: ReturnType<typeof useApp>['state'], opportunityId: string) {
  return state.communityCampaigns.filter((item) => item.opportunityId === opportunityId).reduce((total, campaign) => {
    const metrics = getCommunityCampaignMetrics(state, campaign.id)
    return total + Math.round(campaign.rewardBudget * metrics.counted / Math.max(1, campaign.contentQuota))
  }, 0)
}

type FeaturedCampaign = MadridCampaign

function useMobileAutoCarousel(itemCount: number) {
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel || itemCount < 2 || typeof window.matchMedia !== 'function') return

    const mobile = window.matchMedia('(max-width: 700px)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let timer = 0
    let visible = true

    const stop = () => window.clearTimeout(timer)
    const advance = () => {
      if (!mobile.matches || reducedMotion.matches || !visible || document.hidden) return
      const cards = Array.from(carousel.querySelectorAll<HTMLElement>('.featured-campaign-card'))
      if (cards.length < 2) return
      const firstOffset = cards[0].offsetLeft
      const currentIndex = cards.reduce((closest, card, index) => (
        Math.abs(card.offsetLeft - firstOffset - carousel.scrollLeft) < Math.abs(cards[closest].offsetLeft - firstOffset - carousel.scrollLeft) ? index : closest
      ), 0)
      const nextCard = cards[(currentIndex + 1) % cards.length]
      carousel.scrollTo({ left: nextCard.offsetLeft - firstOffset, behavior: 'smooth' })
    }
    const schedule = (delay = 3000) => {
      stop()
      if (!mobile.matches || reducedMotion.matches || !visible || document.hidden) return
      timer = window.setTimeout(() => {
        advance()
        schedule()
      }, delay)
    }
    const pauseForInteraction = () => stop()
    const resumeAfterInteraction = () => schedule(1000)
    const sync = () => schedule()

    carousel.addEventListener('pointerdown', pauseForInteraction, { passive: true })
    carousel.addEventListener('pointerup', resumeAfterInteraction, { passive: true })
    carousel.addEventListener('pointercancel', resumeAfterInteraction, { passive: true })
    carousel.addEventListener('wheel', resumeAfterInteraction, { passive: true })
    mobile.addEventListener('change', sync)
    reducedMotion.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)

    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      sync()
    }, { threshold: 0.25 })
    observer?.observe(carousel)
    schedule()

    return () => {
      stop()
      observer?.disconnect()
      carousel.removeEventListener('pointerdown', pauseForInteraction)
      carousel.removeEventListener('pointerup', resumeAfterInteraction)
      carousel.removeEventListener('pointercancel', resumeAfterInteraction)
      carousel.removeEventListener('wheel', resumeAfterInteraction)
      mobile.removeEventListener('change', sync)
      reducedMotion.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [itemCount])

  return carouselRef
}

function useShowcaseLiquidity(baseValue: number) {
  const [displayValue, setDisplayValue] = useState(baseValue)
  const [motionState, setMotionState] = useState<'idle' | 'counting' | 'resetting'>('idle')
  const valueRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setDisplayValue(baseValue)
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const decrements = [500, 750, 1000, 625]
    const timers = new Set<number>()
    let visible = typeof IntersectionObserver === 'undefined'

    const clearTimers = () => {
      timers.forEach((timer) => window.clearTimeout(timer))
      timers.clear()
    }

    const later = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer)
        callback()
      }, delay)
      timers.add(timer)
    }

    const scheduleCycle = (delay = 5200) => later(() => {
      if (!visible) return
      let nextValue = baseValue
      let stepIndex = 0
      const countDown = () => {
        if (!visible) return
        nextValue = Math.max(0, nextValue - decrements[stepIndex])
        stepIndex += 1
        setMotionState('counting')
        setDisplayValue(nextValue)
        later(() => setMotionState('idle'), 300)
        if (stepIndex < decrements.length) {
          later(countDown, 1200)
          return
        }
        later(() => {
          setMotionState('resetting')
          later(() => {
            setDisplayValue(baseValue)
            setMotionState('idle')
            scheduleCycle()
          }, 340)
        }, 1800)
      }
      countDown()
    }, delay)

    let observer: IntersectionObserver | undefined
    if (typeof IntersectionObserver !== 'undefined' && valueRef.current) {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          if (!visible) {
            visible = true
            scheduleCycle(3200)
          }
          return
        }
        visible = false
        clearTimers()
        setDisplayValue(baseValue)
        setMotionState('idle')
      }, { threshold: 0.25 })
      observer.observe(valueRef.current)
    } else {
      scheduleCycle(4200)
    }

    return () => {
      observer?.disconnect()
      clearTimers()
    }
  }, [baseValue])

  return { displayValue, motionState, valueRef }
}

const tiktokContentPreviews = Array.from({ length: 9 }, (_, index) => `/assets/tiktok-preview-${String(index + 1).padStart(2, '0')}.png`)
const madridFinancialSnapshot = {
  paid: 745885.02,
  pending: 23286,
  walletBalance: 98985.79,
}
const madridGrossPoolValue = (madridFinancialSnapshot.paid + madridFinancialSnapshot.pending + madridFinancialSnapshot.walletBalance) * 1.4
const madridLiquidity = (madridFinancialSnapshot.pending + madridFinancialSnapshot.walletBalance) * 1.4

export function BrandDashboard() {
  const { state } = useApp()
  const [communitiesOpen, setCommunitiesOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<FeaturedCampaign | null>(null)
  const [goalExpanded, setGoalExpanded] = useState(false)
  const postedOpportunities = state.opportunities.filter((item) => item.status !== 'Draft')
  const grossPoolValue = madridGrossPoolValue
  const liquidity = madridLiquidity
  const liquidityShowcase = useShowcaseLiquidity(liquidity)
  const campaignImages = madridCampaigns
  const campaignCarouselRef = useMobileAutoCarousel(campaignImages.length)
  const communityImages = [
    { name: 'Madrid Performers', src: '/assets/campaign-internship.png' },
    { name: 'Field Riders', src: '/assets/campaign-tiko.jpeg' },
    { name: 'Assessmate Mentors', src: '/assets/campaign-assessmate.png' },
    { name: 'Gasul Community', src: '/assets/campaign-petron-gasul.png' },
  ]
  const creatorImages = ['/assets/madrid-performer-1.jpeg', '/assets/madrid-performer-2.jpeg', '/assets/madrid-rider-1.jpeg', '/assets/madrid-rider-2.jpeg']
  const featuredCommunities = [
    { name: communityImages[0].name, logo: communityImages[0].src, members: creatorImages.slice(0, 2) },
    { name: communityImages[1].name, logo: communityImages[1].src, members: creatorImages.slice(2, 4) },
    { name: communityImages[2].name, logo: communityImages[2].src, members: [creatorImages[1], creatorImages[3]] },
    { name: communityImages[3].name, logo: communityImages[3].src, members: [creatorImages[0], creatorImages[2]] },
  ]

  return <div className="page-stack">
    <section className="featured-campaigns">
      <div className="featured-campaigns-heading"><span className="eyebrow">FEATURED CAMPAIGNS</span></div>
      <div className="featured-campaign-carousel" ref={campaignCarouselRef}>
        {campaignImages.map((campaign) => <button className="featured-campaign-card" key={campaign.name} onClick={() => { setSelectedCampaign(campaign); setGoalExpanded(false) }}>
          <div className="featured-campaign-image"><img src={campaign.src} alt="" /></div>
          <div className="featured-campaign-body">
            <h2>{campaign.name}</h2>
            <p>Madrid Philippines</p>
            <div className="featured-campaign-allocation"><span>Allocated</span><strong>{formatCurrency(campaign.budget)}</strong></div>
            <dl><div><dt>Content target</dt><dd>{campaign.target}</dd></div><div><dt>Duration</dt><dd>{campaign.weeks} weeks</dd></div></dl>
          </div>
        </button>)}
      </div>
    </section>
    <section className="metrics-grid brand-kpi-grid">
      <article className="metric-card pool-card finance-primary gpv-primary">
        <div className="pool-card-values">
          <div><span>Gross Pool Value</span><strong>{formatCurrency(grossPoolValue)}</strong></div>
          <div><span>Liquidity</span><strong className="liquidity-showcase" ref={liquidityShowcase.valueRef} aria-label={formatCurrency(liquidity)}><span className={`liquidity-showcase-value is-${liquidityShowcase.motionState}`} aria-hidden="true">{formatCurrency(liquidityShowcase.displayValue)}</span></strong></div>
        </div>
      </article>
      <button className="metric-card community-directory-card" onClick={() => setCommunitiesOpen(true)}>
        <div className="metric-top"><span>Activated communities</span><i><Layers3 size={18} /></i></div>
        <div className="community-directory-preview">
          <span className="product-avatar-stack image-avatar-stack campaign-logo-stack">{communityImages.map((community) => <i key={community.name} title={community.name}><img src={community.src} alt="" /></i>)}</span>
          <span>View communities <ArrowRight size={15} /></span>
        </div>
      </button>
      <section className="dashboard-top-content" aria-labelledby="dashboard-top-content-title">
        <div><span className="eyebrow" id="dashboard-top-content-title">TOP PERFORMING CONTENT</span><span>{tiktokContentPreviews.length} posts</span></div>
        <div>
          {tiktokContentPreviews.map((src, index) => {
            return <article key={src}>
              <img src={src} alt={`TikTok content preview ${index + 1}`} />
              <span>{[82.4, 74.8, 68.1, 61.9, 57.3, 52.6, 48.2, 43.7, 39.1, 34.8][index]}K views</span>
            </article>
          })}
        </div>
      </section>
    </section>
    {selectedCampaign ? <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="campaign-details-title">
      <div className="modal-card campaign-details-modal">
        <header><div><span className="eyebrow">CAMPAIGN DETAILS</span><h2 id="campaign-details-title">{selectedCampaign.name}</h2></div><button className="icon-button" onClick={() => setSelectedCampaign(null)} aria-label="Close campaign details">×</button></header>
        <div className="campaign-details-hero"><img src={selectedCampaign.src} alt="" /><div><span>Goal</span><p className={goalExpanded ? 'is-expanded' : ''}>{selectedCampaign.goal}</p>{selectedCampaign.goal.length > 140 ? <button className="campaign-goal-toggle" onClick={() => setGoalExpanded((expanded) => !expanded)}>{goalExpanded ? 'See less' : 'See more'}</button> : null}</div></div>
        <dl className="campaign-details-metrics"><div><dt>Spent</dt><dd>{formatCurrency(selectedCampaign.spent)} <span>/ {formatCurrency(selectedCampaign.budget)}</span></dd></div><div><dt>Published</dt><dd>{selectedCampaign.published} <span>/ {selectedCampaign.target}</span></dd></div><div><dt>Duration</dt><dd>{selectedCampaign.currentWeek} <span>/ {selectedCampaign.weeks} weeks</span></dd></div></dl>
        <section className="campaign-details-creators"><div><span className="eyebrow">PARTICIPATING CREATORS</span><p>54 creators across 4 activated communities</p></div><div className="campaign-creator-stack">{creatorImages.map((src, index) => <img src={src} alt="" title={['Maya Reyes', 'Jules Aquino', 'Niko Santos', 'Camille Navarro'][index]} key={src} />)}<span>+50</span></div></section>
        <section className="campaign-top-content"><span className="eyebrow">TOP CONTENT</span><div aria-label="Top campaign content">{Array.from({ length: 10 }, (_, index) => { const available = campaignImages.filter((campaign) => campaign.name !== selectedCampaign.name); const campaign = available[index % available.length]; return <article key={`${campaign.name}-${index}`}><img src={campaign.src} alt="" /><span>{[48.2, 36.7, 29.4, 26.8, 24.1, 21.7, 19.9, 18.4, 16.8, 15.3][index]}K views</span></article> })}</div></section>
      </div>
    </div> : null}
    {communitiesOpen ? <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="community-directory-title">
      <div className="modal-card community-directory-modal">
        <header><div><span className="eyebrow">ACTIVATED COMMUNITIES</span><h2 id="community-directory-title">Madrid Philippines communities</h2></div><button className="icon-button" onClick={() => setCommunitiesOpen(false)} aria-label="Close communities">×</button></header>
        <div className="community-directory-list">{featuredCommunities.map((community) => <article key={community.name}>
          <img className="community-directory-logo" src={community.logo} alt="" />
          <div><strong>{community.name}</strong><span>Activated community</span></div>
          <span className="community-member-preview">{community.members.map((src) => <img src={src} alt="" key={src} />)}</span>
        </article>)}</div>
      </div>
    </div> : null}
  </div>
}

export function BrandProducts() {
  const { state, dispatch } = useApp()
  const [editing, setEditing] = useState<Product | null>(null)
  const blank = (): Product => ({ id: `product-${Date.now()}`, name: '', category: 'Skincare', description: '', keyBenefits: [], usage: '', productUrl: '', active: true })
  function save(event: React.FormEvent) {
    event.preventDefault()
    if (!editing?.name.trim()) return
    dispatch({ type: 'UPSERT_PRODUCT', product: editing })
    setEditing(null)
  }
  return <div className="page-stack">
    <PageHeader eyebrow="PRODUCTS" title="Products" description="Reusable details for every campaign." actions={<button className="button button-primary" onClick={() => setEditing(blank())}><Plus size={16} />Add product</button>} />
    <div className="product-grid">{state.products.map((product) => <article className="product-card" key={product.id}><div className="product-art"><span>DR</span><Package size={34} /></div><div className="product-card-body"><div><span className="overline">{product.category}</span><h2>{product.name}</h2></div><p>{product.description}</p><div className="tag-row">{product.keyBenefits.slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div><footer><span className="status-badge status-active"><i />Active</span><button className="button button-secondary button-small" onClick={() => setEditing(product)}><Pencil size={14} />Edit</button></footer></div></article>)}</div>
    {editing ? <div className="modal-backdrop"><form className="modal-card form-modal" onSubmit={save}><header><div><span className="eyebrow">PRODUCT</span><h2>{state.products.some((item) => item.id === editing.id) ? 'Edit product' : 'Add product'}</h2></div><button type="button" className="icon-button" onClick={() => setEditing(null)}>×</button></header><div className="form-grid form-grid-two"><label className="field full"><span>Product name</span><input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /></label><label className="field"><span>Category</span><input value={editing.category} onChange={(event) => setEditing({ ...editing, category: event.target.value })} /></label><label className="field full"><span>Description</span><textarea rows={3} value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} /></label><label className="field full"><span>Key benefits</span><input value={editing.keyBenefits.join(', ')} onChange={(event) => setEditing({ ...editing, keyBenefits: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} /><small>Separate with commas.</small></label></div><footer><button type="button" className="button button-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="button button-primary">Save product</button></footer></form></div> : null}
  </div>
}

const wizardSteps = ['Brief', 'Timing', 'Review']

function campaignEndFromMonths(start: string, months: number) {
  if (!start || months < 1) return start
  const date = new Date(`${start}T00:00:00Z`)
  date.setUTCMonth(date.getUTCMonth() + months)
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}

function durationMonths(days: number) {
  return Math.min(12, Math.max(3, Math.round(days / 30) || 3))
}

function CampaignDurationCalendar({ start, months, onSelectMonth }: { start: string; months: number; onSelectMonth: (months: number) => void }) {
  const startDate = new Date(`${start}T00:00:00Z`)
  const endDate = new Date(`${campaignEndFromMonths(start, months)}T00:00:00Z`)
  return <div className="campaign-duration-calendar" aria-label={`${months} month campaign calendar`}>
    <div className="duration-calendar-heading"><CalendarDays size={20} /><div><strong>{months} month campaign</strong><small>{formatDate(start)} – {formatDate(campaignEndFromMonths(start, months))}</small></div></div>
    <div className="duration-months">
      {Array.from({ length: 12 }, (_, index) => {
        const month = new Date(startDate)
        month.setUTCDate(1)
        month.setUTCMonth(month.getUTCMonth() + index)
        const monthIndex = month.getUTCFullYear() * 12 + month.getUTCMonth()
        const endMonthIndex = endDate.getUTCFullYear() * 12 + endDate.getUTCMonth()
        const isWithinCampaign = monthIndex <= endMonthIndex
        const selectedDuration = Math.max(3, index)
        return <button type="button" className={isWithinCampaign ? 'selected' : ''} key={`${month.getUTCFullYear()}-${month.getUTCMonth()}`} onClick={() => onSelectMonth(selectedDuration)} aria-label={`Set campaign duration to ${selectedDuration} months, ending in ${month.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })} ${month.getUTCFullYear()}`}>
          <small>{month.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })}</small>
          <strong>{month.getUTCFullYear()}</strong>
        </button>
      })}
    </div>
  </div>
}

export function BrandNewOpportunity() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [draft, setDraft] = useState<OpportunityDraft>(state.opportunityDraft)
  const [step, setStep] = useState(Math.min(wizardSteps.length, Math.max(1, state.opportunityDraft.step)))
  const [campaignMonthsInput, setCampaignMonthsInput] = useState(() => String(durationMonths(state.opportunityDraft.liveDays)))
  function update(next: Partial<OpportunityDraft>) { setDraft((current) => ({ ...current, ...next })) }
  function updateCampaignMonths(value: number) {
    const months = Math.min(12, Math.max(3, value || 3))
    setCampaignMonthsInput(String(months))
    setDraft((current) => ({
      ...current,
      liveDays: months * 30,
      liveEnd: campaignEndFromMonths(current.liveStart, months),
    }))
  }
  function typeCampaignMonths(value: string) {
    setCampaignMonthsInput(value)
    const months = Number(value)
    if (!Number.isInteger(months) || months < 3 || months > 12) return
    setDraft((current) => ({
      ...current,
      liveDays: months * 30,
      liveEnd: campaignEndFromMonths(current.liveStart, months),
    }))
  }
  function go(next: number) { const saved = { ...draft, step: next }; setDraft(saved); setStep(next); dispatch({ type: 'SAVE_OPPORTUNITY_DRAFT', draft: saved }); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const campaignMonths = durationMonths(draft.liveDays)
  const typedCampaignMonths = Number(campaignMonthsInput)
  const campaignMonthsInvalid = !Number.isInteger(typedCampaignMonths) || typedCampaignMonths < 3 || typedCampaignMonths > 12
  const campaignEnd = campaignEndFromMonths(draft.liveStart, campaignMonths)
  function finish(mode: 'draft' | 'post') {
    dispatch({ type: 'SAVE_OPPORTUNITY_DRAFT', draft: { ...draft, liveDays: campaignMonths * 30, liveEnd: campaignEnd, step: wizardSteps.length } })
    dispatch({ type: 'CREATE_OPPORTUNITY', mode })
    navigate('/brand/opportunities')
  }
  return <div className="wizard-page">
    <div className="wizard-stepper">{wizardSteps.map((label, index) => <button key={label} className={step === index + 1 ? 'active' : step > index + 1 ? 'complete' : ''} onClick={() => go(index + 1)}><span>{step > index + 1 ? <Check size={13} /> : index + 1}</span><small>{label}</small></button>)}</div>
    <main className="wizard-body">
      {step === 1 ? <WizardSection number="01" title="Campaign brief" description="Set the direction Community Managers will use for promotions."><div className="form-grid"><label className="field"><span>Campaign name</span><input aria-label="Campaign name" value={draft.name} onChange={(event) => update({ name: event.target.value })} placeholder="e.g. Real Skin, Real Routine" /></label><label className="field"><span>Brief</span><textarea aria-label="Brief" rows={5} value={draft.contentDirection} onChange={(event) => update({ contentDirection: event.target.value })} /></label><label className="field"><span>Required hashtags</span><div className="field-icon"><Hash size={15} /><input aria-label="Required hashtags" value={draft.hashtags.join(', ')} onChange={(event) => update({ hashtags: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} /></div></label></div></WizardSection> : null}
      {step === 2 ? <WizardSection number="02" title="Campaign commitment" description="Set the duration, content target, and pool."><div className="form-grid form-grid-two campaign-commitment-fields"><label className="field full campaign-pool-field"><span>Pool value</span><div className="money-input"><span>₱</span><input aria-label="Pool value" type="number" min="1" step="1000" value={draft.totalBudget} onChange={(event) => update({ totalBudget: Number(event.target.value) })} /></div></label><div className="field commitment-primary-field"><span>Duration (months)</span><div className={`number-stepper${campaignMonthsInvalid ? ' is-invalid' : ''}`} role="group" aria-label="Duration in months"><button type="button" aria-label="Decrease campaign duration" disabled={campaignMonths <= 3} onClick={() => updateCampaignMonths(campaignMonths - 1)}><Minus size={16} /></button><input aria-label="Duration (months)" type="number" min="3" max="12" required value={campaignMonthsInput} aria-invalid={campaignMonthsInvalid} onChange={(event) => typeCampaignMonths(event.target.value)} /><button type="button" aria-label="Increase campaign duration" disabled={campaignMonths >= 12} onClick={() => updateCampaignMonths(campaignMonths + 1)}><Plus size={16} /></button></div>{campaignMonthsInvalid ? <small className="field-error">Enter a whole number from 3 to 12.</small> : null}</div><label className="field commitment-primary-field"><span>Target</span><div className="input-suffix"><input aria-label="Target" type="number" min="1" value={draft.requiredContent} onChange={(event) => update({ requiredContent: Number(event.target.value) })} /><span>posts</span></div></label><div className="full"><CampaignDurationCalendar start={draft.liveStart} months={campaignMonths} onSelectMonth={updateCampaignMonths} /></div></div></WizardSection> : null}
      {step === 3 ? <WizardSection number="03" title="Review and post" description="Check the essentials."><div className="review-grid"><div className="review-card"><span className="eyebrow">CAMPAIGN</span><h2>{draft.name || 'Untitled campaign'}</h2><div className="review-sections"><section><span className="review-icon"><CalendarDays size={22} /></span><div><span>Campaign duration</span><strong className="review-duration-value">{campaignMonths} months</strong><small>{formatDate(draft.liveStart)} – {formatDate(campaignEnd)}</small></div></section><section><span className="review-icon"><Target size={22} /></span><div><span>Content target</span><strong>{draft.requiredContent} posts</strong></div></section><section><span className="review-icon"><WalletCards size={22} /></span><div><span>Pool value</span><strong>{formatCurrency(draft.totalBudget)}</strong></div></section></div></div><aside className="launch-panel"><Sparkles size={22} /><h3>Ready to post</h3><dl><div><dt>Content target</dt><dd>{draft.requiredContent}</dd></div><div><dt>Pool value</dt><dd>{formatCurrency(draft.totalBudget)}</dd></div></dl><div className="launch-actions"><button className="button button-primary button-block" onClick={() => finish('post')}><Send size={16} />Post</button><button className="button button-secondary button-block" onClick={() => finish('draft')}>Save as draft</button></div></aside></div></WizardSection> : null}
      <footer className="wizard-actions"><button className="button button-secondary" disabled={step === 1} onClick={() => go(step - 1)}><ArrowLeft size={16} />Back</button><span>Step {step} of {wizardSteps.length}</span>{step < wizardSteps.length ? <button className="button button-primary" disabled={step === 2 && campaignMonthsInvalid} onClick={() => go(step + 1)}>Continue<ArrowRight size={16} /></button> : <Link className="button button-secondary" to="/brand/opportunities">Cancel</Link>}</footer>
    </main>
  </div>
}

function WizardSection({ number, title, description, children }: { number: string; title: string; description: string; children: React.ReactNode }) {
  return <section className="wizard-section"><header><span>{number}</span><div><h1>{title}</h1><p>{description}</p></div></header>{children}</section>
}

export function BrandOpportunities() {
  const { state } = useApp()
  const createdCampaigns: Array<MadridCampaign & { to: string }> = state.opportunities
    .filter((opportunity) => !legacyDemoOpportunityIds.has(opportunity.id))
    .map((opportunity, index) => {
      const metrics = getOpportunityMetrics(state, opportunity.id)
      const weeks = Math.max(1, Math.ceil(opportunity.liveDays / 7))
      return {
        id: opportunity.id,
        name: opportunity.name,
        src: madridCampaigns[index % madridCampaigns.length].src,
        budget: opportunity.totalBudget,
        spent: opportunityBudgetUsed(state, opportunity.id),
        target: opportunity.requiredContent,
        published: metrics.published,
        weeks,
        currentWeek: opportunity.status === 'Draft' ? 0 : Math.min(weeks, Math.max(1, Math.ceil(weeks * metrics.completionPercentage / 100))),
        goal: opportunity.contentDirection,
        to: `/brand/opportunities/${opportunity.id}`,
      }
    })
  const campaigns: Array<MadridCampaign & { to?: string }> = [...createdCampaigns, ...madridCampaigns]

  return <div className="page-stack">
    <PageHeader
      eyebrow="MADRID PHILIPPINES"
      title="Campaign portfolio"
      description="Track allocation, publishing, and timing in one place."
      actions={<Link className="button button-primary" to="/brand/opportunities/new"><Plus size={16} />New campaign</Link>}
    />
    <section className="campaign-portfolio" aria-label="Madrid Philippines campaigns">
      {campaigns.map((campaign) => {
        const budgetProgress = campaign.budget ? Math.round(campaign.spent / campaign.budget * 100) : 0
        const contentProgress = campaign.target ? Math.round(campaign.published / campaign.target * 100) : 0
        const promotions = madridPromotions.filter((promotion) => promotion.campaignId === campaign.id)
        const analytics = promotions.reduce((totals, promotion) => ({
          views: totals.views + promotion.views,
          clicks: totals.clicks + promotion.clicks,
          earnings: totals.earnings + promotion.earnings,
        }), { views: 0, clicks: 0, earnings: 0 })
        return <details className="campaign-portfolio-card" key={campaign.id}>
          <summary>
            <img src={campaign.src} alt="" />
            <div className="campaign-portfolio-summary">
              <h2>{campaign.name}</h2>
              <span>Madrid Philippines</span>
              <div className="campaign-portfolio-allocation"><span>Allocated</span><strong>{formatCurrency(campaign.budget)}</strong></div>
              <dl>
                <div><dt>Target</dt><dd>{campaign.target}</dd></div>
                <div><dt>Duration</dt><dd>{campaign.weeks} weeks</dd></div>
              </dl>
            </div>
            <span className="campaign-portfolio-toggle"><ChevronDown size={18} /></span>
          </summary>
          <div className="campaign-portfolio-current">
            <section className="campaign-portfolio-progress" aria-label="Campaign progress">
              <div>
                <span>Spent</span>
                <strong>{formatCurrency(campaign.spent)} <small>/ {formatCurrency(campaign.budget)}</small></strong>
                <ProgressBar value={budgetProgress} />
              </div>
              <div>
                <span>Published</span>
                <strong>{campaign.published} <small>/ {campaign.target}</small></strong>
                <ProgressBar value={contentProgress} />
              </div>
              <div>
                <span>Current week</span>
                <strong>{campaign.currentWeek} <small>/ {campaign.weeks}</small></strong>
              </div>
            </section>
            <section className="campaign-portfolio-brief">
              <span className="eyebrow">Campaign brief</span>
              <p>{campaign.goal}</p>
            </section>
            <section className="campaign-portfolio-analytics" aria-label="Campaign analytics">
              <span className="eyebrow">Analytics</span>
              <dl>
                <div><dt>Views</dt><dd>{formatNumber(analytics.views)}</dd></div>
                <div><dt>Clicks</dt><dd>{formatNumber(analytics.clicks)}</dd></div>
                <div><dt>Earnings</dt><dd>{formatCurrency(analytics.earnings)}</dd></div>
              </dl>
            </section>
            {campaign.to ? <Link className="campaign-portfolio-link" to={campaign.to}>View campaign <ArrowRight size={15} /></Link> : null}
          </div>
        </details>
      })}
    </section>
  </div>
}

export function BrandOpportunityWorkspace() {
  const { state, dispatch, getOpportunity } = useApp()
  const { opportunityId } = useParams()
  const [params, setParams] = useSearchParams()
  const opportunity = getOpportunity(opportunityId)
  const tab = params.get('tab') ?? 'overview'
  if (!opportunity) return <EmptyState title="Campaign not found" description="Return to the campaign portfolio." action={<Link className="button button-primary" to="/brand/opportunities">View campaigns</Link>} />
  const product = state.products.find((item) => item.id === opportunity.productId)
  const metrics = getOpportunityMetrics(state, opportunity.id)
  const claims = state.claims.filter((item) => item.opportunityId === opportunity.id)
  const allocatedBudget = claims.reduce((sum, item) => sum + item.budgetAllocation, 0)
  const usedBudget = opportunityBudgetUsed(state, opportunity.id)
  const relatedContent = state.contents.filter((item) => item.opportunityId === opportunity.id)
  const relatedCampaignIds = new Set(state.communityCampaigns.filter((item) => item.opportunityId === opportunity.id).map((item) => item.id))
  const creatorsActivated = new Set(state.assignments.filter((item) => relatedCampaignIds.has(item.communityCampaignId) && state.members.find((member) => member.id === item.memberId)?.active).map((item) => item.memberId)).size
  const tabs = [{ id: 'overview', label: 'Overview' }, { id: 'communities', label: 'Communities', count: claims.length }, { id: 'content', label: 'Content', count: metrics.recorded }, { id: 'report', label: 'Completion report' }]
  return <div className="page-stack workspace-page">
    <Link className="back-link" to="/brand/opportunities"><ArrowLeft size={15} />Campaigns</Link>
    <header className="workspace-header"><div className="workspace-mark">DR</div><div><div className="workspace-title-line"><h1>{opportunity.name}</h1><StatusBadge status={opportunity.status} /></div><p>{product?.name} · {opportunity.platform}</p><span>{formatDate(opportunity.liveStart)} – {formatDate(opportunity.liveEnd)}</span></div><div className="workspace-actions">{opportunity.status === 'Draft' ? <button className="button button-primary" onClick={() => dispatch({ type: 'POST_OPPORTUNITY', opportunityId: opportunity.id })}><Send size={16} />Post campaign</button> : <span className="fixed-pill"><FileCheck2 size={15} />Fixed campaign terms</span>}</div></header>
    <SegmentedTabs tabs={tabs} active={tab} onChange={(id) => setParams({ tab: id })} />

    {tab === 'overview' ? <div className="tab-stack">
      <section className="metrics-grid metrics-grid-five"><MetricCard label="Required" value={metrics.required} detail="published contents" icon={Target} /><MetricCard label="Allocated" value={metrics.allocated} detail={`${Math.max(0, metrics.required - metrics.allocated)} still available`} icon={Layers3} /><MetricCard label="Counted" value={metrics.counted} detail={`${metrics.completionPercentage}% complete`} icon={CheckCircle2} tone="yellow" /><MetricCard label="Remaining" value={metrics.remaining} detail="to fulfill commitment" icon={Flag} /><MetricCard label="Creators activated" value={creatorsActivated} detail="assigned active members" icon={Users} /></section>
      <Panel className="commitment-panel"><div className="commitment-head"><div><span className="eyebrow">PRIMARY MEASUREMENT</span><h2>Published-content fulfillment</h2><p>Only content published externally, recorded in OkPo, validated, and counted contributes here.</p></div><strong>{metrics.completionPercentage}%</strong></div><ProgressBar value={metrics.completionPercentage} tone="black" /><div className="stage-track">{[{ label: 'Required', value: metrics.required }, { label: 'Allocated', value: metrics.allocated }, { label: 'Published', value: metrics.published }, { label: 'Recorded', value: metrics.recorded }, { label: 'Validated', value: metrics.validated }, { label: 'Counted', value: metrics.counted }].map((item, index) => <div key={item.label}><span>{index + 1}</span><div><small>{item.label}</small><strong>{item.value}</strong></div></div>)}</div></Panel>
      <div className="two-column-layout wide-left"><Panel title="Campaign foundation" description="Terms remain fixed after communities claim."><div className="detail-grid"><div><span>Objective</span><strong>{opportunity.objective}</strong></div><div><span>Platform</span><strong>{opportunity.platform}</strong></div><div><span>Preparation</span><strong>{formatDate(opportunity.preparationStart)} – {formatDate(opportunity.preparationEnd)}</strong><small>{opportunity.preparationDays} days</small></div><div><span>Live campaign</span><strong>{formatDate(opportunity.liveStart)} – {formatDate(opportunity.liveEnd)}</strong><small>{opportunity.liveDays} days</small></div></div><hr /><h3>Priority messages</h3><ul className="clean-list">{opportunity.priorityMessages.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul><h3>Content direction</h3><p className="body-copy">{opportunity.contentDirection}</p><div className="tag-row">{[...opportunity.hashtags, ...opportunity.mentions].map((item) => <span key={item}>{item}</span>)}</div></Panel><Panel title="Budget utilization" description="Allocation follows content quota automatically."><div className="budget-big"><span>Total campaign budget</span><strong>{formatCurrency(opportunity.totalBudget)}</strong></div><ProgressBar value={opportunity.totalBudget ? Math.round(usedBudget / opportunity.totalBudget * 100) : 0} label="Used budget" /><dl className="summary-list"><div><dt>Allocated budget</dt><dd>{formatCurrency(allocatedBudget)}</dd></div><div><dt>Used budget</dt><dd>{formatCurrency(usedBudget)}</dd></div><div><dt>Unallocated budget</dt><dd>{formatCurrency(Math.max(0, opportunity.totalBudget - allocatedBudget))}</dd></div><div><dt>Remaining budget</dt><dd>{formatCurrency(Math.max(0, opportunity.totalBudget - usedBudget))}</dd></div></dl></Panel></div>
      <Panel title="Supporting reach" description="Views and engagement are context—not guaranteed campaign outcomes."><div className="supporting-metrics"><div><Eye size={18} /><span>Available views</span><strong>{formatNumber(opportunity.secondaryViews)}</strong></div><div><BarChart3 size={18} /><span>Available engagement</span><strong>{formatNumber(opportunity.secondaryEngagement)}</strong></div></div></Panel>
    </div> : null}

    {tab === 'communities' ? <div className="tab-stack"><Callout title="No Brand approval or allocation controls">Community allocations are created by the system from verified size and remaining capacity. They are immediately confirmed and cannot be negotiated.</Callout><Panel title="Participating communities" description={`${metrics.allocated} of ${metrics.required} contents allocated across ${claims.length} communities.`}><div className="table-wrap"><table><thead><tr><th>Community</th><th>Verified size</th><th>Leader</th><th>Content quota</th><th>Budget allocation</th><th>Counted</th><th>Completion</th></tr></thead><tbody>{claims.map((claim) => { const community = state.communities.find((item) => item.id === claim.communityId)!; const content = relatedContent.filter((item) => item.communityCampaignId && state.communityCampaigns.find((cc) => cc.id === item.communityCampaignId)?.communityId === community.id); const counted = content.filter((item) => item.status === 'Counted').length; return <tr key={claim.id}><td><div className="person-cell"><Avatar initials={community.initials} tone="cream" /><span><strong>{community.name}</strong><small>{community.location}</small></span></div></td><td>{community.verifiedSize}</td><td>{community.leaderName}<small className="table-subline">{community.leaderType}</small></td><td><strong>{claim.contentQuota}</strong></td><td>{formatCurrency(claim.budgetAllocation)}</td><td>{counted}</td><td><div className="table-progress"><ProgressBar value={Math.round(counted / claim.contentQuota * 100)} /><span>{Math.round(counted / claim.contentQuota * 100)}%</span></div></td></tr> })}</tbody></table></div>{claims.length === 0 ? <EmptyState icon={Users} title="No claims yet" description="The campaign is open. Verified Community Leaders can claim their automatic allocation." /> : null}</Panel></div> : null}

    {tab === 'content' ? <BrandContentTable opportunityId={opportunity.id} /> : null}
    {tab === 'report' ? <CompletionReport opportunityId={opportunity.id} /> : null}
  </div>
}

function BrandContentTable({ opportunityId, title = 'Consolidated campaign content', description = 'Published links recorded by participating communities. Brand monitoring is read-only.' }: { opportunityId?: string; title?: string; description?: string }) {
  const { state } = useApp()
  const rows = [...state.contents].reverse().filter((item) => (!opportunityId || item.opportunityId === opportunityId) && ['Published', 'Recorded', 'Validated', 'Counted'].includes(item.status)).slice(0, 40)
  const contentRows = rows.map((content) => {
    const member = state.members.find((item) => item.id === content.memberId)!
    const community = state.communities.find((item) => item.id === member.communityId)!
    const campaign = state.communityCampaigns.find((item) => item.id === content.communityCampaignId)!
    return { content, member, community, campaign }
  })

  return <Panel title={title} description={description}>
    <div className="table-wrap content-table-desktop">
      <table>
        <thead><tr><th>Creator</th><th>Community</th><th>Promotion</th><th>Status</th><th>Published link</th><th>Views</th><th>Engagement</th></tr></thead>
        <tbody>{contentRows.map(({ content, member, community, campaign }) => <tr key={content.id}>
          <td><div className="person-cell"><Avatar initials={member.initials} size="sm" /><span><strong>{member.name}</strong><small>{member.handle}</small></span></div></td>
          <td>{community.name}</td>
          <td>{campaign.title}</td>
          <td><ContentBadge status={content.status} /></td>
          <td>{content.publishedUrl ? <a className="table-link" href={content.publishedUrl} target="_blank" rel="noreferrer">Open post ↗</a> : '—'}</td>
          <td>{formatNumber(content.views)}</td>
          <td>{formatNumber(content.engagement)}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <details className="content-mobile-campaign">
      <summary>Browse {contentRows.length} posts</summary>
      <div className="content-mobile-list">
        {contentRows.map(({ content, member, community, campaign }) => <details key={content.id} className="content-mobile-item">
          <summary>
            <Avatar initials={member.initials} size="sm" />
            <span><strong>{member.name}</strong><small>{member.handle}</small></span>
            <ContentBadge status={content.status} />
          </summary>
          <dl>
            <div><dt>Community</dt><dd>{community.name}</dd></div>
            <div><dt>Promotion</dt><dd>{campaign.title}</dd></div>
            <div><dt>Views</dt><dd>{formatNumber(content.views)}</dd></div>
            <div><dt>Engagement</dt><dd>{formatNumber(content.engagement)}</dd></div>
          </dl>
          {content.publishedUrl ? <a className="button button-secondary button-block" href={content.publishedUrl} target="_blank" rel="noreferrer">Open published post ↗</a> : null}
        </details>)}
      </div>
    </details>
    {rows.length === 0 ? <EmptyState icon={Boxes} title="No published content yet" description="Recorded community content will appear here during the live campaign." /> : null}
  </Panel>
}

function CompletionReport({ opportunityId }: { opportunityId: string }) {
  const { state } = useApp()
  const opportunity = state.opportunities.find((item) => item.id === opportunityId)!
  const metrics = getOpportunityMetrics(state, opportunityId)
  const claims = state.claims.filter((item) => item.opportunityId === opportunityId)
  const used = opportunityBudgetUsed(state, opportunityId)
  return <div className="report-page"><section className="report-cover"><span className="report-logo">OkPo × {state.brand.name}</span><StatusBadge status={opportunity.status} /><h2>{opportunity.name}</h2><p>Campaign completion report</p><div><span>Live period</span><strong>{formatDate(opportunity.liveStart)} – {formatDate(opportunity.liveEnd)}</strong></div></section><section className="metrics-grid metrics-grid-four"><MetricCard label="Content commitment" value={opportunity.requiredContent} detail="published contents" /><MetricCard label="Counted content" value={metrics.counted} detail={`${metrics.completionPercentage}% fulfillment`} tone="yellow" /><MetricCard label="Communities" value={claims.length} detail="participating" /><MetricCard label="Budget used" value={formatCurrency(used)} detail={`of ${formatCurrency(opportunity.totalBudget)}`} /></section><Panel title="Community completion"><div className="community-report-grid">{claims.map((claim) => { const community = state.communities.find((item) => item.id === claim.communityId)!; const ids = new Set(state.communityCampaigns.filter((item) => item.opportunityId === opportunityId && item.communityId === community.id).map((item) => item.id)); const counted = state.contents.filter((item) => ids.has(item.communityCampaignId) && item.status === 'Counted').length; return <article key={claim.id}><Avatar initials={community.initials} tone="cream" /><div><strong>{community.name}</strong><small>{community.leaderName}</small></div><span>{counted}/{claim.contentQuota}</span><ProgressBar value={Math.round(counted / claim.contentQuota * 100)} /><b>{Math.round(counted / claim.contentQuota * 100)}%</b></article> })}</div></Panel><Callout tone={metrics.completionPercentage >= 100 ? 'green' : 'neutral'} title={metrics.completionPercentage >= 100 ? 'Published-content commitment fulfilled' : 'Campaign delivery in progress'}>{metrics.counted} recorded contents contribute to the agreed volume. Available views and engagement remain supporting metrics.</Callout></div>
}

export function BrandContent() {
  const { state } = useApp()
  const visibleStatuses = new Set(['Published', 'Recorded', 'Validated', 'Counted'])
  const opportunityIds = new Set(state.contents.filter((item) => visibleStatuses.has(item.status)).map((item) => item.opportunityId))
  const campaigns = state.opportunities.filter((item) => opportunityIds.has(item.id))
  return <div className="page-stack"><PageHeader eyebrow="CONTENT" title="Content by campaign" description="Published links and delivery status." /><div className="content-campaign-groups">{campaigns.map((campaign) => { const product = state.products.find((item) => item.id === campaign.productId); const metrics = getOpportunityMetrics(state, campaign.id); return <BrandContentTable key={campaign.id} opportunityId={campaign.id} title={campaign.name} description={`${product?.name ?? 'Product'} · ${metrics.recorded} recorded · ${metrics.counted} counted`} /> })}</div>{campaigns.length === 0 ? <EmptyState icon={Boxes} title="No content yet" description="Content appears after creators record published links." /> : null}</div>
}

export function BrandReports() {
  const [selectedCampaign, setSelectedCampaign] = useState<MadridCampaign | null>(null)
  const [selectedPromotion, setSelectedPromotion] = useState<MadridPromotion | null>(null)
  const campaignPromotions = selectedCampaign ? madridPromotions.filter((item) => item.campaignId === selectedCampaign.id) : []

  function openCampaign(campaign: MadridCampaign) {
    setSelectedPromotion(null)
    setSelectedCampaign(campaign)
  }

  function closeReport() {
    setSelectedCampaign(null)
    setSelectedPromotion(null)
  }

  return <div className="page-stack brand-analytics-page">
    <PageHeader eyebrow="REPORTS" title="Performance at every level" description="Open a campaign, then drill into the promotions delivering it." />
    <section className="metrics-grid metrics-grid-four report-summary-metrics" aria-label="Portfolio analytics">
      <MetricCard label="Impressions" value="6.8M" icon={Eye} />
      <MetricCard label="Clicks" value="184.2K" icon={MousePointerClick} />
      <MetricCard label="CTR" value="2.7%" icon={Percent} />
      <MetricCard label="Engagement" value="296.3K" icon={BarChart3} />
    </section>
    <section className="report-campaign-section">
      <header><div><span className="eyebrow">CAMPAIGNS</span><h2>Campaign performance</h2></div><small>Select a campaign to explore its promotions</small></header>
      <div className="report-campaign-grid">
        {madridCampaigns.map((campaign) => {
          const publishedProgress = Math.round(campaign.published / campaign.target * 100)
          return <button type="button" className="report-campaign-card" key={campaign.id} onClick={() => openCampaign(campaign)}>
            <img src={campaign.src} alt="" />
            <div className="report-campaign-body">
              <h3>{campaign.name}</h3>
              <span>Madrid Philippines</span>
              <div className="report-campaign-primary"><span>Spent</span><strong>{formatCurrency(campaign.spent)}</strong></div>
              <dl>
                <div><dt>Published</dt><dd>{campaign.published}/{campaign.target}</dd></div>
              </dl>
              <ProgressBar value={publishedProgress} />
            </div>
            <ArrowRight size={18} />
          </button>
        })}
      </div>
    </section>
    {selectedCampaign ? <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeReport() }}>
      <div className="modal-card analytics-drilldown-modal" role="dialog" aria-modal="true" aria-label={`${selectedCampaign.name} analytics`}>
        <header>
          <div>
            <span className="eyebrow">{selectedPromotion ? 'PROMOTION ANALYTICS' : 'CAMPAIGN ANALYTICS'}</span>
            <h2>{selectedPromotion?.name ?? selectedCampaign.name}</h2>
          </div>
          <button type="button" className="icon-button" onClick={closeReport} aria-label="Close analytics">×</button>
        </header>
        {selectedPromotion ? <PromotionAnalytics promotion={selectedPromotion} campaign={selectedCampaign} onBack={() => setSelectedPromotion(null)} /> : <>
          <div className="analytics-campaign-hero"><img src={selectedCampaign.src} alt="" /><div><span>Goal</span><p>{selectedCampaign.goal}</p></div></div>
          <section className="metrics-grid metrics-grid-four analytics-modal-metrics">
            <MetricCard label="Spent" value={formatCurrency(selectedCampaign.spent)} />
            <MetricCard label="Published" value={`${selectedCampaign.published}/${selectedCampaign.target}`} />
            <MetricCard label="Impressions" value={formatNumber(selectedCampaign.published * 22600)} />
            <MetricCard label="Engagement" value={formatNumber(selectedCampaign.published * 985)} />
          </section>
          <section className="promotion-drill-list">
            <header><div><span className="eyebrow">PROMOTIONS</span><h3>Performance by promotion</h3></div><small>{campaignPromotions.length} active</small></header>
            {campaignPromotions.map((promotion) => <button type="button" key={promotion.id} onClick={() => setSelectedPromotion(promotion)}>
              <img src={promotion.src} alt="" />
              <span><strong>{promotion.name}</strong><small>Managed by {promotion.manager}</small></span>
              <dl><div><dt>Views</dt><dd>{formatNumber(promotion.views)}</dd></div><div><dt>Clicks</dt><dd>{formatNumber(promotion.clicks)}</dd></div></dl>
              <ArrowRight size={17} />
            </button>)}
          </section>
        </>}
      </div>
    </div> : null}
  </div>
}

function PromotionAnalytics({ promotion, campaign, onBack }: { promotion: MadridPromotion; campaign: MadridCampaign; onBack: () => void }) {
  const ctr = promotion.views ? promotion.clicks / promotion.views * 100 : 0
  return <div className="promotion-analytics-detail">
    <button type="button" className="back-link" onClick={onBack}><ArrowLeft size={15} />{campaign.name}</button>
    <div className="analytics-promotion-hero"><img src={promotion.src} alt="" /><div><span>Managed by</span><h3>{promotion.manager}</h3><p>This promotion turns the campaign brief into locally relevant creator content and measurable audience action.</p></div></div>
    <section className="metrics-grid metrics-grid-four analytics-modal-metrics">
      <MetricCard label="Views" value={formatNumber(promotion.views)} icon={Eye} />
      <MetricCard label="Clicks" value={formatNumber(promotion.clicks)} icon={MousePointerClick} />
      <MetricCard label="CTR" value={`${ctr.toFixed(1)}%`} icon={Percent} />
      <MetricCard label="Engagement" value={formatNumber(promotion.engagement)} icon={BarChart3} />
    </section>
    <Panel title="Promotion contribution" description="Attributed performance within this campaign.">
      <dl className="summary-list">
        <div><dt>Community earnings</dt><dd>{formatCurrency(promotion.earnings)}</dd></div>
        <div><dt>Share of published content</dt><dd>{Math.max(1, Math.round(promotion.engagement / Math.max(1, campaign.published * 100)))}%</dd></div>
        <div><dt>Campaign</dt><dd>{campaign.name}</dd></div>
      </dl>
    </Panel>
  </div>
}

export function BrandProfilePage() {
  const { state, dispatch } = useApp()
  const [brand, setBrand] = useState(state.brand)
  const [saved, setSaved] = useState(false)
  function submit(event: React.FormEvent) { event.preventDefault(); dispatch({ type: 'UPDATE_BRAND', brand }); setSaved(true) }
  return <div className="page-stack settings-page"><PageHeader eyebrow="BRAND PROFILE" title="Your identity across OkPo" description="Community Managers see this information when evaluating campaigns." /><form className="panel profile-form" onSubmit={submit}><div className="profile-identity"><Avatar initials={brand.initials} size="lg" tone="yellow" /><div><strong>{brand.name}</strong><span>Verified Brand</span></div></div><div className="form-grid form-grid-two"><label className="field"><span>Brand name</span><input value={brand.name} onChange={(event) => setBrand({ ...brand, name: event.target.value })} /></label><label className="field"><span>Website</span><input value={brand.website} onChange={(event) => setBrand({ ...brand, website: event.target.value })} /></label><label className="field"><span>Industry</span><input value={brand.industry} onChange={(event) => setBrand({ ...brand, industry: event.target.value })} /></label><label className="field"><span>Location</span><input value={brand.location} onChange={(event) => setBrand({ ...brand, location: event.target.value })} /></label><label className="field full"><span>Brand description</span><textarea rows={4} value={brand.description} onChange={(event) => setBrand({ ...brand, description: event.target.value })} /></label><label className="field"><span>Primary contact</span><input value={brand.contactName} onChange={(event) => setBrand({ ...brand, contactName: event.target.value })} /></label><label className="field"><span>Contact email</span><input type="email" value={brand.contactEmail} onChange={(event) => setBrand({ ...brand, contactEmail: event.target.value })} /></label></div><footer className="form-footer">{saved ? <span className="saved-message"><CheckCircle2 size={16} />Saved to this prototype</span> : <span />}<button className="button button-primary">Save brand profile</button></footer></form></div>
}
