import { FaDownload, FaShareSquare } from 'react-icons/fa'
import type { AnnouncementContentProps } from '../../../announcements/loginAnnouncements'

export default function PwaInstallAnnouncementContent({
  canNativeInstall,
  showIosHint,
  onInstall,
}: AnnouncementContentProps) {
  return (
    <div>
      <h2
        id="announcement-title"
        className="font-display text-2xl font-bold tracking-tight text-dark"
      >
        Lleva AppsFly en tu pantalla de inicio
      </h2>
      <p
        id="announcement-desc"
        className="mt-2 max-w-[36ch] text-sm leading-relaxed text-slate-600"
      >
        Instálala para abrirla al instante, a pantalla completa, aunque la conexión falle.
      </p>

      {showIosHint && !canNativeInstall && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left">
          <p className="flex items-center gap-2 text-sm font-semibold text-dark">
            <FaShareSquare className="text-primary" aria-hidden="true" />
            En iPhone o iPad, usa Safari
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Toca Compartir y luego Añadir a pantalla de inicio.
          </p>
        </div>
      )}

      {canNativeInstall && (
        <button
          type="button"
          onClick={onInstall}
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-dark shadow-[0_8px_20px_rgba(2,31,65,0.12)] transition-transform hover:bg-primary-hover active:scale-[0.98]"
        >
          <FaDownload aria-hidden="true" />
          Instalar AppsFly
        </button>
      )}

      {!canNativeInstall && !showIosHint && (
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          En Chrome o Edge, usa el icono de instalación en la barra de direcciones.
        </p>
      )}
    </div>
  )
}
