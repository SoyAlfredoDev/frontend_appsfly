import { Link } from 'react-router-dom'
import Footer from '../FooterComponent.jsx'
import NavbarHome from '../../pages/web/NavbarHome.jsx'
import FaqSection from './FaqSection'
import type { PublicPage } from '../../seo/publicSeo'
import PlansHome from '../../pages/web/PlansHome.jsx'

type SeoArticlePageProps = {
  page: PublicPage
  showPlans?: boolean
}

export default function SeoArticlePage({ page, showPlans = false }: SeoArticlePageProps) {
  return (
    <div className="overflow-x-hidden bg-white font-sans text-dark">
      <NavbarHome />
      <main>
        <article className="mx-auto max-w-3xl px-4 pb-8 pt-16 sm:px-6 md:pt-24">
          <nav aria-label="Ruta" className="mb-6 text-sm text-slate-500">
            <Link to="/" className="hover:text-primary">
              Inicio
            </Link>
            <span aria-hidden="true"> / </span>
            <span>{page.h1}</span>
          </nav>
          <h1 className="font-display text-4xl font-bold tracking-tight text-dark sm:text-5xl">
            {page.h1}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">{page.lead}</p>
          {page.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-4 text-base leading-relaxed text-slate-600">
              {paragraph}
            </p>
          ))}
        </article>

        {page.highlights.length > 0 ? (
          <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6" aria-labelledby="que-incluye">
            <h2 id="que-incluye" className="font-display text-3xl font-bold text-dark">
              Qué incluye
            </h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {page.highlights.map((item) => (
                <li key={item.title} className="rounded-2xl border border-slate-200 p-6">
                  <h3 className="font-display text-lg font-semibold text-dark">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {showPlans ? (
          <PlansHome
            heading="Planes"
            subtitle="Los precios de abajo son netos. Suma el IVA. La prueba de 2 meses no pide tarjeta."
          />
        ) : null}

        <FaqSection faqs={page.faqs} />

        <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
          <div className="rounded-3xl bg-dark px-6 py-10 text-white sm:px-10">
            <h2 className="font-display text-3xl font-bold">Empieza con 2 meses gratis</h2>
            <p className="mt-3 max-w-2xl text-slate-300">
              Crea la cuenta de la prueba Pro sin tarjeta. Si tienes una óptica, también puedes ver
              el recorrido de receta, venta y laboratorio.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-white"
              >
                Crear cuenta
              </Link>
              <Link
                to="/optica"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white"
              >
                Ver la óptica
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
