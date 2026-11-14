# Turbine generation (`colossal_reactors:turbine_generation`)

> **From version 2.2.0.0.0.**

Loaded from **`data/<namespace>/recipe/**/*.json`** as `colossal_reactors:turbine_generation` recipes. Applied at reload by `ColossalRecipeData` from `RecipeManager` (**from 2.4.0.0.0**).

**Recipe ids:** each `entries[]` element becomes a progressive RecipeManager holder (`<filePath>_<index>`). Liquid/gas viewer cards for the same entry share that id. See [Home → Recipe ids](home#recipe-ids-kubejs--viewers--from-24000).

Defines how a **turbine** converts incoming steam into RF and optional condensate. Fluid steam on INSERT from **2.2.0.0.0**; Mek gas from **2.3.0.0.0** on the **MC 1.21.1 line only** (see below).

Builtin fallback: if no datapack entry loads, the mod applies internal defaults (`#c:steam`, mod steam fluid, Mek steam) and loads `data/colossal_reactors/recipe/turbine/turbine_generation.json` when missing from the scan.

## Root document

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | yes | Must be `colossal_reactors:turbine_generation`. |
| `entries` | array of objects | yes | One object per generation profile. |
| `overwritable` | boolean | no | Default for entries in this file. |

## Entry object (`entries[]`)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `coolant_id` | string (Identifier) | yes | — | Unique id for this profile (JSON key name is historical; not reactor coolant). Default builtin id: `colossal_reactors:water`. |
| `inputs` | array of strings | no | `["#c:steam"]` | Steam fluid tag/id. See [Home](home#material-selectors). |
| `output` | string | no | `""` | Single **liquid** condensate (e.g. `minecraft:water`). |
| `outputs` | array of strings | no | from `output` | See [Mekanism](#mekanism-steam-and-condensate-23000) for liquid + gas. |
| `rf_production` | double | no | config `turbine_default_rf_per_steam_mb` | **RF per mB steam** consumed (not per bucket). JEI may show per-bucket for readability (`× 1000`). |
| `overwritable` | boolean | no | from file | If `false` on an existing non-overwritable definition, entry is skipped. |

Merge: `coolant_id` (generation id) is the map key; internal defaults are registered first, then datapack entries override when allowed.

## Simulation notes

- Turbine controller picks the generation definition matching steam in ports.
- From **2.6.0.0.0**, max steam throughput and RF also scale with **flowEff** (rod-column coil average × coil-depth bonus). See [Turbine Elec Coils](turbine-elec-coils#how-flow-works-from-26000).
- RF output scales with `rf_production`, rotor/blade geometry, **coilEff**, **bladeEff**, and **flowEff**:

\[
\text{steamCap} \propto \text{validBlades} \times \text{bladeSteam} \times \text{flowEff},\quad
\text{RF/tick} \propto \text{steam} \times \text{rf\_per\_mB} \times \text{coilEff} \times \text{bladeEff} \times \text{flowEff}
\]

(Details: [Turbine Elec Coils](turbine-elec-coils#how-coil-efficiency-works).)

### Mekanism steam and condensate (from **2.3.0.0.0**, **MC 1.21.1 line only**)

Requires Mekanism and [gas port support](home#mekanism-chemical-integration-23000).

- Add `%mekanism:steam` (or other `%` steam) to `inputs`.
- Use `outputs` for liquid condensate + `%mekanism:water_vapor` (or other gas output).
- EXTRACT ports emit gas when Mekanism is loaded.

## Reference code

- `net.unfamily.colossal_reactors.crafting.ColossalRecipeData`
- `net.unfamily.colossal_reactors.turbine.TurbineGenerationLoader`
- `net.unfamily.colossal_reactors.turbine.TurbineGenerationDefinition`
- `net.unfamily.colossal_reactors.turbine.TurbineSimulation`

## Example (default datapack)

```json
{
  "type": "colossal_reactors:turbine_generation",
  "entries": [
    {
      "coolant_id": "colossal_reactors:water",
      "inputs": [
        "#c:steam",
        "colossal_reactors:gas_fluid_steam",
        "%mekanism:steam"
      ],
      "output": "minecraft:water",
      "outputs": ["minecraft:water", "%mekanism:water_vapor"],
      "rf_production": 4
    }
  ]
}
```

Fluid-only `inputs` from **2.2.0.0.0**. `%mekanism:steam` and dual `outputs` from **2.3.0.0.0**.

## Single recipe (child format) and KubeJS `event.custom`

A **child** is one `entries` element written as a standalone recipe: the element's fields plus `"type"`, with **no** `entries` array. It works both as a datapack file and with KubeJS `event.custom`.

`event.custom` runs **after** Iskandert's Library has split the bundles, so a bundle passed to `event.custom` is **not** expanded: always pass a single child object.

Datapack file (e.g. `data/<ns>/recipe/turbine_steam.json`):

```json
{
  "type": "colossal_reactors:turbine_generation",
  "coolant_id": "colossal_reactors:water",
  "inputs": [
    "#c:steam"
  ],
  "output": "minecraft:water",
  "rf_production": 4
}
```

KubeJS:

```js
ServerEvents.recipes(event => {
  event.custom({
    "type": "colossal_reactors:turbine_generation",
    "coolant_id": "colossal_reactors:water",
    "inputs": [
      "#c:steam"
    ],
    "output": "minecraft:water",
    "rf_production": 4
  }).id('kubejs:turbine/steam')
})
```
