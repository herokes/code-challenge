import type { ComponentProps } from 'react'

export function TextInput({
  className = '',
  ...props
}: ComponentProps<'input'>) {
  return (
    <input
      {...props}
      className={`min-w-0 bg-transparent text-slate-50 outline-none placeholder:text-slate-600 read-only:cursor-default ${className}`}
    />
  )
}
