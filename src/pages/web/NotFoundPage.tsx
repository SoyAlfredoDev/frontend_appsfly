import { Link } from 'react-router-dom'
import Footer from '../../components/FooterComponent.jsx'
import NavbarHome from './NavbarHome.jsx'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-dark">
      <NavbarHome />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-20 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-secondary">404</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          No encontramos esta página
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
          La dirección no existe en AppsFly. Puedes volver al inicio, ver los precios o leer el
          software para ópticas.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-white"
          >
            Ir al inicio
          </Link>
          <Link
            to="/precios"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-dark"
          >
            Ver precios
          </Link>
          <Link
            to="/software-para-opticas"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-dark"
          >
            Software para ópticas
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
