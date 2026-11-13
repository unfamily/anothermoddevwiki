# Kube Stage API (`AnotherStages.*`)

[← Home](Home) · [Stage-Runtime](Stage-Runtime) · [Stage-Items](Stage-Items)

**Canonical catalog** of the KubeJS binding `AnotherStages`: **query**, **mutate**, and **registerStage** helpers. Use them with normal JavaScript control flow (`if` / `else` / `for` / `while` / …) in **`server_scripts`**.

These call **IskaLib `StageRegistry` only**. They are **not** KubeJS’s built-in stage system — do not mix the two.

| Feature | Since |
|---------|--------|
| Query / mutate binding | Another Stages 0.1.0.0.0 |
| `registerStage` / `registerStages` | Another Stages 0.1.0.0.0 |

---

## Two systems (do not confuse)

| System | What it is | Where |
|--------|------------|--------|
| **Script control flow** | Classic JS: `if`, `else`, `for`, `for…of`, `while`, `&&` / `\|\|` / `!`, early `return` — with `AnotherStages.playerHasStage` / `addPlayerStage` / … | **This page** |
| **Restriction managers** | Persistent gating rules: `.logicAnd()` / `.logicOr()` / `.logicDefOr()` / `.logicDefAnd()` / `.stages([...])` / `.when([...], …)` (and JSON equivalents) | [Stage-Items](Stage-Items), [Stage-Recipes](Stage-Recipes), [Stage-Blocks](Stage-Blocks), [Stage-Guis](Stage-Guis) |
| **JSON Stage Actions** | Datapack actions on stage add/remove | [Stage-Actions](Stage-Actions) |
| **Lifecycle / commands** | `stageChanged`, `call_action`, sync | [Stage-Runtime](Stage-Runtime) |

Fluent `.logic*` / `.stages` / `.when` remain **fully valid** — they define rules that re-evaluate over time (server + JEI/client). Script `if` / `for` is for **one-shot or reactive** logic when you already have a `player` / `level`. Both coexist.

**Where you can use queries/mutators:** any **`server_scripts`** handler that gives you a `Player` and/or `Level` — login, ticks, item/block events, commands, `stageChanged`, custom pack events, etc. There is **no** special “stage event only” requirement. Bare top-level script load (no player/level yet) must not call them.

**Register ≠ grant:** `playerHasStage` / `addPlayerStage` / `remove*` / `set*` never add ids to the Tab catalog. Call `AnotherStages.registerStage(type, id)` / `registerStages` at script load (or use datapack `iska_lib:known_stages` / a restriction that references the id) if you want `/iska_lib_stage add|remove …` suggestions. Runtime grant/check still works without registration.

---

## Examples by Kube context

Same API everywhere — only how you obtain `player` / `level` changes.

### Tab catalog first (load-time)

```js
// Does NOT give anyone the stage — only Tab / known-stage catalog
AnotherStages.registerStage('player', 'bronze_age')
AnotherStages.registerStages('player', ['bronze_tools', 'stone_age'])
AnotherStages.registerStage('world', 'raid_week')
AnotherStages.registerStage('team', 'raid_ready')
```

### Login / join

```js
PlayerEvents.loggedIn(event => {
  const player = event.player
  const level = player.level

  if (AnotherStages.playerHasStage(player, 'bronze_age')) {
    // already unlocked
  } else {
    AnotherStages.addPlayerStage(player, 'bronze_age') // grants; Tab needs registerStage above
  }

  if (AnotherStages.worldHasStage(level, 'raid_week')
      && !AnotherStages.teamHasStage(player, 'raid_ready')) {
    AnotherStages.setTeamStage(player, 'raid_ready', true)
  }

  for (const id of ['tool_wood', 'tool_stone', 'tool_bronze']) {
    if (!AnotherStages.playerHasStage(player, id)) {
      AnotherStages.addPlayerStage(player, id, true) // hideLog
    }
  }
})
```

### Stage change (reactive)

```js
AnotherStagesEvents.stageChanged(event => {
  if (event.stageType === 'player' && event.added && event.stage === 'bronze_age') {
    if (event.player != null) {
      AnotherStages.addPlayerStage(event.player, 'bronze_tools', true)
    }
  }
  if (event.stageType === 'world' && event.added && event.stage === 'raid_week') {
    // world grant — player may be null; use level from server if needed
  }
})
```

### Item use / right-click

