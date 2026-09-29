import { z } from 'zod'
import { parseAmount } from '@/lib/money.ts'
import type { Token } from '@/lib/tokens.ts'

export const DIFFERENT_TOKEN_MESSAGE = 'Choose a different token to receive'

export function swapSchema(symbols: readonly string[]) {
  const known = new Set(symbols)
  const token = z
    .string()
    .refine((symbol) => known.has(symbol), 'Choose a token')

  return z
    .object({
      fromToken: token,
      toToken: token,
      amount: z
        .string()
        .refine(
          (value) => parseAmount(value) != null,
          'Enter an amount greater than zero',
        ),
    })
    .refine((value) => value.fromToken !== value.toToken, {
      message: DIFFERENT_TOKEN_MESSAGE,
      path: ['toToken'],
    })
}

export type SwapValues = z.infer<ReturnType<typeof swapSchema>>

export function defaultSwapValues(tokens: Token[]): SwapValues {
  const symbols = tokens.map((token) => token.symbol)
  const fromToken = symbols.includes('SWTH') ? 'SWTH' : symbols[0]
  const toToken =
    symbols.includes('USDC') && fromToken !== 'USDC'
      ? 'USDC'
      : (symbols.find((symbol) => symbol !== fromToken) ?? fromToken)

  return { fromToken, toToken, amount: '' }
}
