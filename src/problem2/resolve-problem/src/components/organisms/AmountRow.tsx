import type { ComponentProps } from 'react'
import type { Token } from '@/lib/tokens.ts'
import { FieldError } from '@/components/atoms/FieldError.tsx'
import { TextInput } from '@/components/atoms/TextInput.tsx'
import { TokenPicker } from '@/components/molecules/TokenPicker.tsx'

type Props = {
  id: string
  label: string
  hint?: string
  error?: string
  tokens: Token[]
  token: string
  onTokenChange: (symbol: string) => void
  readOnly?: boolean
  inputProps: ComponentProps<'input'>
}

export function AmountRow({
  id,
  label,
  hint,
  error,
  tokens,
  token,
  onTokenChange,
  readOnly = false,
  inputProps,
}: Props) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') ||
    undefined

  return (
    <div
      className={`rounded-2xl bg-slate-900 px-4 py-3 ring-1 ${error ? 'ring-red-500/80' : 'ring-slate-800 focus-within:ring-amber-500'}`}
    >
      <div className="mb-1 flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className="text-xs tracking-[0.16em] text-slate-500 uppercase"
        >
          {label}
        </label>
        {hint ? (
          <p id={hintId} className="font-mono text-xs text-slate-500">
            {hint}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <TextInput
          {...inputProps}
          id={id}
          readOnly={readOnly}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          inputMode={readOnly ? undefined : 'decimal'}
          autoComplete="off"
          spellCheck={false}
          placeholder={readOnly ? '—' : '0'}
          className="w-full font-mono text-3xl"
        />
        <TokenPicker
          id={`${id}-token`}
          tokens={tokens}
          value={token}
          onChange={onTokenChange}
        />
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  )
}
