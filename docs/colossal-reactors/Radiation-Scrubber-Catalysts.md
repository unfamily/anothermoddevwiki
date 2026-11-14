## Radiation scrubber catalysts (`colossal_reactors:radiation_scrubber_catalysts`)

## When this datapack matters (important)

The **Radiation Scrubber** feature is meant for **Mekanism** integration (radiation / polonium gas handling, chemical capability on the block). In the mod, that path is wired when **Mekanism is loaded** (e.g. chemical capability registration uses reflection on Mekanism).

Additionally, **`ENABLE_RADIATION_MANAGEMENT`** must be **`true`** in the Colossal Reactors config (`dev` → `004_enable_radiation_management` / radiation management flag). When that flag is **off**, related recipes/content are gated (see `RadiationManagementCondition`, creative tab entries, GuideMe optional chapter).

**Summary:** treat this JSON as **pack dev for the radiation-management + Mekanism scenario**. The file may still be **parsed on every server datapack reload** if it exists under `recipe/` (values are applied to `RadiationScrubberCatalystsLoader`); gameplay relevance is when you actually use the Radiation Scrubber with Mekanism and the config enabled.

---

## Path and loader

- **Path:** `data/<namespace>/recipe/**/*.json` as `colossal_reactors:radiation_scrubber_catalysts` recipes (**from 2.4.0.0.0**, same `recipe/` pipeline as fuel, melter, etc.).
- **Loader:** `ColossalRecipeData` → `RadiationScrubberCatalystsLoader.parseFromRoot` / `applyLoaded`.
- **Builtin fallback:** if nothing loads from `RecipeManager`, see mod jar `data/colossal_reactors/recipe/radiation_scrubber_catalysts.json`.
- **Recipe ids:** each `entries[]` element becomes a progressive RecipeManager holder (`<filePath>_<index>`). Same id for KubeJS — see [Home → Recipe ids](home#recipe-ids-kubejs--viewers--from-24000).

## Root document

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | yes | `colossal_reactors:radiation_scrubber_catalysts` |
| `entries` | array of objects | yes | Merged across files (see below). |

## Entry object (`entries[]`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `catalysts` | array of strings | no | Item ids or `#item_tags` accepted as catalyst in the scrubber slot. Strings are trimmed and appended to the global list. |
| `mult` | int | no | Radiation removal effectiveness: **last non-negative value in recipe merge order wins** (`ColossalRecipeData` stores `radiationScrubberMult`). Used as multiplier with base removal in `RadiationScrubberBlockEntity`. |
| `gas_mult` | int | no | Gas destruction multiplier when a catalyst is present; **last value ≥ 1 wins**, else default `1`. |

Loader javadoc: multiple files/entries merge — **catalysts concatenated**, **last `mult` / `gas_mult` wins** for the numeric globals.

## Reference code

- `net.unfamily.colossal_reactors.radiation_scrubber.RadiationScrubberCatalystsLoader`
- `net.unfamily.colossal_reactors.blockentity.RadiationScrubberBlockEntity`
- `net.unfamily.colossal_reactors.Config.ENABLE_RADIATION_MANAGEMENT`
- `net.unfamily.colossal_reactors.data.RadiationManagementCondition`

## Example (Default Datapack)
```json
{
  "type": "colossal_reactors:radiation_scrubber_catalysts",
  "entries": [
    {
      "catalysts": ["#c:dusts/boron"],
      "mult": 100,
      "gas_mult": 10
    }
  ]
}
```

## Single recipe (child format) and KubeJS `event.custom`

A **child** is one `entries` element written as a standalone recipe: the element's fields plus `"type"`, with **no** `entries` array. It works both as a datapack file and with KubeJS `event.custom`.

`event.custom` runs **after** Iskandert's Library has split the bundles, so a bundle passed to `event.custom` is **not** expanded: always pass a single child object.

Datapack file (e.g. `data/<ns>/recipe/scrubber_boron.json`):

```json
{
  "type": "colossal_reactors:radiation_scrubber_catalysts",
  "catalysts": [
    "#c:dusts/boron"
  ],
  "mult": 100,
  "gas_mult": 10
}
```

KubeJS:

```js
ServerEvents.recipes(event => {
  event.custom({
    "type": "colossal_reactors:radiation_scrubber_catalysts",
    "catalysts": [
      "#c:dusts/boron"
    ],
    "mult": 100,
    "gas_mult": 10
  }).id('kubejs:scrubber/boron')
})
```
