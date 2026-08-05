import {
  ArrowRight, ArrowUpRight, CaretDown, CaretRight, ChartBar as BarChart3, Check, Eye,
  MagnifyingGlass, Network, SortAscending, UserCircle, UsersThree, VideoCamera, X,
} from '@phosphor-icons/react'
import { useDeferredValue, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Avatar, EmptyState, MetricCard, PageHeader, Panel } from '../components'
import { creatorRoster, type CreatorRosterRecord } from '../creatorRosterData'
import { formatNumber } from '../store'

type DirectoryMode = 'brand' | 'leader'
type SortMode = 'members' | 'views' | 'name'

interface CommunitySummary {
  name: string
  members: CreatorRosterRecord[]
  views: number
  likes: number
  comments: number
  videos: number
}

function initialsFor(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean)
  if (words.length > 1) return words.slice(0, 2).map((word) => word[0]).join('').toUpperCase()
  return value.replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase() || 'CR'
}

function buildDirectoryIndex() {
  const membersByCommunity = new Map<string, CreatorRosterRecord[]>()
  const summaries = new Map<string, CommunitySummary>()
  const unassigned: CreatorRosterRecord[] = []

  for (const creator of creatorRoster) {
    if (creator.communities.length === 0) unassigned.push(creator)
    for (const community of creator.communities) {
      const members = membersByCommunity.get(community) ?? []
      members.push(creator)
      membersByCommunity.set(community, members)
      const summary = summaries.get(community) ?? { name: community, members: [], views: 0, likes: 0, comments: 0, videos: 0 }
      summary.members.push(creator)
      summary.views += creator.views
      summary.likes += creator.likes
      summary.comments += creator.comments
      summary.videos += creator.totalVideos
      summaries.set(community, summary)
    }
  }

  return {
    membersByCommunity,
    summaries: [...summaries.values()],
    unassigned,
    unassignedSummary: {
      name: 'Unassigned',
      members: unassigned,
      views: unassigned.reduce((sum, creator) => sum + creator.views, 0),
      likes: unassigned.reduce((sum, creator) => sum + creator.likes, 0),
      comments: unassigned.reduce((sum, creator) => sum + creator.comments, 0),
      videos: unassigned.reduce((sum, creator) => sum + creator.totalVideos, 0),
    } satisfies CommunitySummary,
  }
}

const directoryIndex = buildDirectoryIndex()
const allSummaries = [...directoryIndex.summaries, directoryIndex.unassignedSummary]
const mappedCreatorCount = creatorRoster.length - directoryIndex.unassigned.length
const membershipCount = directoryIndex.summaries.reduce((sum, community) => sum + community.members.length, 0)
const baselineVideos = creatorRoster.reduce((sum, creator) => sum + creator.totalVideos, 0)

function sortSummaries(items: CommunitySummary[], sort: SortMode) {
  return [...items].sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name)
    return (sort === 'views' ? b.views - a.views : b.members.length - a.members.length) || a.name.localeCompare(b.name)
  })
}

function DirectoryCommunityCard({ summary, selected, onSelect }: { summary: CommunitySummary; selected: boolean; onSelect: () => void }) {
  const isUnassigned = summary.name === 'Unassigned'
  return <button className={`directory-community-card ${selected ? 'selected' : ''} ${isUnassigned ? 'unassigned' : ''}`} onClick={onSelect} aria-pressed={selected}>
    <span className="directory-community-card-header"><span className="directory-community-avatar"><Avatar initials={initialsFor(summary.name)} tone={isUnassigned ? 'cream' : 'mint'} /></span><span><strong>{summary.name}</strong><small>{summary.members.length} {summary.members.length === 1 ? 'creator' : 'creators'}</small></span><ArrowRight size={16} /></span>
    <span className="directory-community-card-metrics"><span><Eye size={14} />{formatNumber(summary.views)} views</span><span><VideoCamera size={14} />{formatNumber(summary.videos)} videos</span></span>
  </button>
}

