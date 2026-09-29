import { describe, expect, it } from 'vitest'
import {
  formatAmount,
  formatInputAmount,
  formatPriceDate,
  formatUsd,
  parseAmount,
  quote,
} from '@/lib/money.ts'
import { defaultSwapValues, swapSchema } from '@/lib/schema.ts'
import { parsePriceFeed } from '@/lib/prices.ts'
import { iconFile } from '@/lib/tokenIcons.ts'
import { collectTokens } from '@/lib/tokens.ts'

describe('quote', () => {
  it('converts an amount by the two prices', () => {
    expect(quote('10', 4, 2)).toBe(20)
    expect(quote('1.5', 2, 4)).toBe(0.75)
    expect(quote('5.', 2, 1)).toBe(10)
  })

  it('rejects blank, zero, junk, and a missing price', () => {
    expect(quote('', 1, 1)).toBeNull()
    expect(quote('0', 1, 1)).toBeNull()
    expect(quote('abc', 1, 1)).toBeNull()
    expect(quote('1', 0, 1)).toBeNull()
    expect(parseAmount(' 2 ')).toBe(2)
  })

  it('returns the original amount after a flip across a wide pair', () => {
    const iris = 0.0177095593220339
    const wbtc = 26002.82202020202
    const received = quote('1', iris, wbtc)
    expect(received).not.toBeNull()
    expect(quote(formatInputAmount(received as number), wbtc, iris)).toBe(1)
  })
})

describe('formatting', () => {
  it('prints amounts, dollars, and the price date', () => {
    expect(formatAmount(1234.5)).toBe('1,234.5')
    expect(formatAmount(0.5)).toBe('0.5')
    expect(formatUsd(1.2)).toBe('1.20')
    expect(formatUsd(0.0404)).toBe('0.0404')
    expect(formatInputAmount(0.75)).toBe('0.75')
    expect(formatInputAmount(1000)).toBe('1000')
    expect(formatInputAmount(0)).toBe('')
    expect(formatPriceDate('2023-08-29T07:10:45.000Z')).toBe('29 Aug 2023')
    expect(formatPriceDate('not-a-date')).toBe('not-a-date')
  })
})

describe('collectTokens', () => {
  it('keeps the latest price and drops tokens that are not priced', () => {
    const collected = collectTokens([
      { currency: 'BUSD', date: '2023-08-29T07:10:40.000Z', price: 0.2 },
      { currency: 'BUSD', date: '2023-08-29T07:10:40.000Z', price: 0.9 },
      { currency: 'ETH', date: '2023-08-29T07:10:52.000Z', price: 10 },
      { currency: 'ZERO', date: '2023-08-29T07:10:52.000Z', price: 0 },
    ])

    expect(collected.tokens).toEqual([
      { symbol: 'BUSD', price: 0.9 },
      { symbol: 'ETH', price: 10 },
    ])
    expect(collected.pricedAt).toBe('2023-08-29T07:10:52.000Z')
  })
})

describe('parsePriceFeed', () => {
  it('skips a malformed row and keeps the priced tokens', () => {
    const feed = parsePriceFeed([
      { currency: 'SWTH', date: '2023-08-29T07:10:45.000Z', price: 2 },
      { broken: true },
      { currency: 'USDC', date: '2023-08-29T07:10:40.000Z', price: 1 },
    ])

    expect(feed.ok).toBe(true)
    if (feed.ok) {
      expect(feed.tokens.map((token) => token.symbol)).toEqual(['SWTH', 'USDC'])
    }
  })

  it('rejects a payload that is not a list', () => {
    expect(parsePriceFeed({ currency: 'SWTH' }).ok).toBe(false)
  })
})

describe('swapSchema', () => {
  const schema = swapSchema(['SWTH', 'USDC'])

  it('accepts a positive amount between two known tokens', () => {
    expect(
      schema.safeParse({ fromToken: 'SWTH', toToken: 'USDC', amount: '1' })
        .success,
    ).toBe(true)
  })

  it('rejects an empty amount, the same token, and an unknown token', () => {
    const empty = schema.safeParse({
      fromToken: 'SWTH',
      toToken: 'USDC',
      amount: '',
    })
    const same = schema.safeParse({
      fromToken: 'SWTH',
      toToken: 'SWTH',
      amount: '1',
    })
    const unknown = schema.safeParse({
      fromToken: 'ETH',
      toToken: 'USDC',
      amount: '1',
    })

    expect(empty.success).toBe(false)
    expect(same.success).toBe(false)
    expect(unknown.success).toBe(false)
    if (!empty.success)
      expect(empty.error.issues[0]?.message).toBe(
        'Enter an amount greater than zero',
      )
    if (!same.success)
      expect(same.error.issues.map((issue) => issue.message)).toContain(
        'Choose a different token to receive',
      )
    if (!unknown.success)
      expect(unknown.error.issues[0]?.message).toBe('Choose a token')
  })
})

describe('defaultSwapValues', () => {
  it('starts on SWTH to USDC when both are priced', () => {
    expect(
      defaultSwapValues([
        { symbol: 'ETH', price: 2 },
        { symbol: 'SWTH', price: 1 },
        { symbol: 'USDC', price: 1 },
      ]),
    ).toEqual({ fromToken: 'SWTH', toToken: 'USDC', amount: '' })
  })
})

describe('iconFile', () => {
  it('maps price symbols onto the icon filenames that differ by case', () => {
    expect(iconFile('RATOM')).toBe('rATOM')
    expect(iconFile('STATOM')).toBe('stATOM')
    expect(iconFile('STEVMOS')).toBe('stEVMOS')
    expect(iconFile('STLUNA')).toBe('stLUNA')
    expect(iconFile('STOSMO')).toBe('stOSMO')
    expect(iconFile('SWTH')).toBe('SWTH')
  })
})
