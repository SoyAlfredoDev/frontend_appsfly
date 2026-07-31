import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaUserCircle,
  FaChevronDown,
  FaEye,
} from "react-icons/fa";
import { useAuth } from "../../context/authContext.jsx";
import useTenantSubscriptionBlock from "../../hooks/useTenantSubscriptionBlock.js";
import formatName from "../../utils/formatName.js";
import {
  getNavigationForBusiness,
  isNavPathActive,
} from "./navigationConfig.js";
import useTenantPermissions from "../../hooks/useTenantPermissions.js";
import { getTenantRoleLabel } from "../../utils/tenantRoleLabels.js";
import { isOpticsBusiness } from "../../utils/businessModality.js";

const PROFILE_NAV = {
  type: "flat",
  items: [{ name: "Mi perfil", path: "/profile", icon: FaUserCircle }],
};

function LeafLink({ item, active, onNavigate, variant = "sidebar", nested = false }) {
  const Icon = item.icon;

  if (variant === "mobile") {
    return (
      <Link
        to={item.path}
        onClick={onNavigate}
        className={
          active
            ? `flex items-center gap-3 rounded-lg bg-primary/20 px-3 py-3 text-base font-medium text-white no-underline ${nested ? "pl-10" : ""}`
            : `flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-slate-300 hover:bg-white/5 hover:text-white no-underline transition-colors ${nested ? "pl-10" : ""}`
        }
      >
        {Icon ? <Icon className="text-lg opacity-90 shrink-0" /> : null}
        {item.name}
      </Link>
    );
  }

  return (
    <Link
      to={item.path}
      onClick={onNavigate}
      className={`${active ? "nav-item-active" : "nav-item-inactive"} ${nested ? "!py-2 !text-[13px] pl-9" : ""}`}
    >
      {Icon ? <Icon className="text-base shrink-0 opacity-90" /> : null}
      <span>{item.name}</span>
    </Link>
  );
}

function NavGroup({ group, pathname, onNavigate, variant = "sidebar" }) {
  const children = group.children || [];
  const childActive = children.some((child) => isNavPathActive(pathname, child.path));
  // Colapsados por defecto; se abren si la ruta actual pertenece al grupo
  const [open, setOpen] = useState(childActive);
  const Icon = group.icon;

  useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive, pathname]);

  const groupBtnClass =
    variant === "mobile"
      ? childActive
        ? "flex w-full items-center gap-3 rounded-lg bg-primary/10 px-3 py-3 text-base font-medium text-white"
        : "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
      : childActive
        ? "nav-item-active w-full cursor-pointer border-0 bg-transparent text-left"
        : "nav-item-inactive w-full cursor-pointer border-0 bg-transparent text-left";

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={groupBtnClass}
        aria-expanded={open}
      >
        {Icon ? <Icon className={`${variant === "mobile" ? "text-lg" : "text-base"} shrink-0 opacity-90`} /> : null}
        <span className="flex-1 text-left">{group.name}</span>
        <FaChevronDown
          className={`text-xs opacity-60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden space-y-0.5"
          >
            {children.map((child) => (
              <LeafLink
                key={child.path}
                item={child}
                active={isNavPathActive(pathname, child.path)}
                onNavigate={onNavigate}
                variant={variant}
                nested
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavTree({ items, pathname, onNavigate, variant = "sidebar" }) {
  return items.map((node) => {
    if (node.children?.length) {
      return (
        <NavGroup
          key={node.id || node.name}
          group={node}
          pathname={pathname}
          onNavigate={onNavigate}
          variant={variant}
        />
      );
    }

    return (
      <LeafLink
        key={node.path}
        item={node}
        active={isNavPathActive(pathname, node.path)}
        onNavigate={onNavigate}
        variant={variant}
      />
    );
  });
}

function FlatNav({ items, pathname, onNavigate, variant = "sidebar" }) {
  return items.map((item) => (
    <LeafLink
      key={item.path}
      item={item}
      active={isNavPathActive(pathname, item.path)}
      onNavigate={onNavigate}
      variant={variant}
    />
  ));
}

export default function SidebarNavigation() {
  const { user, business, logout } = useAuth();
  const { subscriptionLocked } = useTenantSubscriptionBlock();
  const { can } = useTenantPermissions();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = useMemo(() => {
    if (subscriptionLocked) return PROFILE_NAV;
    return getNavigationForBusiness(business, can);
  }, [subscriptionLocked, business, can]);

  const closeMobile = () => setMobileOpen(false);
  const homePath = subscriptionLocked ? "/profile" : "/dashboard";
  const isOptics = isOpticsBusiness(business);

  const renderNav = (variant) =>
    navigation.type === "tree" ? (
      <NavTree
        items={navigation.items}
        pathname={location.pathname}
        onNavigate={variant === "mobile" ? closeMobile : undefined}
        variant={variant}
      />
    ) : (
      <FlatNav
        items={navigation.items}
        pathname={location.pathname}
        onNavigate={variant === "mobile" ? closeMobile : undefined}
        variant={variant}
      />
    );

  return (
    <>
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-[260px] flex-col bg-dark border-r border-white/5">
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5 shrink-0">
          <Link to={homePath} className="no-underline group shrink-0">
            <img
              src="/logo-appsfly-white.png"
              alt="AppsFly"
              className="w-24 h-auto object-contain"
            />
          </Link>
          {isOptics && (
            <div
              className="flex items-center gap-1.5 rounded-md border border-teal-400/30 bg-teal-500/15 px-2 py-1 text-teal-200"
              title="Modalidad Óptica"
            >
              <FaEye className="text-[10px] opacity-90" aria-hidden />
              <span className="text-[10px] font-semibold uppercase tracking-wider leading-none">
                Óptica
              </span>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-1">
          {subscriptionLocked && (
            <p className="mb-3 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-3 text-xs text-amber-200/90 leading-relaxed">
              Membresía inactiva. Solo Perfil y Cerrar sesión están disponibles.
            </p>
          )}
          {renderNav("sidebar")}
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
          <Link to={homePath} className="no-underline flex items-center gap-2 min-w-0">
            <span className="text-lg font-bold font-display text-white">AppsFly</span>
            {isOptics && (
              <span className="inline-flex items-center gap-1 rounded-md border border-teal-400/30 bg-teal-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal-200">
                <FaEye className="text-[9px]" aria-hidden />
                Óptica
              </span>
            )}
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
                {renderNav("mobile")}
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
