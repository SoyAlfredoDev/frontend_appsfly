type DataErrorPanelProps = {
  message: string
  onRetry?: () => void
}

export default function DataErrorPanel({ message, onRetry }: DataErrorPanelProps) {
  return (
    <div
      role="alert"
      className="bg-white rounded-xl border border-red-200 px-5 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <p className="text-sm text-red-700">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Reintentar
        </button>
      ) : null}
    </div>
  )
}
