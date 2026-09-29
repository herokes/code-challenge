import { useState } from 'react'
import type { Token } from '@/lib/tokens.ts'
import { formatUsd } from '@/lib/money.ts'
import { Button } from '@/components/atoms/Button.tsx'
import { TextInput } from '@/components/atoms/TextInput.tsx'
import { TokenMark } from '@/components/atoms/TokenMark.tsx'

type Props = {
  id: string
  tokens: Token[]
  value: string
  onChange: (symbol: string) => void
}

export function TokenPicker({ id, tokens, value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const panelId = `${id}-panel`
  const searchId = `${id}-search`
  const selected = tokens.find((token) => token.symbol === value)
  const needle = query.trim().toLowerCase()
  const shown = needle
    ? tokens.filter((token) => token.symbol.toLowerCase().includes(needle))
    : tokens

  function close() {
    setOpen(false)
    setQuery('')
  }

  function choose(symbol: string) {
    onChange(symbol)
    close()
  }

  return (
    <div className="relative shrink-0">
      <Button
        variant="token"
        id={id}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <TokenMark symbol={selected?.symbol ?? value} size={20} />
        <span className="max-w-24 truncate">{selected?.symbol ?? 'Token'}</span>
        <Chevron />
      </Button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-20 cursor-default"
            aria-label="Close token list"
            onClick={close}
          />
          <div
            id={panelId}
            className="absolute right-0 z-30 mt-2 w-[min(18rem,calc(100vw-3rem))] rounded-2xl border border-slate-700 bg-slate-950 p-2 shadow-2xl"
          >
            <label className="sr-only" htmlFor={searchId}>
              Search tokens
            </label>
            <TextInput
              id={searchId}
              value={query}
              placeholder="Search"
              autoFocus
              className="mb-2 h-10 rounded-xl bg-slate-900 px-3 text-base"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.preventDefault()
                if (event.key === 'Escape') close()
              }}
            />
            <ul className="max-h-60 overflow-auto">
              {shown.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-slate-500">
                  No tokens match
                </li>
              ) : (
                shown.map((token) => {
                  const isSelected = token.symbol === value
                  return (
                    <li key={token.symbol}>
                      <button
                        type="button"
                        className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors duration-150 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 motion-reduce:transition-none ${isSelected ? 'bg-slate-800 text-amber-400' : 'text-slate-100'}`}
                        aria-current={isSelected ? 'true' : undefined}
                        onClick={() => choose(token.symbol)}
                      >
                        <TokenMark symbol={token.symbol} size={28} />
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {token.symbol}
                        </span>
                        <span className="font-mono text-xs text-slate-400">
                          ${formatUsd(token.price)}
                        </span>
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  )
}

function Chevron() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="size-4 text-slate-400"
    >
      <path
        fill="currentColor"
        d="M5.2 7.5 10 12.3l4.8-4.8 1.2 1.2L10 14.7 4 8.7z"
      />
    </svg>
  )
}
