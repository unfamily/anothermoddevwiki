# Ancient Tablet & Ancient Table

**Requires Iskandert's Utilities `3.4.0.0.0` or newer.**

Two **sibling** features that share one datapack recipe list:

| Role | Registry ID | Notes |
|------|-------------|--------|
| Portable crafter (item) | `iska_utils:ancient_tablet` | 64-slot bundle-style storage; manual left-click craft |
| Automated crafter (block) | `iska_utils:ancient_table` | Same recipes; **Drop of Chaos** fuel; Factory-like redstone |
| Shared recipe datapack `type` | `iska_utils:ancient_tab` | One `entries` list for **both** tablet and table |
| Table fuel item | `iska_utils:drop_of_chaos` | Charge stack in fuel slot (`chaos_cost` per craft) |

Registry IDs use the `iska_utils:ancient_tab*` family (`ancient_tablet` item, `ancient_table` block). Pack authors author datapack recipes with **`"type": "iska_utils:ancient_tab"`** (typically under `recipe/ancient_tab/`).

## Related

| Topic | Page |
|-------|------|
| Suspicious Delivery loot | [Suspicious-Delivery](Suspicious-Delivery) |
| Factory machine | [Factory](Factory) |
| Delivery recycle tag | [below](#delivery-recycle--drop-of-entropy) |

## Tablet vs table

| | Ancient Tablet (`ancient_tablet`) | Ancient Table (`ancient_table`) |
|---|-----------------------------------|----------------------------------|
| Trigger | Left-click in **main hand** (air or block) | Automatic tick while redstone allows |
| Storage | 64 occupied slots, **one item per slot** (insertion order) | 63 input + 1 fuel + 63 output (GUI scroll) |
| Ingredient order | `must_ordered` / `destroy_if_wrong` respected | **Always unordered**; never destroys on mismatch |
| `destroy_if_wrong` | Honoured when `must_ordered: true` | **Ignored** |
| `chaos_cost` | Ignored | Consumed from fuel per successful craft |
| Fuel | — | `drop_of_chaos` only |

---

## Datapack location

```text
data/<namespace>/recipe/<any-subfolder>/<name>.json
```

Required root field (both siblings):

```json
"type": "iska_utils:ancient_tab"
```

- **One file, many recipes:** the `entries` array can hold **several** recipe objects in the same JSON file. Iskandert's Library **splits** the bundle into one native `RecipeType` entry per row (`iska_utils:ancient_tab`) before KubeJS sees the map (NeoForge **26**: event; **1.21.1**: in-memory recipe bridge). Builtin default children: `ancient_tab/ancient_tab_0` ….
- **Child ids:** always `namespace:path_N` (continuous index `_0`, `_1`, …). Optional entry `"id"` is metadata only and is **not** used in the ResourceLocation.
- **Many files:** every `recipe/**/*.json` with `"type": "iska_utils:ancient_tab"` is registered; after split each entry is independently removable.

**Reload:** `/reload` or `/iska_lib_dev reload`.

Balance toggles (`Config.balanceAncientTab*`) still filter default outputs **after** RecipeManager load.

---

## Ancient Tablet (item)

### Using the tablet

| Action | Result |
|--------|--------|
| **Insert** | Click an item stack onto the tablet (bundle-style). Takes **one** item per click; max **64** occupied slots. |
| **Craft** | **Left-click** with the tablet in the **main hand** while it holds ingredients. First matching datapack entry wins. |
| **Empty** | **Right-click** drops all stored items on the ground. |

Only **occupied** slots participate in matching, in **insertion order** (slot `0` = first item inserted, then `1`, …).

---

## Ancient Table (block)

Block `iska_utils:ancient_table` — automated crafter for the shared datapack list above.

### GUI (200×190)

Background texture `textures/gui/backgrounds/ancient_table.png` is **200×190** pixels. Code must use `imageWidth=200`, `imageHeight=190`, and `blit(..., 200, 190, 200, 190)` so slots align with the art. Scrollbars use the same atlas and draw calls as Factory / Deep Drawers (`scrollbar.png`: 8×34 track, 8×8 up/down/handle with correct UVs).

- **63 input slots** (3×3 visible + scroll)
- **1 fuel slot** — only `drop_of_chaos`
- **63 output slots** (3×3 visible + scroll)
- Redstone mode widget above input grid (same modes as Factory)

### Config (`general_utilities`)

| Key | Default | Description |
|-----|---------|-------------|
| `304_chaosChargesPerItem` | `1000` | Charges on a full Drop of Chaos |
| `305_ancientTableCraftTicks` | `80` | Ticks per craft |
| `306_ancientTableIoSlots` | `63` | Logical input/output slot count |

### Automation

#### Hopper / item pipes

| Face | Insert | Extract |
|------|--------|---------|
| Up / sides / back | Yes (fuel-first routing) | Input + fuel |
| Down | No | Output only |

**Fuel-first:** incoming `drop_of_chaos` fills the fuel slot first; remainder goes to inputs. Chaos is not accepted in input slots unless fuel cannot take more.

#### Comparator

Block analog output **0–15** = fuel charges only:

```text
signal = floor(15 × current_charges / max_charges)
```

Empty fuel → `0`. Full Drop of Chaos → `15`. Input/output fill and craft progress are **not** reported.

The block has **no facing** — identical on all horizontal sides.

---

## Entry schema

One file, two recipes in `entries` (valid and common):

```json
{
  "type": "iska_utils:ancient_tab",
  "entries": [
    {
      "must_ordered": false,
      "destroy_if_wrong": false,
      "chaos_cost": 1,
      "require": [ "minecraft:rotten_flesh", "minecraft:rotten_flesh" ],
      "produce": [ "minecraft:bone" ]
    },
    {
      "must_ordered": false,
      "destroy_if_wrong": false,
      "require": [ "minecraft:bone", "minecraft:bone" ],
      "produce": [ "minecraft:diamond" ]
    }
  ]
}
```

On tablet left-click (or table auto-craft), the mod tries each entry in order; the **first** full match runs.

### Fields per entry

| Field | Default | Description |
|-------|---------|-------------|
| `must_ordered` | `false` | First N tablet slots (by insertion order) must match `require` **in list order**. **Table:** ignored — always unordered |
| `destroy_if_wrong` | `false` | Only with `must_ordered` on **tablet**. Wrong slot order: see **Wrong order** below. **Table:** ignored |
| `chaos_cost` | `1` | Chaos charges consumed from **Ancient Table** fuel per craft. **Tablet:** ignored |
| `require` | — | Inputs; **tags allowed** (`#namespace:path`) |
| `produce` | — | Outputs; **items only** (no tags) |
| `mods`, `mods_logic`, `stages`, `stages_logic` | — | **3.5.0.0.0+** Optional gates — see [Mod and stage gates](#mod-and-stage-gates-3500000) |
| `if` | — | **3.5.0.0.0+** Deferred variant branches (DEF only) — see gates section |

### Mod and stage gates (3.5.0.0.0+)

**Requires Iskandert's Utilities `3.5.0.0.0` or newer.**

Two modes per entry:

**A) Flat `AND` / `OR`** — add `mods` / `stages` on the entry. Craft/JEI only when `isFullyEligible` for the evaluating player.

**B) `DEF_AND` / `DEF_OR`** — `stages[]` / `mods[]` form an indexed pool; top-level **`if[]`** lists branches (same layout as command items: each branch is `[ {conditions…}, { require, produce } ]`). Indices in a branch: `DEF_AND` needs all, `DEF_OR` any. The **first** branch whose `if` passes defines the active `require` / `produce`. A branch with empty `require` or empty `produce` is skipped even if its `if` would pass. No usable branch → entry does not match for that player.

