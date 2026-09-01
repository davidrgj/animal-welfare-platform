# Plataforma de bienestar animal

Prototipo para monitorear y simular el bienestar de bovinos, caprinos y porcinos según las cinco libertades del ICA.

El índice ICA, el modelo de estrés calórico y la simulación de eventos discretos corren en el navegador. Si configuras Supabase, predios, animales, evaluaciones, fotos, alertas y simulaciones se guardan en Postgres. Si no, la app usa IndexedDB en este dispositivo.

## Cómo ejecutarlo

```bash
npm install
npm start
```

Abre http://localhost:4200

Usuario de demostración: `producer@farm.local` / `Producer123!`  
También `vet@farm.local` / `Vet123!` y `admin@farm.local` / `Admin123!`

## Qué datos hay

Hay dos tipos, y no son una base remota por defecto:

1. **Datos de demostración.** Predios El Recuerdo y La Esperanza, animales BOV-087, BOV-102, CAP-014, POR-218 y POR-331, evaluaciones y alertas. En local se insertan una vez en IndexedDB (`src/app/core/database.ts`). En Supabase se cargan con `supabase/seed.sql`.
2. **Catálogos fijos.** Especie, fuente de agua, rol, etc. viven en `src/app/core/labels.ts`. Son listas de la interfaz, no tablas para editar.

Alta, edición y borrado de predios y animales, nuevas evaluaciones con foto, alertas y simulaciones ya están en la interfaz. Con Supabase esas mismas pantallas persisten en la nube.

## Conectar Supabase

En el proyecto de Supabase (Settings > API) copia:

- Project URL (`https://xxxx.supabase.co`)
- anon public key

No hace falta la `service_role`. Pégalas en `src/environments/environment.ts` y `environment.prod.ts`, o define `SUPABASE_URL` y `SUPABASE_ANON_KEY` en Vercel (el build las escribe antes de compilar).

Luego, en el SQL editor, en este orden:

1. `supabase/schema.sql`
2. `supabase/seed.sql`

En Authentication > Providers > Email desactiva **Confirm email** para poder entrar con las cuentas de demo sin correo.

## Qué hace

- Inventario de predios y animales, con campos por especie
- Evaluación de bienestar (nutrición, entorno, salud, conducta y manejo)
- Índice de bienestar ponderado, semáforo ICA y clase de estrés calórico (THI)
- Simulación de eventos discretos para dieta y clima
- Alertas y reportes imprimibles por predio

## Stack

PWA con Ionic y Angular. El puntaje está en `src/app/core/welfare-scoring.ts`. La simulación está en `src/app/core/simulation.ts`.

## Publicar en Vercel

El comando de compilación debe ser `npx ionic build --prod` (o `npm run build`), no `ionic build` a secas: en Vercel el CLI de Ionic no está en el PATH a menos que se invoque con `npx` o un script de npm.

`ionic build` en este proyecto llama a Angular y **tampoco genera `www`**. La carpeta que hay que publicar es `dist/app/browser`.
