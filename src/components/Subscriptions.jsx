import { useState } from "react";
import { useAuth } from "../context/authContext.jsx"; 
import { useToast } from "../context/ToastContext.jsx";
import { v4 as uuidv4 } from "uuid";
import { createSubscriptionRequest } from "../api/subscription.js";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { FaCheck, FaStar, FaArrowRight } from "react-icons/fa";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 }, // Reduje el movimiento para que sea más sutil
    visible: { opacity: 1, y: 0 }
};

export default function Subscription() {
    const { businessSelected, setSubscriptions } = useAuth();
    const navigate = useNavigate();
    const [subscribingId, setSubscribingId] = useState(null);
    const toast = useToast();

    const plan = {
        planId: 'P001',
        planName: 'Plan Básico',
        regularPrice: 9990,
        promoPrice: 0,
        promoDuration: 2,
        features: [
            "Hasta 5 usuarios",
            "Módulo de Compras y Ventas",
            "Control de Inventario",
            "Reportes Inteligentes",
            "Soporte Prioritario 24/7"
        ]
    };

    const handleSubscribe = async (selectedPlan) => {
        if (subscribingId) return;
        try {
            setSubscribingId(selectedPlan.planId);
            const newSubscription = {
                subscriptionId: uuidv4(),
                subscriptionBusinessId: businessSelected?.userBusinessBusinessId,
                subscriptionPlanId: selectedPlan.planId,
                subscriptionPaymentMethod: null 
            };
            const res = await createSubscriptionRequest(newSubscription);
            if (res.status === 201) {
                setSubscriptions(true); 
                toast.success(
                    "Suscripción exitosa", 
                    "Tu cuenta ha sido actualizada correctamente"
                )
                setTimeout(() => navigate("/logout"), 5000);
            } else {
                setSubscribingId(null);  
                toast.error(
                    "Error al procesar la suscripción", 
                    "Error al procesar la suscripción, reinicia la página e intente nuevamente"
                )

            }
        } catch (error) {
            setSubscribingId(null);
            console.error(error);
            toast.error(
                "Error al procesar la suscripción", 
                "Error al procesar la suscripción, reinicia la página e intente nuevamente"
            )
        }
    };

    return (        
        <div className="bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 font-inter text-[#021f41] overflow-hidden">
            <Motion.div 
                className="max-w-6xl w-full mx-auto" 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* CAMBIO: Reduje el gap de gap-12/24 a gap-8/16 para juntar más las dos columnas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                    
                    {/* SECCIÓN IZQUIERDA: Texto */}
                    <div className="text-center lg:text-left">
                        <Motion.h2 
                            variants={itemVariants}
                            // CAMBIO: Tamaños de fuente reducidos (text-4xl lg:text-5xl en vez de 6xl)
                            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-chillax text-[#021f41] leading-tight"
                        >  
                            Impulsa tu negocio <br className="hidden lg:block"/>
                            <span className="text-[#094fd1]">sin costos iniciales</span>
                        </Motion.h2>
                        
                        <Motion.p 
                            variants={itemVariants}
                            // CAMBIO: Texto base en vez de lg o xl
                            className="text-base text-gray-500 mb-6 max-w-lg mx-auto lg:mx-0 leading-relaxed"
                        >
                            La plataforma todo-en-uno para gestionar tus ventas e inventario. 
                            Únete a cientos de empresas que ya usan <strong>AppsFly</strong>.
                        </Motion.p>

                        <Motion.div variants={itemVariants} className="hidden lg:flex items-center gap-3 text-sm font-medium text-gray-400">
                           <div className="flex -space-x-2">
                                {[1,2,3].map(i => (
                                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" />
                                    </div>
                                ))}
                           </div>
                           <p className="text-xs">Confían en nosotros</p>
                        </Motion.div>
                    </div>

                    {/* SECCIÓN DERECHA: La Tarjeta */}
                    <div className="flex justify-center lg:justify-end">
                        <Motion.div 
                            key={plan.planId}
                            variants={itemVariants}
                            // CAMBIO: max-w-sm (aprox 384px) es más pequeño que los 420px anteriores
                            className="relative w-full max-w-sm bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 transform transition-all duration-300 hover:scale-[1.01]"
                        >                       
                            {/* Badge un poco más pequeño */}
                            <div className="absolute top-0 right-0 bg-[#094fd1] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10 uppercase tracking-wide">
                                Oferta Lanzamiento
                            </div>                                

                            {/* CAMBIO: Padding interno reducido de p-8 a p-6 */}
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-xl font-bold font-chillax text-[#021f41]">
                                        {plan.planName}
                                    </h3>
                                    <div className="bg-yellow-50 p-1.5 rounded-full">
                                        <FaStar className="text-yellow-400 text-lg" />
                                    </div>
                                </div>

                                {/* PRECIO */}
                                <div className="mt-4 mb-5">
                                    <div className="flex items-end gap-2">
                                        {/* CAMBIO: Precio reducido de text-6xl a text-5xl */}
                                        <span className="text-5xl font-extrabold text-[#01c676] tracking-tight">
                                            ${plan.promoPrice}
                                        </span>
                                        <div className="flex flex-col mb-1">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">Por 2 meses</span>
                                            <span className="text-gray-500 text-xs font-medium">luego ${plan.regularPrice.toLocaleString("es-CL")}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* LISTA COMPACTA */}
                                {/* CAMBIO: Padding y espacios reducidos */}
                                <div className="bg-gray-50/50 rounded-lg p-4 mb-6 border border-gray-100">
                                    <ul className="space-y-2">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-3">
                                                <div className="flex-shrink-0 bg-green-100 rounded-full p-0.5">
                                                    <FaCheck className="h-2.5 w-2.5 text-[#01c676]" />
                                                </div>
                                                {/* Fuente más pequeña en la lista */}
                                                <span className="text-sm text-gray-600 font-medium">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* BOTÓN COMPACTO */}
                                <button
                                    onClick={() => handleSubscribe(plan)}
                                    disabled={!!subscribingId}
                                    // CAMBIO: py-3 en lugar de py-4
                                    className={`group w-full py-3 px-4 rounded-lg font-bold text-sm text-white shadow-md shadow-green-500/20 transition-all duration-200 flex items-center justify-center gap-2
                                    ${subscribingId 
                                        ? 'bg-gray-100 cursor-not-allowed text-gray-400 shadow-none' 
                                        : 'bg-[#01c676] hover:bg-[#00b067] hover:-translate-y-0.5'
                                    }`}
                                >
                                    {subscribingId === plan.planId ? (
                                        <>Procesando...</>
                                    ) : (
                                        <>
                                            Obtener 2 meses gratis
                                            <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-[10px] text-gray-400 mt-3">
                                    Sin tarjeta de crédito requerida.
                                </p>
                            </div>
                        </Motion.div>                   
                    </div>
                    
                </div>
            </Motion.div>
        </div>
    );
}