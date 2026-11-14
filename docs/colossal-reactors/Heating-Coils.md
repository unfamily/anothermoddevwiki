
> **From 2.4.0.0.0:** primary path is **`data/<namespace>/recipe/**/*.json`** as `colossal_reactors:heating_coils` recipes (`entries` array after bundle split, or legacy top-level `coils`). Applied via `ColossalRecipeData` / `RecipeManager`. **`data/<namespace>/load/**/*.json`** is still scanned for **retrocompat** and merged on reload.

Loaded from **`recipe/`** (and legacy **`load/`**) as above.

## RecipeManager / KubeJS / viewer ids (from **2.4.0.0.0**)

Iskandert Library expands each coil’s `consume` array into **one RecipeManager entry per option**:

`<namespace>:heating_coils_<coilPath>_<optionIndex>`

Examples (builtin bundle `recipe/heating_coils.json`, expanded to progressive RecipeManager ids):

| Coil `id` | Option index | RecipeManager id |
|-----------|--------------|------------------|
| `colossal_reactors:heating_coil_energy` | 0 | `colossal_reactors:heating_coils_heating_coil_energy_0` |
| `colossal_reactors:heating_coil_resource` | 0…3 | `colossal_reactors:heating_coils_heating_coil_resource_0` … `_3` |

KubeJS `event.remove({ id: '…' })`, JEI copy-id, and EMI/REI use that holder id. Gameplay still merges options back into one `HeatingCoilDefinition` per coil `id` (block `_on` / `_off`).

## Important Notes
Every time a heating coil is declared, it will create new blocks and therefore requires a full restart of MC.
Reloading will only reload the logical part of the coils.

The coil blocks that are created will have _on, _off at the end of their ID.
This has been designed to allow them to be easily integrated with other mods that might accept an external heater.

## Root document

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | yes | Must be `colossal_reactors:heating_coils`. |
| `coils` | array of objects | yes* | One object per coil definition (*legacy root key; prefer `entries` in `recipe/` files from **2.4**). |
| `entries` | array of objects | yes* | Same as `coils` when using native recipe bundles (**from 2.4.0.0.0**). |

## Coil object

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | string (Identifier) | — | **Required.** Coil recipe id (e.g. `colossal_reactors:heating_coil_energy`). Duplicate ids across merged files: **last write wins**. It must have the prefix `colossal_reactors:`. This will create two blocks with _on and _off at the end of the ID.|
| `duration` | int | `60` | Tick duration for one cycle (invalid or ≤0 falls back to 60). |
| `consume` | array | `[]` | Ordered list of **consume options** (see below). |
| `all_sides` | boolean | `false` | Machine-specific flag (`HeatingCoilDefinition`). |
| `no_item` | boolean | `false` | Disallow item input side. |
| `no_fluid` | boolean | `false` | Disallow fluid input side. |
| `no_energy` | boolean | `false` | Disallow energy input side. |

## Consume option object

Each element of `consume` is an object that may contain **one or more** of these blocks (combined into one logical option):

### `fluid`

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Fluid id or `#tag` (leading `#` = fluid tag). |
| `activation` | int | mB threshold for activation. |
| `substain` | int | Sustain rate (**JSON key is `substain`**, matches loader). |

### `item`

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Item id or `#tag`. |
| `activation` | int | Count for activation. |
| `substain` | int | Sustain rate. |

### `energy`

| Field | Type | Description |
|-------|------|-------------|
| `activation` | int | RF for activation. |
| `substain` | int | RF per tick sustain. |

### `chemical` (Mekanism)

Requires **Mekanism** at runtime. Uses Mek gas/chemical types (not NeoForge fluids).

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Mek chemical id with `%` prefix (e.g. `%mekanism:steam`). |
| `activation` | int | mB threshold for activation. |
| `substain` | int | Sustain rate (**JSON key is `substain`**, matches loader). |

### `burnable`
Burnable is a special type of item. Can burn any burnable items.

Empty consume entries are skipped. An option with no recognized sub-blocks is dropped.

| Field | Type | Description |
|-------|------|-------------|
| `activation` | int | Cumulative Burning Time for activation. |
| `substain` | int | Cumulative Burning Time per tick sustain. |

## Builtin fallback

If no coils load from datapacks, the mod falls back to the builtin jar file ( **`recipe/heating_coils.json` first**, then legacy **`load/heating_coils.json`** ).

## Reference code

- `net.unfamily.colossal_reactors.crafting.ColossalRecipeData`
- `net.unfamily.colossal_reactors.datapack.LoadDataReloadListener` (legacy `load/` merge)
- `net.unfamily.colossal_reactors.heatingcoil.HeatingCoilLoader`
- `net.unfamily.colossal_reactors.heatingcoil.HeatingCoilDefinition`

## Example (Default datapack)

```json
{
  "type": "colossal_reactors:heating_coils",
  "coils": [
    {
      "id": "colossal_reactors:heating_coil_resource",
      "all_sides": true,
      "no_energy": true,
      "duration": 60,
      "consume": [
        {
          "fluid":{
            "id": "#c:steam",
            "activation": 10000,
            "substain": 100
          }
        },
        {
          "chemical": {
            "id": "%mekanism:steam",
            "activation": 10000,
            "substain": 100
          }
        },
        {
          "item":{
            "id": "#c:ingots/uranium",
            "activation": 1,
            "substain": 1
          }
        },
        {
          "fluid": {
            "id": "#c:water",
            "activation": 20000,
            "substain": 200
          },
          "burnable": {
            "activation": 20000,
            "substain": 100
          }
        }
      ]
    },
    {
      "id": "colossal_reactors:heating_coil_energy",
      "no_item": true,
      "no_fluid": true,
      "duration": 60,
      "consume": [
        {
          "energy": {
            "activation": 10000,
            "substain": 100
          }
        }
      ]
    }
  ]
}
```

## Single recipe (child format) and KubeJS `event.custom`

A **child** is one `entries` / `coils` element written as a standalone recipe: the element's fields plus `"type"`, with **no** `entries` / `coils` array. It works both as a datapack file and with KubeJS `event.custom`.

`event.custom` runs **after** Iskandert's Library has split the bundles, so a bundle passed to `event.custom` is **not** expanded: always pass a single child object.

For heating coils a child is **one coil** with **one** option in `consume` (still written as an array with a single element). A coil `id` that does not exist yet needs a datapack file and a full restart, because the coil blocks are created at startup; `event.custom` is meant for coils that already exist.

Datapack file (e.g. `data/<ns>/recipe/heating_coil_energy.json`):

```json
{
  "type": "colossal_reactors:heating_coils",
  "id": "colossal_reactors:heating_coil_energy",
  "no_item": true,
  "no_fluid": true,
  "duration": 60,
  "consume": [
    {
      "energy": {
        "activation": 10000,
        "substain": 100
      }
    }
  ]
}
```

KubeJS:

```js
ServerEvents.recipes(event => {
  event.custom({
    "type": "colossal_reactors:heating_coils",
    "id": "colossal_reactors:heating_coil_energy",
    "no_item": true,
    "no_fluid": true,
    "duration": 60,
    "consume": [
      {
        "energy": {
          "activation": 10000,
          "substain": 100
        }
      }
    ]
  }).id('kubejs:heating_coils/energy')
})
```
