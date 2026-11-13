# Stage Guis

[← Home](Home) · [Overlapping restrictions](Overlapping-Restrictions) · [KubeJS ↑](#1-kubejs-preferred) · [Datapack ↓](#2-datapack-json)

Block opening machine / chest / merchant menus by stage, force-close when stages change, and optionally gate slots.

When several rules match the same menu, see **[Overlapping restrictions](Overlapping-Restrictions)** (`.priority` / higher wins for exclusive message).

GUI gating is **new in Another Stages** (not migrated from Utils / Library). Stage CRUD still comes from Library.

`PlayerContainerEvent.Open` is not cancellable: **block open** and **force close** use the same `closeContainer()` path.

---

## 1. KubeJS (preferred)

Prefer **`AnotherStagesEvents.restrictions`**. Legacy `AnotherStages.guis.restrict()…` still works. Fluent `.logic*` / `.stages` remain valid for persistent GUI locks.

Script queries/mutators (`AnotherStages.playerHasStage` / `addPlayerStage` / …) work in **any** `server_scripts` handler with a player/level (classic `if`/`for`/`while`) — not only GUI events. Full catalog + examples: **[Kube-Stage-API](Kube-Stage-API)**.

```js
// example: gate custom script logic (restrictions below stay for lasting menu locks)
if (!AnotherStages.playerHasStage(player, 'bronze_age')) {
  // e.g. deny a custom command / give a tip
}

AnotherStagesEvents.restrictions(event => {
  event.guis.restrict()
    .id('pack:no_chest_early') // optional
    .logicAnd()
    .stages([
      { stage_type: 'player', stage: 'bronze_age', is: false },
    ])
    .menus(['net.minecraft.world.inventory.ChestMenu'])
    .menuTypes(['minecraft:generic_9x3', 'minecraft:merchant'])
    .blockOpen(true) // default
    .message(true) // inherit default lang key message.another_stages.gui_blocked
    // .message('message.another_stages.gui_blocked') // lang key (translated)
    // .message('This menu is locked') // literal (not translated)
    // .message(Text.translate('pack.msg.gui_locked')) // formatted Text
    // Slot limits (menu stays open only if blockOpen(false)):
    .blockedSlots([0, 1, 2])
    .blockedItems(['minecraft:diamond', '#c:ores'])
    .maxSlots(9)
})
```

Auto-id: `another_stages:kjs/gui/<fingerprint>`.

Villager trades: include `net.minecraft.world.inventory.MerchantMenu` and/or `minecraft:merchant` — no separate trade system.

### Feedback `message` (Kube + JSON)

Always **lang key** (traducibile) **or** **literal string** (non traducibile). Prefer Kube `Text.translate` / `Text.of` for formatting.

| Call / JSON | Effect |
|-------------|--------|
| omitted / blank string | Default lang key `message.another_stages.gui_blocked` |
| `.message(true)` | Same default lang key |
| `.message('message.another_stages.gui_blocked')` | Lang key — dotted, no spaces → translated |
| `.message('This menu is locked')` | Literal — shown as-is, **not** translated |
| `.message(Text…)` | Formatted `Component` (priority over string) |

JSON `message` is string-only (same lang-key vs literal heuristic).

| Kube | JSON | Default | What it does |
|------|------|---------|--------------|
| `.priority(n)` | `priority` | `0` | When several stage-active rules match the same menu, **higher wins** for exclusive fields (message). Tie → load order. Full flow → [Overlapping-Restrictions](Overlapping-Restrictions). |
| `.logicAnd()` / `.logicOr()` | `stages_logic` | `AND` | How `stages` combine: **`AND` or `OR` only**. No `DEF_*` / `.when()` on guis — those are [Stage-Items](Stage-Items#def_or-branches) only. |
| `.stages([...])` | `stages` | empty | `{ stage_type, stage, is }`. `is` default `false` = lock while stage **missing**. |
| `.menus([...])` | `menus` / `menu` | empty | FQCN matchers for `AbstractContainerMenu`. |
| `.menuTypes([...])` | `menu_types` / `menu_type` | empty | `MenuType` registry ids. |
| `.blockOpen(bool)` | `block_open` | `true` | Close immediately on open when the rule applies. |
| `.message(true\|false\|string\|Text)` | `message` | `message.another_stages.gui_blocked` when blank/omitted | Action-bar when blocked/closed. Lang key **or** literal; Kube `Text` for full formatting. |
| `.blockedSlots([...])` | `blocked_slots` | empty | Slot indices that reject clicks. |
| `.blockedItems([...])` | `blocked_items` | empty | Items not placeable in the menu content. |
| `.maxSlots(n)` | `max_slots` | `0` (off) | Soft cap on non-player filled slots. |

---

## 2. Datapack (JSON)

| `type` | Notes |
|--------|--------|
| `another_stages:stage_gui` | Canonical |

**Path:** any `data/<namespace>/load/**/*.json` with matching `type` (recommended `another_stages_guis/` optional).
Prefer **bundling**: one file, many entries in `restrictions`.

```json
{
  "type": "another_stages:stage_gui",
  "restrictions": [
    {
      "stages_logic": "AND",
      "stages": [
        { "stage_type": "player", "stage": "bronze_age", "is": false }
      ],
      "menus": ["net.minecraft.world.inventory.ChestMenu"],
      "menu_types": ["minecraft:merchant"],
      "block_open": true,
      "message": "This menu is locked",
      "blocked_slots": [],
      "blocked_items": [],
      "max_slots": 0
    }
  ]
}
```

### Fields

- `menus` — FQCN of `AbstractContainerMenu` (same idea as stage_item `containers_list`); also `regex:` / `@mod` via string match on the class name.
- `menu_types` — `MenuType` registry ids.
- `block_open` — default `true`; close immediately on open when the rule applies.
- `message` — **lang key** (dotted, no spaces → translated) **or** **literal** (not translated). Omitted/blank → `message.another_stages.gui_blocked`. Kube may use `Text` instead of a string.
- `blocked_slots` — slot indices that reject clicks (mixin `gui_slots`, config-gated).
- `blocked_items` — id / `#tag` / `@mod` / `regex:` not placeable in the menu content.
- `max_slots` — soft cap on non-player filled slots; excess dropped to the player (`0` = off).

Matching: if both `menus` and `menu_types` are set, either may match. At least one list must be non-empty.

Reload: world start, `/iska_lib_dev reload` (with AS), `/reload`, `/another_stages reload`, `/iska_lib_stage reload`, `/kubejs reload server_scripts` (all KubeJS stage rules).
