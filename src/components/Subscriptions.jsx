import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext.jsx";
import { v4 as uuidv4 } from "uuid";
import { createSubscriptionRequest } from "../api/subscription.js";
import { getPlansRequest } from "../api/plans.js";
import { useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaCrown, FaStar, FaRocket } from "react-icons/fa";

export default function Subscription() {
    const { setSubscriptions, businessSelected } = useAuth();
    const navigate = useNavigate();

    const [plans, setPlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [subscribingId, setSubscribingId] = useState(null); // ID del plan que se está procesando

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await getPlansRequest();
                const fetchedPlans = res.data || [];
                // Ordenar planes por precio (opcional)
                fetchedPlans.sort((a, b) => a.planPrice - b.planPrice);
                setPlans(fetchedPlans);
            } catch (error) {
                console.error("Error fetching plans:", error);
            } finally {
                setLoadingPlans(false);
            }
        };

        fetchPlans();
    }, []);

    const handleSubscribe = async (plan) => {
        if (subscribingId) return; // Prevenir doble clic

        try {
            setSubscribingId(plan.planId);
            
            const newSubscription = {
                subscriptionId: uuidv4(),
                subscriptionBusinessId: businessSelected.userBusinessBusinessId,
                subscriptionPlanId: plan.planId,
                subscriptionPaymentMethod: null // Se puede extender para pagos reales
            };

            const res = await createSubscriptionRequest(newSubscription);

            if (res.status === 201) {
                setSubscriptions(true);
                // Mostrar éxito visual brevemente antes de navegar
                setTimeout(() => {
                    alert("¡Suscripción exitosa! Inicia sesión nuevamente para actualizar tu cuenta.");
                    navigate("/logout");
                }, 500);
            }
        } catch (error) {
            console.error(error);
            alert("Error al suscribirse. Por favor intenta nuevamente.");
            setSubscribingId(null);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loadingPlans) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="animate-spin h-10 w-10 border-4 border-blue-600 rounded-full border-t-transparent"></div>
                <p className="mt-4 text-gray-500 font-medium">Cargando planes disponibles...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Motion.div 
                className="max-w-7xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                  
                    <Motion.h2 
                        variants={itemVariants}
                        className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6"
                    >  
                        Elige el plan perfecto para <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            tu negocio
                        </span>
                    </Motion.h2>
                    <Motion.p 
                        variants={itemVariants}
                        className="text-xl text-gray-500"
                    >
                        Comienza gratis o mejora tu plan para desbloquear todo el potencial de AppsFly.
                    </Motion.p>
                </div>

                {/* Plans Grid */}
                {plans.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-gray-100">
                        <p className="text-gray-500">No hay planes disponibles en este momento.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                        {plans.map((plan) => {
                            const isPopular = plan.planName?.toLowerCase().includes('pro') || plan.planName?.toLowerCase().includes('avanzado');
                            const isFree = plan.planPrice === 0 || plan.planId === 'P001'; // Asumiendo P001 es free
                            
                            return (
                                <Motion.div 
                                    key={plan.planId}
                                    variants={itemVariants}
                                    className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border ${isPopular ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-10' : 'border-gray-100'}`}
                                >
                                    {isPopular && (
                                        <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                                            POPULAR
                                        </div>
                                    )}

                                    <div className="p-8">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-bold text-gray-900">{plan.planName}</h3>
                                            {isFree ? (
                                                <FaStar className="text-yellow-400 text-2xl" />
                                            ) : isPopular ? (
                                                <FaCrown className="text-blue-600 text-2xl" />
                                            ) : (
                                                <FaRocket className="text-indigo-500 text-2xl" />
                                            )}
                                        </div>

                                        <div className="flex items-baseline mb-6">
                                            <span className="text-4xl font-extrabold text-gray-900">
                                                ${plan.planPrice?.toLocaleString("es-CL")}
                                            </span>
                                            <span className="ml-2 text-gray-500 font-medium">/mes</span>
                                        </div>

                                        <p className="text-gray-500 text-sm mb-6 min-h-[40px]">
                                            {plan.planDescription || "La mejor opción para gestionar tu negocio de manera eficiente."}
                                        </p>

                                        <button
                                            onClick={() => handleSubscribe(plan)}
                                            disabled={!!subscribingId}
                                            className={`w-full py-3 px-6 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center
                                                ${subscribingId === plan.planId 
                                                    ? 'bg-blue-50 text-blue-600 cursor-not-allowed' 
                                                    : isPopular 
                                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200' 
                                                        : 'bg-gray-900 text-white hover:bg-gray-800'
                                                }`}
                                        >
                                            {subscribingId === plan.planId ? (
                                                <>
                                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                                                    Procesando...
                                                </>
                                            ) : (
                                                "Suscribirse Ahora"
                                            )}
                                        </button>
                                    </div>

                                    <div className="px-8 pb-8 pt-2 bg-gray-50 border-t border-gray-100 h-full">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                                            LO QUE INCLUYE:
                                        </p>
                                       {/**
                                        * 
                                        * 
                                        * 
                                        */}
                                    </div>
                                </Motion.div>
                            );
                        })}
                    </div>
                )}
                
                <Motion.div variants={itemVariants} className="text-center mt-12">
                    <p className="text-gray-400 text-sm">
                        Todos los precios están en Pesos Chilenos (CLP) e incluyen IVA.
                    </p>
                </Motion.div>

            </Motion.div>
        </div>
    );
}
