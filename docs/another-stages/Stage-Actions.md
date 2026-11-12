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

- `id`: Unique identifier for this action (required). Used by `/iska_lib_stage call_action` / `/another_stages call_action` (**§cJSON ONLY§r** — datapack actions only, not Kube `stageChanged`). On **some older Utils / Library versions** the command verb was only **`action`** instead of `call_action`; current builds use `call_action` only.
- `onCall`: Can be triggered by `call_action` (default: true). Use false to only allow add/remove triggers.
- `onAdd`: Run when stage is added (default: true)
- `onRemove`: Run when stage is removed (default: true)
- `stages_logic`: AND, OR, DEF_AND, DEF_OR (same as command macros)
- `stages`: Array of stage conditions that define which stage change triggers this action
- `do`: Array of actions to run: `{"execute": "command"}` or `{"delay": ticks}`
- `if`: Array of branches `{"conditions": [indices], "do": [actions]}` for conditional execution
- `mods`: **3.5.0.0.0+** Mod presence load gate or deferred pool (see below)
- `mods_logic`: **3.5.0.0.0+** `DEF_AND` / `DEF_OR` for `mod_conditions` in `if` branches

### Mod conditions (3.5.0.0.0+)

**Requires Iskandert's Utilities `3.5.0.0.0` or newer.**

Same semantics as [Suspicious Delivery — Mod conditions](https://www.anothermoddevwiki.eu/#/iskandert-utilities/Suspicious-Delivery#mod-conditions-35000):

- **`mods` without `mods_logic: DEF_*`** — the action definition is skipped at load if any mod condition fails.
- **`mods_logic: DEF_AND` / `DEF_OR`** — add `mod_conditions` to `if` branches alongside `conditions`:

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

Kube `AnotherStagesEvents.stageChanged`, binding mutators (`addPlayerStage` / …), `registerStage(type, id)`, and **`call_action` §cJSON ONLY§r** docs live on the Another Stages wiki:

→ **[Stage-Runtime (Another Stages)](Stage-Runtime)**

This Utils page keeps the **JSON Stage Actions** format above (Library-owned).

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

Alias: `iska_utils:known_stages`. Reload with `/iska_lib_stage reload`. Full behavior + Kube `AnotherStages.registerStage` → [Stage-Runtime](Stage-Runtime#binding--registerstage-tab-catalog).
