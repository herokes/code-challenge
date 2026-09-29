export type Token = {
  symbol: string
  price: number
}

export type PriceRow = {
  currency: string
  date: string
  price: number
}

export function collectTokens(rows: PriceRow[]): {
  tokens: Token[]
  pricedAt: string
} {
  const bySymbol = new Map<string, Token & { date: string }>()
  let pricedAt = ''

  for (const row of rows) {
    if (
      !(row.price > 0) ||
      !Number.isFinite(row.price) ||
      row.currency.length === 0
    )
      continue
    if (row.date > pricedAt) pricedAt = row.date
    const previous = bySymbol.get(row.currency)
    if (!previous || row.date >= previous.date) {
      bySymbol.set(row.currency, {
        symbol: row.currency,
        price: row.price,
        date: row.date,
      })
    }
  }

  const tokens = [...bySymbol.values()]
    .map(({ symbol, price }) => ({ symbol, price }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol))

  return { tokens, pricedAt }
}
