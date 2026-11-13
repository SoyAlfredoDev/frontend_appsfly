import { useState } from 'react'
import { FaArrowRight } from 'react-icons/fa'

const steps = [
  {
    name: 'Registra la venta',
    heading: 'Cada venta, asociada a tu cliente.',
    text: 'Selecciona al cliente, agrega productos o servicios y registra el pago. Si queda un saldo, puedes seguirlo en cuentas por cobrar.',
    image: '/hero/recorrido-venta.png',
    alt: 'Formulario actual de venta de AppsFly con datos de demostración',
  },
  {
    name: 'Sigue los abonos',
    heading: 'Ten claro cuánto queda por cobrar.',
    text: 'Consulta los saldos pendientes y registra cada abono en la venta correspondiente para mantener actualizado lo que te deben.',
    image: '/hero/recorrido-abonos.png',
    alt: 'Vista actual de cuentas por cobrar de AppsFly con una venta de demostración',
  },
  {
    name: 'Revisa tu stock',
    heading: 'Consulta lo que tienes disponible.',
    text: 'Revisa existencias y movimientos de inventario. En una tienda de ropa, cada talla y color tiene su propio stock.',
    image: '/hero/recorrido-inventario.png',
    alt: 'Vista actual de inventario de AppsFly con datos de demostración',
  },
]

export default function ProductTour() {
  const [active, setActive] = useState(0)
  const step = steps[active]!
  return (
    <section
      id="demostracion"
      aria-labelledby="tour-heading"
      className="scroll-mt-20 bg-[#f2f4f7] px-4 py-12 sm:px-6 lg:py-16"
    >
      <div className="mx-auto max-w-7xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-secondary">
          Conoce el producto
        </p>
        <h2 id="tour-heading" className="font-display text-3xl font-bold sm:text-4xl">
          De la venta al cobro, sin perder el hilo.
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">
          Explora tres pantallas de AppsFly. Este recorrido muestra la aplicación con datos de
          demostración; puedes verla sin crear una cuenta.
        </p>
        <div
          className="my-8 grid gap-3 sm:grid-cols-3"
          role="group"
          aria-label="Pantallas del recorrido"
        >
          {steps.map((item, index) => (
            <button
              key={item.name}
              type="button"
              aria-pressed={active === index}
              onClick={() => setActive(index)}
              aria-controls="tour-screen"
              className={`flex items-center gap-3 rounded-xl border px-5 py-4 text-left font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary ${active === index ? 'border-dark bg-dark text-white' : 'border-slate-200 bg-white text-dark hover:border-secondary'}`}
            >
              <span className={`text-xs ${active === index ? 'text-primary' : 'text-secondary'}`}>
                0{index + 1}
              </span>
              {item.name}
            </button>
          ))}
        </div>
        <div id="tour-screen" className="grid gap-6 lg:grid-cols-[0.7fr_1.6fr] lg:items-center">
          <div aria-live="polite" aria-atomic="true">
            <h3 className="font-display text-2xl font-semibold">{step.heading}</h3>
            <p className="mt-4 leading-relaxed text-slate-600">{step.text}</p>
            <a
              href={step.image}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 font-semibold text-secondary underline underline-offset-4"
            >
              Ampliar captura <FaArrowRight aria-hidden="true" />
            </a>
            <p className="mt-3 text-xs text-slate-500">Se abre en otra pestaña.</p>
          </div>
          <img
            key={step.image}
            src={step.image}
            alt={step.alt}
            width="1440"
            height="1000"
            loading="lazy"
            className="w-full rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60"
          />
        </div>
      </div>
    </section>
  )
}
