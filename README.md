# Plataforma de bienestar animal

Prototipo para monitorear y simular el bienestar de bovinos, caprinos y porcinos según las cinco libertades del ICA.

El índice ICA, el modelo de estrés calórico y la simulación de eventos discretos corren en el navegador. Si configuras Supabase, predios, animales, evaluaciones, fotos, alertas y simulaciones se guardan en Postgres. Si no, la app usa IndexedDB en este dispositivo.

## Cómo ejecutarlo

```bash
npm install
npm start
```

Abre http://localhost:4200

La pantalla de login no publica credenciales y el repositorio no guarda contraseñas de las cuentas en la nube. Las de demostración en Supabase las define quien ejecuta `supabase/seed.sql` (variables `*_password` al inicio del archivo) y se entregan por un canal privado. El modo local (IndexedDB, solo cuando no hay proyecto Supabase configurado) usa una clave de demostración propia, definida en `src/app/core/database.ts`, que solo abre los datos guardados en ese navegador.

## Qué datos hay

Hay dos tipos, y no son una base remota por defecto:

1. **Datos de demostración.** Predios El Recuerdo y La Esperanza, animales VACA-087, VACA-102, CABRA-014, CERDO-218 y CERDO-331, evaluaciones y alertas. En local se insertan una vez en IndexedDB (`src/app/core/database.ts`). En Supabase se cargan con `supabase/seed.sql`.
2. **Catálogos fijos.** Especie, fuente de agua, rol, etc. viven en `src/app/core/labels.ts`. Son listas de la interfaz, no tablas para editar.

Alta, edición y borrado de predios y animales, nuevas evaluaciones con foto, alertas y simulaciones ya están en la interfaz. Con Supabase esas mismas pantallas persisten en la nube.

## Conectar Supabase

La app ya apunta al proyecto `https://gkomojjjyydbdajpxyqw.supabase.co` con la clave anónima. La `service_role` no va en el frontend.

Falta crear tablas y datos de demo en el [SQL editor](https://supabase.com/dashboard/project/gkomojjjyydbdajpxyqw/sql/new), en este orden:

1. `supabase/schema.sql`
2. `supabase/seed.sql`
3. `supabase/harden-storage.sql` (si el bucket `welfare-photos` ya existía como público)

Si el esquema ya estaba aplicado antes del CRUD de usuarios, ejecuta también `supabase/admin-policies.sql`.

Si el esquema ya estaba aplicado antes del endurecimiento de roles, ejecuta `supabase/rls_hardening.sql`: impide que un usuario cambie su propio rol y que un registro público obtenga el rol administrador. No modifica usuarios, contraseñas ni datos existentes.

### Pruebas de aislamiento RLS

`supabase/rls_isolation_tests.sql` ejecuta 13 casos directamente sobre las políticas (lectura, modificación, borrado e inserción entre productores, visibilidad del veterinario, acceso anónimo y escalada de privilegios). Pégalo completo en el SQL editor: crea usuarios y datos ficticios, los revierte al terminar y devuelve una fila por caso con `PASS` o `FAIL`.

Para ejecutarlo sin tocar Supabase, sobre un PostgreSQL local vacío:

```bash
psql -d rls_lab -c "create extension if not exists pgcrypto"
psql -d rls_lab -f tests/security/local_supabase_shim.sql
psql -d rls_lab -f supabase/schema.sql
psql -d rls_lab -f supabase/rls_isolation_tests.sql
```

Para que el registro entre de inmediato (sin correo de verificación):

1. [Authentication → Providers → Email](https://supabase.com/dashboard/project/gkomojjjyydbdajpxyqw/auth/providers): desactiva **Confirm email**.
2. [Authentication → URL Configuration](https://supabase.com/dashboard/project/gkomojjjyydbdajpxyqw/auth/url-configuration): **Site URL** = `https://animal-welfare-platform-vepq.vercel.app` (no `localhost`).
3. Opcional, en el SQL editor ejecuta `supabase/disable-email-confirm.sql` para confirmar usuarios pendientes y auto-confirmar altas nuevas.

Las cuentas de seed ya quedan confirmadas.

Administración de usuarios y roles: inicia sesión con una cuenta administrador → **Cuenta** → **Usuarios y roles**.

En Vercel puedes definir `SUPABASE_URL` y `SUPABASE_ANON_KEY` (o `SUPABASE_PUBLISHABLE_KEY`); el build las escribe antes de compilar. Si no, usa las de `src/environments/environment.prod.ts`.

## Qué hace

- Inventario de predios y animales, con campos por especie
- Evaluación de bienestar (nutrición, entorno, salud, conducta y manejo)
- Índice de bienestar ponderado, semáforo ICA y clase de estrés calórico (THI)
- Simulación de eventos discretos para dieta y clima
- Alertas y reportes imprimibles por predio
- Administración de usuarios y roles (solo administrador)

## Stack

PWA con Ionic y Angular. El puntaje está en `src/app/core/welfare-scoring.ts`. La simulación está en `src/app/core/simulation.ts`.

## Publicar en Vercel

El comando de compilación debe ser `npx ionic build --prod` (o `npm run build`), no `ionic build` a secas: en Vercel el CLI de Ionic no está en el PATH a menos que se invoque con `npx` o un script de npm.

`ionic build` en este proyecto llama a Angular y **tampoco genera `www`**. La carpeta que hay que publicar es `dist/app/browser`.
