import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion as Motion, useReducedMotion } from 'framer-motion'
import { FaTimes } from 'react-icons/fa'

type AnnouncementOverlayProps = {
  open: boolean
  onClose: () => void
  onDismissForever?: () => void
  dismissForeverLabel?: string
  imageSrc?: string
  imageAlt?: string
  children: ReactNode
}

function AnnouncementHero({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center bg-dark">
        <img src="/pwa/icon-512.png" alt={alt} className="h-24 w-24 rounded-[1.75rem]" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      width={1280}
      height={720}
      draggable={false}
      className="aspect-[16/9] w-full object-cover"
      onError={() => setFailed(true)}
    />
  )
}

export default function AnnouncementOverlay({
  open,
  onClose,
  onDismissForever,
  dismissForeverLabel = 'No volver a mostrar este mensaje',
  imageSrc,
  imageAlt = '',
  children,
}: AnnouncementOverlayProps) {
  const reduceMotion = useReducedMotion() === true

  useEffect(() => {
    if (!open || typeof document === 'undefined') return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (typeof document === 'undefined') {
    return null
  }

  const fade = reduceMotion ? { duration: 0 } : { duration: 0.22 }
  const enter = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 380, damping: 32 }

  return createPortal(
    <AnimatePresence>
      {open && (
        <Motion.div
          className="fixed inset-0 z-[10050] flex items-end justify-center p-0 sm:items-center sm:p-4"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fade}
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-dark/55 backdrop-blur-[2px]"
            aria-label="Cerrar anuncio"
            onClick={onClose}
          />

          <Motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-title"
            aria-describedby="announcement-desc"
            tabIndex={-1}
            className="relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-slate-200/80 bg-white shadow-[0_24px_60px_rgba(2,31,65,0.28)] sm:max-w-md sm:rounded-3xl"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            transition={enter}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative shrink-0">
              {imageSrc ? (
                <AnnouncementHero src={imageSrc} alt={imageAlt} />
              ) : (
                <div className="h-8" />
              )}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-dark shadow-[0_8px_20px_rgba(2,31,65,0.18)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
                aria-label="Cerrar"
              >
                <FaTimes aria-hidden="true" />
              </button>
            </div>

            <div
              className={`flex-1 overflow-y-auto px-6 sm:px-7 ${imageSrc ? 'pt-5 pb-2' : 'pt-2 pb-2'}`}
            >
              {children}
            </div>

            <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 bg-white px-6 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7 sm:pb-5">
              <button
                type="button"
                onClick={onClose}
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-slate-50 active:scale-[0.98]"
              >
                Ahora no
              </button>
              {onDismissForever && (
                <button
                  type="button"
                  onClick={onDismissForever}
                  className="min-h-11 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-dark active:scale-[0.98]"
                >
                  {dismissForeverLabel}
                </button>
              )}
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
