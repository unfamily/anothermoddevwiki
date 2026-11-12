# Stage Recipes

[← Home](Home) · [Full support ↓](#compatibility-list-full-support) · [Vanilla path coverage ↓](#vanilla-path-coverage)

## What this system does

Another Stages can **lock recipes** so that:

1. **Craft / process does not succeed** while the rule applies (empty crafting result; furnace/campfire/crafter **never start** the cook; some machines are integrated directly through `RecipeBlockBridge` and refuse the recipe).
2. **JEI** can show a red wash + lock badge (`overlay`) or hide the recipe (`hide`).

Entry points for packdevs:

| Entry | Binding / type |
|-------|----------------|
| KubeJS (preferred) | `AnotherStagesEvents.restrictions(e => e.recipes.restrict()…)` in **`server_scripts`** (legacy `AnotherStages.recipes` ok) |
| Datapack JSON | `"type": "another_stages:stage_recipe"` under any `data/<ns>/load/**/*.json` |

Library exposes `RecipeBlockBridge`; Another Stages registers as the provider when installed.

**Vanilla is fully supported** (see [Full support](#compatibility-list-full-support)). Mod coverage grows over time — also [Vanilla path coverage](#vanilla-path-coverage).

| Feature                                                   | Since                                   |
| --------------------------------------------------------- | --------------------------------------- |
| Library `RecipeBlockBridge` API                           | Library (some machines are integrated directly through it) |
| Datapack `another_stages:stage_recipe` + matchers         | Another Stages 0.1.0.0.0                   |
| KubeJS `AnotherStages.recipes`                            | Another Stages 0.1.0.0.0                   |
| KubeJS `AnotherStagesEvents.restrictions` (preferred)     | Another Stages 0.1.0.0.0                   |
| `recipe_viewer` / overlay corner / tooltips               | Another Stages 0.1.0.0.0                   |
| Optional action-bar (`feedback.recipe_blocked_actionbar`) | Another Stages 0.1.0.0.0                   |

---

## How a rule is evaluated (read this)

A rule fires only when **all** of the following hold:

1. **Matchers** — every **non-empty** matcher list on the rule must match (**AND**). Empty list = that matcher is ignored.
2. **Not excluded** — recipe id is not in `exclude_recipes`.
3. **Stages** — `stages` + `stages_logic` say the lock is active (`is: false` means “lock while the player/world/team does **not** have this stage”).

**Matchers (AND):**

| Matcher | Matches when… |
|---------|----------------|
| `recipes` | Recipe **registry id** is in the list (e.g. `minecraft:torch`), or `regex:<pattern>`, or `@modid` |
| `recipe_types` | Recipe’s **`RecipeType` registry id** is in the list (e.g. `minecraft:smelting`, `minecraft:crafting`) — **not** the serializer (`crafting_shaped` is wrong); also `regex:` / `@mod` |
| `outputs` | Recipe **result item** (from `Recipe.display()`) matches id / `#tag` / `@mod` / `regex:` |
| `inputs` | At least one placement ingredient item matches id / `#tag` / `@mod` / `regex:` |

**`regex:` entries:** prefix `regex:` then a Java regex. Matched with `Pattern.find()` on the **full id string** (e.g. `minecraft:glass`). Invalid pattern → that entry never hits (no crash). Example: `regex:minecraft:.*_ingot`. Same convention as `AnotherStages.playerHasStageMatching`.

**Wrong assumptions:**

- `outputs: ["minecraft:glass"]` alone → only recipes whose **result** is glass (e.g. sand→glass), **not** every furnace recipe.
- `recipe_types: ["minecraft:smelting"]` alone → **every** smelting recipe.
- `recipe_types` + `outputs` → smelting **and** that result (both required).

**Menus vs machines:**

| Context | Who is checked | Effect of a lock |
|---------|----------------|------------------|
| Crafting table / inventory craft / stonecutter / smithing / recipe book | **Player** opening the menu (`RecipeStageGate.isBlockedForPlayer`) | No result / cannot place recipe |
| Furnace, smoker, blast furnace, campfire, crafter, most mod machines | **Machine process** (`isBlockedForMachine`; often **no owner**) | Recipe **must not start** (no cook progress) |
| Network autocraft (AE2 / RS / …) | **Native network/node owner UUID** (or requesting player); not a second AS claim when the mod already stores one | Encode refused + job/submit refused; execute is a safety net |
| Machines integrated via `RecipeBlockBridge` | Owner UUID when present; world stages without owner still apply | Machine refuses the recipe |

Anything that only crafts when a **player is interacting in a menu** (crafting table style) already uses the **player UUID** — no `MachineOwners` / owner attachment is required. Owner matters for **autonomous process** blocks (furnace-like), **network autocraft**, and bridge machines.

**No owner is normal** for many process machines. Missing owner does **not** skip stage locks there.

**Native owners (general rule):** if the mod already exposes a **UUID**, pass it to the bridge as-is (no conversion). Convert **only** when the format differs (e.g. AE2 ME player id → use `IGridNode.getOwningPlayerProfileId()` which is already UUID). Do not rewrite the mod’s stored data. Format adapters live in AS for now (`// TODO: move to Iskandert Library when Library is next updated`).

---

## 1. KubeJS (preferred)

Prefer **`AnotherStagesEvents.restrictions`**. Legacy top-level `AnotherStages.recipes.restrict()…` still works. Queries stay on `AnotherStages.playerHasStage` / …

```js
AnotherStagesEvents.restrictions(event => {
  event.recipes.restrict()
    .id('pack:bronze_smelting') // optional
    .logicAnd()
    .stages([
      { stage_type: 'player', stage: 'bronze_age', is: false },
    ])
    .recipes(['minecraft:iron_pickaxe'])
    .recipeTypes(['minecraft:smelting'])
    .outputs(['minecraft:iron_ingot'])
    .inputs(['#c:ores'])
    .excludeRecipes([])
    .viewerOverlay() // default; or .viewerHide()
    .overlayCorner('top_right')
    .tooltip(Text.translate('another_stages.tooltip.locked_bronze'))
    .hideDefaultTooltips(false)
})
```

Calling `.restrict()` **enqueues** the builder; at end of script load (after the event posts) the rule is committed into the recipe gate (same pool as datapack rules).

If `.id(...)` is omitted → auto-id `another_stages:kjs/recipe/<fingerprint>` (collision → `_2`, `_3`, …).

### Kube method reference

| Kube method | JSON field | Default | What it does |
|-------------|------------|---------|--------------|
| `.restrict()` | (starts a rule) | — | Creates one restriction builder and schedules commit on script flush. Without further matchers the rule matches nothing useful until you set stages + at least one matcher. |
| `.id('ns:path')` | (script rule key) | auto fingerprint id | Stable id for this script rule (reload/replace). Does **not** filter Minecraft recipes; only names the restriction. |
| `.logicAnd()` | `stages_logic: "AND"` | AND if omitted | **All** stage conditions must match their `is` flag for the lock to apply. |
| `.logicOr()` | `stages_logic: "OR"` | — | **Any** one stage condition matching its `is` flag activates the lock. |
| `.stages([...])` | `stages` | empty (= always apply if matchers hit) | List of `{ stage_type, stage, is }`. `stage_type`: `player` (default) \| `world` \| `team` (case-insensitive). **`is` default `false`** (lock while stage **missing**); `is: true` = lock while stage **present**. (Before AS/Library current: omitted `is` defaulted to `true` — footgun; now omitted = `false`.) |
| `.recipes([...])` | `recipes` / `recipe` | empty (ignored) | AND-filter: recipe registry ids that may be locked. Forms: exact id, `@mod`, `regex:pattern`. Example: `['minecraft:torch']`, `['regex:minecraft:.*_pickaxe']`. |
| `.recipeTypes([...])` | `recipe_types` / `recipe_type` | empty (ignored) | AND-filter: `RecipeType` ids (`minecraft:smelting`, `minecraft:crafting`, `minecraft:blasting`, …). Also `@mod` / `regex:`. Does **not** lock JEI category UIDs that are not recipe types. |
| `.outputs([...])` | `outputs` / `output` | empty (ignored) | AND-filter: result **item** id / `#tag` / `@mod` / `regex:`. Uses recipe display result, not “all recipes in a JEI tab”. |
| `.inputs([...])` | `inputs` / `input` | empty (ignored) | AND-filter: at least one ingredient item must match id / `#tag` / `@mod` / `regex:`. |
| `.excludeRecipes([...])` | `exclude_recipes` | empty | Recipe ids in this list are **never** locked by this rule (exact / `@mod` / `regex:`). |
| `.viewerOverlay()` | `recipe_viewer: "overlay"` | overlay | JEI: keep recipe visible; light red wash + corner lock badge. Does **not** by itself stop crafting (craft is always server-gated when the rule applies). |
| `.viewerHide()` | `recipe_viewer: "hide"` | — | JEI: hide the recipe from the lookup while the rule applies. Craft still blocked server-side. |
| `.overlayCorner('…')` | `overlay_corner` | `top_right` | Badge corner: `top_left` \| `top_right` \| `bottom_left` \| `bottom_right`. Only matters with overlay. |
| `.overlayTopLeft()` / `TopRight` / `BottomLeft` / `BottomRight` | same | — | Shortcuts for `.overlayCorner(...)`. |
| `.tooltip(Text…)` | (component tooltips) | none | Adds one Kube `Component` line on the JEI recipe / badge (in addition to string tooltips). Prefer `Text.translate` / `Text.of` for formatting. |
| `.tooltips([...])` | `tooltips` | empty | Replaces string tooltip list. Each string is a **lang key** (dotted, no spaces → translated) **or** a **literal** (not translated). Non-empty custom tips replace the default “Recipe locked until stage …” line. |
| `.hideDefaultTooltips(bool)` | `hide_default_tooltips` | `false` | `true` = clear JEI’s own recipe tooltips before AS tips are applied. |

[Full support ↓](#compatibility-list-full-support) · [Vanilla path coverage ↓](#vanilla-path-coverage)

---

## 2. Datapack (JSON)

| Root | Value |
|------|--------|
| `type` | Must be `another_stages:stage_recipe` |
| Path | Any `data/<namespace>/load/**/*.json` (folder `another_stages_recipes/` is optional convention) |
| Shape | Prefer one file with many objects in `restrictions` |

```json
{
  "type": "another_stages:stage_recipe",
  "restrictions": [
    {
      "stages_logic": "AND",
      "stages": [
        { "stage_type": "player", "stage": "bronze_age", "is": false }
      ],
      "recipes": ["minecraft:iron_pickaxe"],
      "recipe_types": ["minecraft:smelting"],
      "outputs": ["minecraft:iron_ingot"],
      "inputs": ["#c:ores"],
      "exclude_recipes": [],
      "recipe_viewer": "overlay",
      "overlay_corner": "top_right",
      "tooltips": ["Requires bronze age"],
      "hide_default_tooltips": false
    }
  ]
}
```

### JSON field reference

| JSON field | Aliases | Default | What it does |
|------------|---------|---------|--------------|
| `stages_logic` | — | `AND` | How `stages` combine: `AND` or `OR` (same meaning as Kube `.logicAnd()` / `.logicOr()`). |
| `stages` | — | empty | Stage conditions. Each entry: `stage_type` (`player`\|`world`\|`team`), `stage` (id string), `is` (boolean, **default `false`** = lock while missing). Empty stages ⇒ rule applies whenever matchers hit. |
| `recipes` | `recipe` | empty | See matcher table — registry recipe ids. |
| `recipe_types` | `recipe_type` | empty | See matcher table — `RecipeType` registry ids only. |
| `outputs` | `output` | empty | See matcher table — result item. |
| `inputs` | `input` | empty | See matcher table — ingredients. |
| `exclude_recipes` | — | empty | Ids skipped by this rule. |
| `recipe_viewer` | — | `overlay` | `overlay` = JEI wash+badge; `hide` = remove from JEI. |
| `overlay_corner` | — | `top_right` | Badge corner for overlay mode. |
| `tooltips` | — | empty | String tips: **lang key** (dotted, no spaces → translated) **or** **literal** (not translated). Kube `.tooltip(Text…)` preferred for formatting. |
| `hide_default_tooltips` | — | `false` | Clear vanilla/JEI tips before AS tips. |

Optional load gates from Library (`mod` / mod conditions on the restriction object) still apply at load time — if the mod is missing the restriction is skipped.

### Recipe viewer (JEI) detail

| `recipe_viewer` | What the player sees |
|-----------------|----------------------|
| `overlay` (default) | Recipe stays listed; red tint; lock badge (`textures/stage_locking/recipe_locked.png`, 16×16) in `overlay_corner`. Hover badge for lock tip. |
| `hide` | Recipe removed from JEI while the rule applies. |

Craft/process enforcement is **always server-side** when the rule applies. REI/EMI are not wired yet.

**Recipe viewer (JEI / EMI / REI):** listing only `minecraft:smelting` does not lock blasting/smoking — add those types too if needed. Prefer `recipes: ["mod:exact_id"]` for mod viewer wrappers that do not expose a clean `RecipeHolder`. AS ships plugins for JEI, EMI, and REI; on **26.1.2** EMI has no official build yet (unofficial jars may exist and are untested) — treat EMI coverage as best-effort until an official port.

**Utils JEI wrappers (Ancient Tablet / Factory):** JEI shows custom records (`AncientTabletJeiRecipe` / `FactoryJeiRecipe`), not always a live `RecipeHolder`. AS resolves the holder from the integrated server RecipeManager when available (SP/dev), and otherwise probes wrapper `inputs()` / `outputs()` plus a soft type map (`iska_utils:ancient_tab` / `iska_utils:factory`). So `recipe_types`, `outputs`, and `inputs` work in JEI for those categories — not only exact `recipes: []`. Pattern Crafter already uses vanilla `RecipeHolder` crafting ids.

### Machines / no owner

- **Accept / no-consume (contract):** when a process is stage-locked, machines still **accept** matching resources into slots/tanks; they **do not consume**, craft, or advance progress. Do not reject inserts solely because the stage is missing.
- **Selection UI stays visible:** if a machine has a picker (e.g. Factory colour/output select), locked options **remain listed**; the stage gate runs on process only (not by emptying the choice list).
- **Crafting-like menus:** gate uses the **player**.
- **Autocrafters that reuse vanilla crafting recipes** (Utils Improved Pattern Crafter, vanilla crafter, and other modded autocrafters that resolve the same `minecraft:…` crafting recipe ids via `RecipeBlockBridge` / craft gates): locking those **vanilla crafting** recipes is enough — they inherit the lock. You do **not** need a separate restriction that targets the machine’s own menu/mod id. The same rule applies to future autocrafter integrations that call the bridge with the vanilla recipe id.
- **Furnace / campfire / crafter / many mod machines:** gate must **stop the recipe from starting**. FastFurnace is covered by a dedicated mixin when present (re-evaluates after unlock without requiring the input stack to change). FastWorkbench clears the client result via FW `RecipePayload` when locked. AE2-family process BEs (Inscriber, ExtAE RecipeExecutor machines, Reaction Chamber) likewise re-scan after stage change without moving items.
- **Matter Foundry (Replication AE2 Bridge):** when inputs match a recipe that is only stage-blocked, the Foundry **keeps re-scanning** after unlock — you do **not** need to move items in/out of the slots for craft to resume. (Latching `recipeChecked` on stage-only misses was a Bridge bug; fixed in current Bridge jars.)
- **Claimed furnace (MachineOwners):** vanilla furnace gate passes the block entity so a placed/claimed owner is used when present.
- **No owner:** still evaluate stage rules. Library `RecipeBlockBridge` with `ownerUuid == null` **delegates to providers** (AS decides). World stages unlock normally. Player-scoped **conditions** without an online owner resolve as “missing stage” (`has = false`) — with typical `is: false` that keeps the lock. Mixed AND rules (world + player) evaluate each condition; a satisfied world unlock can make the whole rule stop applying.
- **Player-scoped fail-close** applies to the player condition itself, not as a blanket “any rule that mentions player is always active” when other conditions would already fail the AND/OR.

### Inputs / outputs matchers (RecipeIoProbe)

`inputs` / `outputs` no longer rely only on vanilla `display()` / `placementInfo()`. AS probes the recipe object (display first, then ingredients/results — Kube-like) so custom types such as `rep_ae2_bridge:matter_foundry`, `iska_utils:factory`, and `iska_utils:ancient_tab` can match I/O even when `NOT_PLACEABLE`. Prefer exact `recipes: ["mod:path_N"]` or `recipe_types` when possible; child ids after Library bundle split use `_0`, `_1`, …

### Utils: AS `stage_recipe` vs JSON `stages`

| Path | Use |
|------|-----|
| **AS `stage_recipe`** via `RecipeBlockBridge` | Pattern Crafter (vanilla crafting ids), Factory craft tick, Ancient Table/Tablet craft, pack-wide lock |
| **Utils JSON `stages` / `stages_logic` / `mods`** (`SuspiciousDeliveryStageHost`) | Built-in per-entry gates on Factory source/select, Ancient Tab entries, Suspicious Delivery, Arcane Dictionary, Auto Shop — works **without** AS |

Shop / Suspicious Delivery / Arcane are **not** recipe-lock targets for AS; keep their JSON stages. Vanilla Utils recipes under `data/**/recipe/**` use normal AS matchers.
### Offline owners

Player stages + owner offline → **blocked** (no online player → player condition `has = false`). World/team stages still resolve via Library SavedData.

### Team stages (Library, not FTB)

Team stage **data** is owned by IskaLib (`TeamStageData` / `iska_utils_team_stages`). FTB Teams only supplies membership + UUID team keys when sync is on. Prefer commands **`team_player`** (`/iska_lib_stage add team_player …`) for pack/quest use; `team <name>` resolves display name → internal key (UUID under FTB sync).

### Action-bar feedback (optional)

Default: **silent** (GUI / recipe viewer already show the lock).  
Config `feedback.recipe_blocked_actionbar` (`false` by default): if `true`, online owner gets an action-bar message when a gate fires **and** they have no container menu open (~3s cooldown). Skipped while a GUI is open.

[Full support ↓](#compatibility-list-full-support) · [Vanilla path coverage ↓](#vanilla-path-coverage)

---

## 3. Queries (exceptional)

Not part of `restrict()` — script helpers to **read** Library/AS stages (do not lock recipes by themselves).

**Isolated from KubeJS built-in stages:** `AnotherStages.playerHasStage` / `addPlayerStage` / … read and write **only** IskaLib `StageRegistry`. They do **not** use KubeJS’s own stage API. Do not mix the two systems. Full table: [Stage-Items § bindings](Stage-Items#3-stage-bindings-query--mutate).

```js
if (AnotherStages.playerHasStage(player, 'bronze_age')) { /* … */ }
AnotherStages.addPlayerStage(player, 'bronze_age')
```

Full query table: [Stage Items → Query](Stage-Items#3-stage-bindings-query--mutate).

---

## Reload — what each command does

| Command | What it reloads |
|---------|-----------------|
| `/iska_lib_dev reload` | Utils datapack content **and** AS stage JSON (items/recipes/blocks/guis) + Kube soft-reload of `server_scripts` when the stage chain runs |
| `/iska_lib_dev reload stages` | Stage block only (Library stage actions + AS chain) |
| `/iska_lib_stage reload` / `/another_stages reload` | Same AS stage chain (JSON + Kube soft-reload) |
| `/reload` | Full Minecraft datapack reload; AS JSON listeners run with the new `ResourceManager` |
| `/kubejs reload server_scripts` | All KubeJS stage rules |
| Edit under `bootstrap.datapack_paths` (e.g. `kubejs/data`) | Picked up on AS `loadAll` via filesystem merge (quick reload / stage reload), not only after full `/reload` |

---

## Compatibility list (full support)

All craft/process machines of the mod are gated. **Since** = first Another Stages version. Vanilla+ mods (crafting table / furnace / stonecutter / smithing only) go here. Requests: [GitHub issues](https://github.com/unfamily/Another-Stages/issues).

| Mod ID | Display name | How | Since |
|--------|--------------|-----|-------|
| `minecraft` | Minecraft (Vanilla) | Mixins | 0.1.0.0.0 |
| `iska_utils` | Iskandert's Utilities | `RecipeBlockBridge` | 0.1.0.0.0 |
| `colossal_reactors` | Colossal Reactors | `RecipeBlockBridge` | 0.1.0.0.0 |
| `rep_ae2_bridge` | Replication AE2 Bridge | `RecipeBlockBridge` | 0.1.0.0.0 |
| `fastbench` | FastWorkbench | Mixin | 0.1.0.0.0 |
| `fastfurnace` | FastFurnace | Mixin | 0.1.0.0.0 |
| `ironfurnaces` | Iron Furnaces | Mixin | 0.1.0.0.0 |
| `polymorph_plus` | Polymorph+ | Mixin (`AbstractRecipeData`) | 0.1.0.0.0 |
| `polymorph` | Polymorph | Mixin (`AbstractRecipeData`) | 0.1.0.0.0 |
| `toms_storage` | Tom's Simple Storage | Mixin (Crafting Terminal) | 0.1.0.0.0 |
| `sophisticatedcore` | Sophisticated Core | Mixin (crafting upgrade) | 0.1.0.0.0 |
| `ae2` | Applied Energistics 2 | Mixins | 0.1.0.0.0 |
| `extendedae` | ExtendedAE | Mixins | 0.1.0.0.0 |
| `advanced_ae` | AdvancedAE | Mixins | 0.1.0.0.0 |
| `refinedstorage` | Refined Storage 2 | Mixins | 0.1.0.0.0 |
| `craftingstation` | Crafting Station | Mixin (menu) | 0.1.0.0.0 |

Install **either** `polymorph` **or** `polymorph_plus`, never both. AE2 Transform supports only `world` stages ([details](#limited-stage-type-paths)). Processing patterns have no recipe id: gate the external machine instead.

---

## Vanilla path coverage

**Partial support:** only the listed paths are gated; unlisted machines of the mod = **bypass**. Toggle under common config `mixins.*`.

| Mod ID | Display name | Path (what is gated) | How | Owner subject | Since |
|--------|--------------|----------------------|-----|---------------|-------|
| `energizedpower` | Energized Power | Auto Crafter; Auto Stonecutter | Mixins | `MachineOwners` / no-owner OK | 0.1.0.0.0 |
| `enderio` | Ender IO | Crafter only | Mixin | `MachineOwners` / no-owner OK | 0.1.0.0.0 |
| `create` | Create | Mechanical Crafter only | Mixin | Machine / no-owner | 0.1.0.0.0 |
| `mekanism` | Mekanism | Formulaic Assemblicator / QIO craft window only | Mixin | Native `getOwnerUUID()` | 0.1.0.0.0 |
| `integratedcrafting` | Integrated Crafting | Schedule / craft paths when recipe id is mapped | Soft | UUID as-is | 0.1.0.0.0 |
| `forestry` | Forestry CE | Worktable only | Mixin | Machine / no-owner | 0.1.0.0.0 |

Machines re-check locks on the next tick after a stage change (no need to reinsert items).

### Limited stage-type paths

| Path | Only compatible | What is gated |
|------|-----------------|---------------|
| AE2 in-world **Transform** (`TransformLogic`) | `world` | Transform must not start / consume |

Machines without an owner still apply stage locks (insert OK / no work / no consume).
