import {
  ChartBar as BarChart3, Bell, CaretDown as ChevronDown, ChatCircle, CurrencyCircleDollar as CircleDollarSign,
  Folder as FolderKanban, House, SquaresFour as LayoutDashboard, ArrowLeft,
  List as Menu, Megaphone, QuestionMark, ArrowCounterClockwise as RotateCcw, Scroll as ScrollText,
  Gear as Settings, ChartLineUp, ShieldCheck, UserCircle, UsersThree as UsersRound, X,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Avatar, Logo } from './components'
import { useApp } from './store'
import type { ProfileRole } from './types'

const roleMeta = {
  brand: { label: 'Brand Representative', short: 'Brand', description: 'Madrid Philippines', initials: 'C', name: 'Cloud' },
  leader: { label: 'Community Manager', short: 'Manager', description: 'SkinTok PH', initials: 'IM', name: 'Ian Madrid' },
  member: { label: 'Community Member', short: 'Member', description: 'SkinTok PH', initials: 'MR', name: 'Maya Reyes' },
} satisfies Record<ProfileRole, { label: string; short: string; description: string; initials: string; name: string }>

const managerShortcuts = [
  { name: 'Madrid HR', image: '/assets/community-madrid-hr-logo.png' },
  { name: 'Madrid PH', image: '/assets/community-madrid-ph-logo.png' },
  { name: 'TICP', image: '/assets/community-ticp.jpeg' },
  { name: 'Madrid Field', image: '/assets/community-madrid-field-logo.png' },
]

type NavigationItem = { to: string; label: string; icon: Icon; end?: boolean; section?: 'secondary' }

