import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const PRIMARY = "#01c676";
const DARK = "#021f41";
const MUTED = "#6b7280";
const BORDER = "#e5e7eb";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingHorizontal: 48,
    paddingBottom: 56,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: DARK,
  },
  coverTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: DARK,
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 13,
    color: MUTED,
    marginBottom: 24,
  },
  coverAccent: {
    height: 4,
    width: 80,
    backgroundColor: PRIMARY,
    marginBottom: 24,
  },
  coverMeta: {
    fontSize: 9,
    color: MUTED,
    marginBottom: 4,
  },
  phaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  phaseBadge: {
    backgroundColor: PRIMARY,
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  phaseTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: DARK,
  },
  phaseDesc: {
    fontSize: 9,
    color: MUTED,
    marginBottom: 10,
    lineHeight: 1.5,
  },
  itemRow: {
    flexDirection: "row",
    marginBottom: 8,
    paddingLeft: 4,
  },
  itemNumber: {
    width: 22,
    fontSize: 10,
    fontWeight: "bold",
    color: PRIMARY,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
  },
  itemDetail: {
    fontSize: 9,
    color: MUTED,
    lineHeight: 1.45,
  },
  summaryBox: {
    marginTop: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    backgroundColor: "#f9fafb",
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    color: DARK,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  summaryLabel: {
    width: 90,
    fontSize: 9,
    fontWeight: "bold",
    color: PRIMARY,
  },
  summaryText: {
    flex: 1,
    fontSize: 9,
    color: MUTED,
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: MUTED,
  },
  statusSection: {
    marginTop: 16,
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
  },
  statusItem: {
    fontSize: 9,
    color: MUTED,
    marginBottom: 4,
    lineHeight: 1.4,
  },
});

const phases = [
  {
    id: "1",
    title: "Corregir lo roto",
    subtitle: "Impacto inmediato",
    description:
      "Prioridad máxima: funcionalidades incompletas, rutas rotas y brechas de seguridad que afectan al usuario hoy.",
    items: [
      {
        title: "Transacciones reales",
        detail:
          "TransactionsPage usa datos mock. Conectar GET real y habilitar POST /transactions en el backend (controlador existe, ruta no registrada).",
      },
      {
        title: "Detalle de compras",
        detail:
          "El botón ver en PurchasePage navega a /purchase/view/:id, ruta inexistente. Crear ViewPurchasePage o retirar el enlace.",
      },
      {
        title: "Seguridad admin",
        detail:
          "Proteger /admin/* en backend (authRequired + super-admin) y frontend (AdminRoute). Hoy cualquier usuario logueado puede acceder.",
      },
      {
        title: "Detalle de venta",
        detail:
          "ViewSalePage: corregir spinner infinito en error, reemplazar alert() por toasts y alinear con patrón Gastos.",
      },
    ],
  },
  {
    id: "2",
    title: "Completar unificación visual",
    subtitle: "Consistencia de producto",
    description:
      "Extender ExpensePageLayout, tokens primary (#01c676) y sistema toast/confirm al resto de vistas.",
    items: [
      {
        title: "Migrar vistas detalle y formulario",
        detail:
          "ViewSalePage, NewPurchasePage, CustomerViewPage y ProfilePage → layout Expense + primary + toasts.",
      },
      {
        title: "Alinear referencia Gastos",
        detail:
          "ExpensesPage es source of truth visual pero no usa ExpensePageLayout ni useAbortEffect.",
      },
      {
        title: "Fetch seguro en listados",
        detail:
          "Aplicar useAbortEffect en CustomerPage, ProviderPage, SalesPage, PurchasePage y ExpensesPage.",
      },
      {
        title: "Eliminar SweetAlert2",
        detail:
          "UserGuestPage, UserGuestPendient, UserNewDashboardPage, RegisterBusinessPage, CategoryModal → useToast/useConfirm.",
      },
    ],
  },
  {
    id: "3",
    title: "Limpiar deuda técnica",
    subtitle: "Código más mantenible",
    description:
      "Reducir dependencias legacy, eliminar duplicados y borrar archivos obsoletos.",
    items: [
      {
        title: "Unificar finanzas",
        detail:
          "Decidir si FinancePage (Bootstrap) se fusiona con TransactionsPage o se elimina. Dos UIs para lo mismo.",
      },
      {
        title: "Migrar módulo admin",
        detail:
          "TicketsAdminPage, TicketDetailAdminPage y DashboardAdminPage fuera de Bootstrap hacia patrón Expense.",
      },
      {
        title: "Borrar código muerto",
        detail: "AddDailySaleModal, AddTicketModal, SetionHeader — ya reemplazados por flujos modernos.",
      },
      {
        title: "Quitar Bootstrap del bundle",
        detail: "Eliminar dependencia cuando no quede ningún uso activo en modales ni páginas.",
      },
    ],
  },
  {
    id: "4",
    title: "Rendimiento y resiliencia",
    subtitle: "Escalar con confianza",
    description:
      "Optimizar carga inicial, endurecer errores y preparar la app para producción a escala.",
    items: [
      {
        title: "Code-splitting por rutas",
        detail:
          "React.lazy en admin, PDF (ViewSalePage) y páginas con gráficos. Bundle actual ~3.2 MB.",
      },
      {
        title: "Unificar librería de gráficos",
        detail: "Elegir Recharts o Chart.js — hoy conviven ambas en distintas páginas.",
      },
      {
        title: "Optimizar cierre masivo",
        detail:
          "Batch en backend para closeAllPendingClosures en tenants con muchos días pendientes.",
      },
      {
        title: "ErrorBoundary",
        detail: "Envolver Outlet en AppLayout para evitar pantallas en blanco ante errores de render.",
      },
      {
        title: "Tests básicos",
        detail: "Vitest + smoke tests: auth, creación de ventas y estado de cierre diario.",
      },
    ],
  },
  {
    id: "5",
    title: "Pulido y consistencia",
    subtitle: "Experiencia premium",
    description: "Detalles finales que elevan la percepción de calidad del producto.",
    items: [
      {
        title: "Dashboard paralelo",
        detail: "UsersDashboardPage: convertir 4 peticiones secuenciales en Promise.all.",
      },
      {
        title: "Soporte",
        detail: "Migrar SupportPage UI y decidir inclusión en navigationConfig (sidebar).",
      },
      {
        title: "Documentación de diseño",
        detail: "Alinear DESIGN_GUIDE.md con index.css y expenseUiPatterns.js (verde #01c676).",
      },
      {
        title: "Auth y onboarding",
        detail: "Limpiar emerald-* restante en registro, recuperar contraseña y confirmación de cuenta.",
      },
    ],
  },
];

