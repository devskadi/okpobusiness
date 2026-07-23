import {
  BarChart3, Bell, Boxes, ChevronDown, CircleDollarSign, ClipboardCheck, FolderKanban,
  LayoutDashboard, Library, Menu, Package, RotateCcw, ScrollText, Settings, ShieldCheck, UserCircle,
  UsersRound, X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Avatar, Logo } from './components'
import { useApp } from './store'
import type { ProfileRole } from './types'

const roleMeta = {
  brand: { label: 'Brand Representative', short: 'Brand', description: 'Dermorepubliq', initials: 'AT', name: 'Alexis Tan' },
  leader: { label: 'Community Leader', short: 'Leader', description: 'SkinTok PH', initials: 'MV', name: 'Mara Villanueva' },
  member: { label: 'Community Member', short: 'Member', description: 'SkinTok PH', initials: 'MR', name: 'Maya Reyes' },
} satisfies Record<ProfileRole, { label: string; short: string; description: string; initials: string; name: string }>

const navigation = {
  brand: [
    { to: '/brand', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/brand/products', label: 'Products', icon: Package },
    { to: '/brand/opportunities', label: 'Opportunities', icon: FolderKanban },
    { to: '/brand/content', label: 'Content', icon: Boxes },
    { to: '/brand/reports', label: 'Reports', icon: BarChart3 },
    { to: '/brand/profile', label: 'Brand Profile', icon: Settings },
  ],
  leader: [
    { to: '/leader', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/leader/opportunities', label: 'Opportunities', icon: Library },
    { to: '/leader/campaigns', label: 'My Community Campaigns', icon: FolderKanban },
    { to: '/leader/members', label: 'Members', icon: UsersRound },
    { to: '/leader/content', label: 'Content Monitoring', icon: ClipboardCheck },
    { to: '/leader/budget', label: 'Budget', icon: CircleDollarSign },
    { to: '/leader/community', label: 'Community Profile', icon: Settings },
  ],
  member: [
    { to: '/member', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/member/campaigns', label: 'Campaigns', icon: FolderKanban },
    { to: '/member/content', label: 'My Content', icon: ScrollText },
    { to: '/member/rewards', label: 'Rewards', icon: CircleDollarSign },
    { to: '/member/profile', label: 'Profile', icon: UserCircle },
  ],
}

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
  const notices = state.notifications.filter((item) => item.role === activeRole)

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
      <div className="sidebar-brand"><Logo /><button className="mobile-only icon-button" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X size={18} /></button></div>
      <div className="role-switcher-wrap">
        <button className="role-switcher" onClick={() => setRoleOpen((value) => !value)} aria-expanded={roleOpen}>
          <Avatar initials={meta.initials} size="sm" src="/assets/user-portrait.png" tone={activeRole === 'brand' ? 'yellow' : activeRole === 'leader' ? 'mint' : 'cream'} />
          <span><small>Viewing as</small><strong>{meta.label}</strong></span><ChevronDown size={15} />
        </button>
        {roleOpen ? <div className="role-menu">
          <span className="menu-label">SWITCH PROFILE</span>
          {(Object.keys(roleMeta) as ProfileRole[]).map((role) => <button key={role} className={activeRole === role ? 'active' : ''} onClick={() => switchRole(role)}><Avatar initials={roleMeta[role].initials} size="sm" tone={role === 'brand' ? 'yellow' : role === 'leader' ? 'mint' : 'cream'} /><span><strong>{roleMeta[role].label}</strong><small>{roleMeta[role].description}</small></span>{activeRole === role ? <ShieldCheck size={16} /> : null}</button>)}
        </div> : null}
      </div>
      <nav aria-label={`${meta.label} navigation`}>
        <span className="nav-label">{meta.short.toUpperCase()} WORKSPACE</span>
        {navigation[activeRole].map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)}><Icon size={18} /><span>{label}</span></NavLink>)}
      </nav>
      <div className="sidebar-story">
        <span>COMMUNITY-POWERED</span><strong>One pool.<br />Many communities.</strong><p>Track every commitment.</p>
      </div>
      <div className="sidebar-bottom">
        <button className="reset-button" onClick={() => dispatch({ type: 'RESET_DEMO' })}><RotateCcw size={15} />Reset demo data</button>
        <div className="sidebar-user"><Avatar initials={meta.initials} size="sm" src="/assets/user-portrait.png" tone="black" /><span><strong>{meta.name}</strong><small>{meta.description}</small></span></div>
      </div>
    </aside>
    {menuOpen ? <button className="sidebar-scrim" onClick={() => setMenuOpen(false)} aria-label="Close menu" /> : null}
    <div className="main-shell">
      <header className="topbar">
        <button className="mobile-menu icon-button" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
        <div className="topbar-context"><Logo compact /><strong>{meta.label}</strong></div>
        <div className="topbar-actions">
          <span className="environment-pill">Leadership prototype</span>
          <button className="icon-button notification-button" aria-label="Notifications" onClick={() => setNotificationsOpen((value) => !value)}><Bell size={18} />{notices.some((item) => !item.read) ? <i /> : null}</button>
          {notificationsOpen ? <div className="notification-popover"><header><strong>Notifications</strong><button onClick={() => setNotificationsOpen(false)}>Close</button></header>{notices.length ? notices.map((item) => <article key={item.id}><span className={item.read ? '' : 'unread'} /><div><strong>{item.title}</strong><p>{item.detail}</p><small>{item.time}</small></div></article>) : <p className="popover-empty">No notifications for this profile.</p>}</div> : null}
        </div>
      </header>
      <main className="page-container"><Outlet /></main>
    </div>
  </div>
}