function CreatorTable({ members, page, pageSize }: { members: CreatorRosterRecord[]; page: number; pageSize: number }) {
  const pageMembers = members.slice(page * pageSize, (page + 1) * pageSize)
  return <div className="table-wrap directory-member-table"><table><thead><tr><th>Creator</th><th>Communities</th><th>Views</th><th>Likes</th><th>Comments</th><th>Videos</th></tr></thead><tbody>{pageMembers.map((creator) => <tr key={creator.id}><td><div className="person-cell"><Avatar initials={initialsFor(creator.name)} size="sm" /><span><strong>{creator.name}</strong><small>Baseline creator record</small></span></div></td><td>{creator.communities.length ? <span className="directory-membership-list">{creator.communities.join(' · ')}</span> : <span className="muted">Unassigned</span>}</td><td>{formatNumber(creator.views)}</td><td>{formatNumber(creator.likes)}</td><td>{formatNumber(creator.comments)}</td><td>{formatNumber(creator.totalVideos)}</td></tr>)}</tbody></table></div>
}

function BrandCommunityDirectoryPage({ mode }: { mode: Extract<DirectoryMode, 'brand'> }) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortMode>('members')
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null)
  const [memberQuery, setMemberQuery] = useState('')
  const [memberPage, setMemberPage] = useState(0)
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())
  const isBrand = mode === 'brand'
  const pageSize = 40
  const selectedSummary = selectedCommunity ? allSummaries.find((summary) => summary.name === selectedCommunity) : undefined

  const visibleSummaries = useMemo(() => {
    const filtered = deferredQuery ? allSummaries.filter((summary) => summary.name.toLowerCase().includes(deferredQuery)) : allSummaries
    return sortSummaries(filtered, sort)
  }, [deferredQuery, sort])

  const selectedMembers = useMemo(() => {
    if (!selectedSummary) return []
    const lowered = memberQuery.trim().toLowerCase()
    const source = selectedSummary.name === 'Unassigned' ? directoryIndex.unassigned : directoryIndex.membersByCommunity.get(selectedSummary.name) ?? []
    if (!lowered) return source
    return source.filter((creator) => creator.name.toLowerCase().includes(lowered) || creator.communities.some((community) => community.toLowerCase().includes(lowered)))
  }, [memberQuery, selectedSummary])

  const pageCount = Math.max(1, Math.ceil(selectedMembers.length / pageSize))
  const safePage = Math.min(memberPage, pageCount - 1)

  function selectCommunity(name: string) {
    setSelectedCommunity(name)
    setMemberQuery('')
    setMemberPage(0)
  }

  function clearSelection() {
    setSelectedCommunity(null)
    setMemberQuery('')
    setMemberPage(0)
  }

  return <div className="page-stack directory-page">
    <PageHeader
      eyebrow={isBrand ? 'BRAND COMMUNITY DIRECTORY' : 'COMMUNITY DIRECTORY'}
      title={isBrand ? 'See the creator network behind your campaigns' : 'Find creators across the network'}
      description={isBrand ? 'Browse the mapped communities and baseline creator performance available to your campaigns.' : 'Browse every mapped community, then open a roster to inspect creator-level baseline metrics.'}
      actions={<span className="directory-scope-pill"><Check size={14} />Read-only network view</span>}
    />

    <section className="metrics-grid metrics-grid-four directory-kpis" aria-label="Creator network summary">
      <MetricCard label="Creators in source" value={formatNumber(creatorRoster.length)} detail="emails hidden from prototype" icon={UsersThree} />
      <MetricCard label="Mapped creators" value={formatNumber(mappedCreatorCount)} detail={`${membershipCount.toLocaleString()} overlapping memberships`} icon={UserCircle} tone="yellow" />
      <MetricCard label="Communities" value={formatNumber(directoryIndex.summaries.length)} detail="after sprint and excluded-group filters" icon={BarChart3} />
      <MetricCard label="Videos logged" value={formatNumber(baselineVideos)} detail="baseline metric only" icon={VideoCamera} tone="black" />
    </section>

    <Panel className="directory-panel" title="Community map" description="Creators can appear in more than one community. Views, likes, comments, and videos are baseline source metrics; they do not represent campaign delivery." action={<div className="directory-controls"><label className="directory-search"><MagnifyingGlass size={16} /><span className="sr-only">Search communities</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search communities" /></label><label className="directory-sort"><SortAscending size={15} /><span className="sr-only">Sort communities</span><select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}><option value="members">Most creators</option><option value="views">Most views</option><option value="name">Name A–Z</option></select></label></div>}>
      <div className="directory-community-grid">{visibleSummaries.map((summary) => <DirectoryCommunityCard key={summary.name} summary={summary} selected={selectedCommunity === summary.name} onSelect={() => selectCommunity(summary.name)} />)}</div>
      {visibleSummaries.length === 0 ? <EmptyState icon={MagnifyingGlass} title="No communities match" description="Try a different community name." /> : null}
    </Panel>

    {selectedSummary ? <Panel className="directory-roster-panel" title={`${selectedSummary.name} roster`} description={`${selectedSummary.members.length.toLocaleString()} creators · baseline performance only`} action={<button className="button button-secondary button-small" onClick={clearSelection}><X size={14} />Close roster</button>}>
      <div className="directory-roster-toolbar"><label className="directory-search directory-search-wide"><MagnifyingGlass size={16} /><span className="sr-only">Search creators</span><input value={memberQuery} onChange={(event) => { setMemberQuery(event.target.value); setMemberPage(0) }} placeholder="Search creators or communities" /></label><span className="directory-result-count">{selectedMembers.length.toLocaleString()} result{selectedMembers.length === 1 ? '' : 's'}</span></div>
      {selectedMembers.length ? <CreatorTable members={selectedMembers} page={safePage} pageSize={pageSize} /> : <EmptyState icon={MagnifyingGlass} title="No creators match" description="Try a different name or community." />}
      {selectedMembers.length > pageSize ? <div className="directory-pagination"><span>Page {safePage + 1} of {pageCount}</span><div><button className="button button-secondary button-small" disabled={safePage === 0} onClick={() => setMemberPage((page) => Math.max(0, page - 1))} aria-label="Previous creator page">Previous</button><button className="button button-secondary button-small" disabled={safePage >= pageCount - 1} onClick={() => setMemberPage((page) => Math.min(pageCount - 1, page + 1))} aria-label="Next creator page">Next</button></div></div> : null}
    </Panel> : <CalloutDirectoryHint mode={mode} />}
  </div>
}

