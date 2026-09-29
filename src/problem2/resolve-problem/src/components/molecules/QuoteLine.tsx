type Props = {
  from: string
  to: string
  rate: string | null
  sendUsd: string | null
  pricedAt: string
}

export function QuoteLine({ from, to, rate, sendUsd, pricedAt }: Props) {
  return (
    <div className="border-t border-slate-800 px-1 py-4" aria-live="polite">
      <dl className="grid gap-2 font-mono text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-slate-500">Rate</dt>
          <dd className="text-right text-slate-100">
            {rate ? `1 ${from} = ${rate} ${to}` : '—'}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-slate-500">Send value</dt>
          <dd className="text-right text-slate-100">
            {sendUsd ? `$${sendUsd}` : '—'}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-slate-500">Prices as of {pricedAt}</p>
    </div>
  )
}
