import {
  ArrowLeft, ArrowRight, BarChart3, Boxes, CalendarDays, Check, CheckCircle2,
  Clock3, Eye, FileCheck2, FileText, Flag, Hash, Layers3, Package, Pencil, Plus, Send,
  Sparkles, Target, Users, WalletCards,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Avatar, Callout, ContentBadge, EmptyState, InfoToast, MetricCard, OpportunityCard, PageHeader, Panel, ProgressBar,
  SegmentedTabs, StatusBadge,
} from '../components'
import { formatCurrency, formatDate, formatNumber, getCommunityCampaignMetrics, getOpportunityMetrics, useApp } from '../store'
import type { OpportunityDraft, Product } from '../types'

function opportunityBudgetUsed(state: ReturnType<typeof useApp>['state'], opportunityId: string) {
  return state.communityCampaigns.filter((item) => item.opportunityId === opportunityId).reduce((total, campaign) => {
    const metrics = getCommunityCampaignMetrics(state, campaign.id)
    return total + Math.round(campaign.rewardBudget * metrics.counted / Math.max(1, campaign.contentQuota))
  }, 0)
}

export function BrandDashboard() {
  const { state } = useApp()
  const [communitiesOpen, setCommunitiesOpen] = useState(false)
  const featuredCarouselRef = useRef<HTMLDivElement>(null)
  const postedOpportunities = state.opportunities.filter((item) => item.status !== 'Draft')
  const grossPoolValue = postedOpportunities.reduce((sum, item) => sum + item.totalBudget, 0)
  const liquidity = postedOpportunities.reduce((sum, item) => sum + opportunityBudgetUsed(state, item.id), 0)
  const views = state.contents.reduce((sum, item) => sum + item.views, 0)
  const engagement = state.contents.reduce((sum, item) => sum + item.engagement, 0)
  const campaignImages = [
    { name: 'Internship Campaign', src: '/assets/campaign-internship.png', progress: 61, content: 184 },
    { name: 'Tiko', src: '/assets/campaign-tiko.jpeg', progress: 74, content: 96 },
    { name: 'Assessmate', src: '/assets/campaign-assessmate.png', progress: 48, content: 72 },
    { name: 'Petron Gasul', src: '/assets/campaign-petron-gasul.png', progress: 83, content: 124 },
  ]
  const creatorImages = ['/assets/madrid-performer-1.jpeg', '/assets/madrid-performer-2.jpeg', '/assets/madrid-rider-1.jpeg', '/assets/madrid-rider-2.jpeg']
  const featuredCommunities = [
    { name: 'Madrid Performers', logo: campaignImages[0].src, members: creatorImages.slice(0, 2) },
    { name: 'Field Riders', logo: campaignImages[1].src, members: creatorImages.slice(2, 4) },
    { name: 'Assessmate Mentors', logo: campaignImages[2].src, members: [creatorImages[1], creatorImages[3]] },
    { name: 'Gasul Community', logo: campaignImages[3].src, members: [creatorImages[0], creatorImages[2]] },
  ]

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mobile = window.matchMedia('(max-width: 700px)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!mobile.matches || reducedMotion.matches) return
    const timer = window.setInterval(() => {
      const carousel = featuredCarouselRef.current
      if (!carousel || carousel.children.length < 2) return
      const cardWidth = carousel.clientWidth
      if (!cardWidth) return
      const current = Math.round(carousel.scrollLeft / cardWidth)
      const next = (current + 1) % carousel.children.length
      carousel.scrollTo({ left: next * cardWidth, behavior: 'smooth' })
    }, 3000)
    return () => window.clearInterval(timer)
  }, [])

  return <div className="page-stack">
    <Link className="button button-primary floating-create-button" to="/brand/opportunities/new"><Plus size={18} /><span>New opportunity</span></Link>
    <section className="featured-campaigns">
      <div className="featured-campaigns-heading"><span className="eyebrow">FEATURED CAMPAIGNS</span><span>{campaignImages.length} active</span></div>
      <div className="featured-campaign-carousel" ref={featuredCarouselRef} data-autoplay="3000">
        {campaignImages.map((campaign) => <article className="featured-campaign-card" key={campaign.name}>
          <div className="featured-campaign-image"><img src={campaign.src} alt="" /></div>
          <div className="featured-campaign-body">
            <div><span className="eyebrow">FEATURED CAMPAIGN</span><span className="status-badge status-live"><i />Live</span></div>
            <h2>{campaign.name}</h2>
            <p>Madrid Philippines</p>
            <div className="featured-campaign-progress"><strong>{campaign.progress}%</strong><span>delivered</span></div>
            <div className="progress"><span style={{ width: `${campaign.progress}%` }} /></div>
            <dl><div><dt>Published</dt><dd>{campaign.content + 42}</dd></div><div><dt>Counted</dt><dd>{campaign.content}</dd></div></dl>
          </div>
        </article>)}
      </div>
    </section>
    <section className="metrics-grid brand-kpi-grid">
      <article className="metric-card pool-card finance-primary gpv-primary">
        <div className="metric-top"><span>Pool</span><i><WalletCards size={18} /></i></div>
        <div className="pool-card-values">
          <div><span>Gross Pool Value</span><strong>{formatCurrency(grossPoolValue)}</strong><small>{postedOpportunities.length} posted opportunities</small></div>
          <div><span>Liquidity</span><strong>{formatCurrency(liquidity)}</strong><small>{grossPoolValue ? Math.round(liquidity / grossPoolValue * 100) : 0}% deployed</small></div>
        </div>
      </article>
      <MetricCard label="Views" value={formatNumber(views)} detail="Across published campaign content" icon={Eye} />
      <MetricCard label="Engagement" value={formatNumber(engagement)} detail="Interactions across campaign content" icon={BarChart3} />
      <button className="metric-card community-directory-card" onClick={() => setCommunitiesOpen(true)}>
        <div className="metric-top"><span>Active communities</span><i><Layers3 size={18} /></i></div>
        <div className="community-directory-preview">
          <span className="product-avatar-stack image-avatar-stack campaign-logo-stack">{campaignImages.map((campaign) => <i key={campaign.name} title={campaign.name}><img src={campaign.src} alt="" /></i>)}</span>
          <span>View communities <ArrowRight size={15} /></span>
        </div>
      </button>
    </section>
    {communitiesOpen ? <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="community-directory-title">
      <div className="modal-card community-directory-modal">
        <header><div><span className="eyebrow">ACTIVE COMMUNITIES</span><h2 id="community-directory-title">Madrid Philippines communities</h2></div><button className="icon-button" onClick={() => setCommunitiesOpen(false)} aria-label="Close communities">×</button></header>
        <div className="community-directory-list">{featuredCommunities.map((community) => <article key={community.name}>
          <img className="community-directory-logo" src={community.logo} alt="" />
          <div><strong>{community.name}</strong><span>Active community</span></div>
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
    <PageHeader eyebrow="PRODUCTS" title="Products" description="Reusable details for every opportunity." actions={<button className="button button-primary" onClick={() => setEditing(blank())}><Plus size={16} />Add product</button>} />
    <div className="product-grid">{state.products.map((product) => <article className="product-card" key={product.id}><div className="product-art"><span>DR</span><Package size={34} /></div><div className="product-card-body"><div><span className="overline">{product.category}</span><h2>{product.name}</h2></div><p>{product.description}</p><div className="tag-row">{product.keyBenefits.slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div><footer><span className="status-badge status-active"><i />Active</span><button className="button button-secondary button-small" onClick={() => setEditing(product)}><Pencil size={14} />Edit</button></footer></div></article>)}</div>
    {editing ? <div className="modal-backdrop"><form className="modal-card form-modal" onSubmit={save}><header><div><span className="eyebrow">PRODUCT</span><h2>{state.products.some((item) => item.id === editing.id) ? 'Edit product' : 'Add product'}</h2></div><button type="button" className="icon-button" onClick={() => setEditing(null)}>×</button></header><div className="form-grid form-grid-two"><label className="field full"><span>Product name</span><input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /></label><label className="field"><span>Category</span><input value={editing.category} onChange={(event) => setEditing({ ...editing, category: event.target.value })} /></label><label className="field full"><span>Description</span><textarea rows={3} value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} /></label><label className="field full"><span>Key benefits</span><input value={editing.keyBenefits.join(', ')} onChange={(event) => setEditing({ ...editing, keyBenefits: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} /><small>Separate with commas.</small></label></div><footer><button type="button" className="button button-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="button button-primary">Save product</button></footer></form></div> : null}
  </div>
}

const wizardSteps = ['Basics', 'Timing', 'Brief', 'Review']

function endDateFromStart(start: string, durationDays: number) {
  if (!start || durationDays < 1) return start
  const date = new Date(`${start}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + durationDays - 1)
  return date.toISOString().slice(0, 10)
}

export function BrandNewOpportunity() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [draft, setDraft] = useState<OpportunityDraft>(state.opportunityDraft)
  const [step, setStep] = useState(Math.max(1, state.opportunityDraft.step))
  function update(next: Partial<OpportunityDraft>) { setDraft((current) => ({ ...current, ...next })) }
  function updatePeriod(period: 'preparation' | 'live', next: { start?: string; days?: number }) {
    setDraft((current) => {
      const start = next.start ?? (period === 'preparation' ? current.preparationStart : current.liveStart)
      const days = next.days ?? (period === 'preparation' ? current.preparationDays : current.liveDays)
      return period === 'preparation'
        ? { ...current, preparationStart: start, preparationDays: days, preparationEnd: endDateFromStart(start, days) }
        : { ...current, liveStart: start, liveDays: days, liveEnd: endDateFromStart(start, days) }
    })
  }
  function go(next: number) { const saved = { ...draft, step: next }; setDraft(saved); setStep(next); dispatch({ type: 'SAVE_OPPORTUNITY_DRAFT', draft: saved }); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  function finish(mode: 'draft' | 'post') { dispatch({ type: 'SAVE_OPPORTUNITY_DRAFT', draft: { ...draft, step: 4 } }); dispatch({ type: 'CREATE_OPPORTUNITY', mode }); navigate('/brand/opportunities') }
  const product = state.products.find((item) => item.id === draft.productId)
  return <div className="wizard-page">
    <header className="wizard-top"><Link to="/brand/opportunities"><ArrowLeft size={16} />Opportunities</Link><div><span>New opportunity</span><strong>{draft.name || 'Untitled opportunity'}</strong></div><button className="button button-ghost" onClick={() => { dispatch({ type: 'SAVE_OPPORTUNITY_DRAFT', draft: { ...draft, step } }); navigate('/brand/opportunities') }}>Save & exit</button></header>
    <div className="wizard-stepper">{wizardSteps.map((label, index) => <button key={label} className={step === index + 1 ? 'active' : step > index + 1 ? 'complete' : ''} onClick={() => go(index + 1)}><span>{step > index + 1 ? <Check size={13} /> : index + 1}</span><small>{label}</small></button>)}</div>
    <main className="wizard-body">
      {step === 1 ? <WizardSection number="01" title="Opportunity" description="What are you posting?"><div className="form-grid form-grid-two"><label className="field full"><span>Opportunity name</span><input aria-label="Opportunity name" value={draft.name} onChange={(event) => update({ name: event.target.value })} placeholder="e.g. Real Skin, Real Routine" /></label><label className="field"><span>Product</span><select aria-label="Product" value={draft.productId} onChange={(event) => update({ productId: event.target.value })}>{state.products.filter((item) => item.active).map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label className="field"><span>Platform</span><select aria-label="Platform" value={draft.platform} onChange={(event) => update({ platform: event.target.value })}><option>TikTok</option><option>Instagram Reels</option><option>TikTok + Instagram</option><option>Facebook Reels</option></select></label></div><InfoToast title="How it works">Leaders claim a fixed share after you post.</InfoToast></WizardSection> : null}
      {step === 2 ? <WizardSection number="02" title="Timing and pool" description="Set dates, output, and pool."><div className="form-grid form-grid-two"><label className="field"><span>Preparation starts</span><input aria-label="Preparation starts" type="date" value={draft.preparationStart} onChange={(event) => updatePeriod('preparation', { start: event.target.value })} /></label><label className="field"><span>Preparation days</span><div className="input-suffix"><input aria-label="Preparation days" type="number" min="1" value={draft.preparationDays} onChange={(event) => updatePeriod('preparation', { days: Number(event.target.value) })} /><span>days</span></div><small>Ends {formatDate(draft.preparationEnd)}</small></label><label className="field"><span>Publishing starts</span><input aria-label="Publishing starts" type="date" value={draft.liveStart} onChange={(event) => updatePeriod('live', { start: event.target.value })} /></label><label className="field"><span>Publishing days</span><div className="input-suffix"><input aria-label="Publishing days" type="number" min="1" value={draft.liveDays} onChange={(event) => updatePeriod('live', { days: Number(event.target.value) })} /><span>days</span></div><small>Ends {formatDate(draft.liveEnd)}</small></label><label className="field"><span>Content target</span><div className="input-suffix"><input aria-label="Content target" type="number" min="1" value={draft.requiredContent} onChange={(event) => update({ requiredContent: Number(event.target.value) })} /><span>posts</span></div></label><label className="field"><span>Pool value</span><div className="money-input"><span>₱</span><input aria-label="Pool value" type="number" min="1" step="1000" value={draft.totalBudget} onChange={(event) => update({ totalBudget: Number(event.target.value) })} /></div></label></div></WizardSection> : null}
      {step === 3 ? <WizardSection number="03" title="Creator brief" description="Give creators only what they need."><div className="form-grid"><label className="field"><span>Brief</span><textarea aria-label="Brief" rows={5} value={draft.contentDirection} onChange={(event) => update({ contentDirection: event.target.value })} /></label><label className="field"><span>Required hashtags</span><div className="field-icon"><Hash size={15} /><input aria-label="Required hashtags" value={draft.hashtags.join(', ')} onChange={(event) => update({ hashtags: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} /></div></label></div></WizardSection> : null}
      {step === 4 ? <WizardSection number="04" title="Review and post" description="Check the essentials."><div className="review-grid"><div className="review-card"><span className="eyebrow">OPPORTUNITY</span><h2>{draft.name || 'Untitled opportunity'}</h2><p>{product?.name}</p><div className="tag-row"><span>{draft.platform}</span></div><div className="review-sections"><section><CalendarDays size={18} /><div><span>Preparation</span><strong>{formatDate(draft.preparationStart)} – {formatDate(draft.preparationEnd)}</strong><small>{draft.preparationDays} days</small></div></section><section><Clock3 size={18} /><div><span>Publishing</span><strong>{formatDate(draft.liveStart)} – {formatDate(draft.liveEnd)}</strong><small>{draft.liveDays} days</small></div></section><section><Target size={18} /><div><span>Content target</span><strong>{draft.requiredContent} posts</strong></div></section><section><WalletCards size={18} /><div><span>Pool value</span><strong>{formatCurrency(draft.totalBudget)}</strong></div></section></div></div><aside className="launch-panel"><Sparkles size={22} /><h3>Ready to post</h3><dl><div><dt>Content target</dt><dd>{draft.requiredContent}</dd></div><div><dt>Pool value</dt><dd>{formatCurrency(draft.totalBudget)}</dd></div></dl><button className="button button-primary button-block" onClick={() => finish('post')}><Send size={16} />Post</button><button className="button button-secondary button-block" onClick={() => finish('draft')}>Save as draft</button></aside></div></WizardSection> : null}
      <footer className="wizard-actions"><button className="button button-secondary" disabled={step === 1} onClick={() => go(step - 1)}><ArrowLeft size={16} />Back</button><span>Step {step} of {wizardSteps.length}</span>{step < 4 ? <button className="button button-primary" onClick={() => go(step + 1)}>Continue<ArrowRight size={16} /></button> : <Link className="button button-secondary" to="/brand/opportunities">Cancel</Link>}</footer>
    </main>
  </div>
}

function WizardSection({ number, title, description, children }: { number: string; title: string; description: string; children: React.ReactNode }) {
  return <section className="wizard-section"><header><span>{number}</span><div><h1>{title}</h1><p>{description}</p></div></header>{children}</section>
}

export function BrandOpportunities() {
  const { state } = useApp()
  const [filter, setFilter] = useState('all')
  const filters = ['all', 'Draft', 'Open', 'Partially Claimed', 'Live', 'Completed']
  const visible = filter === 'all' ? state.opportunities : state.opportunities.filter((item) => item.status === filter)
  return <div className="page-stack">
    <PageHeader eyebrow="CAMPAIGN OPPORTUNITIES" title="Content commitments, from post to completion" description="Post fixed opportunities and let verified communities claim their automatic share." actions={<Link className="button button-primary" to="/brand/opportunities/new"><Plus size={16} />New opportunity</Link>} />
    <label className="opportunity-filter-mobile"><span>Show</span><select aria-label="Filter opportunities" value={filter} onChange={(event) => setFilter(event.target.value)}>{filters.map((item) => <option key={item} value={item}>{item === 'all' ? 'All opportunities' : item} ({item === 'all' ? state.opportunities.length : state.opportunities.filter((opportunity) => opportunity.status === item).length})</option>)}</select></label>
    <div className="filter-tabs opportunity-filter-tabs">{filters.map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item === 'all' ? 'All' : item}<span>{item === 'all' ? state.opportunities.length : state.opportunities.filter((opportunity) => opportunity.status === item).length}</span></button>)}</div>
    <div className="opportunity-grid">{visible.map((opportunity) => {
      const product = state.products.find((item) => item.id === opportunity.productId)
      const metrics = getOpportunityMetrics(state, opportunity.id)
      const to = `/brand/opportunities/${opportunity.id}`
      return <div className="opportunity-responsive-item" key={opportunity.id}>
        <div className="opportunity-card-desktop"><OpportunityCard id={opportunity.id} name={opportunity.name} product={product?.name ?? 'Product'} platform={opportunity.platform} status={opportunity.status} content={`${opportunity.requiredContent} published contents`} budget={formatCurrency(opportunity.totalBudget)} dates={`${formatDate(opportunity.liveStart)} – ${formatDate(opportunity.liveEnd)}`} progress={metrics.completionPercentage} to={to} /></div>
        <details className="opportunity-card-mobile">
          <summary>
            <span className="campaign-mark">{opportunity.name.slice(0, 1)}</span>
            <span><small>{opportunity.platform}</small><strong>{opportunity.name}</strong></span>
            <StatusBadge status={opportunity.status} />
          </summary>
          <div className="opportunity-mobile-body">
            <p>{product?.name ?? 'Product'}</p>
            <dl>
              <div><dt>Content target</dt><dd>{opportunity.requiredContent}</dd></div>
              <div><dt>Pool value</dt><dd>{formatCurrency(opportunity.totalBudget)}</dd></div>
              <div><dt>Publishing</dt><dd>{formatDate(opportunity.liveStart)} – {formatDate(opportunity.liveEnd)}</dd></div>
            </dl>
            <ProgressBar value={metrics.completionPercentage} label="Counted completion" />
            <Link className="button button-secondary button-block" to={to}>Open workspace <ArrowRight size={15} /></Link>
          </div>
        </details>
      </div>
    })}</div>
  </div>
}

export function BrandOpportunityWorkspace() {
  const { state, dispatch, getOpportunity } = useApp()
  const { opportunityId } = useParams()
  const [params, setParams] = useSearchParams()
  const opportunity = getOpportunity(opportunityId)
  const tab = params.get('tab') ?? 'overview'
  if (!opportunity) return <EmptyState title="Opportunity not found" description="Return to the campaign opportunity portfolio." action={<Link className="button button-primary" to="/brand/opportunities">View opportunities</Link>} />
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
    <Link className="back-link" to="/brand/opportunities"><ArrowLeft size={15} />Campaign opportunities</Link>
    <header className="workspace-header"><div className="workspace-mark">DR</div><div><div className="workspace-title-line"><h1>{opportunity.name}</h1><StatusBadge status={opportunity.status} /></div><p>{product?.name} · {opportunity.platform}</p><span>{formatDate(opportunity.liveStart)} – {formatDate(opportunity.liveEnd)}</span></div><div className="workspace-actions">{opportunity.status === 'Draft' ? <button className="button button-primary" onClick={() => dispatch({ type: 'POST_OPPORTUNITY', opportunityId: opportunity.id })}><Send size={16} />Post opportunity</button> : <span className="fixed-pill"><FileCheck2 size={15} />Fixed campaign terms</span>}</div></header>
    <SegmentedTabs tabs={tabs} active={tab} onChange={(id) => setParams({ tab: id })} />

    {tab === 'overview' ? <div className="tab-stack">
      <section className="metrics-grid metrics-grid-five"><MetricCard label="Required" value={metrics.required} detail="published contents" icon={Target} /><MetricCard label="Allocated" value={metrics.allocated} detail={`${Math.max(0, metrics.required - metrics.allocated)} still available`} icon={Layers3} /><MetricCard label="Counted" value={metrics.counted} detail={`${metrics.completionPercentage}% complete`} icon={CheckCircle2} tone="yellow" /><MetricCard label="Remaining" value={metrics.remaining} detail="to fulfill commitment" icon={Flag} /><MetricCard label="Creators activated" value={creatorsActivated} detail="assigned active members" icon={Users} /></section>
      <Panel className="commitment-panel"><div className="commitment-head"><div><span className="eyebrow">PRIMARY MEASUREMENT</span><h2>Published-content fulfillment</h2><p>Only content published externally, recorded in OkPo, validated, and counted contributes here.</p></div><strong>{metrics.completionPercentage}%</strong></div><ProgressBar value={metrics.completionPercentage} tone="black" /><div className="stage-track">{[{ label: 'Required', value: metrics.required }, { label: 'Allocated', value: metrics.allocated }, { label: 'Published', value: metrics.published }, { label: 'Recorded', value: metrics.recorded }, { label: 'Validated', value: metrics.validated }, { label: 'Counted', value: metrics.counted }].map((item, index) => <div key={item.label}><span>{index + 1}</span><div><small>{item.label}</small><strong>{item.value}</strong></div></div>)}</div></Panel>
      <div className="two-column-layout wide-left"><Panel title="Campaign foundation" description="Terms remain fixed after communities claim."><div className="detail-grid"><div><span>Objective</span><strong>{opportunity.objective}</strong></div><div><span>Platform</span><strong>{opportunity.platform}</strong></div><div><span>Preparation</span><strong>{formatDate(opportunity.preparationStart)} – {formatDate(opportunity.preparationEnd)}</strong><small>{opportunity.preparationDays} days</small></div><div><span>Live campaign</span><strong>{formatDate(opportunity.liveStart)} – {formatDate(opportunity.liveEnd)}</strong><small>{opportunity.liveDays} days</small></div></div><hr /><h3>Priority messages</h3><ul className="clean-list">{opportunity.priorityMessages.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul><h3>Content direction</h3><p className="body-copy">{opportunity.contentDirection}</p><div className="tag-row">{[...opportunity.hashtags, ...opportunity.mentions].map((item) => <span key={item}>{item}</span>)}</div></Panel><Panel title="Budget utilization" description="Allocation follows content quota automatically."><div className="budget-big"><span>Total campaign budget</span><strong>{formatCurrency(opportunity.totalBudget)}</strong></div><ProgressBar value={opportunity.totalBudget ? Math.round(usedBudget / opportunity.totalBudget * 100) : 0} label="Used budget" /><dl className="summary-list"><div><dt>Allocated budget</dt><dd>{formatCurrency(allocatedBudget)}</dd></div><div><dt>Used budget</dt><dd>{formatCurrency(usedBudget)}</dd></div><div><dt>Unallocated budget</dt><dd>{formatCurrency(Math.max(0, opportunity.totalBudget - allocatedBudget))}</dd></div><div><dt>Remaining budget</dt><dd>{formatCurrency(Math.max(0, opportunity.totalBudget - usedBudget))}</dd></div></dl></Panel></div>
      <Panel title="Supporting reach" description="Views and engagement are context—not guaranteed campaign outcomes."><div className="supporting-metrics"><div><Eye size={18} /><span>Available views</span><strong>{formatNumber(opportunity.secondaryViews)}</strong></div><div><BarChart3 size={18} /><span>Available engagement</span><strong>{formatNumber(opportunity.secondaryEngagement)}</strong></div></div></Panel>
    </div> : null}

    {tab === 'communities' ? <div className="tab-stack"><Callout title="No Brand approval or allocation controls">Community allocations are created by the system from verified size and remaining capacity. They are immediately confirmed and cannot be negotiated.</Callout><Panel title="Participating communities" description={`${metrics.allocated} of ${metrics.required} contents allocated across ${claims.length} communities.`}><div className="table-wrap"><table><thead><tr><th>Community</th><th>Verified size</th><th>Leader</th><th>Content quota</th><th>Budget allocation</th><th>Counted</th><th>Completion</th></tr></thead><tbody>{claims.map((claim) => { const community = state.communities.find((item) => item.id === claim.communityId)!; const content = relatedContent.filter((item) => item.communityCampaignId && state.communityCampaigns.find((cc) => cc.id === item.communityCampaignId)?.communityId === community.id); const counted = content.filter((item) => item.status === 'Counted').length; return <tr key={claim.id}><td><div className="person-cell"><Avatar initials={community.initials} tone="cream" /><span><strong>{community.name}</strong><small>{community.location}</small></span></div></td><td>{community.verifiedSize}</td><td>{community.leaderName}<small className="table-subline">{community.leaderType}</small></td><td><strong>{claim.contentQuota}</strong></td><td>{formatCurrency(claim.budgetAllocation)}</td><td>{counted}</td><td><div className="table-progress"><ProgressBar value={Math.round(counted / claim.contentQuota * 100)} /><span>{Math.round(counted / claim.contentQuota * 100)}%</span></div></td></tr> })}</tbody></table></div>{claims.length === 0 ? <EmptyState icon={Users} title="No claims yet" description="The opportunity is open. Verified Community Leaders can claim their automatic allocation." /> : null}</Panel></div> : null}

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
        <thead><tr><th>Creator</th><th>Community</th><th>Community campaign</th><th>Status</th><th>Published link</th><th>Views</th><th>Engagement</th></tr></thead>
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
            <div><dt>Campaign</dt><dd>{campaign.title}</dd></div>
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
  return <div className="report-page"><section className="report-cover"><span className="report-logo">OkPo × {state.brand.name}</span><StatusBadge status={opportunity.status} /><h2>{opportunity.name}</h2><p>Campaign completion report</p><div><span>Live period</span><strong>{formatDate(opportunity.liveStart)} – {formatDate(opportunity.liveEnd)}</strong></div></section><section className="metrics-grid metrics-grid-four"><MetricCard label="Content commitment" value={opportunity.requiredContent} detail="published contents" /><MetricCard label="Counted content" value={metrics.counted} detail={`${metrics.completionPercentage}% fulfillment`} tone="yellow" /><MetricCard label="Communities" value={claims.length} detail="participating" /><MetricCard label="Budget used" value={formatCurrency(used)} detail={`of ${formatCurrency(opportunity.totalBudget)}`} /></section><Panel title="Community completion"><div className="community-report-grid">{claims.map((claim) => { const community = state.communities.find((item) => item.id === claim.communityId)!; const ids = new Set(state.communityCampaigns.filter((item) => item.opportunityId === opportunityId && item.communityId === community.id).map((item) => item.id)); const counted = state.contents.filter((item) => ids.has(item.communityCampaignId) && item.status === 'Counted').length; return <article key={claim.id}><Avatar initials={community.initials} tone="cream" /><div><strong>{community.name}</strong><small>{community.leaderName}</small></div><span>{counted}/{claim.contentQuota}</span><ProgressBar value={Math.round(counted / claim.contentQuota * 100)} /><b>{Math.round(counted / claim.contentQuota * 100)}%</b></article> })}</div></Panel><Callout tone={metrics.completionPercentage >= 100 ? 'green' : 'neutral'} title={metrics.completionPercentage >= 100 ? 'Published-content commitment fulfilled' : 'Campaign delivery in progress'}>{metrics.counted} validated and counted contents contribute to the agreed volume. Available views and engagement remain supporting metrics.</Callout></div>
}

export function BrandContent() {
  const { state } = useApp()
  const visibleStatuses = new Set(['Published', 'Recorded', 'Validated', 'Counted'])
  const opportunityIds = new Set(state.contents.filter((item) => visibleStatuses.has(item.status)).map((item) => item.opportunityId))
  const campaigns = state.opportunities.filter((item) => opportunityIds.has(item.id))
  return <div className="page-stack"><PageHeader eyebrow="CONTENT" title="Content by opportunity" description="Published links and delivery status." /><div className="content-campaign-groups">{campaigns.map((campaign) => { const product = state.products.find((item) => item.id === campaign.productId); const metrics = getOpportunityMetrics(state, campaign.id); return <BrandContentTable key={campaign.id} opportunityId={campaign.id} title={campaign.name} description={`${product?.name ?? 'Product'} · ${metrics.recorded} recorded · ${metrics.counted} counted`} /> })}</div>{campaigns.length === 0 ? <EmptyState icon={Boxes} title="No content yet" description="Content appears after creators record published links." /> : null}</div>
}

export function BrandReports() {
  const { state } = useApp()
  const completed = state.opportunities.filter((item) => item.status === 'Completed')
  return <div className="page-stack"><PageHeader eyebrow="CAMPAIGN REPORTS" title="Completion, made accountable" description="Final content fulfillment, community delivery, and budget utilization." /><div className="report-list">{completed.map((item) => { const metrics = getOpportunityMetrics(state, item.id); return <Link to={`/brand/opportunities/${item.id}?tab=report`} key={item.id}><span className="report-file"><FileText size={23} /></span><div><strong>{item.name}</strong><p>{formatDate(item.liveStart)} – {formatDate(item.liveEnd)} · {metrics.counted} counted contents</p></div><StatusBadge status={item.status} /><span className="report-score">{metrics.completionPercentage}%</span><ArrowRight size={17} /></Link> })}</div></div>
}

export function BrandProfilePage() {
  const { state, dispatch } = useApp()
  const [brand, setBrand] = useState(state.brand)
  const [saved, setSaved] = useState(false)
  function submit(event: React.FormEvent) { event.preventDefault(); dispatch({ type: 'UPDATE_BRAND', brand }); setSaved(true) }
  return <div className="page-stack settings-page"><PageHeader eyebrow="BRAND PROFILE" title="Your identity across OkPo" description="Community Leaders see this information when evaluating opportunities." /><form className="panel profile-form" onSubmit={submit}><div className="profile-identity"><Avatar initials={brand.initials} size="lg" tone="yellow" /><div><strong>{brand.name}</strong><span>Verified Brand</span></div></div><div className="form-grid form-grid-two"><label className="field"><span>Brand name</span><input value={brand.name} onChange={(event) => setBrand({ ...brand, name: event.target.value })} /></label><label className="field"><span>Website</span><input value={brand.website} onChange={(event) => setBrand({ ...brand, website: event.target.value })} /></label><label className="field"><span>Industry</span><input value={brand.industry} onChange={(event) => setBrand({ ...brand, industry: event.target.value })} /></label><label className="field"><span>Location</span><input value={brand.location} onChange={(event) => setBrand({ ...brand, location: event.target.value })} /></label><label className="field full"><span>Brand description</span><textarea rows={4} value={brand.description} onChange={(event) => setBrand({ ...brand, description: event.target.value })} /></label><label className="field"><span>Primary contact</span><input value={brand.contactName} onChange={(event) => setBrand({ ...brand, contactName: event.target.value })} /></label><label className="field"><span>Contact email</span><input type="email" value={brand.contactEmail} onChange={(event) => setBrand({ ...brand, contactEmail: event.target.value })} /></label></div><footer className="form-footer">{saved ? <span className="saved-message"><CheckCircle2 size={16} />Saved to this prototype</span> : <span />}<button className="button button-primary">Save brand profile</button></footer></form></div>
}
