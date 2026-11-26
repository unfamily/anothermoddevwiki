# Factory

**Requires Iskandert's Utilities `3.3.0.0.0` or newer.**

Datapack-driven processing machine (`iska_utils:factory`): one input stack, player-selected output variant, optional RF/FE per operation. Can also act as an **alternative Stonecutter** for vanilla `minecraft:stonecutting` recipes (runtime lookup; not datapack rows).

## Related

| Topic | Page |
|-------|------|
| Delivery recycle → Drop of Entropy | [Ancient-Tablet-and-Table](Ancient-Tablet-and-Table#delivery-recycle--drop-of-entropy) |

## Datapack location

```text
data/<namespace>/recipe/<any-subfolder>/<name>.json
```

Required root field (canonical):

```json
"type": "iska_utils:factory"
```

The mod registers a real Minecraft `RecipeType` / serializer (`iska_utils:factory`). Bundle files with a `recipes` (or legacy `sources`) array are **split by Iskandert's Library** into one RecipeManager entry per row **before** KubeJS/CraftTweaker see them, so each mapping has its own recipe id and can be removed/overridden natively (NeoForge **26**: `ModifyRecipeJsonsEvent`; **1.21.1**: in-memory recipe bridge pack).

- **Bundle still allowed:** keep several rows in one JSON; Library expands them at load. Builtin default is `factory/factory_sources.json` (children become `factory_sources_0` …).
- **Child ids:** always `namespace:path_N` (continuous array index: `_0`, `_1`, …). Optional row `"id"` stays as JSON metadata only and is **not** used in the ResourceLocation.

Mod convention: `data/iska_utils/recipe/factory/` (mappings + shaped crafting for the block).

**Reload:** `/reload` or `/iska_lib_dev reload`.

## Recipe schema (`iska_utils:factory`)

```json
{
  "type": "iska_utils:factory",
  "recipes": [
    {
      "id": "dye_berry",
      "input": "iska_utils:dye_berry",
      "amount": 3,
      "energy_per_operation": 1,
      "select": [
        { "output": "minecraft:white_dye", "amount": 4 },
        { "output": "minecraft:orange_dye", "amount": 4 }
      ]
    },
    {
      "id": "delivery_recycle",
      "input": "#iska_utils:delivery_recycle",
      "amount": 1,
      "select": [
        { "output": "iska_utils:drop_of_entropy", "amount": 1 }
      ]
    }
  ]
}
```

| Field | Default | Description |
|-------|---------|-------------|
| `id` | — | Optional metadata label only (does **not** change the RecipeManager id; children are always `path_N`) |
| `input` | — | Item id (`namespace:path`) or tag (`#namespace:path`) |
| `amount` | `1` | Input items consumed **per operation** |
| `select` | — | Output variants; player picks one in the GUI |
| `energy_per_operation` | `1` | RF/FE cost per operation (ignored if the machine energy buffer is disabled in mod server config) |

Each `select` entry:

| Field | Default | Description |
|-------|---------|-------------|
| `output` | — | Output item id (`"id"` is also accepted as an alias) |
| `amount` | `1` | Output count per operation (clamped `>= 1`) |
| `stages`, `stages_logic`, `mods`, `mods_logic` | `[]` / `"AND"` | **3.5.0.0.0+** Optional per-output gate on this variant (`AND` / `OR` evaluation) |

Output ids that are not registered (e.g. optional mod compat) are **skipped** at load time; the row is kept if at least one output remains.

Row-level gate & branching fields:

| Field | Default | Description |
|-------|---------|-------------|
| `stages` | `[]` | **3.5.0.0.0+** Stage conditions (`{ "stage_type": "player"\|"team"\|"world", "stage": "<id>", "is": true\|false }`; `stage_type` defaults to `"player"`, `is` defaults to `true`) — stage data lives in **Iskandert's Library** |
| `stages_logic` | `"AND"` | **3.5.0.0.0+** `"AND"`, `"OR"`, `"DEF_AND"` (alias `"DEF"`), or `"DEF_OR"` |
| `mods` | `[]` | **3.5.0.0.0+** Mod conditions (`{ "mod": "<mod_id>", "is": true\|false }`; `is` defaults to `true`) |
| `mods_logic` | `"AND"` | **3.5.0.0.0+** `"AND"`, `"OR"`, `"DEF_AND"` (alias `"DEF"`), or `"DEF_OR"` |
| `if` | `[]` | **3.5.0.0.0+** DEF branches with `{ "select": [ … ] }` payload (first matching branch wins; mutually exclusive with flat `select[]`) |

### Mod and stage gates (3.5.0.0.0+)

**Requires Iskandert's Utilities `3.5.0.0.0` or newer.**

Stage data (`player`, `team`, and `world` stages) lives in **Iskandert's Library**. Both `stages_logic` and `mods_logic` default to `"AND"` when omitted.

**A) Flat `AND` / `OR`** — optional `mods` / `stages` on the recipe row **or** on individual `select[]` entries (per-output gate).

