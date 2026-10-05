# Deployment

## 1. Deploy the API and test database to Render

In the Render dashboard, create a Blueprint from this repository and select
the `render.yaml` file at the repository root. The Blueprint creates the API
service and a free PostgreSQL database. On startup, the API applies
`backend/database.sql`; it does not load the demo seed data.

Wait until the `listawise-api` service is live, then copy its public service
origin, such as `https://listawise-api.onrender.com`. Create the first owner
account through the app's registration screen after the frontend is deployed.

The free plan is for testing only: services may sleep, and database retention
is limited. Do not store real customer or financial records there.

## 2. Deploy the frontend to Cloudflare Pages

Wrangler must be logged in to the Cloudflare account. From the repository root,
set the API base URL to the Render service origin followed by `/api`, then build
the frontend:

```powershell
$env:VITE_API_BASE_URL = 'https://listawise-api.onrender.com/api'
Push-Location ListaWise-System\frontend
npm ci
npm run build
Pop-Location
```

Create the Pages project once, then publish the build:

```powershell
npx wrangler pages project create listawise --production-branch main
npx wrangler pages deploy ListaWise-System\frontend\dist --project-name listawise --branch main
```

If the Pages project already exists, skip the create command. Replace the
example API URL with the actual Render service origin before building.
