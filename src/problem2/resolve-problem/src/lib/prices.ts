import { z } from 'zod'
import { collectTokens, type Token } from '@/lib/tokens.ts'

const priceRow = z.object({
  currency: z.string(),
  date: z.string(),
  price: z.number(),
})

const PRICES_URL = 'https://interview.switcheo.com/prices.json'

export type PriceLoad =
  | { ok: true; tokens: Token[]; pricedAt: string }
  | { ok: false; message: string }

export function parsePriceFeed(data: unknown): PriceLoad {
  const payload = z.array(z.unknown()).safeParse(data)
  if (!payload.success) {
    return {
      ok: false,
      message: 'Token prices came back in an unexpected shape.',
    }
  }
  const rows = payload.data.flatMap((item) => {
    const row = priceRow.safeParse(item)
    return row.success ? [row.data] : []
  })
  const { tokens, pricedAt } = collectTokens(rows)
  if (tokens.length < 2) {
    return { ok: false, message: 'Not enough priced tokens to swap.' }
  }
  return { ok: true, tokens, pricedAt }
}

export const pricesPromise: Promise<PriceLoad> = fetch(PRICES_URL)
  .then(async (response) => {
    if (!response.ok) {
      return {
        ok: false as const,
        message: `Token prices are unavailable (${response.status}).`,
      }
    }
    return parsePriceFeed(await response.json())
  })
  .catch(() => ({
    ok: false as const,
    message: 'Could not load token prices.',
  }))
