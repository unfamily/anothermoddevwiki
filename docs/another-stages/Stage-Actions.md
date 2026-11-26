# Stage Actions

When a stage is added or removed, actions in this directory can run commands.

**Path:** any `data/<namespace>/load/…` file with matching `type` (namespace and subfolder are free) — **Library `1.12.0.0.0+`**. Recommended: `load/iska_utils_stage_actions/`.

**Type:** canonical `iska_utils:stage_actions` (alias `iska_lib:stage_actions` also accepted — **Library `1.12.0.0.0+`**).

## File format

```json
{
  "type": "iska_utils:stage_actions",
  "overwritable": false,
  "actions": [
    {
      "id": "gamemode_on_stage",
      "onCall": true,
      "onAdd": true,
      "onRemove": true,
      "stages_logic": "DEF_OR",
      "stages": [
        {"stage_type": "player", "stage": "player", "is": true},
        {"stage_type": "player", "stage": "admin", "is": true}
      ],
      "if": [
        {"conditions": [0], "do": [{"execute": "gamemode adventure @p"}, {"delay": 10}, {"execute": "tellraw @p \"Hello!\""}]},
        {"conditions": [1], "do": [{"execute": "gamemode creative @p"}]}
      ]
    },
    {
      "id": "vip_removed",
      "onCall": true,
      "onAdd": false,
      "onRemove": true,
      "stages_logic": "AND",
      "stages": [{"stage_type": "player", "stage": "vip", "is": false}],
      "do": [{"execute": "gamemode survival @p"}]
    }
  ]
}
```

## Fields

- `type`: Must be **iska_utils:stage_actions** [required] (alias `iska_lib:stage_actions` accepted)
- `overwritable`: Reserved for future use (optional)
- `actions`: Array of action definitions [required]

### Action fields

- `id`: Unique identifier for this action (required). Used by `/iska_lib_stage call_action` / `/another_stages call_action` (**JSON ONLY**: runs datapack actions only; Kube `stageChanged` is a separate system and cannot be called this way). On **some older Utils / Library versions** the command verb was only **`action`** instead of `call_action`; current builds use `call_action` only.
- `onCall`: Can be triggered by `call_action` (default: true). Use false to only allow add/remove triggers.
- `onAdd`: Run when stage is added (default: true)
- `onRemove`: Run when stage is removed (default: true)
- `stages_logic`: `AND` (default), `OR`, `DEF_AND`, `DEF_OR` — see [Deferred logic](#deferred-logic-def_and--def_or)
- `stages`: Array of stage conditions that define which stage change triggers this action
- `do`: Array of actions to run: `{"execute": "command"}` or `{"delay": ticks}`
- `if`: Array of branches `{"conditions": [indices], "do": [actions]}` for deferred execution
- `mods`: **3.5.0.0.0+** Mod presence conditions (see [Mod conditions](#mod-conditions-3500000))
- `mods_logic`: **3.5.0.0.0+** `AND` (default if omitted), `OR`, `DEF_AND`, `DEF_OR`

### Deferred logic (DEF_AND / DEF_OR)

This is **not** the [Stage Items](Stage-Items#logic) model (there, `DEF_*` combines whole `if[]` branches). With `DEF_AND` / `DEF_OR` here:

| | |
|--|--|
| Top-level stage gate | Always passes. The changed stage must still appear in `stages[]` to trigger. |
| Each `if[]` branch | `conditions` are indices into `stages[]`. `DEF_AND`: all listed indices must pass. `DEF_OR`: any one. |
| `mod_conditions` | Indices into `mods[]`, combined by `mods_logic`. Only `DEF_OR` is OR; any other value is AND. Stage group and mod group combine with **AND**. |
| Which `if` runs | **First** matching branch’s `do` runs. If none match, top-level `do` runs (if present). |

Same per-`if` index rules as Utils [Command Items](#/iskandert-utilities/Command-Items) and [Command Macros](#/iskandert-utilities/Command-Macros), except those run **every** passing `if` in `do[]`.

### Mod conditions (3.5.0.0.0+)

**Requires Iskandert's Utilities `3.5.0.0.0` or newer.**

- Omitted `mods_logic` = `AND`.
- **`AND` / `OR`** — the action is **skipped at load** if the mod gate fails. At load, `OR` is treated as `AND`.
- **`DEF_AND` / `DEF_OR`** — always registered; use `mod_conditions` on `if` branches (see above).

```json
{
  "if": [
    { "conditions": [0], "mod_conditions": [0, 1], "do": [{"execute": "say both passed"}] }
  ]
}
```

Configurations are loaded at server startup. Reload: `/iska_lib_dev reload` (quick) or `/reload` (full).

---

## Moved — Kube / runtime (Another Stages)

Kube `AnotherStagesEvents.stageChanged`, binding mutators (`addPlayerStage` / …), `registerStage(type, id)`, and **`call_action` **JSON ONLY**** docs live on the Another Stages wiki:

→ **[Stage-Runtime](Stage-Runtime)** — lifecycle / `call_action` / `stageChanged`  
→ **[Kube-Stage-API](Kube-Stage-API)** — centralized `AnotherStages.*` methods + classic JS `if`/`for`/`while`

This page keeps the **JSON Stage Actions** format above (Library-owned).

---

## Known stages catalog (Library JSON)

Tab suggestions for stages that are not yet granted can be registered via datapack (Library load):

```json
{
  "type": "iska_lib:known_stages",
  "stages": [
    { "stage_type": "player", "stage": "bronze_age" },
    { "stage_type": "world", "stage": "global_event" }
  ]
}
```

Alias: `iska_utils:known_stages`. Reload with `/iska_lib_stage reload`. Full behavior + Kube `AnotherStages.registerStage` → [Kube-Stage-API](Kube-Stage-API) and [Stage-Runtime](Stage-Runtime).
