# Reactor heat sinks (`colossal_reactors:heat_sinks`)

Loaded from **`data/<namespace>/recipe/**/*.json`** as `colossal_reactors:heat_sinks` recipes. Applied at reload by `ColossalRecipeData` from `RecipeManager` (**from 2.4.0.0.0**).

**Recipe ids:** each `entries[]` element becomes a progressive RecipeManager holder (`<filePath>_<index>`). Same id for KubeJS / JEI / EMI / REI — see [Home → Recipe ids](home#recipe-ids-kubejs--viewers--from-24000).

**Simulation (from 2.4.0.0.0):** non-adjacent heat sink cells contribute at a capped count of at most **4 × fuel rod count** in reactor simulation (adjacent cells are unaffected by this cap).

## Root document

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | yes | Must be `colossal_reactors:heat_sinks`. |
| `entries` | array of objects | yes | Ordered list of heat sink **definitions** (order matters for builder GUI indices after synthetic “air” option). |

There is **no** top-level `air` object: interior air uses a normal entry with `valid_blocks: ["minecraft:air"]` (see builtin JSON).

## Entry object (`entries[]`)

Each entry defines one coolant “tier” for interior blocks and/or liquids.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `valid_blocks` | array of strings | one of blocks/liquids | `[]` | Block ids or `#block` tags. Use `minecraft:air` for empty interior cells. Selector `minecraft:air` matches any `BlockState.isAir()` (air, cave air, void air). |
| `valid_liquids` | array of strings | one of blocks/liquids | `[]` | Fluid ids or `#fluid` tags. |
| `fuel` | double | no | `1.0` | Fuel consumption multiplier for this material. |
| `energy` | double | no | `1.0` | Energy (RF) multiplier. |
| `overheating` | double | no | `fuel` | Stability / cooling strength when unstability is enabled; higher = more effective overheating contribution in simulation. |
| `must_source` | boolean | no | `true` | If `true`, only **source** fluid blocks count as this heat sink; flowing matches fluid type but is treated like weak interior (air-like path). |

Rules:

- An entry with **both** `valid_blocks` and `valid_liquids` non-empty is unusual; parser allows it if both lists exist.
- Entries with neither non-empty are skipped.

Merge: each RecipeManager file keeps its own recipe ids. Runtime and JEI/EMI/REI flatten holders and, for the same `valid_blocks`+`valid_liquids` selector lists, **last file wins** (addon replace). Distinct selector lists stay additive.

## Reference code

- `net.unfamily.colossal_reactors.crafting.ColossalRecipeData`
- `net.unfamily.colossal_reactors.heatsink.HeatSinkLoader`
- `net.unfamily.colossal_reactors.heatsink.HeatSinkDefinition`

## Example (Default Datapack)
```json
{
  "type": "colossal_reactors:heat_sinks",
  "entries": [
    {
      "valid_blocks": ["minecraft:air"],
      "must_source": false,
      "fuel": 1.0,
      "energy": 1.0,
      "overheating": 0.75
    },
    {
      "valid_liquids": ["#c:water"],
      "must_source": false,
      "fuel": 1.0,
      "energy": 1.0,
      "overheating": 1.0
    },
    {
      "valid_blocks": ["#c:storage_blocks/diamond"],
      "fuel": 1.5,
      "energy": 1.3,
      "overheating": 1.8
    },
    {
      "valid_blocks": ["#c:storage_blocks/emerald"],
      "fuel": 1.4,
      "energy": 1.4,
      "overheating": 1.8
    },
    {
      "valid_blocks": ["#c:storage_blocks/netherite"],
      "fuel": 1.5,
      "energy": 1.75,
      "overheating": 1.7
    },
    {
      "valid_blocks": ["#c:storage_blocks/gold"],
      "fuel": 1.25,
      "energy": 1.25,
      "overheating": 1.7
    },
    {
      "valid_blocks": ["#c:storage_blocks/graphite", "#minecraft:ice"],
      "fuel": 2.0,
      "energy": -5.0,
      "overheating": 2.5
    },
    {
      "valid_liquids": ["#c:ender"],
      "fuel": 1.5,
      "energy": 2.0,
      "overheating": 3.0
    },
    {
      "valid_liquids": ["#c:breezium"],
      "fuel": 1.5,
      "energy": 3.0,
      "overheating": 5.0
    }
  ]
}
```

## Single recipe (child format) and KubeJS `event.custom`

A **child** is one `entries` element written as a standalone recipe: the element's fields plus `"type"`, with **no** `entries` array. It works both as a datapack file and with KubeJS `event.custom`.

`event.custom` runs **after** Iskandert's Library has split the bundles, so a bundle passed to `event.custom` is **not** expanded: always pass a single child object.

Here `valid_blocks` is a normal entry field (a list of block selectors), not a bundle array.

Datapack file (e.g. `data/<ns>/recipe/heat_sink_diamond.json`):

```json
{
  "type": "colossal_reactors:heat_sinks",
  "valid_blocks": [
    "#c:storage_blocks/diamond"
  ],
  "fuel": 1.5,
  "energy": 1.3,
  "overheating": 1.8
}
```

KubeJS:

```js
ServerEvents.recipes(event => {
  event.custom({
    "type": "colossal_reactors:heat_sinks",
    "valid_blocks": [
      "#c:storage_blocks/diamond"
    ],
    "fuel": 1.5,
    "energy": 1.3,
    "overheating": 1.8
  }).id('kubejs:heat_sinks/diamond')
})
```