```js
ItemEvents.rightClicked('minecraft:stick', event => {
  const player = event.player
  if (!AnotherStages.playerHasStage(player, 'stick_quest')) {
    event.cancel()
    return
  }
  if (AnotherStages.playerHasStageMatching(player, '^quest_done_')) {
    // bonus path
  }
})
```

### Block break / place

```js
BlockEvents.broken('minecraft:diamond_ore', event => {
  const player = event.player
  if (player == null) return
  if (!AnotherStages.playerHasStage(player, 'mining_tier_2')) {
    event.cancel()
  }
})

BlockEvents.placed('minecraft:crafting_table', event => {
  const player = event.player
  if (player == null) return
  if (AnotherStages.worldHasStage(player.level, 'no_crafting_tables')) {
    event.cancel()
  }
})
```

### Player tick / loops

```js
PlayerEvents.tick(event => {
  const player = event.player
  if (player.age % 100 !== 0) return

  let n = 0
  while (n < 3 && !AnotherStages.playerHasStageMatching(player, '^quest_')) {
    // pack-specific poll body
    n++
  }

  for (const id of ['daily_a', 'daily_b']) {
    if (AnotherStages.teamHasStage(player, id)) {
      // team already has this daily flag
    }
  }
})
```

### Command / custom server script

```js
ServerEvents.commandRegistry(event => {
  // inside your command execute callback:
  // const player = …; const level = player.level
  // if (AnotherStages.worldHasStage(level, 'event_on')) { … }
  // else { AnotherStages.addWorldStage(level, 'event_on') }
})
```

Queries do **not** replace persistent [Stage-Items](Stage-Items) / recipe / block / GUI **restrictions** (JEI + continuous gates). Use `if` for pack script reactions; use managers/JSON for lasting locks.

---

## Query methods

All return `boolean`. Read-only. `null` / empty stage / missing server context → `false`.

### `AnotherStages.playerHasStage(player, stage)`

| | |
|--|--|
| **What it does** | `true` if the player has that **personal** stage id |
| **Default / null** | `player == null` or blank `stage` → `false` |
| **Accepted** | `Player`, stage id string |
| **How it combines** | Use with `&&` / `\|\|` / `!` / `if` / loops like any boolean |
| **Side effects** | None |
| **Does *not* do** | Does **not** check team or world stages |

```js
if (AnotherStages.playerHasStage(player, 'bronze_age')) {
  // has personal stage
} else {
  // missing
}
```

### `AnotherStages.teamHasStage(player, stage)`

| | |
|--|--|
| **What it does** | `true` if the player's **current** shop/FTB team has that stage (Library team stages) |
| **Default / null** | Invalid player/stage → `false` |
| **Accepted** | `Player`, stage id string |
| **How it combines** | Same as other booleans |
| **Side effects** | None |
| **Does *not* do** | Does **not** check personal stages; needs a resolved team |

```js
if (AnotherStages.teamHasStage(player, 'team_unlock')) {
  // team has it
} else if (AnotherStages.playerHasStage(player, 'solo_fallback')) {
  // personal fallback
}
```

### `AnotherStages.worldHasStage(level, stage)`

| | |
|--|--|
| **What it does** | `true` if the **world** has that stage |
| **Default / null** | `level == null` or blank `stage` → `false` |
| **Accepted** | `Level` (server level in practice), stage id string |
| **How it combines** | Same as other booleans |
| **Side effects** | None |
| **Does *not* do** | Does **not** check player/team |

```js
if (AnotherStages.worldHasStage(player.level, 'global_event')) {
  // world flag on
}
```

### `AnotherStages.playerHasStageMatching(player, regex)`

| | |
|--|--|
| **What it does** | `true` if **any** personal stage id matches the regex (`Pattern.find`) |
| **Default / null** | Non-server player / blank / invalid regex → `false` |
| **Accepted** | `Player` (server), Java regex string |
| **How it combines** | Same as other booleans |
| **Side effects** | None |
| **Does *not* do** | Does **not** grant stages; invalid pattern never throws to the packdev script (returns `false`) |

```js
if (AnotherStages.playerHasStageMatching(player, '^age_')) {
  // any personal id containing age_…
}
```

### `AnotherStages.teamHasStageMatching(player, regex)`

| | |
|--|--|
| **What it does** | `true` if any of the player's **team** stage ids match the regex |
| **Default / null** | Same failure → `false` as player matching |
| **Accepted** | `Player` (server), Java regex string |
| **How it combines** | Same as other booleans |
| **Side effects** | None |
| **Does *not* do** | Does **not** match personal/world ids |