function CalloutDirectoryHint({ mode }: { mode: DirectoryMode }) {
  return <aside className="directory-empty-hint"><UsersThree size={20} /><div><strong>{mode === 'brand' ? 'Start with a community' : 'Choose a community to inspect its roster'}</strong><p>{mode === 'brand' ? 'Open a card to review creator names and baseline performance without exposing email addresses.' : 'Open a community card to browse creators, overlapping memberships, and source metrics.'}</p></div></aside>
}

type HierarchyNodeData = {
  id: string
  name: string
  role: 'Community Leader' | 'Leader' | 'Creator'
  avatar: string
  community: string
  directMemberCount: number
  totalNetworkCount: number
  children: HierarchyNodeData[]
}

const hierarchyRoot: HierarchyNodeData = {
  id: 'ian-madrid',
  name: 'Ian Madrid',
  role: 'Community Leader',
  avatar: '/assets/madrid-rider-1.jpeg',
  community: 'Madrid Philippines',
  directMemberCount: 53,
  totalNetworkCount: 12480,
  children: [
    {
      id: 'jaimie-rivera', name: 'Jaimie C. Rivera', role: 'Leader', avatar: '/assets/madrid-performer-1.jpeg', community: 'Madrid PH', directMemberCount: 18, totalNetworkCount: 4200,
      children: [
        { id: 'reynaldo-zacarias', name: 'Reynaldo Jr. Zacarias', role: 'Leader', avatar: '/assets/madrid-rider-1.jpeg', community: 'Madrid PH', directMemberCount: 7, totalNetworkCount: 1620, children: [
          { id: 'lansuu', name: 'Lansuu', role: 'Creator', avatar: '/assets/madrid-performer-2.jpeg', community: 'Madrid PH', directMemberCount: 1, totalNetworkCount: 1, children: [] },
          { id: 'yuno', name: 'Yuno', role: 'Creator', avatar: '/assets/madrid-rider-2.jpeg', community: 'Madrid PH', directMemberCount: 1, totalNetworkCount: 1, children: [] },
        ] },
        { id: 'fiona', name: 'Fiona', role: 'Creator', avatar: '/assets/madrid-performer-1.jpeg', community: 'Madrid PH', directMemberCount: 1, totalNetworkCount: 1, children: [
          { id: 'fiona-team', name: 'Fiona’s creator circle', role: 'Creator', avatar: '/assets/madrid-performer-2.jpeg', community: 'Madrid PH', directMemberCount: 1, totalNetworkCount: 14, children: [] },
        ] },
        { id: 'aira-dioneda', name: 'Aira Pamela Dioneda', role: 'Creator', avatar: '/assets/madrid-rider-2.jpeg', community: 'Madrid PH', directMemberCount: 1, totalNetworkCount: 1, children: [] },
      ],
    },
    {
      id: 'roseann-agata', name: 'Roseann V. Sta. Agata', role: 'Leader', avatar: '/assets/madrid-rider-2.jpeg', community: 'Madrid HR', directMemberCount: 14, totalNetworkCount: 3180,
      children: [
        { id: 'clara-rabuya', name: 'Clara Marie Rabuya', role: 'Leader', avatar: '/assets/madrid-performer-1.jpeg', community: 'Madrid HR', directMemberCount: 6, totalNetworkCount: 920, children: [
          { id: 'genesis-mindanao', name: 'Genesis Ken Mindanao', role: 'Creator', avatar: '/assets/madrid-rider-1.jpeg', community: 'Madrid HR', directMemberCount: 1, totalNetworkCount: 1, children: [] },
          { id: 'cza', name: 'Cza', role: 'Creator', avatar: '/assets/madrid-performer-2.jpeg', community: 'Madrid HR', directMemberCount: 1, totalNetworkCount: 1, children: [] },
        ] },
        { id: 'kyla', name: 'Kyla', role: 'Creator', avatar: '/assets/madrid-performer-2.jpeg', community: 'Madrid HR', directMemberCount: 1, totalNetworkCount: 1, children: [] },
        { id: 'marissa-amparo', name: 'Marissa A. Amparo', role: 'Creator', avatar: '/assets/madrid-rider-1.jpeg', community: 'Madrid HR', directMemberCount: 1, totalNetworkCount: 1, children: [] },
      ],
    },
    {
      id: 'reynaldo-field', name: 'Reynaldo Jr. Zacarias', role: 'Leader', avatar: '/assets/madrid-rider-1.jpeg', community: 'Madrid FIELD', directMemberCount: 11, totalNetworkCount: 2480,
      children: [
        { id: 'roldan-delos-reyes', name: 'Roldan Delos Reyes Jr.', role: 'Leader', avatar: '/assets/madrid-performer-2.jpeg', community: 'Madrid FIELD', directMemberCount: 5, totalNetworkCount: 680, children: [
          { id: 'jhanan', name: 'Jhanan', role: 'Creator', avatar: '/assets/madrid-rider-2.jpeg', community: 'Madrid FIELD', directMemberCount: 1, totalNetworkCount: 1, children: [] },
          { id: 'norhaya', name: 'Norhaya Mohammad', role: 'Creator', avatar: '/assets/madrid-performer-1.jpeg', community: 'Madrid FIELD', directMemberCount: 1, totalNetworkCount: 1, children: [] },
        ] },
        { id: 'john-wane', name: 'John Wane Salazar', role: 'Creator', avatar: '/assets/madrid-rider-1.jpeg', community: 'Madrid FIELD', directMemberCount: 1, totalNetworkCount: 1, children: [] },
        { id: 'rhodnie', name: 'Rhodnie Santos', role: 'Creator', avatar: '/assets/madrid-performer-1.jpeg', community: 'Madrid FIELD', directMemberCount: 1, totalNetworkCount: 1, children: [] },
      ],
    },
    {
      id: 'mary-angel-mechure', name: 'Mary Angel Hashanah Q. Mechure', role: 'Leader', avatar: '/assets/madrid-performer-1.jpeg', community: 'Tech Interns PH', directMemberCount: 10, totalNetworkCount: 2620,
      children: [
        { id: 'jazel-sison', name: 'Jazel B. Sison', role: 'Leader', avatar: '/assets/madrid-rider-2.jpeg', community: 'Tech Interns PH', directMemberCount: 4, totalNetworkCount: 760, children: [
          { id: 'ai-ni-ian', name: 'Ai ni Ian', role: 'Creator', avatar: '/assets/madrid-rider-1.jpeg', community: 'Tech Interns PH', directMemberCount: 1, totalNetworkCount: 1, children: [] },
          { id: 'jayson', name: 'Jayson', role: 'Creator', avatar: '/assets/madrid-performer-2.jpeg', community: 'Tech Interns PH', directMemberCount: 1, totalNetworkCount: 1, children: [] },
        ] },
        { id: 'kevin-gallego', name: 'Kevin Christopher Gallego', role: 'Creator', avatar: '/assets/madrid-rider-1.jpeg', community: 'Tech Interns PH', directMemberCount: 1, totalNetworkCount: 1, children: [] },
        { id: 'claire', name: 'Claire', role: 'Creator', avatar: '/assets/madrid-performer-2.jpeg', community: 'Tech Interns PH', directMemberCount: 1, totalNetworkCount: 1, children: [] },
      ],
    },
  ],
}

