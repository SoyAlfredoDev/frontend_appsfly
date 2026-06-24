import HeroHome from './web/HeroHome.jsx';
import NavbarHome from './web/NavbarHome.jsx';
import WhatIsAppsFlyHome from './web/WhatIsAppsFlyHome.jsx';
import SalesCustomersHome from './web/SalesCustomersHome.jsx';
import ProductsInventoryHome from './web/ProductsInventoryHome.jsx';
import AIAssistantHome from './web/AIAssistantHome.jsx';
import WhatsAppNotificationsHome from './web/WhatsAppNotificationsHome.jsx';
import NewsHome from './web/NewsHome.jsx';
import PlansHome from './web/PlansHome.jsx';
import WhyHome from './web/WhyHome.jsx';
import NewsLetterHome from './web/NewsLetterHome.jsx';
import Footer from '../components/FooterComponent.jsx';
import FloatingWhatsApp from '../components/web/FloatingWhatsApp.jsx';
import { SUPPORT_WHATSAPP_PHONE } from '../constants/supportContact.js';

const HomePage = () => { 
    return (
        <div className="font-sans text-dark bg-white overflow-x-hidden selection:bg-primary selection:text-white">
            <NavbarHome />

            <main>
                <div id="inicio">
                    <HeroHome />
                </div>

                <div id="que-es" className="scroll-mt-20">
                    <WhatIsAppsFlyHome />
                </div>

                <div id="ventas-clientes" className="scroll-mt-20">
                    <SalesCustomersHome />
                </div>

                <div id="productos-inventario" className="scroll-mt-20">
                    <ProductsInventoryHome />
                </div>

                <div id="inteligencia-artificial" className="scroll-mt-20">
                    <AIAssistantHome />
                </div>

                <div id="notificaciones-whatsapp" className="scroll-mt-20">
                    <WhatsAppNotificationsHome />
                </div>

                <div id="novedades" className="scroll-mt-20">
                    <NewsHome />
                </div>

                <div id="por-que" className="scroll-mt-20">
                    <WhyHome />
                </div>

                <div id="planes" className="scroll-mt-20">
                    <PlansHome />
                </div>

                <div id="newsletter" className="scroll-mt-20">
                    <NewsLetterHome />
                </div>
            </main>

            {/*Footer */}
            <Footer/>

            <FloatingWhatsApp phone={SUPPORT_WHATSAPP_PHONE} />
        </div>
    );
};

export default HomePage;
