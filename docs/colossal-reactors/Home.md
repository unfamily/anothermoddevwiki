# Colossal Reactors PackDev Documentation

From **2.4.0.0.0**, Colossal datapack JSON is registered as native Minecraft **RecipeType** entries under `data/<namespace>/recipe/**/*.json`. On reload, `ColossalRecipeData` reads `RecipeManager` and applies definitions into runtime loaders (gameplay, JEI, EMI, REI).

| Source | Path | Purpose |
|--------|------|---------|
| **Recipes (primary)** | `data/<namespace>/recipe/**/*.json` | All Colossal types: fuel, coolant, heat sinks, turbine generation, elec coils, melter recipes, melter heats, radiation scrubber catalysts, **heating coils** (`colossal_reactors:heating_coils`). |
| **Load data (retrocompat)** | `data/<namespace>/load/**/*.json` | Legacy heating coil files only (**from 2.4**); merged on reload alongside recipe-loaded coils. Prefer `recipe/` for new packs. |

Java entry points:

- `net.unfamily.colossal_reactors.crafting.ColossalRecipeData`
- `net.unfamily.colossal_reactors.crafting.ModColossalRecipes`
- `net.unfamily.colossal_reactors.datapack.LoadDataReloadListener` (legacy `load/` heating coils)

Reload in-game: `/reload` (vanilla datapack reload).

## Recipe ids (KubeJS / viewers) — from **2.4.0.0.0**

Builtin Colossal datapacks may still ship **one bundle file** with an `entries` / `valid_blocks` / heating-coil list. Iskandert Library expands each array element into **one RecipeManager entry** so KubeJS, JEI, EMI, and REI share the same progressive holder id (NeoForge **26**: `ModifyRecipeJsonsEvent`; **1.21.1**: in-memory recipe bridge pack, no `RecipeManager` mixin).

| Bundle key in JSON | Used by | Child RecipeManager id |
|--------------------|---------|------------------------|
| `entries` / `recipes` / `sources` | fuel, coolant, heat_sinks, turbine_generation, elec_coils, melter_recipes, radiation_scrubber_catalysts, heating coil list | `<namespace>:<filePath>_<index>` — e.g. parent `colossal_reactors:reactor/reactor_fuel` → `colossal_reactors:reactor/reactor_fuel_0` |
| `valid_blocks` | melter_heats | same progressive pattern — e.g. `colossal_reactors:melter/melter_heats_0` |
| heating coil `consume[]` (after coil split) | heating_coils | `<namespace>:heating_coils_<coilPath>_<optionIndex>` — e.g. `colossal_reactors:heating_coils_heating_coil_energy_0` |

### Single recipe (child format)

A **child** is one array element written as a standalone recipe: the element's fields plus `"type"`, with **no** bundle array. It works both as a datapack file and with KubeJS `event.custom`.

For heating coils, a child is **one coil** with **one** `consume` option.

The same applies to every Colossal type: copy one element of the bundle, add `"type"`, and pass it as is.

Datapack file (e.g. `data/<ns>/recipe/melter_cobblestone.json`):

```json
{
  "type": "colossal_reactors:melter_recipes",
  "input": "minecraft:cobblestone",
  "output": "#c:lava",
  "amount": 250,
  "time": 100
}
```

### KubeJS

Remove by child id:

```js
ServerEvents.recipes(event => {
  event.remove({ id: 'colossal_reactors:reactor/reactor_fuel_0' })
  event.remove({ id: 'colossal_reactors:heating_coils_heating_coil_energy_0' })
  event.remove({ id: 'colossal_reactors:melter/melter_heats_0' })
})
```

Add with `event.custom`. `event.custom` runs **after** Iskandert's Library has split the bundles, so a bundle passed to `event.custom` is **not** expanded: always pass a single child object (see the child format above).

```js
ServerEvents.recipes(event => {
  event.custom({
    type: 'colossal_reactors:melter_recipes',
    input: 'minecraft:cobblestone',
    output: '#c:lava',
    amount: 250,
    time: 100
  }).id('kubejs:melter/cobblestone')
})
```

