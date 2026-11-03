# Suspicious Delivery

**Requires Iskandert's Utilities `3.4.0.0.0` or newer** (not present in earlier mod releases).

## Related

| Topic | Page |
|-------|------|
| Ancient Tablet & Ancient Table | [Ancient-Tablet-and-Table](Ancient-Tablet-and-Table) |

**Suspicious Delivery** (`iska_utils:suspicious_delivery`) is a consumable item that grants a random reward when used. Pack developers configure the loot table via datapack; obtaining (Wandering Trader drop and trade) is handled by the mod.

## Obtaining (vanilla integration)

| Source | Behavior |
|--------|----------|
| **Wandering Trader — trade** | Listed in the `wandering_trader/uncommon` trade pool (`data/iska_utils/villager_trade/wandering_trader/suspicious_delivery_12.json` … `_16.json`). Cost: **12 emeralds** (datapack), up to **8** uses per offer. |
| **Wandering Trader — fallback trade** | If a trader spawns without a Suspicious Delivery offer from datapacks, the mod **injects** one offer (12–16 emeralds, 8 uses). At most **one** Suspicious Delivery trade per trader (duplicates are removed). |
| **Wandering Trader — drop** | **50%** chance to drop one Suspicious Delivery when the trader is killed. |
| **Mimic (optional)** | If the **Artifacts** mod is loaded, a **5%** loot pool on the Mimic can drop one item from tag `iska_utils:curio_compat/mimic` (default: `suspicious_delivery` only). Artifacts inside the **Suspicious Delivery** are **not** dropped directly by the Mimic. |

Tooltip lines (lang keys):

- `tooltip.iska_utils.suspicious_delivery.obtaining0` — dropped by Wandering Trader
- `tooltip.iska_utils.suspicious_delivery.obtaining1` — traded by Wandering Trader
- `tooltip.iska_utils.suspicious_delivery.obtaining2` — optional Mimic line (only when Artifacts is loaded)

## Using the item

