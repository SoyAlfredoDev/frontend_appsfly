# AppsFly frontend

Aplicación web de AppsFly (Vite + React). El entorno de producción es **Vercel**. No se despliega en otro host.

| | |
| --- | --- |
| Proyecto de Vercel | `frontend-appsfly` |
| Equipo | `appsflycl-7241` |
| Repositorio | [SoyAlfredoDev/frontend_appsfly](https://github.com/SoyAlfredoDev/frontend_appsfly) |
| URL del proyecto | https://frontend-appsfly-eta.vercel.app |
| Dominio público | https://appsfly.cl |

Un push a `main` despliega este proyecto en Vercel. El build es `npm run build`. `vercel.json` reescribe las rutas de la aplicación hacia `app.html` y redirige `www.appsfly.app`, `appsfly.cl` y `www.appsfly.cl` hacia `https://appsfly.app`.

## Desarrollo local

```bash
npm install
npm run dev
```

La app queda en http://localhost:5173 y el proxy de Vite envía `/api` a `http://127.0.0.1:3000`.

Copia `.env.example` a `.env` solo en esta máquina. En Vercel las mismas variables se configuran en el proyecto `frontend-appsfly`. `VITE_API_URL` de producción apunta a la API, que también corre en Vercel.

## Comprobación

```bash
npm run validate
```
