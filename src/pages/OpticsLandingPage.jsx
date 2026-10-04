import OpticsNavbar from "./web/optica/OpticsNavbar.jsx";
import OpticsHero from "./web/optica/OpticsHero.jsx";
import OpticsDayToDay from "./web/optica/OpticsDayToDay.jsx";
import OpticsFlow from "./web/optica/OpticsFlow.jsx";
import OpticsWhy from "./web/optica/OpticsWhy.jsx";
import OpticsFinalCta from "./web/optica/OpticsFinalCta.jsx";
import PlansHome from "./web/PlansHome.jsx";
import Footer from "../components/FooterComponent.jsx";
import FloatingWhatsApp from "../components/web/FloatingWhatsApp.jsx";
import { SUPPORT_WHATSAPP_PHONE } from "../constants/supportContact.js";
import { OPTICS_LANDING_SECTIONS } from "../constants/opticsLandingNavigation.js";
import { OPTICS_PROMO_REGISTER_TO } from "../utils/opticsPromoHost.js";
import FaqSection from "../components/seo/FaqSection.tsx";
import { requirePublicPage } from "../seo/publicSeo.ts";

const opticsFaqs = requirePublicPage("/optica").faqs;

/**
 * Landing promocional para ópticas.
 * En optica.appsfly.app se sirve en `/`; en appsfly.cl también en `/optica`.
 */
export default function OpticsLandingPage({ basePath = "/" }) {
    const sectionHref = (id) =>
        basePath === "/" ? `#${id}` : `${basePath}#${id}`;

    return (
        <div className="font-sans text-dark bg-white overflow-x-hidden selection:bg-primary selection:text-white">
            <OpticsNavbar basePath={basePath} />

            <main>
                <div id="inicio">
                    <OpticsHero />
                </div>

                <div id="dia-a-dia" className="scroll-mt-20">
                    <OpticsDayToDay />
                </div>

                <div id="flujo" className="scroll-mt-20">
                    <OpticsFlow />
                </div>

                <div id="por-que" className="scroll-mt-20">
                    <OpticsWhy />
                </div>

                <div id="planes" className="scroll-mt-20">
                    <PlansHome
                        registerTo={OPTICS_PROMO_REGISTER_TO}
                        heading="Planes para tu óptica"
                        subtitle="Empieza con 2 meses gratis y las funciones de Pro. Start, Pro y Élite se contratan después, más IVA."
                    />
                </div>

                <FaqSection
                    faqs={opticsFaqs}
                    intro="Respuestas cortas para quien busca un software de óptica en Chile."
                />

                <div id="empezar" className="scroll-mt-20">
                    <OpticsFinalCta />
                </div>
            </main>

            <Footer
                sections={OPTICS_LANDING_SECTIONS}
                sectionHref={sectionHref}
                registerTo={OPTICS_PROMO_REGISTER_TO}
                homeTo={basePath}
                blurb="Sistema de gestión para ópticas: recetas, órdenes de trabajo, laboratorios, inventario y ventas en un solo lugar."
            />

            <FloatingWhatsApp
                phone={SUPPORT_WHATSAPP_PHONE}
                message="Hola, quiero información sobre AppsFly para mi óptica."
            />
        </div>
    );
}