```json
{
  "chaos_cost": 10,
  "stages_logic": "DEF_OR",
  "stages": [
    { "stage_type": "player", "stage": "early", "is": true },
    { "stage_type": "player", "stage": "late", "is": true }
  ],
  "if": [
    [
      { "conditions": [0] },
      {
        "require": [{ "id": "#c:gems/amethyst", "count": 8 }],
        "produce": ["iska_utils:entropy_crystal_early"]
      }
    ],
    [
      { "conditions": [1] },
      {
        "require": [{ "id": "#c:ingots/copper", "count": 16 }],
        "produce": ["iska_utils:entropy_crystal_late"]
      }
    ]
  ]
}
```

Do **not** use `stage_conditions` / `mod_conditions` at entry root — only inside `if` condition objects.

| Context | Player for gate |
|---------|-----------------|
| **Tablet** left-click | Player who clicks |
| **Ancient Table** automation | **Owner** — set on first GUI open, cleared when block breaks |

| Situation | Ungated recipes | Gated recipes |
|-----------|-----------------|---------------|
| Block never opened | OK | **Ignored** |
| Owner offline / absent | OK | **Ignored** (no fallback) |
| Owner eligible | OK | OK |
| Owner not eligible | OK | **Ignored** |

Hopper automation before any player opens the GUI crafts **ungated** recipes only.

