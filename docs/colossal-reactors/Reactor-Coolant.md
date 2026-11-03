# Reactor coolant (`colossal_reactors:coolant`)

Loaded from **`data/<namespace>/recipe/**/*.json`** as `colossal_reactors:coolant` recipes. Applied at reload by `ColossalRecipeData` from `RecipeManager` (**from 2.4.0.0.0**).

**Recipe ids:** each `entries[]` element becomes a progressive RecipeManager holder (`<filePath>_<index>`). Liquid/gas JEI-EMI-REI cards for the same entry share that id. See [Home → Recipe ids](home#recipe-ids-kubejs--viewers--from-24000).

Defines coolants for reactor INSERT ports: water/steam mode and RF modifiers.

## Root document

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | yes | Must be `colossal_reactors:coolant`. |
| `entries` | array of objects | yes | One object per coolant definition. |
| `overwritable` | boolean | no | Default for entries in this file. |

## Entry object (`entries[]`)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `coolant_id` | string (Identifier) | yes | — | Unique id (e.g. `colossal_reactors:water`). |
| `inputs` | array of strings | no | `[coolant_id]` | Fluid tags/ids (`#c:water`). |
| `output` | string | no | `""` | Single **liquid** output id or tag (e.g. `#c:steam`). |
| `outputs` | array of strings | no | `output` | See [Mekanism coolant](#mekanism-coolant-23000) when using liquid + gas. |
| `rf_increment_percent` | int | no | `0` | RF multiplier = `1 + value/100`. |
| `mb_decrement_percent` | int | no | `100` | Consumption divisor (`100` → factor `1.0`). |
| `reduce_rf_production` | boolean | no | from `consumes_fluid_for_steam` legacy | Water-style mode: RF → steam conversion path. |
| `rf_to_coolant_factor` | double | no | `0.45` | Coolant mB consumed per 1 RF when in steam mode. |
| `steam_per_coolant` | double | no | `1.0` | Steam mB produced per 1 mB coolant consumed. |
| `overheating` | double | no | `1.0` | Stability / cooling strength when reactor instability is enabled. |
| `fluid_color` | string or int | no | builtin water tint | **Legacy** — tanks now use the fluid's texture and tint (Mek-style). |
| `output_color` | string or int | no | builtin steam tint | **Legacy** — same as above for output display. |
| `overwritable` | boolean | no | from file | Same merge rule as fuel. |

Legacy key: `consumes_fluid_for_steam` (boolean) maps to `reduce_rf_production`.

Only one coolant is active at a time (from fluid in INSERT ports).

### Mekanism coolant (from **2.3.0.0.0**, **MC 1.21.1 line only**)

Requires Mekanism and [gas port support](home#mekanism-chemical-integration-23000).

- `inputs` may include `%mekanism:...` gas in addition to fluid selectors.
- `outputs` array: one liquid (`#` or fluid id) + one gas (`%...`), e.g. superheated sodium fluid and Mek superheated sodium gas.

Merge: `coolant_id` is the map key.

## Reference code

- `net.unfamily.colossal_reactors.crafting.ColossalRecipeData`
- `net.unfamily.colossal_reactors.coolant.CoolantLoader`
- `net.unfamily.colossal_reactors.coolant.CoolantDefinition`

## Example (default datapack)

```json
{
  "type": "colossal_reactors:coolant",
  "entries": [
    {
      "coolant_id": "colossal_reactors:water",
      "inputs": ["#c:water"],
      "output": "#c:steam",
      "rf_increment_percent": 0,
      "mb_decrement_percent": 100,
      "reduce_rf_production": true,
      "rf_to_coolant_factor": 0.45,
      "steam_per_coolant": 1.0,
      "overheating": 0.26
    },
    {
      "coolant_id": "colossal_reactors:mek_sodium",
      "inputs": ["#c:sodium", "%mekanism:sodium"],
      "outputs": ["#c:superheated_sodium", "%mekanism:superheated_sodium"],
      "rf_increment_percent": 0,
      "mb_decrement_percent": 100,
      "reduce_rf_production": true,
      "rf_to_coolant_factor": 0.45,
      "steam_per_coolant": 1.0,
      "overheating": 0.26
    }
  ]
}
```

The `mek_sodium` entry is from **2.3.0.0.0** and requires Mekanism loaded.
