import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import HeroHome from './web/HeroHome.jsx';
import NewsHome from './web/NewsHome.jsx';
import PlansHome from './web/PlansHome.jsx';
import WhyHome from './web/WhyHome.jsx';
import NewsLetterHome from './web/NewsLetterHome.jsx';
import Footer from '../components/FooterComponent.jsx';

const HomePage = () => { 
    return (
        <div className="font-sans text-dark bg-white overflow-x-hidden selection:bg-primary selection:text-white">     
            <main>
                {/* Hero Section */}
                <HeroHome />
            
                {/* News / Updates Section */}
                <NewsHome/>            

                {/* Why AppsFly Section */}
                <WhyHome/>

                {/* Plans Section */}
                <PlansHome/>

                {/* Newsletter Section */}
                <NewsLetterHome/>
            </main>

            {/*Footer */}
            <Footer/>

            {/* Floating WhatsApp */}
            <motion.a
                href="https://wa.me/1234567890" 
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#128C7E] transition-colors z-50 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
            >
                <FaWhatsapp className="text-3xl" />
            </motion.a>
        </div>
    );
};

export default HomePage;
