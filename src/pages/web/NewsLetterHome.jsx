import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope } from 'react-icons/fa';
import { subscribeNewsletter } from '../../api/newsletter';

export default function NewsLetterHome() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState(null); // 'loading', 'success', 'error'

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;
        setStatus('loading');
        try {
            await subscribeNewsletter(email);
            setStatus('success');
            setEmail('');
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <section className="bg-primary py-10 md:py-24 font-sans relative overflow-hidden">
             {/* Background decoration (optional subtle patterns) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10 pointer-events-none">
                 <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-white rounded-full blur-3xl mix-blend-overlay"></div>
                 <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-secondary rounded-full blur-3xl mix-blend-multiply"></div>
            </div>

            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 md:p-12 rounded-3xl shadow-2xl"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6 text-white">
                        <FaEnvelope className="text-3xl" />
                    </div>
                    
                    <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 text-white">
                        Mantente actualizado
                    </h2>
                    
                    <p className="text-white/90 mb-8 text-base md:text-lg max-w-lg mx-auto leading-relaxed">
                        Recibe las últimas noticias, actualizaciones y tips para potenciar tu negocio SaaS directamente en tu bandeja.
                    </p>

                    <form onSubmit={handleSubscribe} className="max-w-lg mx-auto flex flex-col sm:flex-row gap-4">
                        <input
                            type="email"
                            placeholder="Tu correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 px-6 py-4 rounded-xl border border-white/30 bg-white/20 text-white placeholder:text-white/70 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50 transition-all font-medium"
                            required
                        />
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={status === 'loading' || status === 'success'}
                            className={`px-8 py-4 rounded-xl font-bold text-base transition-all shadow-lg min-w-[160px] flex items-center justify-center
                            ${status === 'success' 
                                ? 'bg-white text-primary cursor-default' 
                                : 'bg-dark text-white hover:bg-opacity-90 hover:shadow-xl'
                            }`}
                        >
                            {status === 'loading' ? (
                                <span className="flex items-center gap-2">Enviando...</span>
                            ) : status === 'success' ? (
                                '¡Suscrito!'
                            ) : (
                                'Suscribirse'
                            )}
                        </motion.button>
                    </form>
                    
                    {status === 'error' && (
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-100 bg-red-500/20 py-2 px-4 rounded-lg mt-4 text-sm font-medium inline-block border border-red-500/30"
                        >
                            Hubo un error al suscribirse. Inténtalo de nuevo.
                        </motion.p>
                    )}
                </motion.div>
            </div>
        </section>
    );
}