const timeline = [
  { label: "Esta semana", text: "Fase 1 completa — transacciones, compras, admin, ViewSale." },
  { label: "Siguiente", text: "Fase 2 — detalles, fetch seguro y eliminación de SweetAlert2." },
  { label: "Después", text: "Fases 3 y 4 — limpieza, lazy loading y tests." },
  { label: "Cuando estabilice", text: "Fase 5 — pulido final y documentación." },
];

function PhaseBlock({ phase, startNumber }) {
  return (
    <View wrap={false}>
      <View style={styles.phaseHeader}>
        <Text style={styles.phaseBadge}>FASE {phase.id}</Text>
        <Text style={styles.phaseTitle}>{phase.title}</Text>
      </View>
      <Text style={styles.phaseDesc}>
        {phase.subtitle} — {phase.description}
      </Text>
      {phase.items.map((item, i) => (
        <View key={item.title} style={styles.itemRow}>
          <Text style={styles.itemNumber}>{startNumber + i}.</Text>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemDetail}>{item.detail}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export default function RoadmapDocument() {
  let itemCounter = 1;
  const phaseStarts = phases.map((p) => {
    const start = itemCounter;
    itemCounter += p.items.length;
    return start;
  });

  return (
    <Document title="AppsFly — Próximos Pasos" author="AppsFly">
      <Page size="A4" style={styles.page}>
        <View style={styles.coverAccent} />
        <Text style={styles.coverTitle}>AppsFly</Text>
        <Text style={styles.coverSubtitle}>Hoja de ruta — Próximos pasos de evolución</Text>
        <Text style={styles.coverMeta}>Generado: junio 2026</Text>
        <Text style={styles.coverMeta}>Estado: post-auditoría de rendimiento y migración UI</Text>

        <View style={styles.statusSection}>
          <Text style={styles.statusTitle}>Estado actual</Text>
          <Text style={styles.statusItem}>
            • Listados principales, cierres diarios y nueva venta migrados al patrón Gastos.
          </Text>
          <Text style={styles.statusItem}>
            • useAbortEffect aplicado en Usuarios, Productos, Cierres, Nueva Venta y detalle de cierre.
          </Text>
          <Text style={styles.statusItem}>
            • Pendiente: detalles, admin, transacciones reales, code-splitting y tests.
          </Text>
        </View>

        {phases.slice(0, 2).map((phase, idx) => (
          <PhaseBlock key={phase.id} phase={phase} startNumber={phaseStarts[idx]} />
        ))}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>AppsFly — Documento interno de planificación</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        {phases.slice(2).map((phase, idx) => (
          <PhaseBlock key={phase.id} phase={phase} startNumber={phaseStarts[idx + 2]} />
        ))}

        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Orden sugerido para empezar</Text>
          {timeline.map((row) => (
            <View key={row.label} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{row.label}</Text>
              <Text style={styles.summaryText}>{row.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 9, color: MUTED, lineHeight: 1.5 }}>
            La app ya se siente fluida en los flujos migrados. El siguiente salto de calidad viene de
            cerrar funcionalidades incompletas y llevar el mismo estándar a detalle, admin y onboarding.
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>AppsFly — Documento interno de planificación</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
