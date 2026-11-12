# Stage Items

[← Home](Home)

Restrict items based on player, team, or world stages.

### Heritage

Same feature as the old Utils / Library wiki ([Stage-Items](#/iskandert-utilities/Stage-Items)):

1. **Utilities** — `iska_utils:stage_item` (any `load/**`; recommended `load/iska_utils_stage_items/`).
2. **Library `1.12.0.0.0+`** — alias `iska_lib:stage_item`.
3. **Another Stages** — owns gating when installed (Library skips its handler). Old packs keep working without edits.

Canonical new type: `another_stages:stage_item`. **Path:** any `data/<ns>/load/**/*.json` with matching `type` (subfolders are conventions only).

| Feature | Since |
|---------|--------|
| Core JSON gating (`stages`, `items`, `exclude`, containers, `other_case`, consequences, DEF_*) | Utilities → Library (see [old wiki](#/iskandert-utilities/Stage-Items)); still valid; **moved to Another Stages** when AS is installed |
| Types `iska_utils:stage_item` / `iska_lib:stage_item` | Pre-AS (legacy, still accepted) |
| Mod conditions on load JSON | Utilities **3.5.0.0.0+** (still valid); owned by AS when installed |
| Datapack `another_stages:stage_item` | Another Stages 0.1.0.0.0 |
| KubeJS fluent managers (`AnotherStages.items`) | Another Stages 0.1.0.0.0 |
| KubeJS `AnotherStagesEvents.restrictions` (preferred) | Another Stages 0.1.0.0.0 |
| `tooltips` / `hide_default_tooltips` | Another Stages 0.1.0.0.0 |
| `recipe_viewer` (`overlay` / `hardcore` / `hide`) | Another Stages 0.1.0.0.0 |
| `hide_item_name` / `hidden_item_name` (Unfamiliar or custom) | Another Stages 0.1.0.0.0 |
| `other_case: ["all"]` shorthand | Another Stages 0.1.0.0.0 |
| `cases` alias of `other_case` (both accepted; merge if both present) | Another Stages 0.1.0.0.0 |
| Case `inventory` (player inv scan; default every 30 ticks) | Another Stages 0.1.0.0.0 |
| `inventory_ticks` | Another Stages 0.1.0.0.0 |
| `can_pickup` / `pickup_message` | Another Stages 0.1.0.0.0 |
| Kube `.caseAll(X)` (click+hands+inventory) | Another Stages 0.1.0.0.0 |
| Kube `.caseRightClick` / `.consequenceBlock` / `.cases` / `.consequences` | Another Stages 0.1.0.0.0 |
| Click cancel client+server (`cases` + `consequence`) | Another Stages 0.1.0.0.0 |
| Overlay lock without dark tint; lock also on JEI ingredient list | Another Stages 0.1.0.0.0 |

`overwritable` is obsolete and ignored if present.

---

## 1. KubeJS (preferred)

Register restrictions with **`AnotherStagesEvents.restrictions`** in **`server_scripts`**. Stage **queries and mutators** (`AnotherStages.playerHasStage` / `addPlayerStage` / …) stay on the **`AnotherStages`** binding for any server script event (no `Stages` alias). Legacy top-level `AnotherStages.items.restrict()…` still works.

### Classic AND

```js
AnotherStagesEvents.restrictions(event => {
  event.items.restrict()
    .id('pack:bronze_swords') // optional; otherwise auto-id
    .logicAnd()
    .stages([
      { stage_type: 'player', stage: 'bronze_age', is: false },
    ])
    .items(['minecraft:diamond_sword', '#c:tools', '@ae2'])
    .exclude(['minecraft:wooden_sword'])
    .caseRightClick().caseMainHand()
    // or .caseAll() / .caseAll(20) — click+hands+inventory (ticks <1 → 30)
    // .caseInventory() / .caseInventory(20)
    // .cases(['right_click', 'inventory'])  // array or string
    .canPickup(false)
    .pickupMessage(true) // or String / Text; omit/false = silent
    .consequenceBlockDrop()
    // or .consequences('block_drop') / .consequences(['block_drop'])
    .tooltip(Text.translate('another_stages.tooltip.locked_bronze'))
    .tooltip(Text.of('Requires bronze age'))
    .hideDefaultTooltips(false)
    .viewerOverlay() // or .viewerHardcore() / .viewerHide()
    .hideItemName(true) // default: Unfamiliar Item (red); false = real name + lock chars
    .hiddenItemName(Text.translate('pack.custom.locked_name')) // optional custom name
})
```

Prefer **bundled** datapack files (one JSON, many `restrictions`) when not using Kube.

Auto-id form: `another_stages:kjs/item/<fingerprint>` (collisions get `_2`, `_3`, …).

### DEF_OR (branches)

Indices in `.when([...], …)` match positions in `.stages([...])` (same model as JSON `if` / `conditions`).

```js
AnotherStagesEvents.restrictions(event => {
  event.items.restrict()
    .id('pack:def_or_demo')
    .logicDefOr()
    .stages([
      { stage_type: 'player', stage: 'example_stage', is: false },       // 0
      { stage_type: 'world', stage: 'example_world_stage', is: false }, // 1
      { stage_type: 'player', stage: 'admin', is: true },               // 2
    ])
    .when([0], branch => branch
      .containersWhitelist(true)
      .containers(['net.namespace.inventory.container.ExampleCraftingContainer'])
      .items(['minecraft:diamond_sword'])
      .consequenceDrop()
    )
    .when([1], branch => branch
      .containers(['net.namespace.inventory.container.ExampleChestContainer'])
      .caseRightClick().caseLeftClick()
      .items(['minecraft:nether_star'])
      .consequenceBlockDelete()
    )
})
```

`.logicDefAnd()` + several `.when(...)` requires every branch to pass.

### Verb ↔ JSON

| Kube | JSON | Default | What it does |
|------|------|---------|--------------|
| `.caseRightClick()` | `cases` / `other_case`: `right_click` | (absent) | Cancel right-click / use-item **client+server** when rule applies |
| `.caseLeftClick()` | `left_click` | (absent) | Cancel left-click / attack **client+server** when rule applies (client also cancels attack key before dig prediction) |
| `.caseMainHand()` | `main_hand` | (absent) | Apply `consequence` when item is in main hand |
| `.caseOffHand()` | `off_hand` | (absent) | Apply `consequence` when item is in off hand |
| `.caseInventory()` / `.caseInventory(X)` | `inventory` + `inventory_ticks` | ticks `30` | Adds inventory case; apply `consequence` to **player** inv (items+armor+offhand). `X` omitted or `&lt; 1` → 30 |
| `.caseAll()` / `.caseAll(X)` | four click/hand + `inventory` | ticks `30` | All interaction cases **including** inventory; sets `inventory_ticks` like `.caseInventory(X)` |
| `.cases([...])` / `.cases('…')` | `cases: [...]` | `[]` | Array or string; merges into the same case list (`other_case` still accepted in JSON) |
| `.canPickup(bool)` | `can_pickup` | `true` | If `false`, blocks picking up matching ItemEntities while the rule is active |
| `.pickupMessage(true/false/String/Text)` | `pickup_message` | `""` (silent) | Action-bar when pickup denied; `true` = default lang key |
| `.consequenceDrop()` | `consequence: "drop"` | `drop` | Drop / remove stack (hand/inventory/container) |
| `.consequenceDelete()` | `delete` | — | Delete stack |
| `.consequenceBlock()` | `block` | — | Cancel click/use only; alone does **not** eject inventory; no attribute hacks |
| `.consequenceBlockDrop()` | `block_drop` | — | Block use + drop outside container |
| `.consequenceBlockDelete()` | `block_delete` | — | Block use + delete outside container |
| `.consequences([...])` / `.consequences('…')` | `consequence` (string) | last wins | Array or string; runtime keeps **one** consequence (last non-blank). JSON is always a single string |
| `.viewerOverlay()` | `recipe_viewer: "overlay"` | `overlay` | Lock badge on item (GUI + JEI list); no dark tint |
| `.viewerHardcore()` | `hardcore` | — | Replace model with flat hardcore lock |
| `.viewerHide()` | `hide` | — | Remove from JEI ingredients while rule applies |
| `.hideItemName(true)` | `hide_item_name: true` | `true` | Unfamiliar / custom name |
| `.hideItemName(false)` / `.showRealName()` | `false` | — | Real name + lock chars |
| `.hiddenItemName(...)` | `hidden_item_name` | `""` | Custom hidden name |
| `.logicAnd()` | `stages_logic: "AND"` | `AND` | All stages must match |
| `.logicOr()` / `.logicDefOr()` / `.logicDefAnd()` | `OR` / `DEF_OR` / `DEF_AND` | — | See Logic |

Multiple case verbs = union (same as a JSON list). Legacy JSON key `other_case` still loads; Kube short verbs (`.rightClick()`, `.block()`, …) are **removed**.

### Tooltips / feedback text (Kube + JSON)

Feedback and tooltip strings are always either:

- a **lang key** (traducibile) — dotted, no spaces → `Component.translatable`, or
- a **literal string** (non traducibile) — shown as-is.

Prefer Kube `Text.translate` / `Text.of` for full formatting (colors, style). JSON stays string-only with the same lang-key vs literal heuristic.

```js
.tooltip(Text.translate('another_stages.tooltip.locked_bronze'))
.tooltip(Text.of('Requires bronze age'))
.hideDefaultTooltips(false)
```

Optional `.tooltips(['lang.key', 'literal'])` mirrors datapack string arrays.

### Arrays

Wherever JSON has an array, the builder takes an array: `.stages([...])`, `.items([...])`, `.exclude([...])`, `.containers([...])`, `.tooltips([...])`.

---

## 2. Datapack (JSON)

### Types (all accepted)

| `type` | Notes |
|--------|--------|
| `another_stages:stage_item` | Canonical (new packs) |
| `iska_utils:stage_item` | Legacy |
| `iska_lib:stage_item` | Legacy |

**Path:** any `data/<namespace>/load/**/*.json` with a matching `type` (recommended `another_stages_items/` or legacy `iska_utils_stage_items/` — conventions only).

### Example

```json
{
  "type": "another_stages:stage_item",
  "restrictions": [
    {
      "stages_logic": "AND",
      "stages": [
        { "stage_type": "player", "stage": "bronze_age", "is": false }
      ],
      "containers_whitelist": false,
      "containers_list": [],
      "cases": ["all", "inventory"],
      "inventory_ticks": 30,
      "can_pickup": false,
      "pickup_message": "message.another_stages.item_pickup_blocked",
      "items": ["minecraft:diamond_sword", "#c:tools", "@ae2"],
      "exclude": ["minecraft:wooden_sword"],
      "consequence": "block_drop",
      "tooltips": [
        "another_stages.tooltip.locked_bronze",
        "Requires bronze age"
      ],
      "hide_default_tooltips": false,
      "hide_item_name": true,
      "hidden_item_name": "",
      "recipe_viewer": "overlay"
    }
  ]
}
```

(`other_case` alone still works; if both `cases` and `other_case` are present they are **merged**.)

### Optional fields

- `tooltips` — string array: each entry is a **lang key** (dotted, no spaces → translated) **or** a **literal** (not translated). Kube `.tooltip(Text…)` preferred for formatting.
- `hide_default_tooltips` — clear default tooltip lines before appending custom ones.
- `hide_item_name` — default `true`. When the item stays visible (`overlay` / `hardcore`), replace the display name. Set `false` to keep the real name with lock characters.
- `hidden_item_name` — optional custom name when hiding (**lang key** or **literal**, same rules). Empty = red **Unfamiliar Item**. Kube: `.hiddenItemName(Text…)` takes priority.
- `recipe_viewer` — `overlay` (default), `hardcore`, or `hide` (no aliases).
- `cases` / `other_case: ["all"]` — expands to right/left click + main/off hand (**not** `inventory`).
- `can_pickup` / `pickup_message` / `inventory_ticks` — see field references below.

### `can_pickup` (detail)

| | |
|--|--|
| **What it does** | While the rule is active for that item: if `false`, `ItemEntityPickupEvent` is denied — the player cannot pick the item up from the world. |
| **Default** | `true` (omit = legacy behavior, pickup allowed). |
| **Accepted values** | boolean. |
| **How it combines** | Independent of `cases` / containers. If **any** active rule for the item has `can_pickup: false`, pickup is blocked. |
| **Side effects** | Server-only. Does not drop or delete stacks already in inventory (use `cases: ["inventory"]` for that). |
| **What it does *not* do** | Does not hide JEI, change models, or eject from chests. Does not affect hopper/machine insertion. |

### `pickup_message` (detail)

| | |
|--|--|
| **What it does** | When pickup is denied (`can_pickup: false`), shows this text on the action bar (if non-blank). |
| **Default** | `""` = **silent**. |
| **Accepted values** | Lang key (dotted, no spaces) or literal string. Kube: `true` → `message.another_stages.item_pickup_blocked`; `false` → silent; `String` / `Text`. |
| **How it combines** | Uses the **first** active blocking rule that has a non-blank message (Component wins over string). Independent of consequence messages. |
| **Side effects** | Server action-bar only on denied pickup attempts. |
| **What it does *not* do** | Does not itself block pickup (needs `can_pickup: false`). Does not chat-log. |

### `inventory_ticks` (detail)

| | |
|--|--|
| **What it does** | Server-tick interval for this rule’s `inventory` case scan. |
| **Default** | `30`. Omit or value `&lt; 1` → `30`. |
| **Accepted values** | positive int (normalized). |
| **How it combines** | Per-rule: scan runs when `player.tickCount % inventory_ticks == 0`. DEF branches with `inventory` use the **parent** rule’s interval. |
| **Side effects** | Only matters if `inventory` is in `cases` / `other_case`. |
| **What it does *not* do** | Does not change container-open scanning. Does not add the `inventory` case by itself. |

### `cases` / `other_case` (detail)

| | |
|--|--|
| **What it does** | Lists contexts where `consequence` (and click cancel) apply beyond container-open filtering. |
| **Default** | `[]` (no click/hand/inventory case; containers still use `containers_*` on open). |
| **Accepted values** | `right_click`, `left_click`, `main_hand`, `off_hand`, `inventory`, `all`. JSON key **`cases`** (preferred) or legacy **`other_case`**; both → merge. Kube: `.caseRightClick()` … or `.cases([...])` / `.cases('…')`. |
| **How it combines** | Union of listed cases. `all` → four click/hand cases only; keep `inventory` if listed with `all`. Kube `.caseAll(X)` = four + `inventory` + `inventory_ticks`. DEF `if[]` branches may set their own case lists. |
| **Side effects** | `right_click` / `left_click`: cancel interact / use-item / attack **on client and server**. Client also cancels `InteractionKeyMappingTriggered` (attack=0 / use=1) so dig hold and use prediction never start — `LeftClickBlock` alone is too late for survival hold dig. `inventory`: every `inventory_ticks` server ticks scans **player** inventory only (items+armor+offhand) and applies `consequence` (drop/delete/…). No open GUI required. |
| **What it does *not* do** | `inventory` does **not** scan open chests/TE menus (that remains `containers_*`). JSON `all` does **not** imply `inventory`. `consequence: "block"` alone does not eject inventory stacks and does not change attack attributes. Empty hand is never gated by click cases. |

### `consequence` (detail)

| | |
|--|--|
| **What it does** | Action when a matching case fires: drop/delete stack, or cancel click/use (`block` / `block_*`). |
| **Default** | `drop` |
| **Accepted values** | `drop`, `delete`, `block`, `block_drop`, `block_delete`. JSON string. Kube: `.consequenceBlock()` … or `.consequences('block')` / `.consequences(['block'])` (last non-blank wins). |
| **How it combines** | One consequence per rule (or per DEF `if` branch). With `right_click`/`left_click`, any non-null consequence gates cancel; `block` is cancel-only. |
| **Side effects** | Server action-bar message on click cancel. Hand/inventory cases may eject stacks for drop/delete variants. |
| **What it does *not* do** | Does **not** mutate player attack damage or send fake block updates. Does **not** turn JSON into an array. |

### Recipe viewer (JEI)

| Value | Behavior |
|-------|----------|
| `overlay` (default) | Item stays visible + lock badge (`textures/stage_locking/stage_locked.png`, scaled into 16×16) in inventory GUI **and** JEI ingredient list (no darkening tint) + locked tooltip |
| `hardcore` | Real item model is never shown: replaced by the flat 2D lock (`textures/item/stage_locked_hardcore.png`) in GUI, hand, item frames, pedestals. Jade treats it as the generic hardcore item. |
| `hide` | Removed from JEI ingredient list while the rule applies |

**Display name** (when `overlay` / `hardcore` and `hide_item_name` is true):

- Custom `hidden_item_name` / `.hiddenItemName(...)` if set
- Else red **Unfamiliar Item**

### Generic hardcore item

Registered item `another_stages:stage_locked_hardcore` (internal presentation). It is **always** removed from JEI / EMI / REI ingredient lists (even with no stage rules). Packdevs should not give it to players as a real reward.

### Jade (optional)

With Jade installed, looking at a staged **item entity**:

- `overlay` + `hide_item_name` → Unfamiliar / custom hidden name (no real id/mod)
- `hardcore` → icon/name of `stage_locked_hardcore` / Unfamiliar

Custom `tooltips` / component tooltips replace the default “locked until stage …” line. Stages sync to the client for overlays/hide. Full EMI/REI stage_item hide (beyond the hardcore placeholder) is not wired yet.

### Logic

- `AND` — all stage conditions must match  
- `OR` — any stage condition  
- `DEF_OR` / `DEF_AND` — use `if[]` with `conditions` indices into `stages[]`

### Items / exclude

Each entry: item id, `#tag`, `@modid`, or `regex:<javaPattern>` (`Pattern.find()` on full item id; invalid pattern = no hit).

### Consequences

`drop`, `delete`, `block`, `block_drop`, `block_delete`.

### DEF_OR example

```json
{
  "type": "another_stages:stage_item",
  "restrictions": [
    {
      "stages_logic": "DEF_OR",
      "stages": [
        { "stage_type": "player", "stage": "example_stage", "is": false },
        { "stage_type": "world", "stage": "example_world_stage", "is": false },
        { "stage_type": "player", "stage": "admin", "is": true }
      ],
      "if": [
        {
          "conditions": [0],
          "containers_whitelist": true,
          "containers_list": ["net.namespace.inventory.container.ExampleCraftingContainer"],
          "items": ["minecraft:diamond_sword"],
          "consequence": "drop"
        },
        {
          "conditions": [1],
          "containers_list": ["net.namespace.inventory.container.ExampleChestContainer"],
          "other_case": ["right_click", "left_click"],
          "items": ["minecraft:nether_star"],
          "consequence": "block_delete"
        }
      ]
    }
  ]
}
```

---

## 3. Stage bindings (query + mutate)

Prefer managers for pack **gating**. Use the binding for script logic and to **grant/revoke** Library stages from any **server** Kube event (`PlayerEvents`, `ItemEvents`, `AnotherStagesEvents.stageChanged`, …).

These call **IskaLib `StageRegistry` only**. They are **not** KubeJS’s built-in stage system — do not mix the two.

```js
// Query
if (AnotherStages.playerHasStage(player, 'bronze_age')) { /* … */ }
if (AnotherStages.teamHasStage(player, 'team_unlock')) { /* … */ }
if (AnotherStages.worldHasStage(player.level, 'global_event')) { /* … */ }
if (AnotherStages.playerHasStageMatching(player, '^age_')) { /* … */ }

// Mutate (server-only; returns boolean; fires Library hooks → Stage Actions JSON + stageChanged)
AnotherStages.addPlayerStage(player, 'bronze_age')
AnotherStages.removePlayerStage(player, 'bronze_age')
AnotherStages.setPlayerStage(player, 'bronze_age', true) // or false
AnotherStages.addWorldStage(player.level, 'global_event')
AnotherStages.removeWorldStage(player.level, 'global_event')
AnotherStages.addTeamStage(player, 'team_unlock')      // player's current team (team_player)
AnotherStages.removeTeamStage(player, 'team_unlock')
AnotherStages.addNamedTeamStage(player.level, 'MyTeam', 'raid') // raw team key/name
```

| Method | Default / notes | What it does | Side effects |
|--------|-----------------|--------------|--------------|
| `playerHasStage(player, stage)` | — | Personal stages only | Read-only |
| `teamHasStage(player, stage)` | — | Player **team** stages only (not personal) | Read-only |
| `worldHasStage(level, stage)` | — | World stages | Read-only |
| `*HasStageMatching(..., regex)` | — | Any matching stage id (`Pattern.find`) | Read-only |
| `addPlayerStage(player, stage[, hideLog])` | `hideLog=false` | Grant personal stage | Hooks / Stage Actions / `stageChanged` / client sync |
| `removePlayerStage(player, stage[, hideLog])` | `hideLog=false` | Revoke personal stage | Same |
| `setPlayerStage(player, stage, value)` | — | `true`=add, `false`=remove | Same |
| `addWorldStage` / `removeWorldStage` / `setWorldStage` | — | World scope | Same (player may be null in `stageChanged`) |
| `addTeamStage` / `removeTeamStage` / `setTeamStage` | — | Player's current team (`team_player`) | Prefer over named team when FTB sync is on |
| `addNamedTeamStage` / `removeNamedTeamStage` | — | Explicit team key/name | Prefer `addTeamStage(player, …)` when possible |

`hideLog=true` skips the Library INFO line; hooks still run. Client-side / invalid args → `false`. Commands `/iska_lib_stage …` / `/another_stages …` remain valid. Manual JSON actions: `/another_stages call_action …`.

---

## Reload

- `/iska_lib_dev reload` — Utils quick reload **and** AS stage JSON + Kube soft-reload
- `/iska_lib_stage reload` or `/another_stages reload` — datapack restrictions
- `/reload` — full datapack reload  
- `/kubejs reload server_scripts` — all KubeJS stage rules
