import { Link } from 'react-router-dom'
import type { FaqEntry } from '../../seo/publicSeo'

type FaqSectionProps = {
  faqs: FaqEntry[]
  title?: string
  intro?: string
}

export default function FaqSection({
  faqs,
  title = 'Preguntas frecuentes',
  intro = 'Respuestas directas sobre AppsFly, para quien compara opciones o le pregunta a un buscador.',
}: FaqSectionProps) {
  if (faqs.length === 0) return null

  return (
    <section id="preguntas" className="scroll-mt-20 bg-white py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-display text-3xl font-bold tracking-tight text-dark sm:text-4xl">
          {title}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600">{intro}</p>
        <div className="mt-10 space-y-8">
          {faqs.map((faq) => (
            <article key={faq.question} className="border-t border-slate-200 pt-8">
              <h3 className="font-display text-xl font-semibold text-dark">{faq.question}</h3>
              <p className="mt-3 text-base leading-relaxed text-slate-600">{faq.answer}</p>
            </article>
          ))}
        </div>
        <p className="mt-10 text-sm leading-relaxed text-slate-500">
          <Link
            to="/software-para-opticas"
            className="font-semibold text-secondary hover:text-primary"
          >
            Software para ópticas
          </Link>
          <span aria-hidden="true"> · </span>
          <Link to="/precios" className="font-semibold text-secondary hover:text-primary">
            Precios
          </Link>
          <span aria-hidden="true"> · </span>
          <Link to="/register" className="font-semibold text-secondary hover:text-primary">
            Crear cuenta
          </Link>
        </p>
      </div>
    </section>
  )
}
