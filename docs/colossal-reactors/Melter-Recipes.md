# Melter recipes (`colossal_reactors:melter_recipes`)

Loaded from **`data/<namespace>/recipe/**/*.json`** as `colossal_reactors:melter_recipes` recipes. Applied at reload by `ColossalRecipeData` from `RecipeManager` (**from 2.4.0.0.0**; path is free under `recipe/`).

**Recipe ids:** each `entries[]` element becomes a progressive RecipeManager holder (`<filePath>_<index>`). Same id for KubeJS / JEI / EMI / REI — see [Home → Recipe ids](home#recipe-ids-kubejs--viewers--from-24000).

**GUI (from 2.4.0.0.0):** left-click the melter progress bar opens melter recipes in the active recipe viewer (JEI / EMI / REI).

## Root document

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | yes | Must be `colossal_reactors:melter_recipes`. |
| `entries` | array of objects | yes | One object per recipe. |

## Entry object (`entries[]`)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `input` | string | yes | — | Item id or `#item_tag` (leading `#` = tag). |
| `output` | string | yes | — | **Fluid** id or `#fluid_tag`. If tag, runtime uses **first** fluid in the tag (`MelterRecipesLoader.getOutputFluid`). |
| `amount` | int | yes | — | Output fluid amount in **mB** per craft. Must be positive. |
| `time` | int | yes | — | Base processing time in **ticks**. Must be positive. Effective time is divided by the **product** of six face heat factors (see [Melter heats](melter-heats.md)). |
| `count` | int | no | `1` | Input items consumed per craft. Must be &gt; 0 if set. |

Recipe match: first recipe in list order where the input slot stack matches `input` (tag or item) and `stack.getCount() >= count`.

## Processing time (runtime)

From `MelterBlockEntity` and `MelterRecipe` javadoc:

\[
\text{finalTime} = \max\left(1,\ \left\lfloor \frac{\text{time}}{\prod_{\text{faces}} f_{\text{face}}} \right\rfloor \right)
\]

Each face uses `MelterHeatsLoader.getFactorFor` (block match first, else fluid). Faces with no heat entry use factor **1.0**. If the **product** is ≤ 0, the melter does not advance.

## Merge behaviour

Merge: each RecipeManager file keeps its own recipe ids. Runtime and JEI/EMI/REI, for the same `input` selector + `count`, keep the **last** recipe (addon replace). Distinct inputs stay additive (`MelterRecipesLoader.applyLoaded`).

## Reference code

- `net.unfamily.colossal_reactors.crafting.ColossalRecipeData`
- `net.unfamily.colossal_reactors.melter.MelterRecipesLoader`
- `net.unfamily.colossal_reactors.melter.MelterRecipe`

## Example (Default Datapack)
```json
{
  "type": "colossal_reactors:melter_recipes",
  "entries": [
    {
      "input": "#c:rods/breeze",
      "output": "#c:breezium",
      "amount": 100,
      "time": 200
    },
    {
      "input": "#c:catalysts/breezium",
      "output": "#c:breezium",
      "amount": 250,
      "time": 200
    },
    {
      "input": "#c:ender_pearls",
      "output": "#c:ender",
      "amount": 250,
      "time": 200
    },
    {
      "input": "#c:cobblestones",
      "output": "#c:lava",
      "amount": 100,
      "time": 200
    },
    {
      "input": "#c:netherracks",
      "output": "#c:lava",
      "amount": 250,
      "time": 200
    },
    {
      "input": "#c:obsidians",
      "output": "#c:lava",
      "amount": 1000,
      "time": 200
    }
  ]
}
```
