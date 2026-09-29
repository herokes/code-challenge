import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  formatAmount,
  formatInputAmount,
  formatPriceDate,
  formatUsd,
  parseAmount,
  quote,
} from '@/lib/money.ts'
import {
  DIFFERENT_TOKEN_MESSAGE,
  defaultSwapValues,
  swapSchema,
  type SwapValues,
} from '@/lib/schema.ts'
import type { Token } from '@/lib/tokens.ts'
import { Button } from '@/components/atoms/Button.tsx'
import { QuoteLine } from '@/components/molecules/QuoteLine.tsx'
import { AmountRow } from '@/components/organisms/AmountRow.tsx'

const SUBMIT_DELAY_MS = 900

type Receipt = {
  amount: string
  fromToken: string
  toToken: string
  receive: string
}

type Props = {
  tokens: Token[]
  pricedAt: string
}

export function SwapForm({ tokens, pricedAt }: Props) {
  const symbols = useMemo(() => tokens.map((token) => token.symbol), [tokens])
  const schema = useMemo(() => swapSchema(symbols), [symbols])
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<SwapValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultSwapValues(tokens),
    mode: 'onTouched',
  })
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [confirming, setConfirming] = useState(false)
  const amount = useWatch({ control, name: 'amount' }) ?? ''
  const fromToken = useWatch({ control, name: 'fromToken' })
  const toToken = useWatch({ control, name: 'toToken' })
  const bySymbol = new Map(tokens.map((token) => [token.symbol, token]))
  const from = bySymbol.get(fromToken)
  const to = bySymbol.get(toToken)
  const parsed = parseAmount(amount)
  const received =
    from && to && fromToken !== toToken
      ? quote(amount, from.price, to.price)
      : null
  const sendValue = from && parsed != null ? parsed * from.price : null
  const usdHint = sendValue == null ? undefined : `$${formatUsd(sendValue)}`
  const rate =
    from && to && fromToken !== toToken
      ? formatAmount(from.price / to.price)
      : null
  const sameTokenError =
    fromToken === toToken ? DIFFERENT_TOKEN_MESSAGE : undefined
  const shownReceipt =
    receipt &&
    receipt.amount === amount &&
    receipt.fromToken === fromToken &&
    receipt.toToken === toToken
      ? receipt
      : null

  function selectToken(field: 'fromToken' | 'toToken', symbol: string) {
    setValue(field, symbol, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  function flip() {
    const currentFrom = getValues('fromToken')
    const currentTo = getValues('toToken')
    const currentAmount = getValues('amount')
    const fromPrice = bySymbol.get(currentFrom)?.price
    const toPrice = bySymbol.get(currentTo)?.price
    const nextAmount =
      fromPrice != null && toPrice != null
        ? quote(currentAmount, fromPrice, toPrice)
        : null

    setValue('fromToken', currentTo, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
    setValue('toToken', currentFrom, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
    if (nextAmount != null) {
      setValue('amount', formatInputAmount(nextAmount), {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      })
    }
  }

  async function onSubmit(values: SwapValues) {
    const fromPrice = bySymbol.get(values.fromToken)?.price
    const toPrice = bySymbol.get(values.toToken)?.price
    if (fromPrice == null || toPrice == null) return
    const nextReceive = quote(values.amount, fromPrice, toPrice)
    if (nextReceive == null) return
    setConfirming(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, SUBMIT_DELAY_MS))
      setReceipt({
        amount: values.amount,
        fromToken: values.fromToken,
        toToken: values.toToken,
        receive: formatAmount(nextReceive),
      })
    } finally {
      setConfirming(false)
    }
  }

  return (
    <form
      className="rounded-3xl border border-slate-800 bg-slate-950 p-3"
      aria-labelledby="swap-title"
      aria-busy={confirming}
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <AmountRow
        id="input-amount"
        label="Amount to send"
        hint={usdHint}
        error={errors.amount?.message ?? errors.fromToken?.message}
        tokens={tokens}
        token={fromToken}
        onTokenChange={(symbol) => selectToken('fromToken', symbol)}
        inputProps={register('amount')}
      />
      <div className="relative z-10 -my-3 flex justify-center">
        <Button
          variant="icon"
          aria-label="Swap send and receive tokens"
          onClick={flip}
        >
          <FlipIcon />
        </Button>
      </div>
      <AmountRow
        id="output-amount"
        label="Amount to receive"
        hint={received == null ? undefined : usdHint}
        error={sameTokenError}
        tokens={tokens}
        token={toToken}
        onTokenChange={(symbol) => selectToken('toToken', symbol)}
        readOnly
        inputProps={{ value: received == null ? '' : formatAmount(received) }}
      />
      <div className="px-2 py-3">
        <QuoteLine
          from={fromToken}
          to={toToken}
          rate={rate}
          sendUsd={sendValue == null ? null : formatUsd(sendValue)}
          pricedAt={formatPriceDate(pricedAt)}
        />
      </div>
      {shownReceipt ? (
        <p
          className="mb-3 rounded-2xl border border-emerald-700/60 bg-emerald-950 px-3 py-3 text-sm text-emerald-200"
          role="status"
        >
          Submitted {shownReceipt.amount} {shownReceipt.fromToken} for{' '}
          {shownReceipt.receive} {shownReceipt.toToken}.
        </p>
      ) : null}
      <Button type="submit" disabled={confirming}>
        {confirming ? 'Confirming…' : 'Confirm swap'}
      </Button>
    </form>
  )
}

function FlipIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 6v12M8 18l-3-3M8 18l3-3M16 18V6M16 6l-3 3M16 6l3 3"
      />
    </svg>
  )
}
