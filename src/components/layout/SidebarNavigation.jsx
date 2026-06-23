import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../context/authContext.jsx";
import useTenantSubscriptionBlock from "../../hooks/useTenantSubscriptionBlock.js";
import formatName from "../../utils/formatName.js";
import { NAV_ITEMS, filterNavItemsByRole } from "./navigationConfig.js";
import useTenantPermissions from "../../hooks/useTenantPermissions.js";
import { getTenantRoleLabel } from "../../utils/tenantRoleLabels.js";

const PROFILE_NAV = [{ name: "Mi perfil", path: "/profile", icon: FaUserCircle }];

function NavLinks({ items, isActive, onNavigate, variant = "sidebar" }) {
  return items.map((item) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    if (variant === "mobile") {
      return (
        <Link
          key={item.path}
          to={item.path}
          onClick={onNavigate}
          className={
            active
              ? "flex items-center gap-3 rounded-lg bg-primary/20 px-3 py-3 text-base font-medium text-white no-underline"
              : "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-slate-300 hover:bg-white/5 hover:text-white no-underline transition-colors"
          }
        >
          <Icon className="text-lg opacity-90" />
          {item.name}
        </Link>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path}
        className={active ? "nav-item-active" : "nav-item-inactive"}
      >
        <Icon className="text-base shrink-0 opacity-90" />
        <span>{item.name}</span>
      </Link>
    );
  });
}

export default function SidebarNavigation() {
  const { user, logout } = useAuth();
  const { subscriptionLocked } = useTenantSubscriptionBlock();
  const { can } = useTenantPermissions();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const roleNavItems = filterNavItemsByRole(NAV_ITEMS, can);
  const filteredItems = subscriptionLocked ? PROFILE_NAV : roleNavItems;

  const closeMobile = () => setMobileOpen(false);
  const homePath = subscriptionLocked ? "/profile" : "/dashboard";

  return (
    <>
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-[260px] flex-col bg-dark border-r border-white/5">
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5 shrink-0">
          <Link to={homePath} className="no-underline group">
            <img
              src="/logo-appsfly-white.png"
              alt="AppsFly"
              className="w-28 h-auto object-contain"
            />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-1">
          {subscriptionLocked && (
            <p className="mb-3 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-3 text-xs text-amber-200/90 leading-relaxed">
              Membresía inactiva. Solo Perfil y Cerrar sesión están disponibles.
            </p>
          )}
          <NavLinks items={filteredItems} isActive={isActive} />
        </nav>

        <div className="border-t border-white/10 p-4 shrink-0">
          {user && (
            <p className="text-xs text-slate-400 mb-3 truncate">
              Hola,{" "}
              <span className="text-white font-semibold">
                {formatName(user?.userFirstName)}
              </span>
              {!subscriptionLocked && (
                <span className="block text-[10px] text-slate-500 mt-0.5 capitalize">
                  {getTenantRoleLabel(can("users:manage") ? "ADMIN" : "USER")}
                </span>
              )}
            </p>
          )}
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <FaSignOutAlt className="text-sm" />
            Salir
          </button>
        </div>
      </aside>

      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-dark border-b border-white/10 shadow-lg">
        <div className="flex h-full items-center justify-between px-4">
          <Link to={homePath} className="no-underline">
            <span className="text-lg font-bold font-display text-white">AppsFly</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="rounded-lg p-2 text-white hover:bg-white/10 transition-colors"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-40 bg-dark/60 backdrop-blur-sm"
              onClick={closeMobile}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="md:hidden fixed top-0 right-0 bottom-0 z-50 w-[min(85vw,320px)] bg-dark border-l border-white/10 flex flex-col shadow-2xl"
            >
              <div className="flex h-14 items-center justify-between border-b border-white/10 px-4 shrink-0">
                <span className="text-sm font-semibold text-slate-300">Menú</span>
                <button
                  type="button"
                  onClick={closeMobile}
                  className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/5"
                >
                  <FaTimes size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
                {user && (
                  <div className="mb-4 rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-300">
                    {formatName(user?.userFirstName)}
                  </div>
                )}
                {subscriptionLocked && (
                  <p className="mb-3 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-3 text-xs text-amber-200/90">
                    Membresía inactiva. Accede a Perfil o renueva tu plan.
                  </p>
                )}
                <NavLinks
                  items={filteredItems}
                  isActive={isActive}
                  onNavigate={closeMobile}
                  variant="mobile"
                />
              </div>

              <div className="border-t border-white/10 p-4 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeMobile();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors"
                >
                  <FaSignOutAlt />
                  Cerrar sesión
                </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