**JEI:** one row per active variant; mod-blocked hidden; DEF branches not active → 0% / `requires_stage` tooltip. Refreshes when opening JEI or the Ancient Table GUI (no datapack reload).

### `require` / `produce` syntax

Each array element is either a **string** or an **object**. Every logical slot is **one item** (count `1` in the tablet); `count` on an object **repeats** that requirement across consecutive slots.

| Form | Slots used | Notes |
|------|------------|-------|
| `"minecraft:obsidian"` | 1 | Exact item |
| `"#c:ingots/copper"` | 1 | Any item in tag (`require` only) |
| `{"id": "iska_utils:drop_of_entropy", "count": 8}` | 8 | Same item in 8 consecutive requirements |
| `{"id": "#c:gems/amethyst", "count": 8}` | 8 | Tag in `id` field (see mod default below) |
| `{"item": "minecraft:diamond"}` | 1 | `item` is an alias for `id` |
| `"minecraft:stone_shovel[damage=10]"` | 1 | Item with **damage ≥ 10** (durability used) |

**Produce:** same syntax, but **tags are rejected** (logged at load). Each fulfilled output line gives **one** item stack (size `1`). To grant multiple items, list several outputs or repeat objects with `count`.

### Matching rules

| Mode | Tablet | Table |
|------|--------|-------|
| `must_ordered: false` | Each `require` line matches **any unused** occupied slot | Same (always this mode) |
| `must_ordered: true` | Slot `0` → `require[0]`, slot `1` → `require[1]`, … | Treated as **unordered** |
| Wrong order | See **Wrong order** below | Never detected |
| Recipe scan | Entries in **load order**; stops on first `SUCCESS` **or** first `WRONG_ORDER` | First `SUCCESS` only |
| On success | Matched slots removed; outputs to inventory (then ground drop). Sound: stonecutter take result | Inputs consumed; outputs to output slots; `chaos_cost` deducted from fuel |
| Extra items | Unmatched items stay in the tablet | Unmatched inputs remain |

### Wrong order (tablet only, `must_ordered: true`)

You have the right ingredients but inserted them in the **wrong sequence** (first inserted = slot `0`):

| `destroy_if_wrong` | Feedback | Items |
|--------------------|----------|-------|
| `false` (default) | **Action bar** (no sound): *Wrong component order in the tablet.* / IT: *Ordine dei componenti errato nella tavoletta.* | **Kept** — fix order and left-click again |
| `true` | **Action bar** + sound: fire extinguish — *Wrong component order. The tablet contents were destroyed.* / IT: *Ordine dei componenti errato. Il contenuto della tavoletta è stato distrutto.* (`wrong_order_destroyed`) | **Deleted** — `clear()` wipes tablet NBT; items are **not** dropped on the ground |

`destroy_if_wrong` without `must_ordered` does nothing (wrong order is never detected).

---

## Examples

### 1. Default — Entropy Crystal (mod jar)

First entry in `data/iska_utils/recipe/ancient_tab/ancient_tab.json` — unordered, 12 slots total:

```json
{
  "type": "iska_utils:ancient_tab",
  "entries": [
    {
      "require": [
        { "id": "#c:gems/amethyst", "count": 8 },
        { "id": "iska_utils:drop_of_entropy", "count": 4 }
      ],
      "produce": [ "iska_utils:entropy_crystal" ]
    }
  ]
}
```

**Inputs:** 8× any amethyst gem tag + 4× Drop of Entropy, in **any** slot positions (tablet) or input layout (table). **Output:** 1× Entropy Crystal.

---

### 2. Default — Unstable Entropy Catalyst (mod jar)

Second entry in the same `ancient_tab.json` — unordered, 29 slots:

