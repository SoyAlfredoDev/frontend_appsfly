/** Sección plana sin card — título + divider para formularios de registro. */
export default function FormFlatSection({
  title,
  subtitle,
  actions,
  children,
  className = "",
  bordered = true,
}) {
  return (
    <section
      className={`${bordered ? "border-b border-gray-200" : ""} py-2.5 ${className}`}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="min-w-0">
            {title && (
              <h2 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}