function hierarchyEntries(root: HierarchyNodeData) {
  const entries: Array<{ node: HierarchyNodeData; parentId: string | null; depth: number }> = []
  const parents = new Map<string, string | null>()
  function visit(node: HierarchyNodeData, parentId: string | null, depth: number) {
    entries.push({ node, parentId, depth })
    parents.set(node.id, parentId)
    node.children.forEach((child) => visit(child, node.id, depth + 1))
  }
  visit(root, null, 0)
  return { entries, parents }
}

function HierarchyHeader({ onSearch }: { onSearch: () => void }) {
  return <header className="hierarchy-page-header">
    <div className="hierarchy-page-heading">
      <span className="eyebrow">COMMUNITY DIRECTORY</span>
      <h1>Find creators across the network</h1>
      <p>Follow the people, leaders, and creator groups connected to Madrid Philippines.</p>
    </div>
    <button className="hierarchy-search-action" type="button" onClick={onSearch}><MagnifyingGlass size={18} />Search people</button>
    <div className="hierarchy-community-bar">
      <div className="hierarchy-community-identity"><Avatar initials="MP" src="/assets/madrid-philippines-logo.png" tone="cream" size="lg" /><span><strong>Madrid Philippines</strong><small>Creator network · read-only view</small></span></div>
      <div className="hierarchy-community-stats" aria-label="Community totals"><span><strong>12,480</strong><small>Members</small></span><span><strong>53</strong><small>Community leaders</small></span></div>
    </div>
  </header>
}

