import { expect, test } from '@playwright/test'

const routes = [
  '/brand',
  '/brand/products',
  '/brand/opportunities',
  '/brand/opportunities/new',
  '/brand/opportunities/opportunity-real-skin',
  '/brand/content',
  '/brand/reports',
  '/brand/profile',
  '/leader',
  '/leader/opportunities',
  '/leader/opportunities/opportunity-real-skin',
  '/leader/campaigns',
  '/leader/campaigns/cc-skin-routines',
  '/leader/members',
  '/leader/content',
  '/leader/budget',
  '/leader/community',
  '/member',
  '/member/campaigns',
  '/member/campaigns/cc-skin-routines',
  '/member/content',
  '/member/rewards',
  '/member/profile',
] as const

const viewports = [
  { name: 'compact-mobile', width: 320, height: 720 },
  { name: 'mobile', width: 360, height: 800 },
  { name: 'large-mobile', width: 430, height: 860 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1024, height: 768 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'wide-desktop', width: 1920, height: 1080 },
] as const

for (const viewport of viewports) {
  test(`all primary routes fit the ${viewport.name} viewport`, async ({ page }) => {
    await page.setViewportSize(viewport)

    for (const route of routes) {
      await page.goto(route)
      await expect(page.locator('main.page-container')).toBeVisible()

      const overflow = await page.evaluate(() => ({
        body: document.body.scrollWidth - window.innerWidth,
        document: document.documentElement.scrollWidth - window.innerWidth,
      }))

      expect.soft(overflow.body, `${route} body overflow at ${viewport.width}px`).toBeLessThanOrEqual(1)
      expect.soft(overflow.document, `${route} document overflow at ${viewport.width}px`).toBeLessThanOrEqual(1)
    }
  })
}

test('shared navigation and dialogs remain usable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/brand')

  await page.getByRole('button', { name: 'Open navigation' }).click()
  const navigation = page.getByRole('navigation', { name: 'Brand Representative navigation' })
  await expect(navigation).toBeVisible()
  await expect(navigation.getByRole('link', { name: 'Products' })).toHaveCount(0)
  await expect(navigation.getByRole('link', { name: 'Content' })).toHaveCount(0)
  await navigation.getByRole('link', { name: 'Campaigns' }).click()
  await expect(page).toHaveURL(/\/brand\/opportunities$/)

  await page.goto('/brand/products')
  await page.getByRole('button', { name: /Add product/ }).click()
  const dialog = page.locator('.modal-card')
  await expect(dialog).toBeVisible()
  const productName = dialog.getByLabel('Product name')
  await expect(productName).toBeVisible()
  await expect(productName).not.toBeFocused()
  await expect(productName).toHaveCSS('font-size', '16px')

  const overflow = await page.evaluate(() => ({
    body: document.body.scrollWidth - window.innerWidth,
    document: document.documentElement.scrollWidth - window.innerWidth,
  }))
  expect(overflow.body).toBeLessThanOrEqual(1)
  expect(overflow.document).toBeLessThanOrEqual(1)
})

test('Brand content uses compact expandable items on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/brand/content')

  await expect(page.locator('.content-table-desktop').first()).toBeHidden()
  const firstCampaign = page.locator('.content-mobile-campaign').first()
  await expect(firstCampaign).toBeVisible()
  const firstItem = page.locator('.content-mobile-item').first()
  await expect(firstItem).toBeHidden()
  await firstCampaign.locator(':scope > summary').click()
  await expect(firstItem).toBeVisible()
  await expect(firstItem.locator('dl')).toBeHidden()

  await firstItem.locator('summary').click()
  await expect(firstItem.locator('dl')).toBeVisible()
  await expect(firstItem).toContainText('Community')
  await expect(firstItem).toContainText('Views')
})

test('Brand campaigns use Madrid data and compact current metrics on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto('/brand/opportunities')

  const campaigns = page.locator('.campaign-portfolio-card')
  await expect(campaigns).toHaveCount(5)
  await expect(campaigns.first()).toContainText('OkPo 5-day Public Challenge')
  await expect(campaigns.first().locator('.campaign-portfolio-current')).toBeHidden()

  const thumbnail = campaigns.first().locator('summary > img')
  const size = await thumbnail.evaluate((image) => ({
    width: image.getBoundingClientRect().width,
    height: image.getBoundingClientRect().height,
  }))
  expect(Math.abs(size.width - size.height)).toBeLessThanOrEqual(1)

  await campaigns.first().locator('summary').click()
  const current = campaigns.first().locator('.campaign-portfolio-current')
  await expect(current).toBeVisible()
  await expect(current).toContainText('Spent')
  await expect(current).toContainText('₱93,000')
  await expect(current).toContainText('Published')
  await expect(current).toContainText('186')
  await expect(current).toContainText('Current week')
  await expect(campaigns.first()).not.toContainText('Open workspace')
})

test('Featured campaigns remain swipeable and auto-advance on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/brand')

  const carousel = page.locator('.featured-campaign-carousel')
  await expect(carousel).toBeVisible()
  const initial = await carousel.evaluate((element) => ({
    left: element.scrollLeft,
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }))
  expect(initial.scrollWidth).toBeGreaterThan(initial.clientWidth)

  await expect.poll(
    () => carousel.evaluate((element) => element.scrollLeft),
    { timeout: 4500 },
  ).toBeGreaterThan(initial.left + 1)
})

for (const width of [700, 701, 900, 901]) {
  test(`critical layouts remain stable at the ${width}px breakpoint edge`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })

    for (const route of ['/brand', '/brand/opportunities/new', '/leader/campaigns/cc-skin-routines', '/member/content']) {
      await page.goto(route)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      expect.soft(overflow, `${route} overflow at ${width}px`).toBeLessThanOrEqual(1)
    }
  })
}
