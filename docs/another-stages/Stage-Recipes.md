# Stage Recipes

[← Home](Home) · [Overlapping restrictions](Overlapping-Restrictions) · [Full support ↓](#compatibility-list-full-support) · [Vanilla path coverage ↓](#vanilla-path-coverage)

## What this system does

Another Stages can **lock recipes** so that:

1. **Craft / process does not succeed** while the rule applies (empty crafting result; furnace/campfire/crafter **never start** the cook; some machines are integrated directly through `RecipeBlockBridge` and refuse the recipe).
2. **JEI** can show a red wash + lock badge (`overlay`) or hide the recipe (`hide`).

Entry points for packdevs:

| Entry | Binding / type |
|-------|----------------|
| KubeJS (preferred) | `AnotherStagesEvents.restrictions(e => e.recipes.restrict()…)` in **`server_scripts`** |
| Datapack JSON | `"type": "another_stages:stage_recipe"` under any `data/<ns>/load/**/*.json` |

Library exposes `RecipeBlockBridge`; Another Stages registers as the provider when installed.

**Vanilla is fully supported** (see [Full support](#compatibility-list-full-support)). Mod coverage grows over time — also [Vanilla path coverage](#vanilla-path-coverage).

| Feature                                                   | Since                                   |
| --------------------------------------------------------- | --------------------------------------- |
| Library `RecipeBlockBridge` API                           | Library (some machines are integrated directly through it) |
| Datapack `another_stages:stage_recipe` + matchers         | Another Stages 1.0.0.0.0                   |
| KubeJS `AnotherStagesEvents.restrictions` → `e.recipes`   | Another Stages 1.0.0.0.0                   |
| `priority` / `.priority(n)` (overlap winner for JEI)      | Another Stages (see [Overlapping-Restrictions](Overlapping-Restrictions)) |
| `recipe_viewer` / overlay corner / tooltips               | Another Stages 1.0.0.0.0                   |
| Optional action-bar (`feedback.recipe_blocked_actionbar`) | Another Stages 1.0.0.0.0                   |

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
| Network autocraft (AE2 / RS / …) | **AE2:** grid owning player / action source. **RS:** requesting player UUID on interactive start; `placedByPlayerId` on Pattern Grid / Autocrafter / autonomous ensure; else `null` (world stages) | Encode refused + job/submit refused + stage toast / CraftError text (AE2); execute is a safety net |
| Machines integrated via `RecipeBlockBridge` | Owner UUID when present; world stages without owner still apply | Machine refuses the recipe |

Anything that only crafts when a **player is interacting in a menu** (crafting table style) already uses the **player UUID** — no `MachineOwners` / owner attachment is required. Owner matters for **autonomous process** blocks (furnace-like), **network autocraft**, and bridge machines.

**No owner is normal** for many process machines. Missing owner does **not** skip stage locks there.

**Native owners (general rule):** if the mod already exposes a **UUID**, pass it to the bridge as-is (no conversion). Convert **only** when the format differs (e.g. AE2 ME player id → use `IGridNode.getOwningPlayerProfileId()` which is already UUID). Do not rewrite the mod’s stored data. Format adapters live in AS for now (`// TODO: move to Iskandert Library when Library is next updated`).

---

## 1. KubeJS (preferred)

Register **persistent** craft + JEI locks with **`AnotherStagesEvents.restrictions`** → `event.recipes.restrict()…` in **`server_scripts`**.

Do **not** use classic JS `if` / `for` / `while` to express recipe locks — that is the wrong tool for continuous gating. Runtime `if` + `AnotherStages.playerHasStage` / `addPlayerStage` is a **separate** special case (pack reactions / progression); see [Runtime stage API](#runtime-stage-api-special-case) and **[Kube-Stage-API](Kube-Stage-API)**.

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

### Restriction builder method reference

| Kube method | JSON field | Default | What it does |
|-------------|------------|---------|--------------|
| `.restrict()` | (starts a rule) | — | Creates one restriction builder and schedules commit on script flush. Without further matchers the rule matches nothing useful until you set stages + at least one matcher. |
| `.id('ns:path')` | (script rule key) | auto fingerprint id | Stable id for this script rule (reload/replace). Does **not** filter Minecraft recipes; only names the restriction. |
| `.priority(n)` | `priority` | `0` | When several stage-active rules match the same recipe, **higher wins** for exclusive JEI presentation (`recipe_viewer` / corner). Craft still blocks if **any** active rule matches. Tie → load order. Full flow → [Overlapping-Restrictions](Overlapping-Restrictions). |
| `.logicAnd()` | `stages_logic: "AND"` | AND if omitted | **All** stage conditions must match their `is` flag for the lock to apply. |
| `.logicOr()` | `stages_logic: "OR"` | — | **Any** one stage condition matching its `is` flag activates the lock. Recipe locks support **`AND` / `OR` only** — no `DEF_OR` / `DEF_AND` / `.when()` (those are [Stage-Items](Stage-Items#def_or-branches) only). |
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
| `stages_logic` | — | `AND` | How `stages` combine: **`AND` or `OR` only** (Kube `.logicAnd()` / `.logicOr()`). No `DEF_*` on recipes — see [Stage-Items](Stage-Items#def_or-branches). |
| `priority` | — | `0` | Overlap winner for exclusive JEI fields; higher wins. See [Overlapping-Restrictions](Overlapping-Restrictions). |
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
- **Furnace / campfire / crafter / many mod machines:** gate must **stop the recipe from starting**. Config `mixins.furnace` / `mixins.fastfurnace` / `mixins.ironfurnaces` default **on** (if set `false`, the mixin class still loads but the gate no-ops). When FastFurnace is present, the vanilla furnace mixin is **skipped** and FastFurnace’s `getRecipe` wrap is used instead (26.x: `getRecipe(ServerLevel)`; 1.21.1: no-arg `getRecipe()`). Both paths re-evaluate after unlock without requiring the input stack to change. FastWorkbench clears the client result via FW `RecipePayload` when locked. AE2-family process BEs (Inscriber, ExtAE RecipeExecutor machines, Reaction Chamber) likewise re-scan after stage change without moving items.
- **Matter Foundry (Replication AE2 Bridge):** when inputs match a recipe that is only stage-blocked, the Foundry **keeps re-scanning** after unlock — you do **not** need to move items in/out of the slots for craft to resume. (Latching `recipeChecked` on stage-only misses was a Bridge bug; fixed in current Bridge jars.)
- **Claimed furnace / machine (MachineOwners):** process gates pass the block entity so a placed/claimed owner UUID is used when present. Owner is claimed on **place**, on **first right-click**, and as a backup when a BE-backed menu **opens** (`claimIfAbsent` — never overwrites). Menu open resolves the BE from slot containers **and** reflective `getBlockEntity` / `getTileEntity` / `getMachine` (and common field names) so mod menus (EIO, Iron Furnaces, Create crafter, …) still claim. Player-stage rules stay fail-closed when **no owner** is stored — open or place the machine as the player so unlock restores craft after `/stage add`. JEI still uses the client player and can look unlocked before the machine has an owner. Applies to the whole **furnace family** (furnace / blast furnace / smoker and mod equivalents: FastFurnace, EP powered furnaces, FTBIC, Iron Furnaces, …). **Iron Furnaces:** process subject prefers native IF `owner` when set, else `MachineOwners.get(be)` so unlock works when IF never writes its own field. **Tester note:** ACM can gray/strikethrough mods without TOML config — do not confuse FastFurnace (gated) with “vanilla only” in that UI.
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

## 3. Runtime stage API (special case)

**Not** how you lock recipes. Use §1 managers (or datapack) for craft/JEI gates.

Classic JS `if` / `for` / `while` with `AnotherStages.playerHasStage` / `addPlayerStage` / … is for **runtime** pack logic only (quest unlocks, `stageChanged` reactions, commands). It does not replace `.restrict()`.

**`add*` / `has*` do not register Tab ids** — call `AnotherStages.registerStage` / `registerStages` (or datapack `iska_lib:known_stages`) separately when you want `/iska_lib_stage` autocomplete.

```js
AnotherStages.registerStage('player', 'bronze_age')

AnotherStagesEvents.stageChanged(event => {
  if (event.stageType !== 'player' || !event.added || event.stage !== 'bronze_age') return
  if (event.player == null) return
  if (!AnotherStages.playerHasStage(event.player, 'bronze_tools')) {
    AnotherStages.addPlayerStage(event.player, 'bronze_tools', true)
  }
})
```

Full method catalog: **[Kube-Stage-API](Kube-Stage-API)**.

---

## Reload — what each command does

| Command | What it reloads |
|---------|-----------------|
| `/iska_lib_dev reload` | Utils datapack content **and** AS stage JSON (items/recipes/blocks/guis) + Kube soft-reload of `server_scripts` when the stage chain runs |
| `/iska_lib_dev reload stages` | Stage block only (Library stage actions + AS chain) |
| `/iska_lib_stage reload` / `/another_stages reload` | Same AS stage chain (JSON + Kube soft-reload) |
| `/reload` | Full Minecraft datapack reload; AS JSON listeners run with the new `ResourceManager` |
| `/kubejs reload server-scripts` | All KubeJS stage rules |
| Edit under `bootstrap.datapack_paths` (e.g. `kubejs/data`) | Picked up on AS `loadAll` via filesystem merge (quick reload / stage reload), not only after full `/reload` |

---

## Compatibility list (full support)

All craft/process machines of the mod are gated. **Since** = first Another Stages version. Vanilla+ mods (crafting table / furnace / stonecutter / smithing only) go here. Requests: [GitHub issues](https://github.com/unfamily/Another-Stages/issues).

| Mod ID | Display name | How | Since |
|--------|--------------|-----|-------|
| `minecraft` | Minecraft (Vanilla) | Mixins | 1.0.0.0.0 |
| `iska_utils` | Iskandert's Utilities | `RecipeBlockBridge` | 1.0.0.0.0 |
| `colossal_reactors` | Colossal Reactors | `RecipeBlockBridge` | 1.0.0.0.0 |
| `rep_ae2_bridge` | Replication AE2 Bridge | `RecipeBlockBridge` | 1.0.0.0.0 |
| `fastbench` | FastWorkbench | Mixin | 1.0.0.0.0 |
| `fastfurnace` | FastFurnace | Mixin | 1.0.0.0.0 |
| `ironfurnaces` | Iron Furnaces | Mixin (native `owner` UUID, else `MachineOwners`; claim-on-open) | 1.0.0.0.0 |
| `polymorph_plus` | Polymorph+ | Mixin (`AbstractRecipeData`) | 1.0.0.0.0 |
| `polymorph` | Polymorph | Mixin (`AbstractRecipeData`) | 1.0.0.0.0 |
| `toms_storage` | Tom's Simple Storage | Mixin (Crafting Terminal) | 1.0.0.0.0 |
| `sophisticatedcore` | Sophisticated Core | Mixins (crafting upgrade hard-block on result/select/transfer; cooking/auto-cooking prefer wearing-player subject for unlock after stage grant, else storage/`MachineOwners`/`RsCraftSubjects`; block-converter strips locked recipes in **`filterAndSortRecipes`** and **`getRecipeList`**, plus `selectRecipe` fail-safe with filtered→real index map) | 1.0.0.0.0 |
| `ae2` | Applied Energistics 2 | Mixins | 1.0.0.0.0 |
| `extendedae` | ExtendedAE | Mixins | 1.0.0.0.0 |
| `advanced_ae` | AdvancedAE | Mixins | 1.0.0.0.0 |
| `refinedstorage` | Refined Storage 2 | Mixins (matrix/encode with `placedBy` + interacting player; `startTask`/`ensureTask` autocraft; Autocrafter `canStep`) | 1.0.0.0.0 |
| `craftingstation` | Crafting Station | Mixin (menu) | 1.0.0.0.0 |
| `energizedpower` | Energized Power | Mixins (`SimpleRecipe` / `SimpleRecipeFluid` / `SelectableRecipe` / `SelectableRecipeFluid` / powered furnaces / alloy / auto-crafter; `MachineOwners` / no-owner OK) | 1.0.0.0.0 |
| `enderio` | Ender IO | Mixins (Crafter; Alloy Smelter + remapped smelting dual-id; shared `CraftingMachineTaskHost` for Sag / Slicer / Painting / Soul Binder / Vat; `EioStageRearm` unlock; `MachineOwners` / no-owner OK). Non-recipe machines (obelisks, vacuum, generators, drain) are out of stage-recipe scope. | 1.0.0.0.0 |
| `mekanism` | Mekanism | Mixins (Formulaic Assemblicator; electric Item→Item + smelting synthetic dual-id; QIO; Thermal Evaporation `evaporating/*` + `canHolder` AND; live-cache drop on re-lock). **Owner:** TE with Mek security → native `getOwnerUUID()` only; AS `MachineOwners` claim is **skipped** on those tiles (no duplicate attachment). Evaporation/`MultiblockData` (no `AttributeSecurity` → Mek owner null): Mek first, else AS `MachineOwners` fallback (claim place/open); scan structure locations; **never** `inventoryID`. **Not** stage-recipe: **SPS / Boiler / Fission** (and Matrix/Tank) — hardcoded process, no datapack recipe id. | 1.0.0.0.0 |
| `ftbic` | FTB Industrial Contraptions | Mixins (**26.1.2 only**; all machine recipes: powered furnaces, macerating, extruding, refining/centrifuging, …). On block: clears `cachedRecipe` / `runningRecipeId` / `recipeDirty` so unlock re-finds. JEI adapted cooking keeps **vanilla smelting ids/outputs** (`minecraft:glass` etc.) for RV locks. `MachineOwners` / no-owner OK | 1.0.0.0.0 |

Install **either** `polymorph` **or** `polymorph_plus`, never both. AE2 Transform supports only `world` stages ([details](#limited-stage-type-paths)). Processing patterns have no recipe id: gate the external machine instead.

**AE2 / RS stage feedback:**
- **AE2 submit (Craft Confirm → error dialog):** still returns `INCOMPLETE_PLAN` for AE2 control flow. AS sends **S2C only** (no action-bar under the GUI). Client applies `another_stages.ae2.craft_blocked` / `_recipe` onto `CraftErrorScreen` when the pending flag is set (`setTextContent` late-apply so S2C can arrive after `<init>`). AE2’s global incomplete-plan lang is unchanged for non-stage failures.
- **AE2 encode:** still uses action-bar + the same S2C flag for consistency.
- **RS autocraft / craft-grid:** RS `MessagePacket` toast only (`another_stages.rs.craft_blocked` / `_recipe`) — **no** action-bar.
- **RS encode:** action-bar + RS toast (`another_stages.rs.encode_blocked` / `_recipe`).

---

## Vanilla path coverage

**Partial support:** only the listed paths are gated; unlisted machines of the mod = **bypass**. Toggle under common config `mixins.*`.

| Mod ID | Display name | Path (what is gated) | How | Owner subject | Since |
|--------|--------------|----------------------|-----|---------------|-------|
| `create` | Create | **1.21.1 NeoForge only** (no Create on AS 26). Gated: Mechanical Crafter; fan **BLASTING / SMOKING / HAUNTING / SPLASHING**; **BasinOperating** (Mixer + Press-in-basin); Press belt/world **PRESSING**; Millstone; Saw (`getRecipes` filter + `applyRecipe`; vertical belt cutting — not horizontal block-breaker); Crushing Wheels (`applyRecipe` no-op while locked — must **not** clear inventory / destroy the stack; Create then ejects the **unchanged** input = pass-through, no jam; next insert after stage grant crushes; controller auto-placed → owner from ItemEntity thrower or nearest player); Deployer; **manual item application**; Spout **filling** (`whenItemHeld` / `onItemReceived`); Item Drain **emptying** (`continueProcessing`); sandpaper **hand** (`SandPaperItem.finishUsingItem`) + deployer sandpaper via Deployer gate. **JEI dual-id:** `…_using_deployer` ↔ base for item_application / sandpaper. **Shared ids:** e.g. `create:honey_bottle` is both filling and emptying — distinguish with `recipe_types: create:filling` / `create:emptying`. **Not** gated: sequenced assembly; saw tree/block-breaker. Fan thrower via `CreateFanSubject`. Claim owner (place/open) for player-stage unlocks. | Mixin | `MachineOwners` / player (manual / sandpaper) / thrower UUID / null OK | 1.0.0.0.0 |
| `createaddition` | Create Crafts & Additions | **1.21.1:** Rolling Mill (`find` rolling); Tesla Coil charging (`find`). **Not** gated: Liquid Blaze Burner / `liquid_burning` (hard to support usefully). Other CCA blocks (motor, accumulator, …) out of stage-recipe scope. | Mixin | `MachineOwners` | 1.0.0.0.0 |
| `create_enchantment_industry` | Create Enchantment Industry | **1.21.1 NeoForge:** Printer (`PrintingRecipe` + `MachineOwners` via belt bind); Grindstone Drain (`GrindingRecipe` / disenchant fluid path). Blaze Enchanter/Forger and Apotheosis extras not gated in this pass. | Mixin | `MachineOwners` | 1.0.0.0.0 |
| `create_central_kitchen` | Create Central Kitchen | **1.21.1:** no unique process BE — converts FD/etc. into Create sawing/deploying/mixing/pressing; those use the Create gates above. | Soft (via Create) | same as Create | 1.0.0.0.0 |
| `create_dragons_plus` | Create Dragons Plus | **1.21.1:** fan **ending** / **freezing** datapack recipes (`EndingFanProcessingType` / `FreezingFanProcessingType`, same subject as Create fans). Compat-only transforms without a `RecipeHolder` are not stage-gated. Sanding / coloring not in this pass. | Mixin | thrower UUID / null OK | 1.0.0.0.0 |
| `create_new_age` | Create New Age | **1.21.1:** Energiser (`EnergisingRecipe` via `EnergiserBehaviour.getRecipe`). Motors / heat / nuclear out of stage-recipe scope. | Mixin | `MachineOwners` | 1.0.0.0.0 |
| `integratedcrafting` | Integrated Crafting | Schedule / craft paths when recipe id is mapped | Soft | UUID as-is | 1.0.0.0.0 |
| `forestry` | Forestry CE | Worktable only | Mixin | Machine / no-owner | 1.0.0.0.0 |

**Not supported (do not claim):** Cooking for Blockheads Cooking Table; Pam’s HarvestCraft 2 tools-in-crafting-grid; Mekanism **SPS / Boiler / Fission** (and other multiblocks without datapack recipe ids); Create sequenced assembly; Create saw horizontal block-breaker; CDP fan sanding/coloring / hardcoded compat transforms.

Machines re-check locks on the next tick after a stage change (no need to reinsert items).

### Limited stage-type paths

| Path | Only compatible | What is gated |
|------|-----------------|---------------|
| AE2 in-world **Transform** (`TransformLogic`) | `world` | Transform must not start / consume |

Machines without an owner still apply stage locks (insert OK / no work / no consume).
