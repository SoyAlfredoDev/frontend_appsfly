import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AnnouncementOverlay from './AnnouncementOverlay'
import PwaInstallAnnouncementContent from './content/PwaInstallAnnouncementContent'

const imageAlt = 'Teléfono con el icono de AppsFly en la pantalla de inicio'

function renderAnnouncement({
  onClose = vi.fn(),
  onDismissForever = vi.fn(),
  canNativeInstall = true,
}: {
  onClose?: () => void
  onDismissForever?: () => void
  canNativeInstall?: boolean
} = {}) {
  render(
    <AnnouncementOverlay
      open
      onClose={onClose}
      onDismissForever={onDismissForever}
      imageSrc="/announcements/pwa-install-hero.jpg"
      imageAlt={imageAlt}
    >
      <PwaInstallAnnouncementContent
        canNativeInstall={canNativeInstall}
        showIosHint={false}
        onInstall={vi.fn()}
      />
    </AnnouncementOverlay>,
  )
  return { onClose, onDismissForever }
}

describe('AnnouncementOverlay', () => {
  it('starts the announcement with the image, before the text', () => {
    renderAnnouncement()

    const image = screen.getByRole('img', { name: imageAlt })
    const title = screen.getByRole('heading', { name: 'Lleva AppsFly en tu pantalla de inicio' })

    expect(image.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Instalar AppsFly' })).toBeInTheDocument()
  })

  it('asks not to show the publication again without closing it as a temporary dismissal', () => {
    const { onClose, onDismissForever } = renderAnnouncement()

    fireEvent.click(screen.getByRole('button', { name: 'No volver a mostrar este mensaje' }))

    expect(onDismissForever).toHaveBeenCalledOnce()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('treats Ahora no and Escape as a temporary close', () => {
    const { onClose, onDismissForever } = renderAnnouncement()

    fireEvent.click(screen.getByRole('button', { name: 'Ahora no' }))
    fireEvent.keyDown(window, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(2)
    expect(onDismissForever).not.toHaveBeenCalled()
  })
})
