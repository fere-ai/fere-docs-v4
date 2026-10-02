# Agents catalogue, onboarding, and agent cash

Customer-facing behavior for the Alpha Engine agent experience (webapp).

## Agents catalogue

- Signed-in users see **Agents** with owned agents, category filters, and an optional banner for the next step (start an agent or fund one awaiting cash).
- Banner actions use short labels (**Start**, **Fund**); the agent name appears in the banner copy.
- Category chips reflect how many agents in each template the user has already deployed.

## Agent detail — Edit strategy

- On `/agents/{slug}`, **Alpha editors** (same entitlement as full strategy detail in Alpha Engine) see **Edit strategy** beside “← All agents”.
- The link opens `/strategies/{origin_schedule_id}` — the house schedule chat for that published agent.
- Non-editors do not see the control; the edit-target API returns 404 for them.
- If someone opens a house schedule id without editor access, the app redirects to their deployed clone (`/strategies/{clone_id}`) or the public agent page (`/agents/{slug}`).

## Onboarding strategy cards

`GET /onboarding/strategies` cards now include the same public facts as the catalogue where relevant: slug, assets, exit rule, leverage, take-profit / stop-loss knobs, asset types, and chains. Cards still omit scripts, hashes, and wallet internals.

## Onboarding ticket (`GET /onboarding/subscription`)

- **No active ticket:** the gateway returns **404**. The webapp treats that as “no subscription” (`null`) and does **not** report it as a client error in PostHog.

## Agent cash in wallet and activity

- In an **agent wallet**, Base USDC is shown as **Cash** (withdrawable balance), distinct from spot token rows.
- **Activity** and **portfolio history** label Cash only for cash lifecycle events (fund, convert, withdraw) — not for ordinary Base USDC swap or bridge legs in a personal or agent trading flow.
