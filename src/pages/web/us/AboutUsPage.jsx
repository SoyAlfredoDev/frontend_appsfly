import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaUsers, FaRocket, FaShieldAlt } from "react-icons/fa";
import NavbarHome from "../NavbarHome.jsx";
import Footer from "../../../components/FooterComponent";
import FloatingWhatsApp from "../../../components/web/FloatingWhatsApp.jsx";

const AboutUsPage = () => {
  const [activeSection, setActiveSection] = useState("who-we-are");

  const sections = [
    { id: "who-we-are", title: "Quiénes Somos", icon: <FaUsers /> },
    { id: "what-is-appsfly", title: "¿Qué es AppsFly?", icon: <FaRocket /> },
    {
      id: "tech-security",
      title: "Tecnología y Seguridad",
      icon: <FaShieldAlt />,
    },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  };

  // Update active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150; // Offset for sticky header

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="font-sans text-gray-600 bg-white min-h-screen selection:bg-[#01c676] selection:text-white">
      {/* Header / Navbar */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <NavbarHome />
      </div>

      <main className="relative">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10">
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#01c676] rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-[#094fd1] rounded-full blur-[120px]"></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10 text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-display font-bold text-[#021f41] mb-6 tracking-tight"
              style={{ fontFamily: '"Chillax", sans-serif' }}
            >
              Sobre <span className="text-[#01c676]">Nosotros</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto"
            >
              Profesionales apasionados por la innovación y la creación de
              soluciones digitales que transforman negocios.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 inline-block px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-sm text-gray-500"
            >
              El equipo AppsFly
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Sidebar Navigation (Sticky) */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-32 space-y-2">
                <h3 className="text-[#021f41] font-bold mb-4 px-4 text-lg">
                  Índice
                </h3>
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 group ${
                      activeSection === section.id
                        ? "bg-[#01c676]/10 text-[#01c676] border-l-4 border-[#01c676]"
                        : "text-gray-500 hover:bg-gray-50 hover:text-[#01c676]"
                    }`}
                  >
                    <span
                      className={`text-lg ${activeSection === section.id ? "text-[#01c676]" : "text-gray-400 group-hover:text-[#01c676]"}`}
                    >
                      {section.icon}
                    </span>
                    <span className="font-medium text-sm">{section.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-9 space-y-16">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-16"
              >
                {/* Who We Are */}
                <motion.section
                  id="who-we-are"
                  variants={itemVariants}
                  className="scroll-mt-32"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-[#094fd1]/10 text-[#094fd1]">
                      <FaUsers className="text-2xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#021f41] mb-2 font-display">
                        Quiénes Somos
                      </h2>
                      <div className="h-1 w-20 bg-gradient-to-r from-[#094fd1] to-transparent rounded-full mb-6"></div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 hover:border-[#094fd1]/30 transition-colors">
                    <p className="leading-relaxed text-gray-600 mb-4">
                      Somos un equipo de profesionales apasionados por la
                      innovación y la creación de sistemas digitales. Nos
                      especializamos en desarrollar soluciones tecnológicas de
                      alta calidad que simplifican lo complejo.
                    </p>
                    <p className="leading-relaxed text-gray-600">
                      Nuestro enfoque está en construir herramientas robustas y
                      modernas que impulsen la eficiencia operativa, permitiendo
                      a los dueños de negocios gestionar su crecimiento con
                      total confianza y claridad.
                    </p>
                  </div>
                </motion.section>

                {/* What Is AppsFly */}
                <motion.section
                  id="what-is-appsfly"
                  variants={itemVariants}
                  className="scroll-mt-32"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-[#01c676]/10 text-[#01c676]">
                      <FaRocket className="text-2xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#021f41] mb-2 font-display">
                        ¿Qué es AppsFly?
                      </h2>
                      <div className="h-1 w-20 bg-gradient-to-r from-[#01c676] to-transparent rounded-full mb-6"></div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 hover:border-[#01c676]/30 transition-colors">
                    <p className="leading-relaxed text-gray-600 mb-4">
                      AppsFly es un{" "}
                      <strong>SaaS (Software as a Service)</strong> diseñado
                      para ser el centro de control de tu empresa. Es la
                      herramienta definitiva para llevar un registro preciso de
                      tus ventas, gestión de clientes, inventarios y reportes en
                      tiempo real.
                    </p>
                    <div className="bg-[#01c676]/5 p-4 rounded-lg border border-[#01c676]/10">
                      <p className="text-gray-600 text-sm">
                        Más que un software estático, AppsFly es una plataforma
                        en constante crecimiento: evolucionamos continuamente,
                        agregando nuevas funciones y mejoras para asegurarnos de
                        que tu negocio siempre cuente con la tecnología más
                        actual para enfrentar los retos del mercado.
                      </p>
                    </div>
                  </div>
                </motion.section>

                {/* Technology & Security */}
                <motion.section
                  id="tech-security"
                  variants={itemVariants}
                  className="scroll-mt-32"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                      <FaShieldAlt className="text-2xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#021f41] mb-2 font-display">
                        Tecnología y Seguridad Blindada
                      </h2>
                      <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-transparent rounded-full mb-6"></div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 hover:border-purple-500/30 transition-colors">
                    <p className="leading-relaxed text-gray-600 mb-6">
                      La seguridad no es una opción, es la base de nuestra
                      arquitectura. AppsFly está construido con tecnologías
                      modernas que garantizan una experiencia fluida, pero
                      nuestra mayor fortaleza es la privacidad de tus datos.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h4 className="text-[#021f41] font-bold mb-2 text-sm uppercase tracking-wide">
                          Aislamiento Estricto
                        </h4>
                        <p className="text-sm text-gray-500">
                          Al crear tu cuenta, generamos automáticamente una base
                          de datos física y exclusiva para tu negocio.
                        </p>
                      </div>
                      <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h4 className="text-[#021f41] font-bold mb-2 text-sm uppercase tracking-wide">
                          Privacidad Superior
                        </h4>
                        <p className="text-sm text-gray-500">
                          Tu información está 'blindada' y separada de cualquier
                          otro usuario, ofreciéndote un nivel de seguridad
                          superior al estándar.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.section>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      <FloatingWhatsApp />
    </div>
  );
};

export default AboutUsPage;
