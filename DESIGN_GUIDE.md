# AppsFly Design Guide

## 1. Visión General
El objetivo es lograr una interfaz **moderna, limpia y profesional**, inspirada en fintechs como Mercado Pago o Nubank.
Se prioriza el uso de espacio en blanco, tipografía legible (sans-serif), sombras suaves para profundidad y colores vibrantes para acciones principales.

## 2. Paleta de Colores

### Brand Colors (Identidad)
Usaremos un gradiente principal que ya está presente en el Home, pero lo estandarizaremos.
- **Primary Blue**: `#2563EB` (Tailwind `blue-600`) - Acción principal, enlaces, bordes activos.
- **Primary Purple**: `#9333EA` (Tailwind `purple-600`) - Gradientes, acentos.
- **Brand Gradient**: `bg-gradient-to-r from-blue-600 to-purple-600`

### Semantic Colors (Estado)
- **Success**: `#10B981` (Tailwind `emerald-500`) - Confirmaciones, ventas, dinero positivo.
- **Warning**: `#F59E0B` (Tailwind `amber-500`) - Alertas, pendientes.
- **Danger**: `#EF4444` (Tailwind `red-500`) - Errores, eliminar, dinero negativo/gastos.
- **Info**: `#3B82F6` (Tailwind `blue-500`) - Información neutral.

### Neutral Colors (Fondos y Textos)
- **Background Main**: `#F8FAFC` (Tailwind `slate-50`) - Fondo general de la app.
- **Background Card**: `#FFFFFF` (Tailwind `white`) - Fondo de tarjetas y contenedores.
- **Text Main**: `#1E293B` (Tailwind `slate-800`) - Títulos y texto principal.
- **Text Secondary**: `#64748B` (Tailwind `slate-500`) - Subtítulos, labels.
- **Border**: `#E2E8F0` (Tailwind `slate-200`) - Líneas divisoras.

## 3. Tipografía
Usaremos la fuente del sistema por defecto (Inter/Roboto/San Francisco) que Tailwind trae, o **Inter** si decidimos importarla.
- **H1 (Títulos Página)**: `text-3xl font-bold text-slate-800`
- **H2 (Secciones)**: `text-xl font-semibold text-slate-800`
- **Body**: `text-base text-slate-600`
- **Small/Label**: `text-sm font-medium text-slate-500`

## 4. Sombras y Bordes
- **Cards**: `bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200`
- **Inputs**: `rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`
- **Buttons**: Rounded `rounded-lg` o `rounded-full` para acciones principales.

## 5. Componentes Base (Patrones Tailwind)

### Botones
- **Primary**: `bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm`
- **Secondary**: `bg-white hover:bg-slate-50 text-slate-700 font-medium py-2 px-4 rounded-lg border border-slate-300 transition-colors`
- **Danger**: `bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-lg transition-colors`

### Inputs (Floating Label Style - Modernizado)
Reemplazaremos el `form-floating` de Bootstrap con una implementación custom en Tailwind usando `peer` y `placeholder-shown`.

### Cards/Contenedores
```jsx
<div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
  {/* contenido */}
</div>
```

## 6. Animaciones (Framer Motion)
Mantenerlas sutiles ("suaves y discretas").
- **Page Transition**: Fade in suave al cambiar de ruta.
- **Hover Effects**: Ligero escalado (`scale: 1.02`) en cards clickeables.
- **Modales**: Slide up + Fade in.

Ejemplo variante común:
```javascript
export const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};
```