**B) `DEF_AND` / `DEF_OR`** — indexed `stages[]` / `mods[]` on the row + top-level **`if[]`**. Each branch payload is `{ "select": [ … ] }`. Indices in a branch: `DEF_AND` needs all, `DEF_OR` any. First matching branch supplies the output grid, craft tick, and JEI. **`select[]` flat and `if[]` on the same row are mutually exclusive** (parse warning if both present).

```json
{
  "input": "iska_utils:dye_berry",
  "amount": 3,
  "stages_logic": "DEF_OR",
  "stages": [
    { "stage_type": "player", "stage": "white_path", "is": true },
    { "stage_type": "player", "stage": "orange_path", "is": true }
  ],
  "if": [
    [
      { "conditions": [0] },
      {
        "select": [
          { "output": "minecraft:white_dye", "amount": 4 },
          { "output": "minecraft:light_gray_dye", "amount": 4 }
        ]
      }
    ],
    [
      { "conditions": [1] },
      {
        "select": [{ "output": "minecraft:orange_dye", "amount": 4 }]
      }
    ]
  ]
}
```

No branch satisfied → input still matches the row but **no output variant** (empty GUI grid, no craft).

**Factory owner:** first GUI open assigns the block owner UUID (cleared on break). Unlike Ancient Table, Factory evaluates `world` stages, offline `player` / `team` stages (via Iskandert's Library UUID lookup), and `mods` even while the owner is **offline**. Before any player opens the GUI, `if[]` branches do not match and player/team-gated outputs are skipped.

**JEI:** shows `select[]` from the active DEF branch (or flat list); dynamic refresh on JEI / Factory GUI open. Missing mod → row hidden.

## Single recipe (child format)

A **child** is one array element written as a standalone recipe: the element's fields at root level plus `"type": "iska_utils:factory"`, with **no** `recipes` (or `sources`) bundle array. Every row field — including `energy_per_operation`, `stages`, `stages_logic`, `mods`, `mods_logic`, per-output gates in `select[]`, and `if[]` — works at root level in both standalone datapack files and KubeJS `event.custom`.

### Minimal child datapack JSON

`data/<ns>/recipe/cobble_to_gravel.json`:

```json
{
  "type": "iska_utils:factory",
  "input": "minecraft:cobblestone",
  "amount": 1,
  "select": [
    { "output": "minecraft:gravel", "amount": 1 }
  ]
}
```

### Full gated child datapack JSON

`data/<ns>/recipe/staged_crushing.json`:

```json
{
  "type": "iska_utils:factory",
  "id": "staged_crushing",
  "input": "#c:cobblestones",
  "amount": 2,
  "energy_per_operation": 40,
  "stages_logic": "AND",
  "stages": [
    { "stage_type": "player", "stage": "factory_tier_2", "is": true }
  ],
  "mods_logic": "AND",
  "mods": [
    { "mod": "kubejs", "is": true }
  ],
  "select": [
    { "output": "minecraft:gravel", "amount": 2 },
    {
      "output": "minecraft:sand",
      "amount": 2,
      "stages": [{ "stage_type": "world", "stage": "desert_unlocked", "is": true }],
      "stages_logic": "AND"
    }
  ]
}
```

(To use deferred `if[]` branches in a single-recipe file, set `stages_logic` / `mods_logic` to `"DEF_AND"` or `"DEF_OR"` and supply `"if": [...]` instead of top-level `select[]`, just like in [Mod and stage gates](#mod-and-stage-gates-3500000).)

## KubeJS

See [Single recipe (child format)](#single-recipe-child-format) for the standalone JSON schema and [Mod and stage gates](#mod-and-stage-gates-3500000) for stage/mod evaluation details.

`event.custom` runs **after** Iskandert's Library has split bundle files (NeoForge **26**: `ModifyRecipeJsonsEvent`; **1.21.1**: in-memory recipe bridge), so a bundle with `recipes: [...]` passed to `event.custom` is **not** expanded. Always pass a **single child object** with `type: 'iska_utils:factory'` (do **not** use `'iska_utils:factory_sources'` in `event.custom` — only `iska_utils:factory` has a registered `RecipeSerializer`).

### Minimal `event.custom` example

```js
ServerEvents.recipes(event => {
  event.custom({
    type: 'iska_utils:factory',
    input: 'minecraft:cobblestone',
    amount: 1,
    select: [{ output: 'minecraft:gravel', amount: 1 }]
  }).id('kubejs:factory/cobble_to_gravel')
})
```

### Full `event.custom` example (all flat fields + row & per-output gates)

```js
ServerEvents.recipes(event => {
  event.custom({
    type: 'iska_utils:factory',
    id: 'staged_crushing',
    input: '#c:cobblestones',
    amount: 2,
    energy_per_operation: 40,
    stages_logic: 'AND',
    stages: [
      { stage_type: 'player', stage: 'factory_tier_2', is: true },
      { stage_type: 'team', stage: 'industry_team', is: true }
    ],
    mods_logic: 'AND',
    mods: [
      { mod: 'kubejs', is: true }
    ],
    select: [
      { output: 'minecraft:gravel', amount: 2 },
      {
        output: 'minecraft:sand',
        amount: 2,
        stages_logic: 'AND',
        stages: [{ stage_type: 'world', stage: 'desert_unlocked', is: true }],
        mods_logic: 'AND',
        mods: [{ mod: 'kubejs', is: true }]
      }
    ]
  }).id('kubejs:factory/staged_crushing')
})
```

### Deferred `if[]` `event.custom` example (`DEF_OR` / `DEF_AND`)

When using `DEF_AND` or `DEF_OR`, `stages[]` and `mods[]` act as indexed pools and the **first** matching branch in `if[]` provides the active `select[]` list (do **not** set flat `select[]` alongside `if`):

```js
ServerEvents.recipes(event => {
  event.custom({
    type: 'iska_utils:factory',
    id: 'tiered_dye_berry',
    input: 'iska_utils:dye_berry',
    amount: 3,
    energy_per_operation: 10,
    stages_logic: 'DEF_OR',
    stages: [
      { stage_type: 'player', stage: 'white_path', is: true },
      { stage_type: 'player', stage: 'orange_path', is: true }
    ],
    mods_logic: 'DEF_AND',
    mods: [
      { mod: 'kubejs', is: true }
    ],
    if: [
      [
        { conditions: [0], mod_conditions: [0] },
        {
          select: [
            { output: 'minecraft:white_dye', amount: 4 },
            { output: 'minecraft:light_gray_dye', amount: 4 }
          ]
        }
      ],
      [
        { conditions: [1] },
        {
          select: [
            { output: 'minecraft:orange_dye', amount: 4 }
          ]
        }
      ]
    ]
  }).id('kubejs:factory/tiered_dye_berry')
})
```

### `event.custom` field reference

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `type` | Yes | — | Must be `'iska_utils:factory'` |
| `id` | No | — | Optional metadata label only (does not set the KubeJS/RecipeManager recipe id; chain `.id('...')` on `event.custom(...)`) |
| `input` | Yes | — | Input item id (`'namespace:path'`) or tag string (`'#namespace:path'`) |
| `amount` | No | `1` | Input items consumed per operation (clamped `>= 1`) |
| `energy_per_operation` | No | `1` | RF/FE cost per operation (clamped `>= 0`; ignored if the Factory energy buffer is disabled) |
| `select` | Yes (unless `if` or legacy `colors`) | `[]` | Array of output variants `{ output: 'ns:item', amount?: N, stages?: [...], stages_logic?: 'AND'\|'OR', mods?: [...], mods_logic?: 'AND'\|'OR' }` (`id` alias for `output`; `amount` defaults to `1`) |
| `stages` | No | `[]` | Array of `{ stage_type: 'player' \| 'team' \| 'world', stage: '<id>', is: true \| false }` (`stage_type` defaults to `'player'`, `is` defaults to `true`; stage data lives in **Iskandert's Library**) |
| `stages_logic` | No | `'AND'` | `'AND'`, `'OR'`, `'DEF_AND'` (alias `'DEF'`), or `'DEF_OR'` |
| `mods` | No | `[]` | Array of `{ mod: '<mod_id>', is: true \| false }` (`is` defaults to `true`) |
| `mods_logic` | No | `'AND'` | `'AND'`, `'OR'`, `'DEF_AND'` (alias `'DEF'`), or `'DEF_OR'` |
| `if` | No (replaces flat `select`) | `[]` | Array of `[ { conditions: [idx...], mod_conditions: [idx...] }, { select: [...] } ]` branches (`DEF_*` mode; first matching branch wins) |
| `colors` | No | `[]` | Legacy fallback array `{ id: 'ns:item', amount?: N }` used only when `select` and `if` are both empty |

**Notes for KubeJS:**
- **Same schema on 1.21.1 and 26.1.2:** all `iska_utils:factory` field names, defaults, and `'#namespace:path'` tag strings are identical in both versions.
- **Do not pass `results` or `ingredients` manually in `event.custom`:** Library injects `results` / `ingredients` mirrors onto split bundle children (alongside `kubejs/recipe_schema`) so `event.remove` and `event.replaceOutput` / `event.replaceInput` work. In `FactorySourcesRecipe`, if `results` is non-empty it overrides `select` with `amount: 1` per output and ignores per-output `stages` / `mods`.
- **KubeJS removal / replacement examples:**
  - `event.remove({ id: 'iska_utils:factory/factory_sources_0' })`
  - `event.remove({ output: 'iska_utils:drop_of_entropy' })`
  - `event.replaceOutput({ type: 'iska_utils:factory' }, 'minecraft:white_dye', 'minecraft:blue_dye')`

## Legacy schema (`iska_utils:factory_sources`)

Older packs may use `"type": "iska_utils:factory_sources"` with a `sources` array and `colors` entries using `"id"` instead of `"output"`. Note that `iska_utils:factory_sources` has no registered `RecipeSerializer` — KubeJS `event.custom` must use `"type": "iska_utils:factory"`. Prefer `iska_utils:factory` + `recipes` + `select` for new datapacks.

## Machine behaviour

- **Slots:** input + output (auto-crafts while input matches a mapping, output has space, and redstone allows).
- **Output choice:** scroll/select in GUI; last choice per input mapping is remembered.
- **Redstone modes (GUI):** none / low / high / pulse (one op per rising edge) / disabled.
- **Energy:** optional RF/FE buffer; when buffer size is `0` in server config, energy is not used.

### Stonecutter compatibility

When enabled in server config (see **dev** below), the Factory accepts any input that has a **vanilla stonecutter** recipe (`minecraft:stonecutting`), if no `iska_utils:factory` mapping matches first.

- **Priority:** datapack `iska_utils:factory` mappings are checked first; stonecutter is a **fallback** only.
- **GUI:** same output grid as custom mappings — all stonecutter results for that input appear as selectable variants (1 input item per operation).
- **Energy:** stonecutter-style operations use **`005_factory_stonecutter_energy_per_operation`** (default **5** RF/op) when the Factory energy buffer is enabled (`303_factoryEnergyBuffer` > 0). Datapack rows still use each recipe’s `energy_per_operation`.
- **JEI:** stonecutter recipes are **not** listed in the mod Factory JEI category (`jei.iska_utils.factory`). They stay in vanilla **Stonecutter** JEI. When `004_factory_stonecutter_enabled` is `true`, the **Factory block** is also registered as a **crafting station** for that Stonecutter category (alongside `minecraft:stonecutter`), so players can see the Factory as an alternative workstation there.

### Server config (`dev`)

| Key | Default | Description |
|-----|---------|-------------|
| `004_factory_stonecutter_enabled` | `true` | Allow stonecutter fallback when no datapack mapping matches |
| `005_factory_stonecutter_energy_per_operation` | `5` | RF/FE per stonecutter-style operation (ignored if `303_factoryEnergyBuffer` = 0) |

When `004_factory_stonecutter_enabled` is `false`, the Factory only accepts inputs defined by `iska_utils:factory` datapacks.

Default mappings: `data/iska_utils/recipe/factory/factory_sources.json` (dye berry → dyes, delivery recycle tag → drop of entropy).

Block crafting (shaped): `data/iska_utils/recipe/factory/factory.json` — normal `minecraft:crafting_shaped`, not `iska_utils:factory`.

## JEI

Category `jei.iska_utils.factory`: representative input stack(s) and a **9×3** output grid (up to **27** outputs per page; extra pages when a mapping has more variants). Tag inputs expand to all tag members in JEI. **Only datapack `iska_utils:factory` mappings** — not stonecutter fallback recipes.

**Stonecutter category (vanilla JEI):** shows every `minecraft:stonecutting` recipe. With stonecutter mode enabled, the Factory item appears as an additional crafting station for that category (see **Stonecutter compatibility** above). Datapack Factory mappings never duplicate into the Stonecutter list.

## First match

If two mappings accept the same input item, the **first loaded** mapping wins (`findSource` scan order).
