import NavbarHome from './web/NavbarHome.jsx'
import HomeIntroduction from './web/HomeIntroduction'
import ProductTour from './web/ProductTour'
import PlansHome from './web/PlansHome'
import Footer from '../components/FooterComponent.jsx'
import FloatingWhatsApp from '../components/web/FloatingWhatsApp.jsx'
import FaqSection from '../components/seo/FaqSection'
import { requirePublicPage } from '../seo/publicSeo'
import { SUPPORT_WHATSAPP_PHONE } from '../constants/supportContact.js'

export default function HomePage() {
  return (
    <div className="bg-white font-sans text-dark selection:bg-primary/25">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:p-4"
      >
        Ir al contenido
      </a>
      <NavbarHome />
      <main id="contenido">
        <HomeIntroduction />
        <ProductTour />
        <div id="planes" className="scroll-mt-20">
          <PlansHome />
        </div>
        <FaqSection
          faqs={requirePublicPage('/').faqs}
          intro="Lo que necesitas saber antes de empezar."
        />
      </main>
      <Footer />
      <FloatingWhatsApp phone={SUPPORT_WHATSAPP_PHONE} />
    </div>
  )
}
