# Animal welfare platform

Prototype for monitoring and simulating livestock welfare (cattle, goats, swine) against ICA five-freedom rules.

There is **no custom backend**. The ICA index, heat-stress model and discrete-event simulation run in the browser. Data is stored in IndexedDB (same tables as `supabase/schema.sql` if you later attach Postgres).

## Run

```bash
npm install
npm start
```

Open http://localhost:4200

Demo user: `producer@farm.local` / `Producer123!`  
Also `vet@farm.local` / `Vet123!` and `admin@farm.local` / `Admin123!`

## What it does

- Farm and animal inventory, with species-specific fields
- Welfare assessment (nutrition, environment, health, behaviour, handling)
- Weighted **welfare index**, ICA traffic light, THI heat-stress class
- Discrete-event simulation of diet and climate scenarios
- Alerts and printable farm reports

## Stack

Ionic + Angular PWA. Scoring lives in `src/app/core/welfare-scoring.ts`. Simulation lives in `src/app/core/simulation.ts`.
