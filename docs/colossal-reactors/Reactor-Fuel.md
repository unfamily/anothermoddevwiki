# Reactor fuel (`colossal_reactors:fuel`)

Loaded from **`data/<namespace>/recipe/**/*.json`** as `colossal_reactors:fuel` recipes. Applied at reload by `ColossalRecipeData` from `RecipeManager` (**from 2.4.0.0.0**; any subdirectory under `recipe/` is valid).

**Recipe ids:** each `entries[]` element becomes a progressive RecipeManager holder (`<filePath>_<index>`). Same id for KubeJS / JEI / EMI / REI — see [Home → Recipe ids](home#recipe-ids-kubejs--viewers--from-24000).

Defines fuels accepted in reactor INSERT ports and consumed in fuel rods.

**From 2.2.0.0.0:** `sub_type`, `consume`, `produce`, and any `fluid` medium on ports. **From 2.3.0.0.0:** `chemical` in `sub_type` and `%` selectors ([Home](home#mekanism-chemical-integration-23000)).

## Root document

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | yes | Must be `colossal_reactors:fuel`. |
| `entries` | array of objects | yes | One object per fuel definition. |
| `overwritable` | boolean | no | Default for entries in this file when an entry omits its own `overwritable`. |

## Entry object (`entries[]`)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `fuel_id` | string (Identifier) | yes | — | Unique id for **fuel** stored in the controller / rods (consumption, RF curve, insert matching). |
| `waste_id` | string (Identifier) | no | `fuel_id` | Unique id for the **waste buffer** (aggregated waste units). Lets several fuels share one waste pool. |
| `inputs` | array of strings | no | `[fuel_id]` | Accepted INSERT selectors; must match the **input** side of `sub_type`. See [Home](home#material-selectors). |
| `sub_type` | string | no | `item-item` | From **2.2.0.0.0**. `{input}-{output}` medium pair (see [sub_type](#sub_type)). |
| `output` | string | no | `""` | EXTRACT selector; must match the **output** side of `sub_type`. |
| `consume` | int | no | `1` | From **2.2.0.0.0**. Input amount per fuel grant (items, mB fluid, or mB gas). |
| `produce` | int | no | `1` | From **2.2.0.0.0**. Output amount per waste grant (twin of `consume`). |
| `units_per_fuel` | int | no | `1000` | Fuel buffer units granted per `consume` amount of input. |
| `units_per_waste` | int | no | `units_per_fuel` | Waste buffer units accumulated per `units_per_fuel` fuel burned (before `produce` scaling on eject). |
| `base_rf_per_tick` | double | no | `200.0` | Base RF production scaling input. |
| `base_fuel_units_per_tick` | double | no | `0.03` | Base fuel consumption curve input. Higher values consume more fuel; does not directly scale RF output. |
| `overwritable` | boolean | no | from file `overwritable` | If `false` on an **existing** definition that is already non-overwritable, datapack entry is skipped. |

Legacy keys still parsed: `units_per_item` (alias for `units_per_fuel`), `base_mb_per_tick` (alias for `base_fuel_units_per_tick`).

### `consume` and `produce` (from **2.2.0.0.0**)

| Field | Side | Formula (conceptual) |
|-------|------|----------------------|
| `consume` + `units_per_fuel` | INSERT / burn input | `fuel_units += input_amount × units_per_fuel / consume` |
| `produce` + `units_per_waste` | EXTRACT / waste output | `output_amount = floor(waste_units × produce / units_per_waste)` |

`produce` mirrors `consume`: it is how many items or mB of `output` leave the reactor per chunk of waste buffer, not a separate item id. Defaults to **`1`** when omitted (one waste item per `units_per_waste`, legacy behaviour).

Examples:

- `consume: 1`, `units_per_fuel: 1000` → 1 uranium ingot = 1000 fuel units.
- `produce: 1`, `units_per_waste: 1500` → 1500 waste units eject as **1** waste item/stack.
- `consume: 500`, `produce: 500`, `units_per_fuel: 50000`, `units_per_waste: 50000` → 500 mB fissile fuel in grants 50000 fuel units; 50000 waste units eject as **500 mB** spent fuel gas.

### `fuel_id` vs `waste_id` vs `output`

| Key | Role |
|-----|------|
| **`fuel_id`** | Key for the **fuel** side: INSERT ports add units here; consumption reads from here. One entry per fuel type. |
| **`waste_id`** | Key for the **waste** side: burned fuel adds units here (controller aggregate + rod accumulators). **Not** the item id — a logical buffer name (often mod ids like `colossal_reactors:nuclear_waste`). |
| **`output`** | What actually leaves the reactor on EXTRACT (item or `%` chemical). Can match an item id while `waste_id` stays a separate logical key. |

When **`waste_id` is omitted**, it defaults to **`fuel_id`** (legacy behaviour). Explicit `waste_id` is recommended whenever the physical waste item is shared or when you want fuel accounting separate from waste accounting.

**Shared waste example:** uranium and azurite both set `"waste_id": "colossal_reactors:nuclear_waste"` while keeping different `fuel_id` and `units_per_waste`. Waste from both fuels merges into one buffer; ejection still uses each definition’s `output`, `produce`, and `units_per_waste` when resolving that buffer (see below).

### `sub_type` (from **2.2.0.0.0**)

String with two halves separated by `-`:

```text
{input_medium}-{output_medium}
```

Each half is one of **`item`**, **`fluid`**, or **`chemical`**. It tells the reactor which INSERT/EXTRACT port mode and selector shape to use for this fuel entry.

| Medium | INSERT / EXTRACT | Selectors in `inputs` / `output` |
|--------|------------------|----------------------------------|
| `item` | Solid slot | Item id or `#item_tag` (e.g. `#c:ingots/uranium`, `colossal_reactors:nuclear_waste`) |
| `fluid` | Liquid tank | Fluid id or `#fluid_tag` (e.g. `minecraft:lava`, `#c:steam`) |
| `chemical` | Gas tank (Mekanism) | `%namespace:chemical` (e.g. `%mekanism:fissile_fuel`). From **2.3.0.0.0** — see [Home](home#mekanism-chemical-integration-23000). |

Default when omitted: **`item-item`** (solid fuel in, solid waste out).

#### Common values

| `sub_type` | Input | Output |
|------------|-------|--------|
| `item-item` | Items in INSERT (solid) | Items on EXTRACT (solid) |
| `fluid-fluid` | Fluid mB in INSERT (liquid) | Fluid mB on EXTRACT (liquid) |
| `chemical-chemical` | Mek gas mB in INSERT (gas) | Mek gas mB on EXTRACT (gas) |
| `item-fluid` | Items in | Fluid out |
| `item-chemical` | Items in | Gas out |
| `fluid-item` | Fluid in | Items out |
| `fluid-chemical` | Fluid in | Gas out |
| `chemical-item` | Gas in | Items out |
| `chemical-fluid` | Gas in | Fluid out |

Any `{input}-{output}` combination is valid as long as `inputs` and `output` use selectors for those media. Mixed pairs route waste to the port type given by the **second** half (e.g. `fluid-fluid` ejects steam on the **liquid** EXTRACT path, not solid).

`consume` / `produce` apply to the amount of the input/output medium per grant (1 item, 1 mB fluid, or 1 mB gas depending on `sub_type`).

Merge: `fuel_id` is the map key; later files overwrite earlier definitions when allowed.

## Waste buffer behaviour (runtime)

1. **Fuel and waste are separate stores.** Controller keeps `fuelEntries` (keyed by `fuel_id`) and `wasteEntries` (keyed by `waste_id`). Waste units are **never** auto-converted into fuel, even when `waste_id` equals `fuel_id`.
2. **On burn**, consumed fuel units are credited to `def.wasteId()`, not `fuel_id` (unless they are the same by default).
3. **On EXTRACT**, the mod resolves a fuel definition from the waste buffer key via `FuelLoader.getDefinitionForWasteBuffer(wasteId)` (matches any entry whose `waste_id` equals the buffer key). That definition supplies `output`, `produce`, `units_per_waste`, and chemical vs solid handling.
4. **INSERT** only accepts inputs matching the **input** medium of `sub_type`; waste in ports is not pulled back into the fuel buffer.

### Pack design notes

- **Same `waste_id`, different `units_per_waste`:** allowed (e.g. azurite 1500 vs uranium 1000 per waste item). Ejection uses **one** matching definition for the buffer key; avoid conflicting rates when sharing a `waste_id`, or keep `units_per_waste` aligned across entries that share it.
- **Same physical `output`, different fuels:** use a common `waste_id` so waste pools combine; keep distinct `fuel_id` for RF/consumption curves.
- **`waste_id` ≠ item id:** valid — e.g. `waste_id: colossal_reactors:spent_nuclear_waste` with `output: %mekanism:spent_nuclear_waste` separates logical buffer from Mek chemical id.

### Stale / stuck waste (no auto-migration)

| Situation | Behaviour |
|-----------|-----------|
| **`waste_id` omitted** (buffer key = `fuel_id`) | Waste accumulates under `fuel_id`. Still **not** treated as fuel; only the waste list is used for ejection. |
| **`waste_id` changed** in datapack after a world already has waste | Units stored under the **old** buffer key are **not** remapped. They can remain stuck until manually cleared or until code/data is aligned with the old key. |
| **Buffer key with no matching definition** | Ejection skips that entry (`getDefinitionForWasteBuffer` returns null). |

If you introduce explicit `waste_id` on fuels that previously defaulted to `fuel_id`, expect orphaned waste under the old `fuel_id` keys in existing saves — plan a one-time migration or accept manual cleanup.

## Reference code

- `net.unfamily.colossal_reactors.crafting.ColossalRecipeData`
- `net.unfamily.colossal_reactors.fuel.FuelLoader` — parsing, `getDefinitionForWasteBuffer`
- `net.unfamily.colossal_reactors.fuel.FuelDefinition`
- `net.unfamily.colossal_reactors.reactor.ReactorSimulation` — burn → `wasteId`, EXTRACT push
- `net.unfamily.colossal_reactors.blockentity.ReactorControllerBlockEntity` — fuel/waste aggregates

## Example (default datapack)

```json
{
  "type": "colossal_reactors:fuel",
  "entries": [
    {
      "fuel_id": "colossal_reactors:uranium",
      "waste_id": "colossal_reactors:nuclear_waste",
      "inputs": ["#c:ingots/uranium"],
      "output": "colossal_reactors:nuclear_waste",
      "units_per_fuel": 1000,
      "units_per_waste": 1000,
      "base_rf_per_tick": 400.0,
      "base_fuel_units_per_tick": 0.03
    },
    {
      "fuel_id": "colossal_reactors:azurite",
      "waste_id": "colossal_reactors:nuclear_waste",
      "inputs": ["#c:ingots/azurite"],
      "output": "colossal_reactors:nuclear_waste",
      "units_per_fuel": 500,
      "units_per_waste": 1500,
      "base_rf_per_tick": 1000.0,
      "base_fuel_units_per_tick": 0.03
    },
    {
      "fuel_id": "colossal_reactors:mek_fissile",
      "waste_id": "colossal_reactors:spent_nuclear_waste",
      "sub_type": "chemical-chemical",
      "inputs": ["%mekanism:fissile_fuel"],
      "consume": 500,
      "output": "%mekanism:spent_nuclear_waste",
      "produce": 500,
      "units_per_fuel": 50000,
      "units_per_waste": 50000,
      "base_rf_per_tick": 1500.0,
      "base_fuel_units_per_tick": 1.0
    }
  ]
}
```

`mek_fissile` (`chemical-chemical`, `%` selectors) from **2.3.0.0.0** (Mekanism). Uranium/azurite omit `sub_type` → `item-item`. A `fluid-fluid` entry (e.g. lava in, steam out) uses the same **2.2.0.0.0** `sub_type` rules.

## Single recipe (child format) and KubeJS `event.custom`

A **child** is one `entries` element written as a standalone recipe: the element's fields plus `"type"`, with **no** `entries` array. It works both as a datapack file and with KubeJS `event.custom`.

`event.custom` runs **after** Iskandert's Library has split the bundles, so a bundle passed to `event.custom` is **not** expanded: always pass a single child object.

Datapack file (e.g. `data/<ns>/recipe/fuel_uranium.json`):

```json
{
  "type": "colossal_reactors:fuel",
  "fuel_id": "colossal_reactors:uranium",
  "waste_id": "colossal_reactors:nuclear_waste",
  "inputs": [
    "#c:ingots/uranium"
  ],
  "output": "colossal_reactors:nuclear_waste",
  "units_per_fuel": 1000,
  "units_per_waste": 1000,
  "base_rf_per_tick": 400.0,
  "base_fuel_units_per_tick": 0.03
}
```

KubeJS:

```js
ServerEvents.recipes(event => {
  event.custom({
    "type": "colossal_reactors:fuel",
    "fuel_id": "colossal_reactors:uranium",
    "waste_id": "colossal_reactors:nuclear_waste",
    "inputs": [
      "#c:ingots/uranium"
    ],
    "output": "colossal_reactors:nuclear_waste",
    "units_per_fuel": 1000,
    "units_per_waste": 1000,
    "base_rf_per_tick": 400.0,
    "base_fuel_units_per_tick": 0.03
  }).id('kubejs:fuel/uranium')
})
```
