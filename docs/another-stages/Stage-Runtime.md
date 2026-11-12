# Stage Runtime

[← Home](Home)

Server-side **stage lifecycle** APIs owned by Another Stages (when installed): Kube event `stageChanged`, binding **query / mutate / registerStage**, and the mirrored **`call_action`** command. JSON Stage Action *definitions* — see [Stage-Actions](Stage-Actions).

> **Under construction** — packdev docs may grow with new verbs.

| Feature | Since |
|---------|--------|
| Kube `AnotherStagesEvents.stageChanged` | Another Stages 0.1.0.0.0 |
| Binding mutators (`addPlayerStage` / …) | Another Stages 0.1.0.0.0 |
| `AnotherStages.registerStage(type, id)` | Another Stages 0.1.0.0.0 |
| `/another_stages call_action` (JSON ONLY mirror) | Another Stages 0.1.0.0.0 |
| Library `/iska_lib_stage call_action` restored | Library 1.14.0.1.0 |
| Legacy subcommand `action` (same role as `call_action`) | Older Utils / Library builds only — **not** current |
| Client world rebuild only for camouflage stage diffs | Another Stages 0.1.0.0.0 |

---

## What this page covers

| Topic | Runtime effect |
|-------|----------------|
| `stageChanged` | Fires on server when Library grants/revokes a player/world/team stage |
| Mutators | Call Library `StageRegistry` (hooks + JSON actions + `stageChanged` still run) |
| `registerStage` | Adds id to **typed Tab suggestions** only — does **not** grant the stage |
| `call_action` | Manually runs a **datapack** Stage Action by id — **JSON ONLY** (legacy verb on some older builds: `action`) |
| Client sync | S2C stage lists for JEI/UI; world mesh rebuild only if camouflage stage_block ids change |

**Not here:** item/recipe/block/GUI restriction fields → [Stage-Items](Stage-Items) / [Stage-Recipes](Stage-Recipes) / [Stage-Blocks](Stage-Blocks) / [Stage-Guis](Stage-Guis). JSON action `if`/`delay`/`onCall` format → [Stage-Actions](Stage-Actions).

---

## Full example (Kube)

```js
// server_scripts — react + mutate + register for Tab
AnotherStages.registerStage('player', 'bronze_age')
AnotherStages.registerStages('world', ['global_event', 'raid_week'])

AnotherStagesEvents.stageChanged(event => {
  if (event.stageType === 'player' && event.added && event.stage === 'bronze_age') {
    AnotherStages.addPlayerStage(event.player, 'bronze_tools', true) // hideLog
  }
})
```

---

## Commands — `call_action` (**JSON ONLY**)

Runs a named datapack Stage Action (`iska_utils:stage_actions` / `iska_lib:stage_actions`).

| | |
|--|--|
| **What it does** | Executes Library `StageActionsManager.executeActionById` for the target player(s) |
| **Default** | `force=false`, `silent=false`, `hide=false` |
| **Accepted** | Verb **`call_action`** (current). On **some older Utils / Library versions** the subcommand was only **`action`** — same role, different token. Current AS + Library expect `call_action` only. |
| **Combines** | Respects action `onCall`; `force=true` bypasses `onCall=false` |
| **Side effects** | Server only; rechecks stage conditions at run time; does **not** open menus by itself |
| **Does *not* do** | Does **not** fire Kube `stageChanged`; does **not** run script handlers; only JSON actions. Does **not** accept the legacy `action` verb on current builds. |

```
/iska_lib_stage call_action <target> <action_id> [force] [silent] [hide]
/another_stages call_action <target> <action_id> [force] [silent] [hide]
```

Legacy (older builds only — do not use on current AS / Library):

```
/iska_lib_stage action <target> <action_id> …
/iska_utils_stage action <target> <action_id> …
```

Both roots are registered on current builds (Library owns actions; AS mirrors). Chat success/fail text marks **JSON ONLY** (red). Tab suggestions for `call_action` and `action_id` show the same red tooltip.

---

## KubeJS — `AnotherStagesEvents.stageChanged`

| | |
|--|--|
| **What it does** | Server event after Library stage add/remove (player / world / team). Much more advanced than JSON Stage Actions: any KubeJS logic |
| **Default** | No handlers → nothing |
| **Accepted** | Kube callback; event fields below |
| **Combines** | Separate from JSON Stage Actions: similar purpose, different system. Both run on a stage change |
| **Side effects** | Server only; nested mutators inside a handler do **not** re-post `stageChanged` (anti-recursion) |
| **Does *not* do** | Cannot be invoked by `call_action` (JSON only); not client-side; **does not** put stage ids into Tab suggestions by itself |

### Tab suggestions for stages used only here

Stage ids that appear **only** inside `stageChanged` (or other scripts) and are **not** also referenced by restrictions / Stage Actions / other catalog contributors will **not** show up under `/iska_lib_stage add|remove …` Tab.

Register them explicitly:

