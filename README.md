# Plataforma de bienestar animal

Prototipo para monitorear y simular el bienestar de bovinos, caprinos y porcinos según las cinco libertades del ICA.

No hay backend propio. El índice ICA, el modelo de estrés calórico y la simulación de eventos discretos corren en el navegador. Los datos se guardan en IndexedDB (las mismas tablas que `supabase/schema.sql` si más adelante se conecta Postgres).

## Cómo ejecutarlo

```bash
npm install
npm start
```

Abre http://localhost:4200

Usuario de demostración: `producer@farm.local` / `Producer123!`  
También `vet@farm.local` / `Vet123!` y `admin@farm.local` / `Admin123!`

## Qué hace

- Inventario de predios y animales, con campos por especie
- Evaluación de bienestar (nutrición, entorno, salud, conducta y manejo)
- Índice de bienestar ponderado, semáforo ICA y clase de estrés calórico (THI)
- Simulación de eventos discretos para dieta y clima
- Alertas y reportes imprimibles por predio

## Stack

PWA con Ionic y Angular. El puntaje está en `src/app/core/welfare-scoring.ts`. La simulación está en `src/app/core/simulation.ts`.