```js
if (AnotherStages.teamHasStageMatching(player, '^raid_')) {
  // any team raid_* stage
}
```

### `AnotherStages.worldHasStageMatching(level, regex)`

| | |
|--|--|
| **What it does** | `true` if any **world** stage id matches the regex |
| **Default / null** | Non-server level / blank / invalid regex → `false` |
| **Accepted** | `Level` (server), Java regex string |
| **How it combines** | Same as other booleans |
| **Side effects** | None |
| **Does *not* do** | Does **not** match player/team ids |

```js
if (AnotherStages.worldHasStageMatching(player.level, 'event_')) {
  // any world event_* stage
}
```

---

## Mutate methods — player

All call Library `StageRegistry`. On success: hooks, JSON Stage Actions, S2C sync, and `AnotherStagesEvents.stageChanged` still run (nested mutators inside a `stageChanged` handler do **not** re-post the event — anti-recursion). Returns `boolean` (`false` on client / invalid args).

### `AnotherStages.addPlayerStage(player, stage[, hideLog])`

| | |
|--|--|
| **What it does** | Grants a **personal** stage |
| **Default** | `hideLog = false` |
| **Accepted** | `Player`, stage id; optional boolean `hideLog` |
| **How it combines** | Use after `if (!playerHasStage(…))` or inside loops |
| **Side effects** | Hooks / Stage Actions / `stageChanged` / client sync. `hideLog=true` skips Library INFO log only |
| **Does *not* do** | Does **not** add team/world stages |

```js
if (!AnotherStages.playerHasStage(player, 'bronze_age')) {
  AnotherStages.addPlayerStage(player, 'bronze_age')
  // or: AnotherStages.addPlayerStage(player, 'bronze_age', true) // hideLog
}
```

### `AnotherStages.removePlayerStage(player, stage[, hideLog])`

| | |
|--|--|
| **What it does** | Revokes a personal stage |
| **Default** | `hideLog = false` |
| **Accepted** | Same as add |
| **How it combines** | Same |
| **Side effects** | Same family as add |
| **Does *not* do** | Does **not** clear team/world |

```js
if (AnotherStages.playerHasStage(player, 'tutorial_lock')) {
  AnotherStages.removePlayerStage(player, 'tutorial_lock')
}
```

### `AnotherStages.setPlayerStage(player, stage, value)`

| | |
|--|--|
| **What it does** | `true` → add, `false` → remove |
| **Default** | — |
| **Accepted** | `Player`, stage id, boolean |
| **How it combines** | Useful when a flag is already computed |
| **Side effects** | Same as add/remove |
| **Does *not* do** | Does **not** accept a third hideLog arg (use add/remove for that) |

```js
const unlock = /* pack condition */ true
AnotherStages.setPlayerStage(player, 'bronze_age', unlock)
```

---

## Mutate methods — world

### `AnotherStages.addWorldStage(level, stage)`

| | |
|--|--|
| **What it does** | Grants a **world** stage |
| **Default / null** | Invalid level/stage → `false` |
| **Accepted** | `Level`, stage id |
| **How it combines** | Same boolean / `if` / loop patterns |
| **Side effects** | Hooks / Stage Actions / `stageChanged` (player may be null on the event) / sync |
| **Does *not* do** | Does **not** grant personal/team |

```js
if (!AnotherStages.worldHasStage(level, 'global_event')) {
  AnotherStages.addWorldStage(level, 'global_event')
}
```

### `AnotherStages.removeWorldStage(level, stage)`

| | |
|--|--|
| **What it does** | Revokes a world stage |
| **Default / null** | Invalid → `false` |
| **Accepted** | `Level`, stage id |
| **How it combines** | Same |
| **Side effects** | Same family as add |
| **Does *not* do** | — |

```js
if (AnotherStages.worldHasStage(level, 'temp_event')) {
  AnotherStages.removeWorldStage(level, 'temp_event')
}
```

### `AnotherStages.setWorldStage(level, stage, value)`

| | |
|--|--|
| **What it does** | `true` → add, `false` → remove |
| **Accepted** | `Level`, stage id, boolean |
| **Side effects** | Same as add/remove |
| **Does *not* do** | — |

```js
AnotherStages.setWorldStage(level, 'global_event', true)
```

---

## Mutate methods — team

### `AnotherStages.addTeamStage(player, stage)` / `removeTeamStage` / `setTeamStage`