- Kube: [`AnotherStages.registerStage` / `registerStages`](#binding--registerstage-tab-catalog)
- Datapack: [`iska_lib:known_stages`](#datapack-iska_libknown_stages-library)

(Ids already pulled from stage_item / stage_recipe / stage_block / stage_gui / stage_actions catalogs do not need a second registration.)

### Event fields

| Field | Default | What it does | Does *not* |
|-------|---------|--------------|------------|
| `stageType` | — | `'player'` / `'world'` / `'team'` | Not a command literal |
| `stage` | — | Stage id string | Not auto-registered in Tab catalog |
| `added` | — | `true` grant / `false` remove | — |
| `player` | `null` | Set for player changes | Often null for world/team |
| `team` | `null` | Team key when `stageType === 'team'` | — |
| `server` | — | `MinecraftServer` | — |

---

## Binding — query

Usable from any **server** Kube event (not only `stageChanged`).

| Kube | Default | What it does | Does *not* |
|------|---------|--------------|------------|
| `playerHasStage(player, stage)` | — | Personal stages | Not team stages |
| `teamHasStage(player, stage)` | — | Player's current shop/FTB team stages | Not personal |
| `worldHasStage(level, stage)` | — | World stages | Needs server level |
| `playerHasStageMatching(player, regex)` | — | Any personal id matches regex | Invalid regex → false |
| `teamHasStageMatching(player, regex)` | — | Any team id matches | — |
| `worldHasStageMatching(level, regex)` | — | Any world id matches | — |

---

## Binding — mutate

All call Library `StageRegistry`. Hooks, JSON Stage Actions, S2C sync, and `stageChanged` still apply (unless nested anti-recursion for the event).

| Kube | Default | What it does | Does *not* |
|------|---------|--------------|------------|
| `addPlayerStage(player, stage[, hideLog])` | `hideLog=false` | Grant personal stage | Client → false |
| `removePlayerStage(player, stage[, hideLog])` | `hideLog=false` | Revoke personal | — |
| `setPlayerStage(player, stage, value)` | — | Add or remove by boolean | — |
| `addWorldStage(level, stage)` | — | Grant world stage | Needs server |
| `removeWorldStage` / `setWorldStage` | — | World revoke / set | — |
| `addTeamStage(player, stage)` | — | Stage on player's current team | Needs team membership |
| `removeTeamStage` / `setTeamStage` | — | Team via player | — |
| `addNamedTeamStage(level, teamName, stage)` | — | Named team key | Prefer player-based when possible |
| `removeNamedTeamStage` | — | Named team revoke | — |

---

## Binding — `registerStage` (Tab catalog)

| Kube | JSON | Default | What it does |
|------|------|---------|--------------|
| `AnotherStages.registerStage(stageType, id)` | `iska_lib:known_stages` entry | — | Adds id to **typed** suggestions for `/iska_lib_stage add\|remove …` |
| `AnotherStages.registerStages(stageType, ids[])` | same file, many rows | — | Batch typed registration |

| | |
|--|--|
| **Accepted `stageType`** | `player` / `world` / `team` (`team_player` → `team`) |
| **Combines** | Union with datapack known_stages + contributor catalogs (actions, restrictions, …) |
| **Side effects** | Memory catalog only until restart/reload clears JSON contributor; Kube static typed regs persist for the process |
| **Does *not* do** | Does **not** grant the stage; **no** `/register_stage` command |

Stage Generator can export this catalog as JSON or Kube — see [Stage-Generator](Stage-Generator#known-stages-tab-catalog).

### Datapack `iska_lib:known_stages` (Library)

Loaded by Library from any `data/<ns>/load/**` with matching type (alias `iska_utils:known_stages`). Reloaded with `/iska_lib_stage reload`, `/reload` (stage JSON reload listener), or Library stage reload path.

```json
{
  "type": "iska_lib:known_stages",
  "stages": [
    { "stage_type": "player", "stage": "bronze_age" },
    { "stage_type": "world", "stage": "global_event" },
    { "stage_type": "team", "stage": "team_unlock" }
  ]
}
```

| Field | Default | What it does | Does *not* |
|-------|---------|--------------|------------|
| `stage_type` | required | Branch for Tab suggestions | Untyped dump into every branch |
| `stage` | required | Stage id string | Does not unlock content by itself |

---

## Client stage sync / camouflage refresh

| | |
|--|--|
| **What it does** | Server pushes player ∪ world ∪ team stage lists to the local client (`ClientStageCache`) for JEI overlays and stage_block visuals |
| **World rebuild** | `levelRenderer.allChanged()` only when the sync **diff** intersects stage ids referenced by **stage_block rules with `camouflage == true`** (default when omitted), or on first sync / logout clear |
| **Always** | Cache revision / JEI fingerprint still bump on every sync |
| **Does *not*** | Full chunk rebuild on every unrelated stage change |

---

## Reload

| Command | Reloads |
|---------|---------|
| `/iska_lib_stage reload` | Library stage actions + **known_stages** (+ Library stage items if AS absent) |
| `/iska_lib_dev reload` | Broader Library load paths (see Library/Utils docs) |
| `/reload` | Full datapack + resources (also reloads known_stages via Library stage JSON reload listener) |
| `/kubejs reload server_scripts` | All KubeJS stage content (restrictions, `registerStage`, `stageChanged` handlers) |

Kube `registerStage` is script-side — rerun scripts / restart to re-apply after clear.

---

## See also

- [Stage-Actions (JSON format)](Stage-Actions)
- [Stage-Items § bindings](Stage-Items#3-stage-bindings-query--mutate)
- [Stage-Generator](Stage-Generator)
- [Stage-Blocks](Stage-Blocks) (`camouflage`)

