# Arcane Dictionary (Arcane Tome)

The **Arcane Dictionary** (`iska_utils:arcane_dictionary`) is a **cursed Curio** (belt or charm slot) that stores random **arcane traits** (levels I–V). Players reroll traits with **XP**; active traits consume **entropy charges** absorbed automatically from inventory while **exactly one** dictionary is equipped in **Curios**.

Pack authors configure **which traits appear in the pool**, their **weights**, **luck bias**, **entropy consume**, and **reroll catalysts**. **How each trait behaves in gameplay is implemented in the mod** — datapacks cannot add new trait logic without a code update.

## Related

| Topic | Page |
|-------|------|
| Drop of Entropy | [Ancient-Tablet-and-Table](Ancient-Tablet-and-Table) (entropy chain) |
| Suspicious Delivery | [Suspicious-Delivery](Suspicious-Delivery) |
| Entropy materials (player guide) | in-game Patchouli / guides |

## Obtaining (default mod jar)

| Source | Notes |
|--------|--------|
| **Suspicious Delivery** | Pool entry: `weight: 50`, `luck: 30`, `jeimode: show` — same **weight** as the fake bomb entry (`weight: 50`); lower `luck` than top artifacts, so **Luck** potions reroll toward higher-`luck` rewards. |
| **Recycling** | Tag `iska_utils:delivery_recycle` — one **Drop of Entropy** via crafting table or **Factory**. |

---

## Datapack vs mod

| Area | Datapack | Mod (code) |
|------|----------|------------|
| Trait **pool** (which traits can roll) | Yes — `entries[]` | Default pool shipped in mod jar |
| Per-trait **weight**, **luck**, **ent_cha**, **color**, **cat**, **only_curio** | Yes | — |
| **Mod / stage gates** (`mods`, `stages`, `*_logic`) | Yes — **3.5.0.0.0+** | Runtime evaluation (see below) |
| **Catalyst** specs (`item_id` or `#tag`) | Yes | Matching logic only |
| **Trait gameplay** (damage, armor, potions, XP, etc.) | **No** — needs `ArcaneDictionaryEffect` in mod | 22 built-in traits (see below) |
| **Reroll** (XP cost, trait count/level curves) | **No** | Server config |
| **Per-trait strength** (Glass Skin reflect, Agility speed, etc.) | **No** | Server config |
| **Entropy fuel** (absorb drops, max storage, consume every 5 s) | **No** | Server config + hardcoded behaviour |
| **Two+ dictionaries equipped** → all traits disabled | **No** | Hardcoded |
| Curios slot, item, tooltip, JEI category | **No** | Mod assets |
| Lang / display names for traits | Datapack can reference custom `enchant` IDs, but **no effect** unless mod registers them | Built-in lang for `iska_utils:*` traits |

**Important:** An `enchant` entry is **ignored at reroll time** unless the mod registers an effect for that ID. Unknown IDs are skipped (logged at consume lookup).

---

## Datapack location

```text
data/<namespace>/load/<any_subdirectory>/
```

Every JSON file anywhere under `data/<namespace>/load/` whose root `"type"` is `iska_utils:arcane_dictionary` is loaded. You can split pools across folders (e.g. `load/iska_utils_arcane_dictionary/`, `load/my_pack_arcane/`, or flat `load/traits.json`).

**Reload:** `/reload` or `/iska_lib_dev reload` (Arcane Dictionary pool is included).

**Merge behaviour:** All matching files from all namespaces and subfolders are merged; every `entries[]` array is **appended** into one runtime pool (same pattern as Factory / Ancient Tablet — **not** last-wins per trait ID).

There is **no** config key to restrict the load folder — all subdirectories are scanned automatically.

