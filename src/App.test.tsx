import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from './App'
import { AppProvider } from './store'

function renderRoute(route: string) {
  return render(<MemoryRouter initialEntries={[route]}><AppProvider><App /></AppProvider></MemoryRouter>)
}

describe('OkPo role workspaces', () => {
  beforeEach(() => window.localStorage.clear())

  it('renders the Brand command center and fixed-content campaign', () => {
    renderRoute('/brand')
    expect(screen.getByRole('heading', { name: /Good morning, Alexis/i })).toBeInTheDocument()
    expect(screen.getByText('Gross Pool Value')).toBeInTheDocument()
    expect(screen.getByText('Liquidity')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Solutions Job Fair' })).toBeInTheDocument()
    expect(screen.getByText('Activated communities')).toBeInTheDocument()
    expect(screen.getByText('Creator roster')).toBeInTheDocument()
    expect(screen.getByText('FEATURED CAMPAIGNS')).toBeInTheDocument()
  })

  it('opens the active community directory', async () => {
    const user = userEvent.setup()
    renderRoute('/brand')
    await user.click(screen.getByRole('button', { name: /Activated communities/i }))
    expect(screen.getByRole('heading', { name: 'Madrid Philippines communities' })).toBeInTheDocument()
    expect(screen.getByText('Madrid Performers')).toBeInTheDocument()
    expect(screen.getByText('Field Riders')).toBeInTheDocument()
  })

  it('opens featured campaign details', async () => {
    const user = userEvent.setup()
    renderRoute('/brand')
    await user.click(screen.getByRole('button', { name: /Solutions Job Fair/i }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('heading', { name: 'Solutions Job Fair' })).toBeInTheDocument()
    expect(within(dialog).getByText('Spent / allocated')).toBeInTheDocument()
    expect(within(dialog).getByText('+50')).toBeInTheDocument()
    expect(within(dialog).getByText('TOP CONTENT')).toBeInTheDocument()
  })

  it('renders the complete Brand opportunity wizard directly', () => {
    renderRoute('/brand/opportunities/new')
    expect(screen.getByRole('heading', { name: 'Opportunity' })).toBeInTheDocument()
    expect(screen.getByText('Timing')).toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()
  })

  it('lets the Brand jump between wizard steps and derives end dates from duration', async () => {
    const user = userEvent.setup()
    renderRoute('/brand/opportunities/new')
    await user.click(screen.getByRole('button', { name: /Timing/i }))
    expect(screen.getByRole('heading', { name: 'Timing and pool' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Preparation ends')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Live campaign ends')).not.toBeInTheDocument()
    await user.clear(screen.getByLabelText('Preparation days'))
    await user.type(screen.getByLabelText('Preparation days'), '10')
    await user.click(screen.getByRole('button', { name: /Review/i }))
    expect(screen.getByText('Sep 1, 2026 – Sep 10, 2026')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Post$/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save as draft' })).toBeInTheDocument()
    expect(screen.queryByText('Brand approvals')).not.toBeInTheDocument()
    expect(screen.queryByText('Negotiation')).not.toBeInTheDocument()
  })

  it('groups Brand content by campaign', () => {
    renderRoute('/brand/content')
    expect(screen.getByRole('heading', { name: 'Content by opportunity' })).toBeInTheDocument()
    expect(screen.getByText('Real Skin, Real Routine')).toBeInTheDocument()
    expect(screen.getByText('Hydration, Your Way')).toBeInTheDocument()
  })

  it('redirects the redundant Brand Communities route into campaign context', async () => {
    renderRoute('/brand/communities')
    expect(await screen.findByRole('heading', { name: 'Real Skin, Real Routine' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Communities/ })).toHaveAttribute('aria-selected', 'true')
  })

  it('renders the Leader marketplace with automatic-allocation messaging', () => {
    renderRoute('/leader/opportunities')
    expect(screen.getByRole('heading', { name: /Campaigns your community can power/i })).toBeInTheDocument()
    expect(screen.getByText('Claim means confirmed')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Community Leader navigation' })).toBeInTheDocument()
  })

  it('renders the Leader community campaign workspace directly', () => {
    renderRoute('/leader/campaigns/cc-skin-routines')
    expect(screen.getByRole('heading', { name: 'Morning Routine Diaries' })).toBeInTheDocument()
    expect(screen.getByText('Fixed Brand foundation')).toBeInTheDocument()
  })

  it('renders the responsive Member content workflow directly', () => {
    renderRoute('/member/content')
    expect(screen.getByRole('heading', { name: /Publish. Record. Get counted/i })).toBeInTheDocument()
    expect(screen.getByText('Publish externally')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Community Member navigation' })).toBeInTheDocument()
  })

  it('switches profiles from the shared shell', async () => {
    const user = userEvent.setup()
    renderRoute('/brand')
    await user.click(screen.getByRole('button', { name: /Viewing as Brand Representative/i }))
    await user.click(screen.getByRole('button', { name: /Community Leader SkinTok PH/i }))
    expect(await screen.findByRole('heading', { name: /Good morning, Mara/i })).toBeInTheDocument()
  })
})
