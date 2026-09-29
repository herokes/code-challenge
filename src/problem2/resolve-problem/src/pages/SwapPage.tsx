import { Suspense, use } from 'react'
import { StatusPanel } from '@/components/molecules/StatusPanel.tsx'
import { SwapForm } from '@/components/organisms/SwapForm.tsx'
import { SwapTemplate } from '@/components/templates/SwapTemplate.tsx'
import { pricesPromise } from '@/lib/prices.ts'

export function SwapPage() {
  return (
    <SwapTemplate>
      <Suspense
        fallback={
          <StatusPanel
            title="Loading prices"
            message="Fetching the latest token rates."
          />
        }
      >
        <LoadedSwap />
      </Suspense>
    </SwapTemplate>
  )
}

function LoadedSwap() {
  const prices = use(pricesPromise)
  if (!prices.ok) {
    return <StatusPanel title="Prices unavailable" message={prices.message} />
  }
  return <SwapForm tokens={prices.tokens} pricedAt={prices.pricedAt} />
}
