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
    expect(screen.getByRole('heading', { name: /Good morning, Cloud/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Portfolio performance')).toBeInTheDocument()
    expect(screen.getByText('6.8M')).toBeInTheDocument()
    expect(screen.getByText('296.3K')).toBeInTheDocument()
    expect(screen.getByText('Gross Pool Value')).toBeInTheDocument()
    expect(screen.getByText('Liquidity')).toBeInTheDocument()
    expect(screen.getByText('₱1,215,420')).toBeInTheDocument()
    expect(screen.getByLabelText('₱171,181')).toBeInTheDocument()
    expect(screen.queryByText('4 posted campaigns')).not.toBeInTheDocument()
    expect(screen.queryByText('14% deployed')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Solutions Job Fair' })).toBeInTheDocument()
    expect(screen.getByText('Activated communities')).toBeInTheDocument()
    expect(screen.queryByText('Creator roster')).not.toBeInTheDocument()
    expect(screen.getByText('FEATURED CAMPAIGNS')).toBeInTheDocument()
    expect(screen.getByText('9 posts')).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: /TikTok content preview/ })).toHaveLength(9)
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
    expect(within(dialog).getByText('Spent')).toBeInTheDocument()
    expect(within(dialog).getByText('Published')).toBeInTheDocument()
    expect(within(dialog).getByText('Duration')).toBeInTheDocument()
    expect(within(dialog).getByText('+50')).toBeInTheDocument()
    expect(within(dialog).getByText('TOP CONTENT')).toBeInTheDocument()
  })

  it('shows campaign brief and analytics in expanded portfolio cards', async () => {
    const user = userEvent.setup()
    renderRoute('/brand/opportunities')
    const campaignHeading = screen.getByRole('heading', { name: 'Solutions Job Fair' })
    const campaignCard = campaignHeading.closest('details')!
    await user.click(campaignHeading)
    expect(within(campaignCard).getByText('Campaign brief')).toBeInTheDocument()
    expect(within(campaignCard).getByLabelText('Campaign analytics')).toBeInTheDocument()
    expect(within(campaignCard).getByText('84,900')).toBeInTheDocument()
    expect(within(campaignCard).getByText('Earnings')).toBeInTheDocument()
    expect(within(campaignCard).getByText('₱33,000')).toBeInTheDocument()
  })

  it('renders the complete Brand opportunity wizard directly', () => {
    renderRoute('/brand/opportunities/new')
    expect(screen.getByRole('img', { name: 'Madrid Philippines' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Campaign brief' })).toBeInTheDocument()
    expect(screen.getByLabelText('Campaign name')).toBeInTheDocument()
    expect(screen.queryByLabelText('Product')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Platform')).not.toBeInTheDocument()
    expect(screen.queryByText('How it works')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save & exit' })).not.toBeInTheDocument()
    expect(screen.getByText('Timing')).toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()
  })

  it('lets the Brand jump between wizard steps and derives end dates from duration', async () => {
    const user = userEvent.setup()
    renderRoute('/brand/opportunities/new')
    await user.click(screen.getByRole('button', { name: /Timing/i }))
    expect(screen.getByRole('heading', { name: 'Campaign commitment' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Preparation starts')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Preparation days')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Publishing starts')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Increase campaign duration' }))
    await user.click(screen.getByRole('button', { name: 'Increase campaign duration' }))
    await user.click(screen.getByRole('button', { name: 'Increase campaign duration' }))
    expect(screen.getByLabelText('6 month campaign calendar')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Review/i }))
    expect(screen.getByText('Sep 15, 2026 – Mar 14, 2027')).toBeInTheDocument()
    expect(screen.getByText('6 months')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Post$/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save as draft' })).toBeInTheDocument()
    expect(screen.queryByText('Brand approvals')).not.toBeInTheDocument()
    expect(screen.queryByText('Negotiation')).not.toBeInTheDocument()
  })

  it('validates typed campaign duration and highlights every touched calendar month', async () => {
    const user = userEvent.setup()
    renderRoute('/brand/opportunities/new')
    await user.click(screen.getByRole('button', { name: /Timing/i }))
    const duration = screen.getByRole('spinbutton', { name: 'Duration (months)' })
    await user.clear(duration)
    await user.type(duration, '2')
    expect(duration).toBeInvalid()
    expect(screen.getByRole('button', { name: /Continue/i })).toBeDisabled()
    await user.clear(duration)
    await user.type(duration, '3')
    const calendar = screen.getByLabelText('3 month campaign calendar')
    expect(calendar.querySelectorAll('.duration-months .selected')).toHaveLength(4)
    expect(within(calendar).getByText('Dec')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Continue/i })).toBeEnabled()
  })

  it('updates campaign duration when a calendar month is selected', async () => {
    const user = userEvent.setup()
    renderRoute('/brand/opportunities/new')
    await user.click(screen.getByRole('button', { name: /Timing/i }))
    await user.click(screen.getByRole('button', { name: /Set campaign duration to 4 months, ending in January 2027/i }))
    expect(screen.getByRole('spinbutton', { name: 'Duration (months)' })).toHaveValue(4)
    expect(screen.getByLabelText('4 month campaign calendar')).toBeInTheDocument()
  })

  it('groups Brand content by campaign', () => {
    renderRoute('/brand/content')
    expect(screen.getByRole('heading', { name: 'Content by campaign' })).toBeInTheDocument()
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
    expect(screen.getByRole('navigation', { name: 'Community Manager navigation' })).toBeInTheDocument()
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
    await user.click(screen.getByRole('button', { name: /Community Manager SkinTok PH/i }))
    expect(await screen.findByRole('heading', { name: /Good morning, Mara/i })).toBeInTheDocument()
  })
})
