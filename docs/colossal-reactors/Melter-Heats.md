# Melter heats (`colossal_reactors:melter_heats`)

Loaded from **`data/<namespace>/recipe/**/*.json`** as `colossal_reactors:melter_heats` recipes. Applied at reload by `ColossalRecipeData` from `RecipeManager` (**from 2.4.0.0.0**)

## RecipeManager / KubeJS / viewer ids (from **2.4.0.0.0**)

Iskandert Library treats `valid_blocks` as a bundle array and registers **one RecipeManager entry per heat object**:

`<namespace>:<filePath>_<index>`

Example: parent file `colossal_reactors:melter/melter_heats` → `colossal_reactors:melter/melter_heats_0`, `_1`, …  
Those ids are what KubeJS remove/replace and JEI/EMI/REI show. Gameplay still appends every entry into one heat list (`MelterHeatsLoader.applyLoaded`).

## Root document

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | yes | Must be `colossal_reactors:melter_heats`. |
| `valid_blocks` | array of objects | yes | Each object is one **heat entry** (name is historical: entries can target fluids too). Bundle-split into progressive RecipeManager children (see above). |

## Heat entry object (`valid_blocks[]`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `factor` | double | yes | Heat multiplier for this entry when it matches (see below). |
| `blocks` | array of strings | no* | Block ids or `#block_tags`. |
| `fluids` | array of strings | no* | Fluid ids or `#fluid_tags`. |
| `not_valid` | boolean | no (`false`) | If `true`, this entry is **ignored** when checking “is there any adjacent heating source?” but its **factor still applies** to `getFactorFor` when that face matches. Use for blocks that should **slow** melting (low factor) without counting as valid heat (e.g. ice in the builtin file). |
|  |  |  | *At least one of `blocks` or `fluids` must be non-empty; otherwise the entry is skipped. |

### Matching

- **`hasHeatingSource`:** used so the melter **must** have at least one adjacent valid heat on the six main faces. Skips entries with `not_valid: true`.
- **`getFactorForBlock` / `getFactorForFluid`:** first matching entry on that face returns its `factor`. Does **not** skip `not_valid` — so a `not_valid` block can still multiply the six-face product (often making `product` very small).
- **`getFactorFor`:** block rules first; if block factor is still default (no block match → internally the block path returns `1.0` when no block ids OR no match — actually `getFactorForBlock` returns 1.0 only when no entry matches; if block list empty it continues). Then fluid. See `MelterHeatsLoader.getFactorFor`.

Per face, if nothing matches, factor **1.0** for that face.

**Six-face product:** `up * down * east * west * north * south`.  
**Final recipe ticks:** `max(1, floor(time / product))` (see [Melter recipes](melter-recipes.md)).

If `product <= 0`, progress does not advance.

## Merge behaviour

Merge: each RecipeManager file keeps its own recipe ids. Runtime and JEI/EMI/REI, for the same block/fluid selector sets, keep the **last** heat entry (addon replace). Distinct selector sets stay additive (`MelterHeatsLoader.applyLoaded`). First remaining match per face wins in iteration order.

## Reference code

- `net.unfamily.colossal_reactors.crafting.ColossalRecipeData`
- `net.unfamily.colossal_reactors.melter.MelterHeatsLoader`
- `net.unfamily.colossal_reactors.melter.MelterHeatEntry`

## Example (Default Datapack)
```json

{
  "type": "colossal_reactors:melter_heats",
  "valid_blocks":[
    {
      "blocks": ["minecraft:torch"],
      "factor": 0.01
    },
    {
      "blocks": ["#minecraft:ice"],
      "factor": 0.001,
      "not_valid":true
    },
    {
      "blocks": ["#minecraft:campfires"],
      "factor": 0.5
    },
    {
      "fluids": ["#c:lava"],
      "factor": 1.0
    },
    {
      "blocks": ["colossal_reactors:heating_coil_resource_on"],
      "factor": 2.0
    },
    {
      "blocks": ["colossal_reactors:heating_coil_energy_on"],
      "factor": 3.0
    }
  ]
}
```

## Single recipe (child format) and KubeJS `event.custom`

A **child** is one `valid_blocks` element written as a standalone recipe: the element's fields plus `"type"`, with **no** `valid_blocks` array. It works both as a datapack file and with KubeJS `event.custom`.

`event.custom` runs **after** Iskandert's Library has split the bundles, so a bundle passed to `event.custom` is **not** expanded: always pass a single child object.

Datapack file (e.g. `data/<ns>/recipe/melter_heat_campfire.json`):

```json
{
  "type": "colossal_reactors:melter_heats",
  "blocks": [
    "#minecraft:campfires"
  ],
  "factor": 0.5
}
```

KubeJS:

```js
ServerEvents.recipes(event => {
  event.custom({
    "type": "colossal_reactors:melter_heats",
    "blocks": [
      "#minecraft:campfires"
    ],
    "factor": 0.5
  }).id('kubejs:melter_heats/campfire')
})
```
