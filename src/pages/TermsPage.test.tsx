import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import {
  DATA_RETENTION_HEADING,
  DATA_RETENTION_SUMMARY,
  LEGAL_LAST_UPDATED_LABEL,
} from '../constants/legalDocuments'
import TermsPage from './TermsPage.jsx'

describe('TermsPage', () => {
  it('states the 12-month retention for inactive clients', () => {
    render(
      <MemoryRouter>
        <TermsPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: `5. ${DATA_RETENTION_HEADING}` }),
    ).toBeInTheDocument()
    expect(screen.getByText(DATA_RETENTION_SUMMARY)).toBeInTheDocument()
    expect(
      screen.getByText(`Última actualización: ${LEGAL_LAST_UPDATED_LABEL}`),
    ).toBeInTheDocument()
    expect(screen.getByText(/12 meses/)).toBeInTheDocument()
  })
})