In JEI / EMI / REI, enable advanced tooltips and copy the recipe id from the Colossal category card — it matches the RecipeManager key above. Do **not** invent path segments such as `/gas` or `/liquid`; liquid and gas display cards for the same datapack entry share that one progressive id.

## Required mods (from **2.4.0.0.0**)

| Mod id | Minimum version | Notes |
|--------|-----------------|-------|
| `iska_lib` (Iskandert Library) | **1.13.0.0.0** | Required dependency; recipe bundle splitting, preview inset shell, shared APIs. |
| `another_config_manager` | 1.0.0.0.0 | **ACM** — in-game config browser (required). |
| `fusion` | 1.2.0 | Reactor glass / casing connected textures (unchanged). |

Optional clients: **JEI**, **EMI**, and **REI** (both MC lines when the viewer mod is present). GuideME optional. Mekanism port integration depends on the Minecraft/NeoForge line (below).

## Mod versions

Feature availability by **Colossal Reactors** release (NeoForge builds; semver is shared across supported MC lines):

| From version | Features |
|--------------|----------|
| **2.2.0.0.0** | **Turbine** multiblock, turbine builder, datapack `colossal_reactors:turbine_generation` and `colossal_reactors:elec_coils` (steam → RF via **fluid** ports). Reactor fuel **`sub_type`**, **`consume`**, **`produce`**, and **`fluid`** sides on reactor resource ports (e.g. `fluid-fluid` fuel). |
| **2.3.0.0.0** | **Mekanism** on reactor and turbine ports: `%` selectors, gas tanks, **`chemical`** in fuel `sub_type`, coolant `outputs` (liquid + gas), turbine Mek steam input and dual condensate `outputs`. Requires Mekanism loaded (**1.21.1 line only** — see below). |
| **2.4.0.0.0** | **Native datapack RecipeTypes** under `recipe/` with Library progressive holder ids shared by KubeJS / JEI / EMI / REI. **Iskandert Library** (versions above) and **ACM** required. **EMI / REI / JEI** for Colossal recipe types on both lines. Reactor and turbine **builder simulators** show **consumption / production ratio**. Reactor simulation **caps non-adjacent heat sink** contribution at **4× rod count**. **Heating coils** canonical in `recipe/` (`entries` bundle); **`load/` retrocompat** on reload (new coil ids still need a full game restart for blocks). Melter progress bar opens melter recipes in the active viewer. |
| **2.5.0.0.0** | **Website** builder pattern (`mdcr1` / `mdct1`), Hyperflow multi rod-controller turbines (−5% blade efficiency if any column lacks a controller), JEI ghost → Mark Input, dynamic reactor rod tint (`color` on fuel), GuideME **pt_br**. |
| **2.6.0.0.0** | Turbine Builder modes **Website → Flow → HyperFlow → Custom → None**; HyperFlow uses ModDecoded **bestLayout**; dual builder coil materials (zone vs rod-column); **`mdct2` / `mdcr2`** seeds with recipe selectors (`~` = `#` for tags; CSV maps optional); tag coil auto-place uses **buffer item** (not tag first); datapack **`flow_coe` / `flow_max`** + capped **coil-depth** steam bonus; Reactor Frame **concentric 1-wide rings**; builder GUIs **250×250**; preview inset shell (iska 1.13). See [Turbine Elec Coils](turbine-elec-coils), [Turbine Website Seeds](turbine-website-seeds), [Reactor Website Seeds](reactor-website-seeds), [Turbine Builder](turbine-builder). |

Pages below mark **from 2.2.0.0.0**, **from 2.3.0.0.0**, **from 2.4.0.0.0**, or **from 2.6.0.0.0** only on those features.

## Material selectors

Used in `inputs`, `output`, and `outputs` across fuel, coolant, and turbine JSON:

| Prefix | Meaning | Example |
|--------|---------|---------|
| `#` | Item or fluid **tag** (fluid tag is tried first) | `#c:water`, `#c:ingots/uranium` |
| plain id | Registry id (item or fluid, resolved at parse time) | `minecraft:water`, `colossal_reactors:gas_fluid_steam` |
| `%` | Mekanism **chemical** (gas) id or tag; requires Mekanism loaded | `%mekanism:steam`, `%mekanism:fissile_fuel` |

