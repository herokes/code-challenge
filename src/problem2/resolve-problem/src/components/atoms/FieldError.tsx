type Props = {
  id: string
  message?: string
}

export function FieldError({ id, message }: Props) {
  if (!message) return null
  return (
    <p id={id} className="mt-2 text-sm text-red-400">
      {message}
    </p>
  )
}
