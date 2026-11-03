# Configuration

Common config file: `another_dynamics-common.toml` (NeoForge config).

Leave **`dev`** options off for players and production servers.

## `dev` — developer diagnostics

| Key | Default | Description |
|-----|---------|-------------|
| `000_filterSyncDebug` | `false` | Heavy filter mirror sync/push tracing (`[FILTER-DBG]`) |
| `001_ductTransitDebug` | `false` | Item transit cancel tracing on dedicated server (`[DUCT-TRN]`) |
| `002_ductRoutingDebug` | `false` | Routing cache / BFS diagnostics (`[DUCT-RTG]`) |
| `003_ductCacheDebug` | `false` | Network cache invalidation tracing (`[DUCT-CCH]`) |
| `004A_cableFacadesConfigSeed` | `true` | One-shot Cable Facades whitelist repair (`duct` + `project_duct`, strips legacy `another_dynamics:*`); then set false automatically |

## `logistics`

| Key | Default | Description |
|-----|---------|-------------|
| `100_ductGlobalStallDrainGuard` | `true` | When a duct’s item stall drain makes no progress, skip that duct for a few ticks (TPS-friendly). `false` keeps only the finer per-face throttle. |

## Balance

Rates, quantities, Sequential Stacks, filter banks, module effects, and feature locks are **not** in this config — use datapacks:

- [Declare Duct](Declare-Duct)
- [Declare Module](Declare-Module)

Restart is not required for datapack balance after `/reload`. Config changes that affect `dev` / `logistics` follow NeoForge common-config reload rules (typically restart or config reload if your environment supports it).