```json
{
  "type": "iska_utils:ancient_tab",
  "entries": [
    {
      "require": [
        { "id": "#c:ingots/copper", "count": 16 },
        { "id": "iska_utils:drop_of_entropy", "count": 8 },
        { "id": "#c:nether_stars", "count": 4 },
        "minecraft:dragon_breath"
      ],
      "produce": [ "iska_utils:unstable_entropy_catalyst" ]
    }
  ]
}
```

**Inputs:** 16× copper ingot tag, 8× Drop of Entropy, 4× nether star tag, 1× Dragon's Breath. **Output:** 1× Unstable Entropy Catalyst.

---

### 3. Minimal custom recipe

`data/mypack/recipe/ancient_tab/compact_coal.json`:

```json
{
  "type": "iska_utils:ancient_tab",
  "entries": [
    {
      "require": [
        "minecraft:coal",
        "minecraft:coal",
        "minecraft:coal",
        "minecraft:coal"
      ],
      "produce": [ "minecraft:diamond" ]
    }
  ]
}
```

Equivalent to four separate coal slots using the object form:

```json
"require": [ { "id": "minecraft:coal", "count": 4 } ]
```

---

### 4. Ordered ritual — harsh (`must_ordered` + `destroy_if_wrong: true`)

**Tablet only** — ingredients must be inserted **in this exact sequence** (first inserted = slot 0). Wrong order **deletes** all tablet contents (no refund, no drops). On the **Ancient Table**, this entry still crafts with ingredients in **any** order and never punishes wrong layout:

```json
{
  "type": "iska_utils:ancient_tab",
  "entries": [
    {
      "must_ordered": true,
      "destroy_if_wrong": true,
      "require": [
        "minecraft:crying_obsidian",
        "minecraft:ender_pearl",
        "minecraft:blaze_powder",
        "iska_utils:drop_of_entropy"
      ],
      "produce": [ "iska_utils:entropy_crystal" ]
    }
  ]
}
```

| Tablet order (slots 0→3) | Result |
|--------------------------|--------|
| Crying obsidian → Ender pearl → Blaze powder → Drop of Entropy | Craft succeeds |
| Same items but e.g. ender pearl inserted before crying obsidian | Contents **wiped** + action bar (`wrong_order_destroyed`) + extinguish sound |
| Missing one ingredient | No craft (no punishment) |

---

### 5. Ordered — warning only (`destroy_if_wrong: false`)

Same ordering rules on **tablet**; mistake = action bar only, **items stay**:

```json
{
  "type": "iska_utils:ancient_tab",
  "entries": [
    {
      "must_ordered": true,
      "destroy_if_wrong": false,
      "require": [
        "minecraft:gold_ingot",
        "minecraft:gold_ingot",
        "minecraft:emerald"
      ],
      "produce": [ "minecraft:netherite_ingot" ]
    }
  ]
}
```

Wrong order → action bar only (`message.iska_utils.ancient_tablet.wrong_order`). No sound.

---

### 6. Damaged tool as ingredient

Requires a stone shovel with **at least 10 damage** (well-used tool):

```json
{
  "type": "iska_utils:ancient_tab",
  "entries": [
    {
      "require": [
        "minecraft:stone_shovel[damage=10]",
        "minecraft:flint"
      ],
      "produce": [ "minecraft:iron_ingot" ]
    }
  ]
}
```

---

### 7. Multiple outputs

Each `produce` line is granted separately (here: three diamonds):

```json
{
  "type": "iska_utils:ancient_tab",
  "entries": [
    {
      "require": [
        { "id": "minecraft:emerald", "count": 3 }
      ],
      "produce": [
        "minecraft:diamond",
        "minecraft:diamond",
        "minecraft:diamond"
      ]
    }
  ]
}
```

Or compact:

```json
"produce": [ { "id": "minecraft:diamond", "count": 3 } ]
```

(both yield three single-count diamond stacks on success).

---

### 8. Higher table fuel cost (`chaos_cost`)

Optional per entry — only consumed on the **Ancient Table**:

```json
{
  "type": "iska_utils:ancient_tab",
  "entries": [
    {
      "chaos_cost": 10,
      "require": [ "minecraft:blaze_rod", "minecraft:blaze_rod" ],
      "produce": [ "minecraft:blaze_powder" ]
    }
  ]
}
```

