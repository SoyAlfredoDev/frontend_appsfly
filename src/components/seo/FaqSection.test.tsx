import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import FaqSection from './FaqSection'
import { requirePublicPage } from '../../seo/publicSeo'

describe('FaqSection', () => {
  it('shows every question and answer as visible text', () => {
    const faqs = requirePublicPage('/').faqs
    render(
      <MemoryRouter>
        <FaqSection faqs={faqs} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Preguntas frecuentes' })).toBeInTheDocument()
    for (const faq of faqs) {
      expect(screen.getByRole('heading', { name: faq.question })).toBeInTheDocument()
      expect(screen.getByText(faq.answer)).toBeInTheDocument()
    }
  })
})
