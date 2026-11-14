# Turbine electromagnetic coils (`colossal_reactors:elec_coils`)

> **From version 2.2.0.0.0.** Flow fields and dual builder coil materials: **from 2.6.0.0.0**.

Loaded from **`data/<namespace>/recipe/**/*.json`** as `colossal_reactors:elec_coils` recipes. Applied at reload by `ColossalRecipeData` from `RecipeManager` (**from 2.4.0.0.0**).

**Recipe ids:** each `entries[]` element becomes a progressive RecipeManager holder (`<filePath>_<index>`). Same id for KubeJS / JEI / EMI / REI — see [Home → Recipe ids](home#recipe-ids-kubejs--viewers--from-24000).

Defines which blocks placed in the turbine **coil zone** (above the closure deck / rod controllers, inside the casing) count as electromagnetic coil material. Each entry contributes to:

- **Coil efficiency (`eff_*`)** — RF multiplier from the whole coil zone average.
- **Flow (`flow_*`, from 2.6)** — steam throughput multiplier from coil cells in **columns that have a Turbine Rod Controller** only.

Builtin fallback: `data/colossal_reactors/recipe/turbine/elec_coils.json` is loaded when the scan finds no coils or misses the builtin file.

## How coil efficiency works

When the turbine structure is validated (and in the Turbine Builder simulator), the mod scans **every cell** of the coil zone. For each cell it looks up `eff_coe` / `eff_max` from the matching datapack entry (first matching `valid_blocks` wins). **Air** contributes config `turbine` → `coil` → `000_emptyCoilEfficiency` (default **0.3**) to both sums, unless legacy ignore-air is on (`001_legacyIgnoreAirInCoilAverage`, 2.4.1-style).

Then it computes a single **coil efficiency** (same formula as the [ModDecoded Turbine Calculator](https://moddecoded.com/tools/colossal-reactors/turbine-calculator/)):

\[
\text{coilEff} = \min\left(\frac{\sum \text{eff\_coe}}{N},\ \frac{\sum \text{eff\_max}}{N}\right)
\]

where \(N\) = number of counted coil-zone cells (all cells from **2.4.2+** by default).

That value multiplies RF together with blade efficiency, **flowEff** (2.6), and steam (`TurbineProductionMath`):

\[
\text{RF/tick} \propto \text{steam} \times \text{rf\_per\_mB} \times \text{coilEff} \times \text{bladeEff} \times \text{flowEff}
\]

So **coilEff = 1.0** means “full” coil contribution; **0.5** means half the RF you would get with the same steam and blades at 1.0. The turbine controller GUI shows this value after validation.

### What `eff_coe` and `eff_max` mean

| Field | Role | Intuition |
|-------|------|-----------|
| **`eff_coe`** | **Efficiency coefficient** — per-block contribution to the *average target* efficiency. | For a zone filled entirely with one material, this is effectively the coil efficiency you get (as long as `eff_coe ≤ eff_max`). Higher = more RF from the same steam. |
| **`eff_max`** | **Efficiency limiter** — per-block contribution to the *average cap*. | Participates in the `min(...)` above. On a **uniform** fill it is usually **above** `eff_coe`, so it does not limit. It **does** matter when you **mix** coil tiers: a low `eff_max` material pulls the average cap down and can cap `coilEff` below the average coefficient. |

**Uniform fill (one material everywhere):**  
`coilEff ≈ eff_coe` (because `avg(eff_coe) ≤ avg(eff_max)`).

**Mixed fill:** both fields are averaged **by cell count**. Example — half graphite, half netherite in a fully filled zone:

- `avg(eff_coe) = (0.5 + 1.3) / 2 = 0.9`
- `avg(eff_max) = (0.66 + 1.5) / 2 = 1.08`
- `coilEff = min(0.9, 1.08) = **0.9**`

**Empty / air cells (default 2.4.2+):** each air cell adds `emptyCoil` to both sums and still increases \(N\). A single strong coil block in a large mostly-air zone is diluted toward `emptyCoil`. Fill the layer for full material efficiency.

**Legacy air skip:** with `001_legacyIgnoreAirInCoilAverage`, air cells are omitted from the RF average (only solid coil blocks count), matching 2.4.1 and older.

**Air vs flow on rod columns (2.6):** in columns above a Turbine Rod Controller, air still uses **`emptyCoil` for RF** in the zone average, but **flow** for that cell is **1.0** (neutral) — not `emptyCoil`. Solid coil materials use their `flow_coe` / `flow_max` there.

## How flow works (from **2.6.0.0.0**)

`flow_coe` / `flow_max` scale the turbine’s **maximum steam throughput** (then RF follows steam × `rf_per_mB` × efficiencies).

At validation / production, the mod averages flow only over coil cells whose **(crossA, crossB)** column has a **Turbine Rod Controller** on the closure deck — the same columns that drive steam path in multi-rod layouts. Other coil cells still affect **coilEff** (RF) but **not** flow.

\[
\text{materialFlow} = \min\left(\frac{\sum \text{flow\_coe}}{N_{\text{RC}}},\ \frac{\sum \text{flow\_max}}{N_{\text{RC}}}\right)
\]

If `flow_coe` / `flow_max` are omitted on an entry, both default to **1.0**.

### Coil-depth bonus (config)

Extra coil layers above the closure deck can add a **capped** steam bonus on top of `materialFlow` (not a per-layer stack that replaces blades):

\[
\text{exteriorAlong} = \text{interiorAlong} + 2,\quad
\text{targetL} = \mathrm{clamp}\big(\mathrm{round}(\mathrm{round}(\text{exteriorAlong}/\text{HEIGHT\_DIV}) \times \min(1,\ \text{crossArea}/\text{FOOTPRINT\_REF})),\ 1,\ \text{TARGET\_MAX}\big)
\]

\[
\text{usefulL} = \min(\text{actualCoilLayers},\ \text{targetL}),\quad
\text{layerBonus} = \text{MAX} \times (1 - 1/\text{usefulL})
\]

\[
\text{flowEff} = \text{materialFlow} \times \big(1 + \text{layerBonus} \times \min(1,\ \text{validBlades}/\text{GATE\_BLADES})\big)
\]

Defaults (`turbine.coil`): `MAX=0.20`, `HEIGHT_DIV=10`, `TARGET_MAX=8`, `FOOTPRINT_REF=49` (7×7 interior), `GATE_BLADES=64`.  
Height uses **exterior** along (interior + casing), so ~2 useful layers @ exterior 16, ~3 @ 32, ~6 @ 64 on a wide footprint; **L=1 → no depth bonus**. Skinny shells (e.g. 5×5) shrink `targetL` via footprint. Layers above `targetL` do not raise `flowEff`.

Non-Website Turbine Builder **clamps** the coil-layer control to `targetL` (Website seeds unchanged for now).

### What `flow_coe` and `flow_max` mean

| Field | Role | Intuition |
|-------|------|-----------|
| **`flow_coe`** | Flow **coefficient** on RC-column coil cells. | Uniform RC fill ≈ this value as the material flow multiplier (if ≤ `flow_max`). |
| **`flow_max`** | Flow **limiter** on those cells. | Caps mixed RC columns the same way `eff_max` caps RF. |

JEI / EMI / REI show both efficiency and flow lines when present.

## Turbine Builder (from **2.6.0.0.0**)

The builder can place **two** materials in the coil zone:

| Control | Fills | Typical use |
|---------|-------|-------------|
| **Zone coil** (right-block Coil button) | Coil cells **not** above rod columns | Main RF fill |
| **Rod-column coil** (beside Efficient / Website seed EditBox) | Coil cells **above rod columns** | Flow-focused material |

Website seeds: **mdct1** uses one short coil id for both; **mdct2** uses datapack selectors (`~c:…` = `#c:…`) and a separate `rodCoil` when zone ≠ rod-column or the coil is not in the optional CSV short-id map (see [Turbine Website Seeds](turbine-website-seeds)). Cycling either builder coil control rewrites the seed. Coil **layer count** is a separate control; on non-Website patterns it is capped to the useful flow-depth **target** for the current size (see above). Patterns and sim: [Turbine Builder](turbine-builder).

When auto-building, tag-based coil options place the **matching item from the builder buffer**, not the first block listed in the tag.

Builder simulation / material counts use the dual-fill rules and the same depth-bonus / coil-average formulas as runtime. Mixed hand-built rings still resolve per-block at runtime as above.

### Default datapack — efficiency (uniform fill)

Approximate **coilEff** if every coil cell uses the same tier (builtin `elec_coils.json`):

| Material | `eff_coe` | `eff_max` | **coilEff** |
|----------|-----------|-----------|-------------|
| `#c:storage_blocks/graphite` | 0.50 | 0.66 | **0.50** |
| `#c:storage_blocks/iron` | 0.66 | 0.75 | **0.66** |
| `#c:storage_blocks/lapis` | 0.70 | 0.85 | **0.70** |
| `#c:storage_blocks/tin` | 0.75 | 0.80 | **0.75** |
| `#c:storage_blocks/nickel` | 0.75 | 0.90 | **0.75** |
| `#c:storage_blocks/aluminum` | 0.80 | 0.90 | **0.80** |
| `#c:storage_blocks/copper_all` | 0.80 | 1.00 | **0.80** |
| `#c:storage_blocks/redstone` | 0.85 | 0.90 | **0.85** |
| `#c:storage_blocks/bronze` | 0.85 | 1.00 | **0.85** |
| `#c:storage_blocks/steel` | 0.90 | 1.00 | **0.90** |
| `#c:storage_blocks/constantan` | 0.90 | 1.00 | **0.90** |
| `#c:storage_blocks/silver` | 1.00 | 1.00 | **1.00** |
| `#c:storage_blocks/gold` | 1.00 | 1.30 | **1.00** |
| `#c:storage_blocks/electrum` | 1.15 | 1.30 | **1.15** |
| `#c:storage_blocks/stainless_steel` | 1.00 | 1.20 | **1.00** |
| `#c:storage_blocks/netherite` | 1.30 | 1.50 | **1.30** |
| `minecraft:crying_obsidian` | 1.00 | 1.50 | **1.00** |

Values are **multipliers**, not percents.

### Default datapack — flow (when set)

| Material | `flow_coe` | `flow_max` |
|----------|------------|------------|
| iron | 1.25 | 1.35 |
| lapis | 1.10 | 1.20 |
| redstone, steel | 1.50 | 1.65 |
| stainless steel | 2.00 | 2.20 |
| crying obsidian | 2.80 | 3.00 |
| *(omitted on other entries)* | **1.0** | **1.0** |

### Pack design tips

- Raise **`eff_coe`** for RF-focused tiers; raise **`flow_coe`** for steam-throughput tiers (especially materials players put on RC columns).
- Set limiters (`*_max`) above coefficients for uniform fills; lower them to punish mixed rings.
- JEI shows efficiency and flow lines (“Efficiency coefficient” / “Efficiency limiter” / “Flow coefficient” / “Flow limit”).
- Builder dual controls let pack players (and the default GUI) put a high-flow material on rod columns and a high-RF material elsewhere without hand-placing every cell.

## Root document

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | yes | Must be `colossal_reactors:elec_coils`. |
| `entries` | array of objects | yes | Ordered list of coil material definitions. |

## Entry object (`entries[]`)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `valid_blocks` | array of strings | yes | — | Block ids or `#block` tags matched in the coil zone. |
| `eff_coe` | double | no | `1.0` | Efficiency **coefficient** per block (see above). |
| `eff_max` | double | no | `eff_coe` | Efficiency **limiter** per block (see above). |
| `flow_coe` | double | no | `1.0` | Flow **coefficient** on RC-column cells (**from 2.6.0.0.0**). |
| `flow_max` | double | no | `flow_coe` if set, else `1.0` | Flow **limiter** on RC-column cells (**from 2.6.0.0.0**). |

Entries with empty `valid_blocks` are skipped. An entry that only lists `minecraft:air` is used as the synthetic air / empty option in the builder list.

Merge: each RecipeManager file keeps its own recipe ids (no CR↔addon id collision). Runtime and JEI/EMI/REI flatten holders and, for the same `valid_blocks` selector list, **last file wins**. When resolving a block state, the first remaining matching definition is used.

## Reference code

- `net.unfamily.colossal_reactors.crafting.ColossalRecipeData`
- `net.unfamily.colossal_reactors.turbine.ElecCoilLoader`
- `net.unfamily.colossal_reactors.turbine.ElecCoilDefinition`
- `net.unfamily.colossal_reactors.turbine.TurbineValidation` (coil / flow aggregation)
- `net.unfamily.colossal_reactors.turbine.TurbineProductionMath`
- `net.unfamily.colossal_reactors.turbine.TurbineBuildLogic` (dual-fill build)

## Example (default datapack)

```json
{
  "type": "colossal_reactors:elec_coils",
  "entries": [
    {
      "valid_blocks": ["#c:storage_blocks/iron"],
      "eff_coe": 0.66,
      "eff_max": 0.75,
      "flow_coe": 1.25,
      "flow_max": 1.35
    },
    {
      "valid_blocks": ["#c:storage_blocks/gold"],
      "eff_coe": 1.0,
      "eff_max": 1.3
    },
    {
      "valid_blocks": ["minecraft:crying_obsidian"],
      "eff_coe": 1.0,
      "eff_max": 1.5,
      "flow_coe": 2.8,
      "flow_max": 3.0
    }
  ]
}
```

## Single recipe (child format) and KubeJS `event.custom`

A **child** is one `entries` element written as a standalone recipe: the element's fields plus `"type"`, with **no** `entries` array. It works both as a datapack file and with KubeJS `event.custom`.

`event.custom` runs **after** Iskandert's Library has split the bundles, so a bundle passed to `event.custom` is **not** expanded: always pass a single child object.

Here `valid_blocks` is a normal entry field (a list of block selectors), not a bundle array.

Datapack file (e.g. `data/<ns>/recipe/elec_coil_iron.json`):

```json
{
  "type": "colossal_reactors:elec_coils",
  "valid_blocks": [
    "#c:storage_blocks/iron"
  ],
  "eff_coe": 0.66,
  "eff_max": 0.75,
  "flow_coe": 1.25,
  "flow_max": 1.35
}
```

KubeJS:

```js
ServerEvents.recipes(event => {
  event.custom({
    "type": "colossal_reactors:elec_coils",
    "valid_blocks": [
      "#c:storage_blocks/iron"
    ],
    "eff_coe": 0.66,
    "eff_max": 0.75,
    "flow_coe": 1.25,
    "flow_max": 1.35
  }).id('kubejs:elec_coils/iron')
})
```
