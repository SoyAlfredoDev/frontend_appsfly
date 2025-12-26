import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebook, FaTwitter, FaTiktok, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#f2f4f7] pt-16 pb-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="text-2xl font-display font-bold text-[#021f41]">
              AppsFly
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              La plataforma todo en uno para gestionar tu negocio.
              Simple, potente y escalable.
            </p>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="font-bold text-[#021f41] mb-4 font-display">Producto</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <a href="#" className="hover:text-[#01c676] transition-colors">Características</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#01c676] transition-colors">Precios</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#01c676] transition-colors">Novedades</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#01c676] transition-colors">Integraciones</a>
              </li>
            </ul>
          </div>

          {/* Legal/Company Column */}
          <div>
            <h4 className="font-bold text-[#021f41] mb-4 font-display">Compañía</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <a href="#" className="hover:text-[#01c676] transition-colors">Nosotros</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#01c676] transition-colors">Contacto</a>
              </li>
              {/* Usamos Link para navegación interna rápida */}
              <li>
                <Link to="/politicas" className="hover:text-[#01c676] transition-colors">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link to="/terminos" className="hover:text-[#01c676] transition-colors">
                  Términos
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials Column */}
          <div>
            <h4 className="font-bold text-[#021f41] mb-4 font-display">Síguenos</h4>
            <div className="flex gap-4">
              <SocialLink href="https://www.instagram.com/appsfly.cl/" color="hover:bg-[#E1306C]" icon={<FaInstagram />} />
              <SocialLink href="https://www.facebook.com/61585307100875#" color="hover:bg-[#1877F2]" icon={<FaFacebook />} />
              <SocialLink href="https://twitter.com/appsfly_cl" color="hover:bg-black" icon={<FaTwitter />} /> {/* O X */}
              <SocialLink href="https://www.tiktok.com/@appsfly.software" color="hover:bg-black" icon={<FaTiktok />} />
              <SocialLink href="https://www.linkedin.com/company/appsfly/" color="hover:bg-[#0077b5]" icon={<FaLinkedin />} />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-gray-200 text-center text-gray-400 text-sm">
          <p>&copy; {currentYear} AppsFly. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

// Componente auxiliar para evitar repetir clases en los iconos sociales
const SocialLink = ({ href, icon, color }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className={`w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-500 ${color} hover:text-white transition-all shadow-sm`}
  >
    {icon}
  </a>
);

export default Footer;