| | |
|--|--|
| **What it does** | Add / remove / set a stage on the player's **current** team (Library `team_player` path) |
| **Default / null** | Non-server player / no server / blank stage → `false` |
| **Accepted** | `Player`, stage id; `setTeamStage` also takes boolean `value` |
| **How it combines** | Prefer these over named-team helpers when FTB/shop team sync is on |
| **Side effects** | Same mutate family |
| **Does *not* do** | Does **not** change personal stages; fails if the player has no team |

```js
if (!AnotherStages.teamHasStage(player, 'team_unlock')) {
  AnotherStages.addTeamStage(player, 'team_unlock')
} else {
  AnotherStages.removeTeamStage(player, 'old_flag')
}
AnotherStages.setTeamStage(player, 'raid_ready', true)
```

### `AnotherStages.addNamedTeamStage(level, teamName, stage)` / `removeNamedTeamStage`

| | |
|--|--|
| **What it does** | Add / remove a stage on an explicit team key/name (Library `team <name>`) |
| **Default / null** | Blank team/stage/level → `false` |
| **Accepted** | `Level`, team name string, stage id |
| **How it combines** | Use when you already know the team key |
| **Side effects** | Same mutate family |
| **Does *not* do** | Prefer `addTeamStage(player, …)` when the acting player’s team is the target |

```js
if (/* admin path */) {
  AnotherStages.addNamedTeamStage(level, 'MyTeam', 'raid')
} else {
  AnotherStages.removeNamedTeamStage(level, 'MyTeam', 'raid')
}
```

---

## Catalog — `registerStage` / `registerStages`

Usually at **script load** (no player needed) — Tab catalog only. **Not** called automatically by `addPlayerStage` / `playerHasStage` / other mutators or queries.

### `AnotherStages.registerStage(stageType, stage)`

| | |
|--|--|
| **What it does** | Registers a stage id for **typed Tab suggestions** (`/iska_lib_stage add\|remove …`) |
| **Default / null** | Invalid type/id ignored |
| **Accepted** | `stageType`: `player` / `world` / `team` (`team_player` → `team`); stage id string |
| **How it combines** | Unions with datapack `iska_lib:known_stages` and other contributors |
| **Side effects** | Memory catalog; Kube regs persist for the process until cleared/reload patterns apply |
| **Does *not* do** | Does **not** grant the stage to anyone; **no** `/register_stage` command; does **not** run when you only `addPlayerStage` |

```js
AnotherStages.registerStage('player', 'bronze_age')
AnotherStages.registerStage('world', 'global_event')
// later, in an event:
if (!AnotherStages.playerHasStage(player, 'bronze_age')) {
  AnotherStages.addPlayerStage(player, 'bronze_age')
}
```

### `AnotherStages.registerStages(stageType, stages)`

| | |
|--|--|
| **What it does** | Batch of `registerStage` for one typed branch |
| **Accepted** | `stageType`, collection/array of ids |
| **Side effects** | Same as single register |
| **Does *not* do** | Does **not** grant stages; does **not** replace `add*` |

```js
AnotherStages.registerStages('player', ['bronze_age', 'iron_age', 'steel_age'])
```

Datapack alternative and Stage Generator export: [Stage-Runtime](Stage-Runtime), [Stage-Generator](Stage-Generator#known-stages-tab-catalog).

---

## Mapping note (JSON logics ↔ JS)

| Restriction / JSON idea | Script-flow equivalent (this page) |
|-------------------------|-------------------------------------|
| `stages_logic: AND` + several `is: true` | `a && b && c` with `playerHasStage` / `worldHasStage` / … |
| `is: false` (lock while missing) | `!AnotherStages.playerHasStage(player, '…')` |
| `OR` | `a \|\| b` |
| `DEF_*` + `.when([i], …)` branches | Nested `if` / separate blocks for **script** reactions — **not** a replacement for persistent restrict rules |

For **gating** items/recipes/blocks/guis that must stay active and show in JEI, keep using [Stage-Items](Stage-Items) (and sibling) managers or datapack JSON.

---

## See also

- [Stage-Runtime](Stage-Runtime) — `stageChanged`, `call_action`, client sync, reload
- [Stage-Items](Stage-Items) — restriction fluent (`.logic*` / `.when`) still valid
- [Stage-Recipes](Stage-Recipes) · [Stage-Blocks](Stage-Blocks) · [Stage-Guis](Stage-Guis)
- [Stage-Actions](Stage-Actions) — JSON actions on add/remove