const navigation = {
  brand: [
    { to: '/brand', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/brand/opportunities', label: 'Campaigns', icon: FolderKanban },
    { to: '/brand/communities', label: 'Communities', icon: UsersRound },
    { to: '/brand/reports', label: 'Analytics', icon: BarChart3 },
    { to: '/brand/notifications', label: 'Notifications', icon: Bell },
    { to: '/brand/profile', label: 'Brand Profile', icon: UserCircle },
    { to: '/brand/settings', label: 'Settings', icon: Settings },
  ],
  leader: [
    { to: '/leader', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/leader/campaigns', label: 'Campaigns', icon: Megaphone },
    { to: '/leader/communities', label: 'Communities', icon: UsersRound },
    { to: '/leader/budget', label: 'Earnings', icon: CircleDollarSign },
    { to: '/leader/analytics', label: 'Analytics', icon: ChartLineUp },
    { to: '/leader/settings', label: 'Settings', icon: Settings, section: 'secondary' },
    { to: '/leader/help-support', label: 'Help & support', icon: ChatCircle, section: 'secondary' },
  ],
  member: [
    { to: '/member', label: 'Dashboard', icon: House, end: true },
    { to: '/member/campaigns', label: 'Promotions', icon: FolderKanban },
    { to: '/member/content', label: 'My Content', icon: ScrollText },
    { to: '/member/rewards', label: 'Rewards', icon: CircleDollarSign },
    { to: '/member/profile', label: 'Profile', icon: UserCircle },
  ],
} satisfies Record<ProfileRole, NavigationItem[]>

export function AppShell() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const routeSegment = location.pathname.split('/')[1]
  const activeRole: ProfileRole = routeSegment === 'brand' || routeSegment === 'leader' || routeSegment === 'member' ? routeSegment : state.activeRole
  const meta = roleMeta[activeRole]
  const activeNavigation: NavigationItem[] = navigation[activeRole]
  const notices = state.notifications.filter((item) => item.role === activeRole)
  const isLeaderClaimRoute = location.pathname.startsWith('/leader/campaigns/claim/')

  useEffect(() => {
    if (state.activeRole !== activeRole) dispatch({ type: 'SET_ROLE', role: activeRole })
  }, [activeRole, dispatch, state.activeRole])

  function switchRole(role: ProfileRole) {
    dispatch({ type: 'SET_ROLE', role })
    setRoleOpen(false)
    setMenuOpen(false)
    navigate(`/${role}`)
  }

  return <div className={`app-shell role-${activeRole}`}>
    <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
      {activeRole !== 'leader' ? <div className="sidebar-brand"><Logo /><button className="mobile-only icon-button" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X size={18} /></button></div> : null}
      <div className="role-switcher-wrap">
        <button className="role-switcher" onClick={() => setRoleOpen((value) => !value)} aria-expanded={roleOpen}>
          <Avatar initials={meta.initials} size="sm" src="/assets/user-portrait.png" tone={activeRole === 'brand' ? 'yellow' : activeRole === 'leader' ? 'mint' : 'cream'} />
          <span>{activeRole !== 'leader' ? <small>Viewing as</small> : null}<strong>{activeRole === 'leader' ? meta.name : meta.label}</strong></span><ChevronDown size={15} />
        </button>
        {roleOpen ? <div className="role-menu">
          <span className="menu-label">SWITCH PROFILE</span>
          {(Object.keys(roleMeta) as ProfileRole[]).map((role) => <button key={role} className={activeRole === role ? 'active' : ''} onClick={() => switchRole(role)}><Avatar initials={roleMeta[role].initials} size="sm" tone={role === 'brand' ? 'yellow' : role === 'leader' ? 'mint' : 'cream'} /><span><strong>{roleMeta[role].label}</strong><small>{roleMeta[role].description}</small></span>{activeRole === role ? <ShieldCheck size={16} /> : null}</button>)}
          {activeRole === 'leader' ? <button className="role-menu-reset" onClick={() => { dispatch({ type: 'RESET_DEMO' }); setRoleOpen(false) }}><RotateCcw size={16} /><span>Reset demo data</span></button> : null}
        </div> : null}
      </div>
      <nav className={activeRole === 'leader' ? 'community-manager-nav' : ''} aria-label={`${meta.label} navigation`}>
        {activeRole !== 'leader' ? <span className="nav-label">{meta.short.toUpperCase()} WORKSPACE</span> : null}
        <div className={activeRole === 'leader' ? 'community-manager-nav-grid' : ''}>
          {activeNavigation.filter((item) => item.section !== 'secondary').map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)}><Icon size={activeRole === 'leader' ? 28 : 18} weight={activeRole === 'leader' ? 'regular' : undefined} /><span>{label}</span></NavLink>)}
        </div>
        {activeRole === 'leader' ? <section className="manager-shortcuts" aria-labelledby="manager-shortcuts-title">
          <h2 id="manager-shortcuts-title">Shortcuts</h2>
          <div>
            {managerShortcuts.map((shortcut) => <NavLink key={shortcut.name} to="/leader/communities" onClick={() => setMenuOpen(false)} aria-label={shortcut.name}>
              <span className="manager-shortcut-thumbnail"><img src={shortcut.image} alt="" /><UsersRound size={18} weight="fill" /></span>
              <span className="manager-shortcut-label">{shortcut.name}</span>
            </NavLink>)}
          </div>
        </section> : null}
        {activeRole === 'leader' ? <div className="community-manager-nav-secondary">
          {navigation.leader.filter((item) => item.section === 'secondary').map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}>{label === 'Help & support' ? <span className="help-support-icon" aria-hidden="true"><ChatCircle size={25} /><QuestionMark size={12} weight="bold" /></span> : <Icon size={25} />}<span>{label}</span><ChevronDown size={18} /></NavLink>)}
        </div> : null}
      </nav>
      {activeRole !== 'leader' ? <div className="sidebar-bottom">
        <button className="reset-button" onClick={() => dispatch({ type: 'RESET_DEMO' })}><RotateCcw size={15} />Reset demo data</button>
        <div className="sidebar-user"><Avatar initials={meta.initials} size="sm" src="/assets/user-portrait.png" tone="black" /><span><strong>{meta.name}</strong><small>{meta.description}</small></span></div>
      </div> : null}
    </aside>
    {menuOpen ? <button className="sidebar-scrim" onClick={() => setMenuOpen(false)} aria-label="Close menu" /> : null}
    <div className="main-shell">
      <header className="topbar">
        {isLeaderClaimRoute
          ? <button className="mobile-menu icon-button" onClick={() => navigate('/leader/campaigns')} aria-label="Close campaign"><X size={22} /></button>
          : activeRole === 'leader' && location.pathname !== '/leader'
          ? <button className="mobile-menu icon-button" onClick={() => navigate('/leader')} aria-label="Back to dashboard"><ArrowLeft size={20} /></button>
          : <button className="mobile-menu icon-button" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>}
        {activeRole !== 'brand' ? <div className="topbar-context">{activeRole !== 'leader' ? <Logo compact /> : null}<strong>{meta.label}</strong></div> : null}
        <div className="topbar-actions">
          {!isLeaderClaimRoute ? <button className="icon-button notification-button" aria-label="Notifications" onClick={() => setNotificationsOpen((value) => !value)}><Bell size={18} />{notices.some((item) => !item.read) ? <i /> : null}</button> : null}
          {!isLeaderClaimRoute && notificationsOpen ? <div className="notification-popover"><header><strong>Notifications</strong><button onClick={() => setNotificationsOpen(false)}>Close</button></header>{notices.length ? notices.map((item) => <article key={item.id}><span className={item.read ? '' : 'unread'} /><div><strong>{item.title}</strong><p>{item.detail}</p><small>{item.time}</small></div></article>) : <p className="popover-empty">No notifications for this profile.</p>}</div> : null}
        </div>
      </header>
      <main className="page-container"><Outlet /></main>
    </div>
  </div>
}
