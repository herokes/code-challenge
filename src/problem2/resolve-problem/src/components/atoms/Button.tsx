import type { ButtonHTMLAttributes } from 'react'

const variants = {
  primary:
    'h-12 w-full bg-amber-500 text-base text-slate-950 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500',
  icon: 'size-11 border border-slate-700 bg-slate-950 text-slate-100 hover:border-amber-500 hover:text-amber-400',
  token:
    'h-10 gap-2 bg-slate-800 px-2.5 text-sm text-slate-100 hover:bg-slate-700',
} as const

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants
}

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center rounded-full font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 disabled:cursor-not-allowed motion-reduce:transition-none ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