- Reactor/turbine **liquid** ports use fluid selectors (`#` or plain fluid id).
- Legacy single `output` still works for liquid-only.

### Mekanism chemical integration (from **2.3.0.0.0**)

Requires Mekanism loaded on the **Minecraft 1.21.1 / NeoForge 21.1** Colossal line. The **NeoForge 26.1.2** Colossal **2.4** build does **not** include this reactor/turbine port integration.

| Colossal line | Mek reactor/turbine port integration |
|---------------|--------------------------------------|
| **MC 1.21.1** (NeoForge 21.1) | **Yes** — gas tanks, `%` selectors, chemical fuel/coolant/turbine datapack fields when Mekanism is installed. |
| **MC 26.1.2** (NeoForge 26.1) | **No** — do not rely on `%` or Mek gas/liquid port behaviour from 2.3 on this line. |

On the **1.21.1** line: resource ports gain a **gas** tank and solid/liquid/gas toggles on EXTRACT/EJECT. Use `%` in datapack `inputs` / `output` / `outputs`. The `outputs` array (max one liquid + one gas): first non-`%` entry = liquid, first `%` entry = gas. Reactor INSERT/EXTRACT/EJECT accepts matching Mek fluids and chemicals per fuel/coolant definition.

## Index

### Reactor

| Page | `type` value | Typical location (mod builtin) |
|------|--------------|--------------------------------|
| [Heating Coils](heating-coils) | `colossal_reactors:heating_coils` | `data/colossal_reactors/recipe/heating_coils.json` (legacy: `data/colossal_reactors/load/heating_coils.json`) |
| [Reactor Fuel](reactor-fuel) | `colossal_reactors:fuel` | `data/colossal_reactors/recipe/reactor/reactor_fuel.json` |
| [Reactor Coolant](reactor-coolant) | `colossal_reactors:coolant` | `data/colossal_reactors/recipe/reactor/reactor_coolant.json` |
| [Reactor Heat Sinks](reactor-heat-sinks) | `colossal_reactors:heat_sinks` | `data/colossal_reactors/recipe/reactor/reactor_heat_sinks.json` |

### Turbine (from **2.2.0.0.0**)

| Page | `type` value | Typical location (mod builtin) |
|------|--------------|--------------------------------|
| [Turbine Generation](turbine-generation) | `colossal_reactors:turbine_generation` | `data/colossal_reactors/recipe/turbine/turbine_generation.json` |
| [Turbine Elec Coils](turbine-elec-coils) | `colossal_reactors:elec_coils` | `data/colossal_reactors/recipe/turbine/elec_coils.json` |
| [Turbine Website Seeds](turbine-website-seeds) | — (builder `mdct1` / `mdct2`, selectors) | [ModDecoded turbine calculator](https://moddecoded.com/tools/colossal-reactors/turbine-calculator/) |
| [Reactor Website Seeds](reactor-website-seeds) | — (builder `mdcr1` / `mdcr2`, selectors) | [ModDecoded reactor calculator](https://moddecoded.com/tools/colossal-reactors/reactor-calculator/) |
| [Turbine Builder](turbine-builder) | — (GUI / patterns) | in-game Turbine Builder |

### Other (`recipe/` pipeline)

| Page | `type` value | Typical location (mod builtin) |
|------|--------------|--------------------------------|
| [Melter Recipes](melter-recipes) | `colossal_reactors:melter_recipes` | `data/colossal_reactors/recipe/melter/melter_recipes.json` |
| [Melter Heats](melter-heats) | `colossal_reactors:melter_heats` | `data/colossal_reactors/recipe/melter/melter_heats.json` |
| [Radiation Scrubber Catalysts](radiation-scrubber-catalysts) | `colossal_reactors:radiation_scrubber_catalysts` | `data/colossal_reactors/recipe/radiation_scrubber_catalysts.json` |