Default `chaos_cost` is `1` if omitted.

---

### 9. Pack override in your namespace

Add `data/mypack/recipe/ancient_tab/extra.json` with the same `type` (one or more objects in `entries`, or several JSON files). Your recipes are **appended** to the mod defaults unless you remove those recipes in your pack. Load order among namespaces: non-`iska_utils` datapacks typically come after `iska_utils`, so your entries are tried after the mod’s unless you control pack order.

---

## Single recipe (child format)

A **child** is one array element written as a standalone recipe: the element's fields plus `"type"`, with **no** bundle array. It works both as a datapack file and with KubeJS `event.custom`.

Datapack file (e.g. `data/<ns>/recipe/dirt_to_diamond.json`):

```json
{
  "type": "iska_utils:ancient_tab",
  "fuel_cost": 1,
  "require": [
    { "id": "minecraft:dirt", "count": 1 }
  ],
  "produce": ["minecraft:diamond"]
}
```

## KubeJS

- **KubeJS mirrors:** injected `results` / `ingredients` (from `produce` / `require`) + datapack `kubejs/recipe_schema`. Codec prefers those mirrors after `replaceOutput` / `replaceInput`.
- **KubeJS examples:** `event.remove({ id: 'iska_utils:ancient_tab/ancient_tab_0' })` and `event.remove({ output: 'iska_utils:entropy_crystal' })`.

`event.custom` runs **after** Iskandert's Library has split the bundles, so a bundle passed to `event.custom` is **not** expanded: always pass a single child object (see the child format above).

```js
ServerEvents.recipes(event => {
  event.custom({
    type: 'iska_utils:ancient_tab',
    fuel_cost: 1,
    require: [{ id: 'minecraft:dirt', count: 1 }],
    produce: ['minecraft:diamond']
  }).id('kubejs:ancient_tab/dirt_to_diamond')
})
```

---

## Default mod recipes (summary)

Single file `recipe/ancient_tab/ancient_tab.json` with two `entries`:

| Entry | Slots | Output |
|-------|-------|--------|
| 1 | 12 | `entropy_crystal` |
| 2 | 29 | `unstable_entropy_catalyst` |

Full JSON: see **Examples 1–2** above.

## Delivery recycle → Drop of Entropy

Tag: `iska_utils:delivery_recycle` (`data/iska_utils/tags/item/delivery_recycle.json`)

| Channel | Location |
|---------|----------|
| Factory | any `recipe/**/*.json` with `"type": "iska_utils:factory"` — default: `recipe/factory/factory_sources.json` (`"#iska_utils:delivery_recycle"`) |
| Crafting table | `recipe/mixed/shapeless/delivery_recycle_to_entropy.json` |

**Note:** Vanilla crafting JSON tag syntax differs between **1.21.1** (`{ "tag": "iska_utils:delivery_recycle" }`) and **1.26** (`"#iska_utils:delivery_recycle"` string). Use the correct file per game version.

## JEI

Both categories list the **same** datapack entries.

| Category ID | Catalyst | Extra UI |
|-------------|----------|----------|
| `jei.iska_utils.ancient_tablet` | Ancient Tablet item | Up to **18** grouped input slots and **18** output slots; ordered/destroy warnings |
| `jei.iska_utils.ancient_table` | Ancient Table block | Shows `chaos_cost` and automation note |

Consecutive identical requirements are collapsed with a count badge (tablet category).

**Tablet warning lines** (drawn under the recipe on **1.21.1** only; **1.26** category draws slots/background but not these strings yet):

| Shown when | Key | English | Italiano |
|------------|-----|---------|----------|
| `must_ordered: true` | `jei.iska_utils.ancient_tablet.warn_ordered` | Requires exact slot order (must_ordered). | Richiede ordine esatto negli slot (must_ordered). |
| `must_ordered` **and** `destroy_if_wrong: true` | `jei.iska_utils.ancient_tablet.warn_destroy` | Wrong order destroys contents (destroy_if_wrong). | Ordine errato distrugge il contenuto (destroy_if_wrong). |

`destroy_if_wrong` alone (without `must_ordered`) shows **no** destroy warning in JEI — matching in-game behaviour.