function HierarchyTabs({ active, onChange }: { active: 'hierarchy' | 'members'; onChange: (next: 'hierarchy' | 'members') => void }) {
  return <div className="hierarchy-view-tabs" role="tablist" aria-label="Community directory views">
    <button type="button" role="tab" aria-selected={active === 'hierarchy'} className={active === 'hierarchy' ? 'active' : ''} onClick={() => onChange('hierarchy')}><Network size={17} />Hierarchy</button>
    <button type="button" role="tab" aria-selected={active === 'members'} className={active === 'members' ? 'active' : ''} onClick={() => onChange('members')}><UsersThree size={17} />Members</button>
  </div>
}

function HierarchySearch({ query, onChange, inputRef, resultLabel }: { query: string; onChange: (value: string) => void; inputRef: React.RefObject<HTMLInputElement | null>; resultLabel: string }) {
  return <div className="hierarchy-search-row">
    <label className="hierarchy-search-field"><MagnifyingGlass size={18} /><span className="sr-only">Search people</span><input ref={inputRef} value={query} onChange={(event) => onChange(event.target.value)} placeholder="Search people by name or role" /></label>
    {query ? <button type="button" className="hierarchy-search-clear" onClick={() => onChange('')} aria-label="Clear people search"><X size={16} /></button> : null}
    <span className="hierarchy-search-result">{resultLabel}</span>
  </div>
}