**Gates:** each entry may declare **`mods`** and/or **`stages`** (same syntax as [Suspicious Delivery](Suspicious-Delivery) and Command Items). Only **`AND`** / **`OR`** logic — no `DEF_AND` / `DEF_OR`. Entries are **always loaded**; gates are checked at **reroll**, **runtime**, and **JEI** (see [Mod and stage gates](#mod-and-stage-gates-3500000)).

---

## JSON format

Root:

```json
{
  "type": "iska_utils:arcane_dictionary",
  "entries": [
    {
      "weight": 40,
      "luck": 15,
      "enchant": "iska_utils:lucky",
      "ent_cha": 0,
      "only_curio": false,
      "cat": ["#c:gems/lapis"],
      "color": "55FF55"
    }
  ]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | Yes | Must be `iska_utils:arcane_dictionary` |
| `entries` | Yes | Array of trait pool entries (alias `entrities` accepted, typo compat) |
| `weight` | No (default `0`) | Relative weight for random pool picks. Higher = more common. |
| `luck` | No (default `0`) | Bias for luck rerolls. Negative = “unlucky” side; positive = “lucky” side. Influenced by vanilla Luck / Bad Luck on the player. |
| `enchant` | Yes | Trait ID (`namespace:path`). Must match a **mod-registered** effect. |
| `ent_cha` | No (default `-1`) | Entropy charges drained **per trait level every 5 seconds** while active. `-1` = use the mod’s default for that trait. `0` = no entropy consume. |
| `only_curio` | No (default `true`) | When `false`, the trait can apply while the dictionary is carried in inventory (not only when equipped in Curios). |
| `color` | No (default aqua) | Trait name colour as **6-digit hex RGB** (`RRGGBB` or `#RRGGBB`). Used in **JEI title** and **dictionary tooltip** (normal + Shift brief). |
| `cat` | No | Reroll **catalysts** (offhand while shift-rerolling). Each string is `namespace:item:weight` or `#namespace:tag:weight`. The trailing **`:weight`** is added to that trait’s pool weight during the reroll (does **not** guarantee it). One catalyst item is consumed per reroll. JEI and Shift tooltip show the **resulting pick chance** with the best matching catalyst. |
| `mods` | No | Mod presence conditions (**3.5.0.0.0+**). See [Mod and stage gates](#mod-and-stage-gates-3500000). |
| `mods_logic` | No (default `AND`) | How to combine `mods[]`: `AND` or `OR` only. |
| `stages` | No | Stage conditions (**3.5.0.0.0+**). Same objects as Suspicious Delivery (`stage_type`, `stage`, `is`). |
| `stages_logic` | No (default `AND`) | How to combine `stages[]`: `AND` or `OR` only. |

### Mod and stage gates (3.5.0.0.0+)

**Requires Iskandert's Utilities `3.5.0.0.0` or newer.**

Each pool entry can require mods and/or stages. Syntax matches [Suspicious Delivery](Suspicious-Delivery) entries (not Command Item `if` blocks — **no deferred `DEF_*` logic**; if present in JSON, logged as warning and treated as **`AND`**).

```json
{
  "weight": 20,
  "enchant": "iska_utils:entropy_blade",
  "mods": [{ "mod": "create", "is": true }],
  "mods_logic": "AND",
  "stages": [
    { "stage_type": "player", "stage": "chapter_2", "is": true },
    { "stage_type": "world", "stage": "boss_defeated", "is": true }
  ],
  "stages_logic": "OR"
}
```

| Field | Description |
|-------|-------------|
| `mods[]` | Objects `{ "mod": "<modid>", "is": true \| false }`. `is: true` = mod must be loaded; `is: false` = mod must **not** be loaded. |
| `mods_logic` | `AND` (default): all mod conditions must pass. `OR`: at least one must pass. |
| `stages[]` | `stage_type`: `player`, `world`, or `team`. `stage`: stage id string. `is`: whether that stage must be set (`true`) or unset (`false`). |
| `stages_logic` | `AND` (default): all stage conditions must pass. `OR`: at least one must pass. |

**Load vs runtime:** entries are **not** stripped at load when a mod is missing. The full pool is merged at `/reload`; gates filter **per player** when rolling and when applying effects.

| When | Behaviour |
|------|-----------|
| **Reroll** | Only **eligible** entries (mod + stage satisfied) enter the weighted pool. Weights are **re-normalized** over eligible entries only. Empty eligible pool → reroll fails. |
| **Equipped dictionary** | A trait already on the item but **not eligible** stays on the tooltip but has **no effects** and **no entropy consume** until gates are satisfied again. |
| **JEI — mods** | Entries failing mod checks are **hidden** on the client (mod list is known without player context). |
| **JEI — stages** | Stage-gated entries **remain visible** (hiding would need live stage sync + JEI reload). Chance shows **0%** until the player meets the stage (when stage data is available, e.g. SP / integrated server). |
| **JEI — chance / catalyst** | Displayed percentages use the **obtainable pool** for the current context (mods always; stages when server player is resolvable). |

Both gates must pass for eligibility: `eligible = mods_ok AND stages_ok` (each side uses its own `*_logic`).

### Catalyst examples

```json
"cat": ["minecraft:golden_apple:10"]
"cat": ["#c:gems/lapis:12"]
"cat": ["#c:ender_pearls:4", "minecraft:phantom_membrane:8"]
```

Tags use the same `#id` syntax as elsewhere in Iska Utils datapacks.

---

## Built-in traits (mod-implemented)

These `enchant` IDs have gameplay code in the mod. Datapacks may re-weight, recatalyst, or change consume; **cannot redefine mechanics in JSON alone**.

| `enchant` ID | Summary |
|--------------|---------|
| `iska_utils:glass_skin` | Reflects magic damage; extra self damage when hit |
| `iska_utils:lucky` | Applies vanilla Luck |
| `iska_utils:unlucky` | Applies vanilla Bad Luck |
| `iska_utils:stone_skin` | Flat armor bonus per level |
| `iska_utils:entropy_shell` | +1 armor toughness per level; −2 max HP (fixed) |
| `iska_utils:agility` | Movement speed (no Speed potion icon) |
| `iska_utils:blood_ledger` | Regeneration at low HP |
| `iska_utils:void_thorns` | Magic thorns on attackers |
| `iska_utils:execution_line` | Bonus vs low-HP targets |
| `iska_utils:entropy_blade` | Partial armor bypass on your hits |
| `iska_utils:martyr_script` | Increased dealt and taken damage |
| `iska_utils:recall_of_knowledge` | Bonus XP from orbs |
| `iska_utils:phase_mismatch` | Chance to negate hits |
| `iska_utils:shifting_power` | Periodically rotates through another positive pool trait |
| `iska_utils:entropy_overflow` | Lowers other traits’ consume; reduces max HP |
| `iska_utils:life_siphon` | Heals a fraction of damage dealt (cap per hit) |
| `iska_utils:iron_root` | Knockback resistance per level |
| `iska_utils:quick_hands` | Attack speed per level |
| `iska_utils:entropy_funnel` | Extra entropy charges per absorbed Drop of Entropy |
| `iska_utils:last_stand` | Resistance at low HP |
| `iska_utils:grave_debt` | Slowness at high HP; movement speed when wounded |
| `iska_utils:tier_resonance` | Lowers other traits’ entropy consume by Apotheosis world tier (**Apotheosis only** — pool entry uses `mods: apotheosis`) |

Removing an entry from the datapack removes it from rolls. Adding a **new** `enchant` ID requires a mod release that registers that effect.

---

## Player-facing behaviour (mod-only, for context)

Not configurable via datapack:

| Mechanic | Behaviour |
|----------|-----------|
| Equip | Exactly **one** dictionary in Curios → traits apply. **Two or more** → **no** trait effects. |
| First obtain | Traitless dictionaries auto-roll once (free level-1 quality reroll). |
| Reroll | Main hand + **Shift + use**. Consumes XP. Quality scales trait **count** and **level** (I–V). |
| Catalyst reroll | Matching item in **offhand** adds the configured **weight bonus** (`:weight` suffix in `cat`) to linked traits during the reroll. JEI shows the **new pick chance** per catalyst. Consumes **one** catalyst item per reroll. Does **not** guarantee the trait. |
| Entropy | With **exactly one** dictionary in **Curios**, automatically absorbs **Drops of Entropy** from **inventory** (not Curios slots). Traits drain stored entropy every **5 seconds** (entropy consume). |
| Luck integration | Pool `luck` + vanilla Luck/Bad Luck can reroll low/high entries before final pick. |

---

## JEI

Category **`jei.iska_utils.arcane_dictionary`** (catalyst item: Arcane Dictionary). Lists each pool trait with effect description, weight/luck meta, optional **requires mod / requires stage** lines, and **reroll catalyst** slots (tags cycle all tag members). Requires JEI + mod **3.5.0.0.0+**.

- Traits blocked by a **missing mod** are omitted from the category.
- **Chance** and **catalyst reroll %** are computed against the **obtainable** pool (mods + stages when readable), not the raw datapack total.
- Stage-only gates do not hide entries; chance may read **0%** until the player qualifies.

---

## Example: slim pool for a pack

```json
{
  "type": "iska_utils:arcane_dictionary",
  "entries": [
    {
      "weight": 50,
      "luck": 10,
      "enchant": "iska_utils:lucky",
      "ent_cha": 0,
      "cat": ["#c:gems/lapis:12"]
    },
    {
      "weight": 50,
      "luck": -10,
      "enchant": "iska_utils:unlucky",
      "ent_cha": 0,
      "cat": ["minecraft:poisonous_potato:12"]
    },
    {
      "weight": 20,
      "luck": 0,
      "enchant": "iska_utils:stone_skin",
      "ent_cha": 8
    },
    {
      "weight": 15,
      "luck": 5,
      "enchant": "iska_utils:entropy_blade",
      "ent_cha": 4,
      "mods": [{ "mod": "create", "is": true }],
      "stages": [{ "stage_type": "player", "stage": "midgame", "is": true }]
    }
  ]
}
```

Place under `data/mypack/load/iska_utils_arcane_dictionary/traits.json` (or any `load/` subfolder). Reload. Entries **merge** with other packs’ files.
