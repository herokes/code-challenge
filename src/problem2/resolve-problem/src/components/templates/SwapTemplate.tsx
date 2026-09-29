import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export function SwapTemplate({ children }: Props) {
  return (
    <div className="min-h-svh bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-svh w-full max-w-lg flex-col justify-center px-5 py-12">
        <header className="mb-8">
          <p className="text-xs tracking-[0.28em] text-amber-500">FANCY FORM</p>
          <h1
            id="swap-title"
            className="mt-3 font-display text-5xl leading-none font-black tracking-tight sm:text-6xl"
          >
            Swap
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Exchange one priced asset for another.
          </p>
          <div className="mt-6 h-px w-16 bg-amber-500" />
        </header>
        {children}
      </div>
    </div>
  )
}
