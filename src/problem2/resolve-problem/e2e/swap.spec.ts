import { expect, test, type Page } from '@playwright/test'

const prices = [
  { currency: 'SWTH', date: '2023-08-29T07:10:45.000Z', price: 2 },
  { currency: 'USDC', date: '2023-08-29T07:10:40.000Z', price: 1 },
  { currency: 'ETH', date: '2023-08-29T08:00:00.000Z', price: 2000 },
]

async function openSwap(page: Page) {
  await page.route('https://interview.switcheo.com/prices.json', (route) =>
    route.fulfill({ json: prices }),
  )
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Swap' })).toBeVisible()
}

async function pickReceive(page: Page, symbol: string) {
  await page.getByRole('button', { name: 'USDC', exact: true }).click()
  await page.getByRole('textbox', { name: 'Search tokens' }).fill(symbol)
  await page.getByRole('button', { name: new RegExp(`^${symbol} `) }).click()
}

test('quotes the receive amount from the published rate', async ({ page }) => {
  await openSwap(page)
  await page.getByRole('textbox', { name: 'Amount to send' }).fill('100')

  await expect(
    page.getByRole('textbox', { name: 'Amount to receive' }),
  ).toHaveValue('200')
  await expect(page.getByText('1 SWTH = 2 USDC')).toBeVisible()
  await expect(page.getByText('$200.00').first()).toBeVisible()
  await expect(page.getByText('Prices as of 29 Aug 2023')).toBeVisible()
})

test('rejects an empty or non-numeric amount', async ({ page }) => {
  await openSwap(page)
  await page.getByRole('button', { name: 'Confirm swap' }).click()
  await expect(
    page.getByText('Enter an amount greater than zero'),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Confirm swap' })).toBeEnabled()

  await page.getByRole('textbox', { name: 'Amount to send' }).fill('abc')
  await expect(
    page.getByText('Enter an amount greater than zero'),
  ).toBeVisible()
  await expect(
    page.getByRole('textbox', { name: 'Amount to receive' }),
  ).toHaveValue('')
})

test('rejects a swap into the same token', async ({ page }) => {
  await openSwap(page)
  await page.getByRole('textbox', { name: 'Amount to send' }).fill('100')
  await pickReceive(page, 'SWTH')

  await expect(
    page.getByText('Choose a different token to receive'),
  ).toBeVisible()
  await expect(
    page.getByRole('textbox', { name: 'Amount to receive' }),
  ).toHaveValue('')
})

test('flips the pair and submits the swap', async ({ page }) => {
  await openSwap(page)
  await page.getByRole('textbox', { name: 'Amount to send' }).fill('100')
  await page
    .getByRole('button', { name: 'Swap send and receive tokens' })
    .click()

  await expect(
    page.getByRole('button', { name: 'USDC', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'SWTH', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('textbox', { name: 'Amount to send' }),
  ).toHaveValue('200')
  await expect(
    page.getByRole('textbox', { name: 'Amount to receive' }),
  ).toHaveValue('100')

  await page.getByRole('button', { name: 'Confirm swap' }).click()
  await expect(page.getByRole('button', { name: 'Confirming…' })).toBeDisabled()
  await expect(page.getByRole('status')).toHaveText(
    'Submitted 200 USDC for 100 SWTH.',
  )
})
