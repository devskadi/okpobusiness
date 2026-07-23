import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight, Check, CircleDashed, Info, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { ContentStatus, OpportunityStatus } from './types'

export function Logo({ compact = false }: { compact?: boolean }) {
  return <div className={`logo ${compact ? 'logo-compact' : ''}`} aria-label="OkPo"><img src="/assets/okpo-logo.png" alt="" /></div>
}

export function Avatar({ initials, tone = 'yellow', size = 'md', src }: { initials: string; tone?: 'yellow' | 'black' | 'cream' | 'coral' | 'mint'; size?: 'sm' | 'md' | 'lg'; src?: string }) {
  return <span className={`avatar avatar-${tone} avatar-${size} ${src ? 'avatar-image' : ''}`}>{src ? <img src={src} alt="" /> : initials}</span>
}

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase().replaceAll(' ', '-').replaceAll('/', '-')
  return <span className={`status-badge status-${key}`}><i />{status}</span>
}

export function ContentBadge({ status }: { status: ContentStatus }) {
  return <StatusBadge status={status} />
}

export function ProgressBar({ value, tone = 'yellow', label }: { value: number; tone?: 'yellow' | 'black' | 'green'; label?: string }) {
  const safe = Math.max(0, Math.min(100, value))
  return <div className="progress-wrap">{label ? <div className="progress-label"><span>{label}</span><strong>{safe}%</strong></div> : null}<div className={`progress progress-${tone}`}><span style={{ width: `${safe}%` }} /></div></div>
}

export function MetricCard({ label, value, detail, icon: Icon, tone = 'plain', className = '' }: { label: string; value: ReactNode; detail?: ReactNode; icon?: LucideIcon; tone?: 'plain' | 'yellow' | 'black'; className?: string }) {
  return <article className={`metric-card metric-${tone} ${className}`}><div className="metric-top"><span>{label}</span>{Icon ? <i><Icon size={18} /></i> : null}</div><strong>{value}</strong>{detail ? <small>{detail}</small> : null}</article>
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <header className="page-header"><div>{eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}<h1>{title}</h1>{description ? <p>{description}</p> : null}</div>{actions ? <div className="page-actions">{actions}</div> : null}</header>
}

export function Panel({ title, description, action, children, className = '' }: { title?: string; description?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}>{title || action ? <header className="panel-header"><div>{title ? <h2>{title}</h2> : null}{description ? <p>{description}</p> : null}</div>{action}</header> : null}{children}</section>
}

export function EmptyState({ icon: Icon = CircleDashed, title, description, action }: { icon?: LucideIcon; title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><span><Icon size={24} /></span><h3>{title}</h3><p>{description}</p>{action}</div>
}

export function CheckRow({ checked, children, onClick }: { checked: boolean; children: ReactNode; onClick?: () => void }) {
  const content = <><span className={`check-box ${checked ? 'checked' : ''}`}>{checked ? <Check size={13} /> : null}</span><span>{children}</span></>
  return onClick ? <button className="check-row" onClick={onClick}>{content}</button> : <div className="check-row">{content}</div>
}

export function Callout({ title, children, tone = 'yellow' }: { title: string; children: ReactNode; tone?: 'yellow' | 'neutral' | 'green' }) {
  return <aside className={`callout callout-${tone}`}><Sparkles size={17} /><div><strong>{title}</strong><p>{children}</p></div></aside>
}

export function InfoToast({ title, children }: { title: string; children: ReactNode }) {
  return <aside className="info-toast" role="note"><Info size={15} /><div><strong>{title}</strong><span>{children}</span></div></aside>
}

export function OpportunityCard({ id, name, product, platform, status, content, budget, dates, progress, to }: { id: string; name: string; product: string; platform: string; status: OpportunityStatus; content: string; budget: string; dates: string; progress?: number; to: string }) {
  return <Link className="opportunity-card" to={to} data-opportunity-id={id}><div className="opportunity-card-top"><span className="campaign-mark">OP</span><StatusBadge status={status} /></div><div><span className="overline">{platform}</span><h3>{name}</h3><p>{product}</p></div><dl><div><dt>Commitment</dt><dd>{content}</dd></div><div><dt>Budget</dt><dd>{budget}</dd></div><div><dt>Live period</dt><dd>{dates}</dd></div></dl>{progress !== undefined ? <ProgressBar value={progress} label="Counted completion" /> : null}<span className="card-link">Open workspace <ArrowUpRight size={15} /></span></Link>
}

export function SegmentedTabs({ tabs, active, onChange }: { tabs: { id: string; label: string; count?: number }[]; active: string; onChange: (id: string) => void }) {
  return <div className="segmented-tabs" role="tablist">{tabs.map((tab) => <button key={tab.id} role="tab" aria-selected={active === tab.id} className={active === tab.id ? 'active' : ''} onClick={() => onChange(tab.id)}>{tab.label}{tab.count !== undefined ? <span>{tab.count}</span> : null}</button>)}</div>
}