function HierarchyNodeTree({ node, depth, expandedIds, highlightedId, onToggle, onOpenProfile, onViewAll }: { node: HierarchyNodeData; depth: number; expandedIds: Set<string>; highlightedId: string | null; onToggle: (id: string) => void; onOpenProfile: (node: HierarchyNodeData) => void; onViewAll: (node: HierarchyNodeData) => void }) {
  const previewChildren = node.children.slice(0, 4)
  const expanded = expandedIds.has(node.id)
  const hasMoreChildren = node.directMemberCount > previewChildren.length
  const nodeStyle = { '--depth': depth } as CSSProperties
  return <article id={`hierarchy-node-${node.id}`} className={`hierarchy-node hierarchy-node-depth-${Math.min(depth, 3)} ${depth === 0 ? 'hierarchy-node-root' : ''} ${highlightedId === node.id ? 'is-highlighted' : ''}`} style={nodeStyle}>
    <div className="hierarchy-node-card-wrap">
      <button className="hierarchy-node-main" type="button" onClick={() => onToggle(node.id)} aria-expanded={node.children.length ? expanded : undefined} aria-controls={node.children.length ? `hierarchy-children-${node.id}` : undefined}>
        <Avatar initials={initialsFor(node.name)} src={node.avatar} tone={depth === 0 ? 'yellow' : depth === 1 ? 'mint' : 'cream'} size={depth === 0 ? 'lg' : depth === 1 ? 'md' : 'sm'} />
        <span className="hierarchy-node-copy"><strong>{node.name}</strong><small>{node.role} · {node.community}</small><span><b>{formatNumber(node.totalNetworkCount)}</b> in network <i>·</i> <b>{formatNumber(node.directMemberCount)}</b> direct</span></span>
        {node.children.length ? <span className="hierarchy-node-chevron" aria-hidden="true">{expanded ? <CaretDown size={19} /> : <CaretRight size={19} />}</span> : <span className="hierarchy-leaf-mark" aria-hidden="true" />}
      </button>
      <button className="hierarchy-node-profile" type="button" onClick={() => onOpenProfile(node)} aria-label={`Open profile for ${node.name}`}><ArrowUpRight size={16} /></button>
    </div>
    {expanded && node.children.length ? <div id={`hierarchy-children-${node.id}`} className="hierarchy-node-children" aria-label={`${node.name} direct network`}>
      {previewChildren.map((child) => <HierarchyNodeTree key={child.id} node={child} depth={depth + 1} expandedIds={expandedIds} highlightedId={highlightedId} onToggle={onToggle} onOpenProfile={onOpenProfile} onViewAll={onViewAll} />)}
      {hasMoreChildren ? <button type="button" className="hierarchy-view-all" onClick={() => onViewAll(node)}>View all {formatNumber(node.directMemberCount)} {node.directMemberCount === 1 ? 'member' : 'members'} <ArrowRight size={15} /></button> : null}
    </div> : null}
  </article>
}

function HierarchyProfileDrawer({ node, onClose }: { node: HierarchyNodeData; onClose: () => void }) {
  return <div className="hierarchy-profile-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="hierarchy-profile-drawer" role="dialog" aria-modal="true" aria-labelledby="hierarchy-profile-title">
      <header><span className="eyebrow">NETWORK PROFILE</span><button type="button" className="hierarchy-profile-close" onClick={onClose} aria-label="Close profile"><X size={20} /></button></header>
      <div className="hierarchy-profile-heading"><Avatar initials={initialsFor(node.name)} src={node.avatar} tone="yellow" size="lg" /><div><h2 id="hierarchy-profile-title">{node.name}</h2><p>{node.role} · {node.community}</p></div></div>
      <div className="hierarchy-profile-metrics"><span><strong>{formatNumber(node.totalNetworkCount)}</strong><small>people in network</small></span><span><strong>{formatNumber(node.directMemberCount)}</strong><small>direct members</small></span></div>
      <p className="hierarchy-profile-note">This read-only profile shows the person’s downstream community scale and direct connections.</p>
      <button type="button" className="button button-primary button-block" onClick={onClose}>Done</button>
    </section>
  </div>
}

function HierarchyMemberCard({ node, onOpenProfile }: { node: HierarchyNodeData; onOpenProfile: () => void }) {
  return <article className="hierarchy-member-card"><Avatar initials={initialsFor(node.name)} src={node.avatar} tone={node.role === 'Community Leader' ? 'yellow' : 'mint'} size="md" /><div><strong>{node.name}</strong><small>{node.role} · {node.community}</small><span>{formatNumber(node.totalNetworkCount)} in network · {formatNumber(node.directMemberCount)} direct</span></div><button type="button" onClick={onOpenProfile} aria-label={`Open profile for ${node.name}`}><ArrowUpRight size={16} /></button></article>
}

