type FieldSkeletonProps = {
  className?: string
}

export function FieldSkeleton({ className = 'h-5 w-32' }: FieldSkeletonProps) {
  return (
    <span
      className={`inline-block rounded bg-slate-100 animate-pulse ${className}`}
      aria-hidden="true"
    />
  )
}

type DetailFieldsSkeletonProps = {
  fields?: number
  label?: string
}

export function DetailFieldsSkeleton({
  fields = 8,
  label = 'Cargando datos',
}: DetailFieldsSkeletonProps) {
  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-5"
      aria-busy="true"
      aria-label={label}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: fields }, (_, index) => (
          <div key={index} className="space-y-2">
            <span className="block h-3 w-16 rounded bg-slate-100 animate-pulse" />
            <span className="block h-5 w-28 rounded bg-slate-100 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

type TableRowsSkeletonProps = {
  rows?: number
  label?: string
}

export function TableRowsSkeleton({ rows = 4, label = 'Cargando filas' }: TableRowsSkeletonProps) {
  return (
    <div
      className="bg-white rounded-xl border border-slate-200 overflow-hidden"
      aria-busy="true"
      aria-label={label}
    >
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="h-12 border-b border-slate-100 last:border-b-0 px-4 flex items-center"
        >
          <span className="block h-4 w-full max-w-md rounded bg-slate-100 animate-pulse" />
        </div>
      ))}
    </div>
  )
}

type PageDataSkeletonProps = {
  label?: string
}

export function PageDataSkeleton({ label = 'Cargando vista' }: PageDataSkeletonProps) {
  return (
    <div className="page-container" aria-busy="true" aria-label={label}>
      <div className="page-inner space-y-6">
        <div className="card card-body flex flex-col gap-3">
          <span className="block h-7 w-56 rounded bg-slate-100 animate-pulse" />
          <span className="block h-4 w-72 max-w-full rounded bg-slate-100 animate-pulse" />
        </div>
        <DetailFieldsSkeleton />
        <TableRowsSkeleton />
      </div>
    </div>
  )
}
