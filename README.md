# BROKE

A mobile-first life and financial simulation. You start at 18 with a randomized background and try to build a life one month at a time.

## Run it

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). The layout is meant for a phone-width browser.

```bash
npm run build
npm run preview
```

`npm run build` typechecks, then creates a production build in `dist/`.

## Checks

```bash
npm run typecheck
npm run lint
npm test
```

## Architecture

The simulation does not live in React.

- `src/game/engine` — seeded PRNG. Gameplay uses this instead of `Math.random()`.
- `src/game/models` — shared types.
- `src/game/balance` — wages, costs, rates, milestones, and economic modifiers.
- `src/game/simulation` — month resolution, jobs, credit, events, and player actions.
- `src/data` — jobs, careers, cities, and events. Add content here without rewriting the month loop.
- `src/store` — Zustand store. It calls the simulation, then renders the result.
- `src/services/storage.ts` — IndexedDB saves (continue, export, import). Save objects include a `version`.
- `src/screens` and `src/components` — the mobile UI.

A month resolves income, simplified taxes, housing, transportation, debt payments and interest, investment moves, lifestyle, education, children, career performance, credit, the economy, and at most one random event. Press **Next Month** to see the recap.

## Balance

Change numbers in `src/game/balance/constants.ts`. Do not scatter new tuning values through components.

Taxes are a simplified bracket estimate plus a flat local rate from the fictional city. They are not a real tax code.

## Adding content

**Job:** add an object to `src/data/jobs/jobs.ts` and, if it continues a ladder, append its id to the matching path in `src/data/careers/careers.ts`.

**Career:** add a `CareerPath` whose `jobs` array lists job ids from entry level to the top.

**Event:** add a `GameEvent` to `src/data/events/events.ts` with `id`, `title`, `description`, `choices`, `category`, `rarity`, optional `requirements`, and `cooldownMonths`.

## Saves

The game autosaves the current life to IndexedDB. From the menu you can continue, start a new life, or import a JSON save. Export lives under More. A save that fails validation is rejected instead of crashing the game.

## Developer tools

On More, turn on Developer Mode. The panel can add cash, set age, credit, and net worth, jump a year, and force an event. It is for balancing, not for the normal game.
