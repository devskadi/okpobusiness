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
    const brandNavigation = screen.getByRole('navigation', { name: 'Brand Representative navigation' })
    expect(within(brandNavigation).getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Dashboard', 'Campaigns', 'Communities', 'Analytics', 'Notifications', 'Brand Profile', 'Settings',
    ])
    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeInTheDocument()
    expect(document.querySelector('.topbar-context')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Portfolio performance')).toBeInTheDocument()
    expect(screen.getByText('6.8M')).toBeInTheDocument()
    expect(screen.getByText('296.3K')).toBeInTheDocument()
    expect(screen.getByText('Gross Pool Value')).toBeInTheDocument()
    expect(screen.getByText('Liquidity')).toBeInTheDocument()
    expect(screen.getByText('₱1,215,420')).toBeInTheDocument()
    expect(screen.getByLabelText('₱171,181')).toBeInTheDocument()
    expect(screen.queryByText('4 posted campaigns')).not.toBeInTheDocument()
    expect(screen.queryByText('14% deployed')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tech Recruitment' })).toBeInTheDocument()
    expect(screen.getByText('Activated communities')).toBeInTheDocument()
    expect(screen.queryByText('Creator roster')).not.toBeInTheDocument()
    expect(screen.getByText('FEATURED CAMPAIGNS')).toBeInTheDocument()
    expect(screen.getByText('9 posts')).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: /TikTok content preview/ })).toHaveLength(9)
  })

  it('renders Brand notification and settings destinations', () => {
    const { unmount } = renderRoute('/brand/notifications')
    expect(screen.getByRole('heading', { name: 'Updates for your workspace' })).toBeInTheDocument()
    unmount()
    renderRoute('/brand/settings')
    expect(screen.getByRole('heading', { name: 'Workspace preferences' })).toBeInTheDocument()
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
    await user.click(screen.getByRole('button', { name: /Tech Recruitment/i }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('heading', { name: 'Tech Recruitment' })).toBeInTheDocument()
    expect(within(dialog).getByText('Spent')).toBeInTheDocument()
    expect(within(dialog).getByText('Published')).toBeInTheDocument()
    expect(within(dialog).getByText('Duration')).toBeInTheDocument()
    expect(within(dialog).getByText('+50')).toBeInTheDocument()
    expect(within(dialog).getByText('TOP CONTENT')).toBeInTheDocument()
  })

  it('opens a campaign page with submissions, missions, and leaderboard tabs', async () => {
    const user = userEvent.setup()
    renderRoute('/brand/opportunities')
    expect(screen.queryByRole('group', { name: 'Campaign layout' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Madrid Philippines campaigns')).toHaveClass('campaign-portfolio-large')
    expect(screen.queryByText('Prize pool')).not.toBeInTheDocument()
    const campaignHeading = screen.getByRole('heading', { name: 'Tech Recruitment' })
    const campaignLink = campaignHeading.closest('a')!
    expect(within(campaignLink).getByLabelText('Target 90')).toBeInTheDocument()
    expect(within(campaignLink).getByText(/₱150,000/)).toBeInTheDocument()
    expect(within(campaignLink).getByLabelText('13 weeks')).toBeInTheDocument()
    expect(within(campaignLink).queryByText(/published/)).not.toBeInTheDocument()
    expect(within(campaignLink).queryByText('allocated')).not.toBeInTheDocument()
    const portfolio = screen.getByLabelText('Madrid Philippines campaigns')
    expect(within(within(portfolio).getByRole('heading', { name: 'SPM Dubai Hiring' }).closest('a')!).getByText(/₱300,000/)).toBeInTheDocument()
    expect(within(within(portfolio).getByRole('heading', { name: 'PITX Job Fair' }).closest('a')!).getByText(/₱600,000/)).toBeInTheDocument()
    await user.click(campaignHeading)
    expect(screen.getByRole('link', { name: 'Back to Campaigns' })).toHaveAttribute('href', '/brand/opportunities')
    expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Campaign by Madrid Philippines' })).not.toBeInTheDocument()
    expect(screen.getByText('1 community')).toBeInTheDocument()
    expect(screen.getByText('10 creators')).toBeInTheDocument()
    expect(screen.getByText('0 submissions')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Rewards remaining' })).toHaveAttribute('aria-valuenow', '100')
    expect(screen.getByRole('navigation', { name: 'Campaign sections' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: "What's Happening" })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: "Who's Participating" })).toBeInTheDocument()
    expect(screen.getByText('Madrid HR')).toBeInTheDocument()
    expect(screen.queryByText('Madrid PH')).not.toBeInTheDocument()
    expect(screen.queryByText('TICP')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous communities' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next communities' })).toBeDisabled()
    expect(screen.getByLabelText('Campaign submissions')).toBeInTheDocument()
    expect(screen.getByText('Ian Madrid')).toBeInTheDocument()
    expect(screen.queryByText('Roseann Sta. Agata')).not.toBeInTheDocument()
    const submissionToggle = screen.getByRole('button', { name: 'See all' })
    expect(submissionToggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(submissionToggle)
    expect(screen.getByText('Roseann Sta. Agata')).toBeInTheDocument()
    expect(screen.getByText('seanrnp')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'See less' }))
    expect(screen.queryByText('Roseann Sta. Agata')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '#MadridPHCareers #SolutionsJobFair' })).not.toBeInTheDocument()
    expect(screen.getByText('2 minutes ago at 9:42 AM')).toBeInTheDocument()
    const firstSubmission = screen.getByText('angelmechure').closest('details')!
    await user.click(firstSubmission.querySelector('summary')!)
    expect(firstSubmission).toHaveAttribute('open')
    expect(within(firstSubmission).getByRole('link', { name: 'See in TikTok' })).toHaveAttribute('href', 'https://www.tiktok.com/')
    expect(within(firstSubmission).queryByRole('link', { name: 'Community' })).not.toBeInTheDocument()
    await user.click(within(firstSubmission).getByRole('button', { name: /View mission/i }))
    expect(screen.getByLabelText('Campaign missions')).toBeInTheDocument()
    expect(screen.getAllByLabelText('20 participating creators')).toHaveLength(3)
    expect(screen.queryByText(/Managed by/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'leaderboard' }))
    expect(screen.getByLabelText('Campaign leaderboard')).toBeInTheDocument()
    expect(screen.getByLabelText('Top 3 creators').querySelectorAll('article')).toHaveLength(3)
    expect(screen.getByLabelText('Rest of the Top 10').querySelectorAll('article')).toHaveLength(7)
  })

  it('renders the upcoming OkPo public challenge with empty campaign states', async () => {
    const user = userEvent.setup()
    renderRoute('/brand/opportunities')
    const portfolio = screen.getByLabelText('Madrid Philippines campaigns')
    const challenge = within(portfolio).getByRole('heading', { name: 'OkPo 5-day Public Challenge' }).closest('a')!
    expect(challenge).toHaveTextContent('Upcoming')
    expect(challenge).toHaveTextContent('Posted by OkPo')
    expect(challenge).toHaveTextContent('₱10,000 for 5 days')
    expect(challenge.querySelector('img')).toHaveAttribute('src', '/assets/campaign-okpo-five-day-public-challenge.png')
    expect(within(challenge).getByLabelText('Content target unlimited')).toBeInTheDocument()
    await user.click(challenge)
    expect(screen.getByText('Upcoming')).toHaveClass('campaign-detail-status-chip')
    expect(screen.getByText('0 communities')).toBeInTheDocument()
    expect(screen.getByText('0 creators')).toBeInTheDocument()
    expect(screen.getByText('0 submissions')).toBeInTheDocument()
    expect(screen.getAllByText('₱10,000')).toHaveLength(2)
    expect(screen.queryByRole('button', { name: 'missions' })).not.toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Campaign sections' })).toHaveClass('upcoming')
    expect(screen.queryByRole('button', { name: 'See all' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Campaign submissions')).toHaveTextContent('This is an upcoming campaign, check tomorrow for updates!')
    await user.click(screen.getByRole('button', { name: 'leaderboard' }))
    expect(screen.getByLabelText('Campaign leaderboard')).toHaveTextContent('This is an upcoming campaign, check tomorrow for updates!')
    expect(screen.getByText('This is an upcoming campaign, no communities yet.')).toBeInTheDocument()
    expect(screen.getByText(/This campaign will open tomorrow July 31, 2026/)).toHaveTextContent('August 4, 2026')
    expect(screen.getByText(/This campaign will open tomorrow July 31, 2026/)).toHaveTextContent('unless OkPo decides to extend its duration and add more funds')
  })

  it('scopes participating communities to each Madrid campaign', () => {
    const routes = [
      ['/brand/campaigns/madrid-tech-recruitment', ['Madrid HR']],
      ['/brand/campaigns/madrid-internship-cohort-3', ['TICP', 'Madrid PH', 'Madrid HR']],
      ['/brand/campaigns/madrid-spm-dubai-hiring', ['Madrid HR', 'Madrid PH']],
      ['/brand/campaigns/madrid-pitx-job-fair', ['Madrid HR']],
    ] as const
    for (const [route, expectedNames] of routes) {
      const view = renderRoute(route)
      const participants = within(document.querySelector('.campaign-participants')!)
      expect(expectedNames.every((name) => participants.queryByText(name))).toBe(true)
      expect(participants.getAllByRole('link')).toHaveLength(expectedNames.length)
      expect(screen.getByText(/This campaign was last funded/)).toHaveTextContent('unless Madrid Philippines decides to extend its duration and add more funds')
      view.unmount()
    }
  })

  it('renders the complete Brand opportunity wizard directly', () => {
    renderRoute('/brand/opportunities/new')
    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeInTheDocument()
    expect(document.querySelector('.topbar-context')).not.toBeInTheDocument()
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