function LeaderHierarchyDirectoryPage() {
  const [activeView, setActiveView] = useState<'hierarchy' | 'members'>('hierarchy')
  const [query, setQuery] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set([hierarchyRoot.id]))
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [profileNode, setProfileNode] = useState<HierarchyNodeData | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const { entries, parents } = useMemo(() => hierarchyEntries(hierarchyRoot), [])
  const loweredQuery = query.trim().toLowerCase()
  const filteredMembers = useMemo(() => loweredQuery ? entries.filter(({ node }) => `${node.name} ${node.role} ${node.community}`.toLowerCase().includes(loweredQuery)) : entries, [entries, loweredQuery])
  const matchingNode = useMemo(() => loweredQuery ? entries.find(({ node }) => `${node.name} ${node.role} ${node.community}`.toLowerCase().includes(loweredQuery))?.node ?? null : null, [entries, loweredQuery])

  useEffect(() => {
    if (!searchOpen) return
    searchRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    if (activeView !== 'hierarchy') return
    if (!matchingNode) {
      setHighlightedId(null)
      return
    }
    const path = new Set<string>()
    let current: string | null = matchingNode.id
    while (current) {
      path.add(current)
      current = parents.get(current) ?? null
    }
    setExpandedIds((previous) => new Set([...previous, ...path]))
    setHighlightedId(matchingNode.id)
    const frame = window.requestAnimationFrame(() => document.getElementById(`hierarchy-node-${matchingNode.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
    return () => window.cancelAnimationFrame(frame)
  }, [activeView, matchingNode, parents])

  function toggleNode(id: string) {
    setExpandedIds((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function updateQuery(value: string) {
    setQuery(value)
    setSearchOpen(true)
  }

  const resultLabel = activeView === 'hierarchy' ? (matchingNode ? `Showing ${matchingNode.name}` : 'Search reveals nested paths') : `${filteredMembers.length} people`
  return <div className="page-stack hierarchy-directory-page">
    <HierarchyHeader onSearch={() => setSearchOpen(true)} />
    <HierarchyTabs active={activeView} onChange={setActiveView} />
    {searchOpen ? <HierarchySearch query={query} onChange={updateQuery} inputRef={searchRef} resultLabel={resultLabel} /> : <button type="button" className="hierarchy-collapsed-search" onClick={() => setSearchOpen(true)}><MagnifyingGlass size={17} /><span>Search people by name or role</span><ArrowRight size={16} /></button>}
    <section className="hierarchy-scale-strip" aria-label="Network scale"><div><span>NETWORK SCALE</span><strong>12,480 <small>creators</small></strong><p>One person can connect thousands of people through their own community.</p></div><div className="hierarchy-scale-stat"><strong>53</strong><span>community leaders</span></div><div className="hierarchy-scale-stat"><strong>4</strong><span>visible branches</span></div></section>
    {activeView === 'hierarchy' ? <section className="hierarchy-stage" aria-labelledby="hierarchy-stage-title"><header><div><span className="eyebrow">HIERARCHY</span><h2 id="hierarchy-stage-title">One community, many paths</h2><p>Expand a person to follow the people directly beneath them.</p></div><span className="hierarchy-connector-legend"><i />Direct connection</span></header><div className="hierarchy-tree" aria-label="Expandable community hierarchy"><HierarchyNodeTree node={hierarchyRoot} depth={0} expandedIds={expandedIds} highlightedId={highlightedId} onToggle={toggleNode} onOpenProfile={setProfileNode} onViewAll={setProfileNode} /></div></section> : <section className="hierarchy-members-panel" aria-labelledby="hierarchy-members-title"><header><div><span className="eyebrow">MEMBERS</span><h2 id="hierarchy-members-title">Everyone in the network</h2><p>Search the flat directory or open a profile for downstream context.</p></div><strong>{filteredMembers.length}</strong></header><div className="hierarchy-member-list">{filteredMembers.map(({ node }) => <HierarchyMemberCard node={node} key={node.id} onOpenProfile={() => setProfileNode(node)} />)}</div>{filteredMembers.length === 0 ? <EmptyState icon={MagnifyingGlass} title="No people match" description="Try a different name, role, or community." /> : null}</section>}
    {profileNode ? <HierarchyProfileDrawer node={profileNode} onClose={() => setProfileNode(null)} /> : null}
  </div>
}

export default function CommunityDirectoryPage({ mode }: { mode: DirectoryMode }) {
  return mode === 'leader' ? <LeaderHierarchyDirectoryPage /> : <BrandCommunityDirectoryPage mode="brand" />
}
