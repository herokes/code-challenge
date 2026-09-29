const AMOUNT = /^(?:0|[1-9]\d*)(?:\.\d*)?$/

export function parseAmount(amount: string): number | null {
  const value = amount.trim()
  if (!AMOUNT.test(value)) return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return null
  return parsed
}

export function quote(
  amount: string,
  fromPrice: number,
  toPrice: number,
): number | null {
  const value = parseAmount(amount)
  if (value == null || !(fromPrice > 0) || !(toPrice > 0)) return null
  const received = (value * fromPrice) / toPrice
  return Number.isFinite(received) ? received : null
}

export function formatAmount(value: number): string {
  if (value >= 1) {
    return value.toLocaleString('en-US', { maximumFractionDigits: 6 })
  }
  return value.toLocaleString('en-US', { maximumSignificantDigits: 6 })
}

export function formatUsd(value: number): string {
  if (value >= 1) {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
  return value.toLocaleString('en-US', { maximumSignificantDigits: 4 })
}

export function formatInputAmount(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return ''
  const raw = value.toString()
  if (!raw.includes('e') && !raw.includes('E')) return raw
  const [coeff, expPart] = raw.split(/e/i)
  const exp = Number(expPart)
  const [whole, frac = ''] = coeff.split('.')
  const digits = `${whole}${frac}`
  const point = whole.length + exp
  const text =
    point <= 0
      ? `0.${'0'.repeat(-point)}${digits}`
      : point >= digits.length
        ? `${digits}${'0'.repeat(point - digits.length)}`
        : `${digits.slice(0, point)}.${digits.slice(point)}`
  if (!text.includes('.')) return text
  return text.replace(/0+$/, '').replace(/\.$/, '')
}

export function formatPriceDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}
