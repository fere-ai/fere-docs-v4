# Agents catalogue, onboarding, and agent cash

Customer-facing behavior for the Alpha Engine agent experience (webapp).

## Agents catalogue

- Signed-in users see **Agents** with owned agents, category filters, and an optional banner for the next step (start an agent or fund one awaiting cash).
- A clone the user **archived before funding** shows as **Stopped** in Your agents (no Fund banner or inline Fund on that row). Restart from Discover or the agent page if they want back in. The schedules drawer may still list unfunded deploys separately.
- Banner actions use short labels (**Start**, **Fund**); the agent name appears in the banner copy.
- Category chips reflect how many agents in each template the user has already deployed.

## Agent detail — Edit strategy

- On `/agents/{slug}`, **Alpha editors** (same entitlement as full strategy detail in Alpha Engine) see **Edit strategy** beside “← All agents”.
- The link opens `/strategies/{origin_schedule_id}` — the house schedule chat for that published agent.
- Non-editors do not see the control; the edit-target API returns 404 for them.
- If someone opens a house schedule id without editor access, the app redirects to their deployed clone (`/strategies/{clone_id}`) or the public agent page (`/agents/{slug}`).

## Onboarding strategy cards

`GET /onboarding/strategies` cards now include the same public facts as the catalogue where relevant: slug, assets, exit rule, leverage, take-profit / stop-loss knobs, asset types, and chains. Cards still omit scripts, hashes, and wallet internals.

## Agent cash in wallet and activity

- In an **agent wallet**, Base USDC is shown as **Cash** (withdrawable balance), distinct from spot token rows.
- **Activity** and **portfolio history** label Cash only for cash lifecycle events (fund, convert, withdraw) — not for ordinary Base USDC swap or bridge legs in a personal or agent trading flow.

## Latest calls and spot liquidity (published Alpha agents)

On the public agent page, **Latest calls** lists spot **buy** signals from the house strategy run. A buy is recorded only if it passes the same Codex deepest-pool liquidity floor used at trade time (`ALPHA_ENGINE_MIN_ASSET_LIQUIDITY_USD`, default **$100k**). Illiquid spot buys are rejected when the strategy emits the decision and are dropped again when the run is promoted to a signal, so a call should not appear if followers could not buy. **Sells** and **perps** are not screened this way. Chat trending-token discovery is unchanged.

## In-app notifications — event time

Notification rows and date-range filters (`from_ts` / `to_ts` on the notifications API) use each event’s **publish time** — when the backend emitted the event onto the message bus — not when the database writer finished persisting it. That matches the timestamp carried on the RabbitMQ envelope.

If a consumer is delayed (retries, backlog, or DLQ replay), the shown time can be earlier than when the row appeared in your feed. Thread ordering in chat still uses `created_at` (insert order); only notification display and time-window filters use this publish timestamp.