- **Use** (right-click): server picks **one** weighted entry from the loaded definition, runs all actions in that entry’s `do` list, then **consumes** one item from the stack.
- **Shift+use** (sneak + right-click): **3.8.0.0.0+** — opens packages in a loop while the stack still has items. After each roll, if the entry has `quick_open: true`, continues; if `quick_open` is `false` or omitted, opens **that** package once and then **stops** (remaining stack is kept).
- Items are dropped at the player’s position (`drop` action). Messages use the same `message` format as [Command Items](Command-Items#message-action).
- If no definition is loaded or all weights are zero, the item is still consumed but nothing is granted.

## Datapack location

Place JSON under:

```text
data/<namespace>/load/iska_utils_suspicious_delivery/
```

Or a flat file under `data/<namespace>/load/` with `"type": "iska_utils:suspicious_delivery"` (routed by type).

**Reload:** `/iska_lib_dev reload` or `/reload`.

**Important:** Only **one** definition file is kept at runtime — the last matching file in datapack load order **replaces** the entire table (entries are **not** merged across files). Use a single file or namespace priority you control.

## JSON format

```json
{
  "type": "iska_utils:suspicious_delivery",
  "overwritable": true,
  "entries": [
    {
      "weight": 1,
      "luck": 0,
      "do": [
        { "drop": "iska_utils:drop_of_entropy" }
      ]
    },
    {
      "weight": 3,
      "luck": 0,
      "do": [
        { "message": {
          "target": "@s",
          "distance": 0,
          "color": "#FFD700",
          "in": "action_bar",
          "text": "message.suspicious_delivery.mining_equitizer"
        }},
        { "drop": "iska_utils:mining_equitizer" }
      ]
    }
  ]
}
```

### Root fields

| Field | Description |
|-------|-------------|
| `type` | Must be `iska_utils:suspicious_delivery` |
| `overwritable` | Optional; same semantics as other load JSON (default generation / overwrite protection) |
| `entries` | Array of loot entries (preferred key) |
| `entrities` | Legacy alias for `entries` (typo kept for backward compatibility) |

### Entry fields

| Field | Default | Description |
|-------|---------|-------------|
| `weight` | `0` | Relative weight. Entries with `weight ≤ 0` are skipped in the roll total. |
| `luck` | `0` | Signed tier for fortune / unluck rerolls (see below). |
| `jeimode` | `show` | JEI display: `show`, `hidden`, or `mask`. |
| `stages` | `[]` | Stage conditions (same objects as [Command Items](Command-Items)). |
| `stages_logic` | `AND` | `AND`, `OR`, `DEF_AND`, or `DEF_OR`. |
| `mods` | — | Mod presence pool (see [Mod and stage gates](#mod-and-stage-gates-3500000)). |
| `mods_logic` | `AND` | `AND`, `OR`, `DEF_AND`, or `DEF_OR`. |
| `do` | `[]` | Ordered script actions when this entry wins. |
| `quick_open` | `false` | **3.8.0.0.0+** — when `true`, this entry may continue in a **shift+use bulk** open chain. Leave `false` or omit for entries with `delay`, `execute`, or long scripts (e.g. fake TNT bomb). |

### Actions in `do`

Same action types as command items (`execute`, `message`, `delay`, `if`, per-action `stages`). Suspicious Delivery also supports:

| Action | JSON | Description |
|--------|------|-------------|
| **Drop** | `{ "drop": "namespace:item_id" }` | Spawns one item entity at the player (optional — entries can be message/command only). |
| **Message** | `{ "message": { ... } }` | See [Command Items — Message action](Command-Items#message-action). |
| **Execute** | `{ "execute": "..." }` | Runs as the player (`@s`, `~ ~ ~`). Command text is passed through unchanged. |
| **Delay** | `{ "delay": 20 }` | Waits N ticks before the next action (async per player). |

`item: delete/consume/...` actions are ignored with a log warning.

### `jeimode` and JEI

Same layout as **[Factory](Factory)**: one input slot (**Suspicious Delivery**) and a **9×3** output grid per page (up to **27** visible entries per JEI page; extra pages if needed).

- **show** — one grid slot per entry; if `do` has several `drop` actions, they **alternate in that same slot** (`addItemStacks`).
- **hidden** — not shown in the grid; `weight` still counts in the percentage denominator.
- **mask** — **wins over drops**; that slot always shows `iska_utils:suspicious_delivery_undefined`.

Per-slot tooltip: `30.0%` (one decimal) and optional `luck: <value>` when `luck ≠ 0`. Percentages use the **eligible pool** for the current player context (mods always; stages on SP / integrated server). JEI refreshes when opening the category or the Suspicious Delivery GUI — no `/reload` required after stage changes.

### Luck reroll (Fortune / Unluck)

While opening a **Suspicious Delivery**, the player’s **Luck** and **Bad Luck** effects adjust the weighted roll:

- **Net** = `(LUCK level) − (UNLUCK level)` where level = amplifier + 1 (0 if absent).

**Fortune** (`net ≥ 0`):

| Phase | Reroll chance if entry `luck` below threshold |
|-------|--------------------------------------------------|
| Tier 1 | `min(50, 30 + net×5)%` while `luck < 0` |
| Tier 2 (net ≥ 5) | `min(100, 50 + (net−4)×10)%` while `luck < 0` |
| Tier 3 (net ≥ 10) | Reroll until `luck ≥ 1000` (max 64 tries) |
| Tier 4 | Reroll until `luck ≥ 10000` (max 64 tries) |

**Unluck** (`net < 0`): symmetric with `effective = −net`, rerolling while `luck > 0` and toward `luck ≤ −1000` / `≤ −10000`.

If no entry in the pool reaches the forced threshold, the current pick is kept (debug log).

### Example: nested Suspicious Delivery

```json
{
  "weight": 2,
  "luck": 0,
  "jeimode": "show",
  "do": [
    { "message": { "target": "@s", "in": "action_bar", "text": "message.iska_utils.suspicious_delivery.nested" } },
    { "drop": "iska_utils:suspicious_delivery" }
  ]
}
```

### Example: bomb (`jeimode: mask`, `luck: -10`)

Use these **exact** execute strings (do not alter NBT or selectors):

```json
{
  "weight": 3,
  "luck": -10,
  "jeimode": "mask",
  "do": [
    { "message": { "target": "@s", "in": "action_bar", "text": "message.iska_utils.suspicious_delivery.bomb_tickle" } },
    { "delay": 20 },
    { "message": { "target": "@s", "in": "action_bar", "color": "#FF0000", "text": "message.iska_utils.suspicious_delivery.bomb_alarm" } },
    { "execute": "summon tnt ~ ~ ~ {fuse:5000, Tags:[\"fake_tnt\"]}" },
    { "delay": 100 },
    { "execute": "kill @e[type=tnt,tag=fake_tnt]" },
    { "message": { "target": "@s", "in": "action_bar", "text": "message.iska_utils.suspicious_delivery.bomb_clock" } },
    { "drop": "minecraft:clock" }
  ]
}
```

## Shift+click bulk open (`quick_open`) (3.8.0.0.0+)

**Requires Iskandert's Utilities `3.8.0.0.0` or newer.**

- **Normal use:** one package per click (unchanged).
- **Shift+use:** server opens packages in a loop while the stack still has items:
  1. Weighted roll → run `do[]` → consume 1 item.
  2. If the winning entry has `quick_open: true` and the stack is not empty → repeat.
  3. If `quick_open` is `false` or omitted → open **this** package, then **stop** (remaining stack is kept).

Pack authors should set `"quick_open": true` on instant rewards (drops, messages) and omit it or set `false` on entries with `delay`, `execute`, or other long scripts (e.g. fake TNT bomb).

Example — instant reward (bulk-eligible):

```json
{
  "weight": 100,
  "luck": 500,
  "quick_open": true,
  "do": [{ "drop": "iska_utils:chosen_cheese" }]
}
```

Example — bomb (not bulk-eligible; default `quick_open: false`):

```json
{
  "weight": 50,
  "luck": -10,
  "jeimode": "mask",
  "do": [
    { "message": { "target": "@s", "in": "action_bar", "text": "message.iska_utils.suspicious_delivery.bomb_tickle" } },
    { "delay": 20 },
    { "execute": "summon tnt ~ ~ ~ {fuse:5000, Tags:[\"fake_tnt\"]}" }
  ]
}
```

## Default loot table (mod jar)

Built-in `data/iska_utils/load/iska_utils_suspicious_delivery/suspicious_delivery.json` includes:

- `drop_of_entropy` (`luck: 10000`) — **only when Artifacts is not loaded** (`mods: [{ "mod": "artifacts", "is": false }]`)
- `cursed_key` (`luck: 10000`) — **only when Artifacts is loaded** (`mods: [{ "mod": "artifacts", "is": true }]`); same weight slot as Drop of Entropy, mutually exclusive
- Artifacts `luck` 100–1200 (weight **100**, `cursed_candle` **75**); nested **85**; bomb (mask) **50**; **Arcane Dictionary** **50** / `luck: 30`; entropy **30** (rarest by weight among scripted outcomes)
- Nested Suspicious Delivery (`luck: 0`, drops another `suspicious_delivery`)
- Bomb entry above (`luck: -10`, `jeimode: mask`)

Override by adding your own file in a datapack with the same `type`; ensure it is the winning file if multiple packs define one.

## Localization

Add keys under `assets/<namespace>/lang/` for any `message` actions, for example:

```json
"message.suspicious_delivery.mining_equitizer": "Mining Equitizer found"
```

## Mod and stage gates (3.5.0.0.0+)

**Requires Iskandert's Utilities `3.5.0.0.0` or newer.**

Entry-level gates use the same field names as [Command Items](Command-Items): `mods`, `mods_logic`, `stages`, `stages_logic`. Entries are **always loaded** at `/reload` (no load-time stripping when a mod is missing).

### Pool roll (`weight` denominator)

| `stages_logic` / `mods_logic` | Entry in weighted roll |
|-------------------------------|------------------------|
| `AND` / `OR` | Only when **both** mod and stage sides pass (`isFullyEligible`) |
| `DEF_AND` / `DEF_OR` | **Always** in the pool; gates run inside `do[]` via `if` blocks |

For `DEF_*`, `stages[]` / `mods[]` are an **indexed pool**. Inside each `if` block, `conditions` / `mod_conditions` list indices (same layout as command items). Multiple sibling `if` blocks in one action are evaluated **in order**; the first block whose conditions pass runs its payload.

```json
{
  "weight": 10,
  "stages_logic": "DEF_OR",
  "stages": [
    { "stage_type": "player", "stage": "early", "is": true },
    { "stage_type": "player", "stage": "late", "is": true }
  ],
  "do": [{
    "if": [
      [{ "conditions": [0] }, { "drop": "iska_utils:entropy_crystal_early" }],
      [{ "conditions": [1] }, { "drop": "iska_utils:entropy_crystal_late" }]
    ]
  }]
}
```

### JEI behaviour

- **`jeimode: hidden`** + entry not eligible → hidden from grid **and** excluded from `%` denominator.
- **`jeimode: show`** + several `{ "drop" }` in `do[]` → one slot with alternating stacks (unchanged).
- Missing mod → entry hidden on client.
- **DEF** entries stay visible in JEI; `%` uses the AND/OR eligible pool; DEF entries count in the rollable denominator (documented for pack authors).

### Flat AND / OR (no `if`)

When `stages_logic` and `mods_logic` are **`AND` or `OR` only**, the whole entry must pass before it enters the roll pool:

```json
{
  "weight": 50,
  "mods": [{ "mod": "artifacts", "is": true }],
  "mods_logic": "AND",
  "stages": [{ "stage_type": "player", "stage": "chapter_2", "is": true }],
  "do": [{ "drop": "artifacts:everlasting_beef" }]
}
```

| Field | Description |
|-------|-------------|
| `mod` | NeoForge mod ID |
| `is` | `true` = mod must be loaded; `false` = mod must **not** be loaded |
| `stage_type` | `player`, `world`, or `team` |
| `stage` | Stage id string |
| `is` (stage) | Stage must be set (`true`) or unset (`false`) |

## Related

- **Optional Mimic drop:** tag `iska_utils:curio_compat/mimic` (Dev) — see [Home — Configurable Tags](Home#configurable-tags). Default tag value is only `suspicious_delivery`.
- **Command items** (same `message` action): [Command-Items](Command-Items)
