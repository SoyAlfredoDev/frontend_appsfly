import { Link } from 'react-router-dom'
import { FaArrowRight, FaCheck, FaGlasses, FaStore, FaTshirt } from 'react-icons/fa'
import { HOME_H1, HOME_LEAD } from '../../seo/publicSeo'

const industries = [
  {
    name: 'Negocio general',
    icon: FaStore,
    text: 'Ventas, clientes, cuentas por cobrar e inventario para el día a día de tu comercio.',
  },
  {
    name: 'Tienda de ropa',
    icon: FaTshirt,
    text: 'Controla cada talla y color con su propio SKU y stock por variante.',
  },
  {
    name: 'Óptica',
    icon: FaGlasses,
    text: 'Recetas OD/OI, órdenes de trabajo, laboratorios y seguimiento de la entrega.',
  },
]

export default function HomeIntroduction() {
  return (
    <>
      <section
        id="inicio"
        aria-labelledby="home-title"
        className="bg-gradient-to-b from-white to-[#f0f7fc] px-4 py-12 sm:px-6 lg:py-20"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-secondary">
              AppsFly · Gestión para tu negocio en Chile
            </p>
            <h1
              id="home-title"
              className="max-w-xl font-display text-4xl font-bold leading-[1.12] tracking-tight text-dark sm:text-5xl xl:text-6xl"
            >
              {HOME_H1}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">{HOME_LEAD}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-primary px-6 py-4 font-bold text-dark hover:bg-[#00b86d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
              >
                Probar 2 meses gratis <FaArrowRight aria-hidden="true" />
              </Link>
              <a
                href="#demostracion"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-4 font-semibold hover:border-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
              >
                Ver cómo funciona
              </a>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-slate-600">
              <FaCheck aria-hidden="true" className="text-secondary" /> Sin tarjeta para empezar. Tú
              eliges si continúas.
            </p>
            <p className="mt-7 text-sm text-slate-500">Desde tu computador, tablet o teléfono.</p>
          </div>
          <figure className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-xs">
                <span className="font-semibold">Tu inventario, a mano</span>
                <span className="text-slate-500">AppsFly</span>
              </div>
              <img
                src="/hero/recorrido-inventario.png"
                alt="Vista actual de inventario de AppsFly con un cuaderno de demostración"
                width="1440"
                height="1000"
                fetchPriority="high"
                className="block w-full"
              />
            </div>
            <figcaption className="mt-3 text-center text-xs text-slate-500">
              Captura de la aplicación con datos de demostración.
            </figcaption>
          </figure>
        </div>
      </section>
      <section
        id="rubros"
        aria-labelledby="industries-title"
        className="scroll-mt-20 px-4 py-12 sm:px-6 lg:py-16"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <h2 id="industries-title" className="font-display text-3xl font-bold">
              Un sistema, la forma de trabajar de tu negocio.
            </h2>
            <p className="shrink-0 text-sm text-slate-500">Rubros disponibles</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {industries.map(({ name, icon: Icon, text }) => (
              <article key={name} className="border-t-2 border-primary pt-6">
                <Icon aria-hidden="true" className="mb-4 text-2xl text-secondary" />
                <h3 className="font-display text-xl font-semibold">{name}</h3>
                <p className="mt-3 leading-relaxed text-slate-600">{text}</p>
                {name === 'Óptica' && (
                  <Link
                    to="/software-para-opticas"
                    className="mt-3 inline-block font-semibold text-secondary underline underline-offset-4"
                  >
                    Conoce AppsFly para ópticas
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
