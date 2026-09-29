type Props = {
  title: string
  message: string
}

export function StatusPanel({ title, message }: Props) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 px-5 py-8">
      <h2 className="font-display text-2xl text-slate-50">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{message}</p>
    </section>
  )
}
