# Iskandert's Mods Developers Documentation

## Notices

**The documentation provided uses the old folder structure; from version 3.0.0.0.0 onwards, configs are datapacks, but the syntax remains the same. The issue with the overwritable file being regenerated on disk is gone.**

**This document provides an overview of the commands and scripting systems provided by the Iska Utils mod.**

| Minecraft | Iskandert's Library |
|-----------|---------------------|
| **26.1.2** | Always — core systems use **Iskandert's Library** |
| **1.21.1** | From **Iskandert's Utilities 3.6.0.0.0** onwards (install **both** mods on 1.21.1 for current releases) |

**Some features may not strictly require Iskandert's Utilities** (Iskandert's Library alone is enough for part of the stack); **installing both mods is still recommended**. Most datapack `type` values stay **`iska_utils:XXX`**. Exception: shop currencies use canonical **`iska_lib:shop_currency`** (aliases `iska_utils:shop_currency` / `shop_valute` still work — see [Currencies](Currencies)). On **26.1.2**, several commands were renamed to **`iska_lib_*`** (for example `/iska_lib_stage`) but behave the same way.

**FTB Teams (optional):** Shop team sync with FTB Teams runs only if the **`ftbteams`** mod is installed. FTB Library alone is not enough. If `ftbteams` is absent, internal shop teams still work.

**`list all` / `clear all` (stages):** `list all` shows **world**, **player**, and **team** stages for the target (default `@s`; the team line includes the resolved team name from the shop/FTB mapping). `clear all` clears **player**, **world**, and **team** stages for the target’s team (world stages are global; other teams are not cleared).

## Table of Contents

1. [Commands Added by the Mod](#commands-added-by-the-mod)
2. [Scripting](#scripting)
3. [Configurable Tags](#configurable-tags)
4. [Internal Stages](#internal-stages)
5. [Advanced Features](#advanced-features)
6. [Overridable Content](#overridable-content)
7. [Currencies](Currencies) (Library)

## Commands Added by the Mod

**In 26.1.2, some commands have been renamed to `iska_lib_*`, but they work in exactly the same way.**

### `/iska_utils_macro list|test`

- `list` - Displays a list of all loaded macro commands
- `test` - Allows testing macro commands without actually executing them

### `/iska_lib_stage add|remove|list|set|clear`

- `add` - Adds a stage, with parameters:
  * `world`, `player`, `team`, or `team_player` for the stage type
  * For `player` / `team_player` self: `self <stage> [silent] [hide]` (example: `iska_lib_stage add player self initialized true`)
  * For other players: `<targets> <stage> [silent] [hide]` (example: `iska_lib_stage add player @s initialized true`)
  * `stage` - The string identifier for the stage (recommended to avoid spaces)
  * `silent` / `hide` - Optional booleans (default `false`)

- `remove` - Same shape as `add` (including `self` vs targets for player/team_player)

- `list` - Displays stages, with parameters:
  * `world` - Shows stages saved for the world
  * `player` - Shows stages saved for the player (target is an optional parameter, default `@s`)
  * `team` - Shows stages saved for the team (target is an optional parameter, default `@s`)
  * `all` - Shows **world**, **player**, and **team** stages for the target (default `@s`; team line includes the resolved team name)

- `set` - Similar to add/remove, with parameters:
  * `world`, `player`, `team`, or `team_player`
  * For player/team_player: `self <stage> <value> …` or `<targets> <stage> <value> …`
  * `value` - Boolean (`true|false`) where `true` adds the stage and `false` removes it
  * `silent` / `hide` - Optional booleans (default `false`)

- `clear` - Removes all stages, with parameters:
  * `world`, `player`, `team`, `team_player`, or `all`
  * For player/team_player: `self [silent] [hide]` or `<targets> [silent] [hide]`
  * `all` - Clears **player**, **world**, and **team** stages for the target’s team (world stages are global)
  * `silent` / `hide` - Optional booleans (default `false`)

- `call_action <target> <action_id>` - Runs a stage action for target(s). Target supports @a, @p, @s, @r, @e, @n. Stages are rechecked at execution.
  * `force` - Bypass onCall=false (optional, default false)
  * `silent`, `hide` - Suppress feedback (optional)

### `/iska_lib_dev`

- `hand` - Dumps the item in hand (ID, components, tags) for debugging
- `reload` - Reloads Utils dynamic configs without a full `/reload` (command items, stage actions, shop, structures, factory, Suspicious Delivery, Ancient Tablet, Arcane Dictionary). Requires Iska Utils + OP level 2.
- `wiki` - Prints a clickable link to the developers wiki ([Home](https://github.com/unfamily/iskandert_utilities/wiki))

### `/iska_utils_shop reload|info|balance|edit`

Requires OP level 2.

- `reload` - Reloads all shop configurations from files
- `info` - Shows general information about the shop system
- `balance [extended]` - Shows the current team's balance (compact by default; `true` = full numbers)
- `edit` - Opens the in-game shop JSON editor (one editor at a time)

### `/iska_lib_team`

Team management (from Iskandert's Library; not `iska_utils_team`):

- `create <teamName>` - Creates a new team
- `delete [teamName]` - Deletes own team or specified team (admin only)
- `rename <newName> [teamName]` - Renames own team or specified team
- `leader <newLeader> [teamName]` - Transfers team leadership
- `assistant add|remove <player> [teamName]` - Manages team assistants
- `assistant_list [teamName]` - Lists team assistants
- `invite <player> [teamName]` - Invites player to team
- `cancelInvite <player> [teamName]` - Cancels a pending invite
- `accept <teamName>` - Accepts team invitation
- `leave` - Leaves current team
- `info [teamName]` - Shows team information
- `members [teamName]` - Lists team members
- `list` - Lists all teams
- `invitations` - Lists your pending invitations
- `currency list|add|remove|set|move …` - Admin team currency (Library 1.10+; was under `/iska_utils_shop team`)

### `/iska_lib_dev`

- `hand` - Dump held item components
- `reload` - Quick reload of Utils `data/*/load/**` (requires Iska Utils)
- `wiki` - Clickable developers wiki link ([Home](https://github.com/unfamily/iskandert_utilities/wiki))

### FTB Quests (Library 1.10+)

Optional types `iska_lib:iska_stage` and `iska_lib:iska_currency` (task + reward). See [Currencies](Currencies) and [Shop](Shop).

## Scripting

Starting with version 3.0.0.0.0, configs are **datapacks**, not external scripts under KubeJS.

All files are JSON. **Rule (Library `1.12.0.0.0+`):** `data/<any_namespace>/load/<any_subdir>/…` — namespace and folder under `load/` are free; loaders match the root **`type`**. Recommended folder names below are conventions only.

Before version 3.0.0.0.0 the default base directory (can be changed in the mod's config file) was `kubejs/external_scripts`.

Files are identified by their `type` parameter:

- `iska_utils:commands_macro` - For declaring custom commands that group multiple commands with various conditions and parameters.
  * Location: `kubejs/external_scripts/iska_utils_macros/` (legacy) or datapack paths as documented per feature

- `iska_utils:command_item` - For declaring items that execute a series of commands, including macros.
  * Location: `data/<namespace>/load/iska_utils_command_items/`
  * Documentation: [Command-Items](Command-Items)

- `iska_utils:suspicious_delivery` - Loot table for the **Suspicious Delivery** item (weighted drops and messages on use). Optional **entry gates** (flat AND/OR or DEF `if` in `do[]`) — **3.5.0.0.0+** ([gates section](Suspicious-Delivery#mod-and-stage-gates-3500000)). Optional **`quick_open`** for shift+bulk open — **3.8.0.0.0+** ([bulk section](Suspicious-Delivery#shiftclick-bulk-open-quick_open-3800000)).
  * Location: `data/<namespace>/load/iska_utils_suspicious_delivery/`
  * Documentation: [Suspicious-Delivery](Suspicious-Delivery)

- `iska_utils:stage_item` - For declaring stages that limit items, allowing filtering by inventory. For example, this can block items that go into curios slots.
  * Location: any `data/<namespace>/load/…` with this `type` (recommended `load/iska_utils_stage_items/`; alias type `iska_lib:stage_item` — **Library `1.12.0.0.0+`**)
  * Documentation: [Stage-Items](Stage-Items)

- `iska_utils:stage_actions` - Commands when stages are added/removed.
  * Location: any `data/<namespace>/load/…` with this `type` (recommended `load/iska_utils_stage_actions/`; alias type `iska_lib:stage_actions` — **Library `1.12.0.0.0+`**)
  * Documentation: [Stage-Actions](Stage-Actions)

- `iska_lib:tools` - startup Library tools (`iska_lib:<id>`) + AOE (**Library `1.12.0.0.0+`**; new ids need restart).
  * Location: any `data/<namespace>/load/…` with this `type` (recommended `load/iska_lib_tools/`; sidecar `iska_lib/tools/`)
  * Documentation: [Tools-Declare](Tools-Declare)

- `iska_lib:liquid` / `iska_lib:gas` - Liquid and gas definitions (**Library `1.12.0.0.0+`**). Gases rise and dissipate instead of spreading.
  * Location: `data/<namespace>/iska_lib/liquids/<id>.json` or `…/iska_lib/gases/<id>.json`
  * Documentation: [Liquid-Declare](Liquid-Declare)

- `iska_utils:plates` - For declaring custom plates that apply potion effects, direct damage, or predefined statuses like fire and freeze.
  * Location: `data/<namespace>/load/…` (see [Potion-Plates](Potion-Plates))

- `iska_utils:structure` - Multi-block structure definitions (placer item, machine, commands). Loaded by Utilities; core registry in **Iskandert's Library** on 1.21.1.
  * Location: `data/<namespace>/load/iska_utils_structure_definitions/`
  * Documentation: [Structure-System](Structure-System)

- `iska_utils:structure_monouse_item` - Consumable item: gives materials and places a structure.
  * Location: `data/<namespace>/load/iska_utils_structures_monouse/`
  * Documentation: [Structure-System](Structure-System)

- `iska_utils:ancient_tab` - Shared Ancient Tablet / Ancient Table recipe list (see [Ancient-Tablet-and-Table](Ancient-Tablet-and-Table)). Optional **entry gates** (`mods`, `stages`, `if[]`) — **3.5.0.0.0+** ([gates section](Ancient-Tablet-and-Table#mod-and-stage-gates-3500000)).
  * Recipe JSON location: `data/<namespace>/recipe/` (type field inside file)

- `iska_utils:factory` - Factory machine mappings (`recipe/**/*.json`). Optional **entry gates** and DEF `if[]` → `select` — **3.5.0.0.0+** ([Factory gates](Factory#mod-and-stage-gates-3500000)).
  * Documentation: [Factory](Factory)

- `iska_utils:arcane_dictionary` - **Arcane Dictionary (Arcane Tome)** trait pool: weights, luck, consume, reroll catalysts (`cat`), optional **mod/stage gates** (`mods`, `stages`, `*_logic` — AND/OR only).
  * Location: `data/<namespace>/load/iska_utils_arcane_dictionary/`
  * Documentation: [Arcane-Dictionary](Arcane-Dictionary)

- `iska_lib:shop_currency` - Shop currencies (**Library**; canonical type). Aliases: `iska_utils:shop_currency`, `iska_utils:shop_valute`.
  * Location: `data/<namespace>/load/iska_utils_shop/`
  * Documentation: [Currencies](Currencies)

- `iska_utils:shop_category` - For declaring categories to organize shop entries.
  * Location: `data/<namespace>/load/…` (see [Shop](Shop))

- `iska_utils:shop_entry` - For declaring items available in the shop with prices and properties.
  * Location: `data/<namespace>/load/…` (see [Shop](Shop))

## Configurable Tags

Tags read by the mod at runtime, extensible via datapack.

### Tag: `iska_utils:curio_compat/mimic` (item)

**Optional** extra drop on the Artifacts **Mimic** loot table (only when the Artifacts mod is loaded). Defines which items can appear in that pool — default is **`suspicious_delivery`** only (artifacts are obtained by **opening** the Suspicious Delivery, not from the Mimic directly).

- **Pool chance:** 5% per Mimic kill
- **Item selection:** 1 item chosen from the tag with equal weight per item

Extend via datapack: `data/iska_utils/tags/item/curio_compat/mimic.json` with `replace: false`. Requires the **Artifacts** mod (optional for players). Primary obtain for Suspicious Delivery remains the **Wandering Trader**.

### Tag: `c:wrench_not_rotate` (block)

Blacklist for the Swiss Wrench. Blocks in this tag cannot be rotated by the Swiss Wrench.

- **Default:** vanilla beds (`#minecraft:beds`)
Extend via datapack: create `data/c/tags/block/wrench_not_rotate.json` (or your namespace) with `replace: false` and add block IDs to `values`.

## Internal Stages

The mod uses stages with the `iska_utils_internal-` prefix for internal logic. The following are documented for Dev and integrations.

### Stages for Dev

These stages can be assigned via datapack/macro. **Curse stages** are scalable: they can be applied at **player** (single player), **team** (all members of the player's team), or **world** (everyone). The mod checks in that order; if any level has the stage, the effect applies.

- **`iska_utils_internal-curse_flight`** (player | team | world)
  * **Use:** Disables creative flight (and from other mods) while the stage is present at the given level.
  * **Where:** `FlightHandler` (player tick event).
  * **Effect:** Every tick, if the stage is on the player, their team, or the world, `mayfly` and `flying` are forced to `false`; spectator is not affected.

- **`iska_utils_internal-curse_flame`** (player | team | world)
  * **Use:** Enables "super hot" mode for Burning Brazier and Burning Flame block without using config.
  * **Where:** `BurningBrazierItem` (flame placement and inventoryTick), `BurningFlameBlock` (entityInside), `Config` (evil_things options comments).
  * **Effect:** If the stage is on the player, their team, or the world, Brazier and Flame set entities on fire as with `burning_brazier_super_hot` / `burning_flame_super_hot` options. For non-player entities in the flame block, only world stage is checked.

### Other internal stages

- **`iska_utils_internal-funpack_flight0`** / **`iska_utils_internal-funpack_flight1`** (player)
  * **Use:** Fanpack flight heartbeat: the mod enables flight only when `funpack_flight0` is present (set by item/curio).
  * **Where:** `FlightHandler`, `FanpackItem`, `FanpackCurioHandler`.
  * **Effect:** Ensures the Fanpack is actually present; do not assign manually for flight.

- **`iska_utils_internal-greedy_shield_equip`** (player)
  * **Use:** Indicates that the Greedy Shield is equipped.
  * **Where:** `GreedyShieldItem`, `LivingIncomingDamageEventHandler`.

- **`iska_utils_internal-necro_crystal_heart_equip`** (player)
  * **Use:** Indicates that the Necrotic Crystal Heart is equipped.
  * **Where:** `NecroticCrystalHeartItem`, `LivingIncomingDamageEventHandler`.

- **`iska_utils_internal-necrotic_crystal_heart`** (player)
  * **Use:** Removed when the player wakes up.
  * **Where:** `PlayerSleep`.

- **`iska_utils_internal-CH:<year>`** (e.g. `iska_utils_internal-CH:2025`)
  * **Use:** Dynamic stages per year (Calendar/Date events).
  * **Where:** `DateEvents`.

## Advanced Features

### Sub-Command Implementation

The system supports implementing sub-commands using the static parameter type and conditional execution with stages.
See the README.md file in the iska_utils_macros folder for a complete example and explanation.

### Command Reloading

For a **quick reload** without restarting, use `/iska_lib_dev reload` (OP level 2). This reloads: command items, stage actions, stage items, shop, structures, factory recipes, Suspicious Delivery loot table, Ancient Tablet recipes, **Arcane Dictionary** trait pool. It does not reload macros.

For a **full reload**, use the standard `/reload` command or the mod's `/reloader` macro. This reloads all configs including macros.

If you change a default generated file, set `overwritable` to `false` in the file to prevent it from being regenerated.

## Overridable Content

Detailed pages for developers:

| Topic | Page | Min mod version |
|-------|------|-----------------|
| Factory (datapack machine recipes) | [Factory](Factory) | **3.3.0.0.0+** |
| Command items (scripted items; improved `message` action) | [Command-Items](Command-Items) | `message` text: **3.4.0.0.0+** |
| Command macros (improved `message` in `do` steps) | [Command-Macros](Command-Macros) | `message` text: **3.4.0.0.0+** |
| Suspicious Delivery (trader, loot table) | [Suspicious-Delivery](Suspicious-Delivery) | **3.4.0.0.0+** |
| Suspicious Delivery — `quick_open` / shift bulk | [Suspicious-Delivery](Suspicious-Delivery#shiftclick-bulk-open-quick_open-3800000) | **3.8.0.0.0+** |
| Ancient Tablet & Ancient Table (shared datapack `iska_utils:ancient_tab`, chaos fuel) | [Ancient-Tablet-and-Table](Ancient-Tablet-and-Table) | **3.4.0.0.0+** |
| Arcane Dictionary / Arcane Tome (trait pool, catalysts, consume) | [Arcane-Dictionary](Arcane-Dictionary) | **3.5.0.0.0+** |
| Entry gates on crafting/load JSON (`mods`, `stages`, `if[]`) | [Suspicious-Delivery](Suspicious-Delivery#mod-and-stage-gates-3500000), [Ancient-Tablet-and-Table](Ancient-Tablet-and-Table#mod-and-stage-gates-3500000), [Factory](Factory#mod-and-stage-gates-3500000), [Arcane-Dictionary](Arcane-Dictionary#mod-and-stage-gates-3500000) | **3.5.0.0.0+** (per-page gate sections; base features keep their own min version) |
| Mod conditions in load JSON (`mods`, `mods_logic`, `mod_conditions`) | [Command-Items](Command-Items#mod-conditions-3500000), [Command-Macros](Command-Macros#mod-conditions-3500000), [Stage-Actions](Stage-Actions#mod-conditions-3500000), [Stage-Items](Stage-Items#mod-conditions-3500000) | **3.5.0.0.0+** |
| Stage items | [Stage-Items](Stage-Items) | Any `load/…` + type / `iska_lib:` alias: **Library `1.12.0.0.0+`** |
| Stage actions | [Stage-Actions](Stage-Actions) | Any `load/…` + type / `iska_lib:` alias: **Library `1.12.0.0.0+`** |
| Liquid & Gas JSON (Library) | [Liquid-Declare](Liquid-Declare) | **Library `1.12.0.0.0+`** (`iska_lib:liquid` / `iska_lib:gas`; bootstrap paths in Library config) |
| Tool AOE / Library tools | [Tools-Declare](Tools-Declare) | **Library `1.12.0.0.0+`** (`iska_lib:tools`; JSON creates `iska_lib:<id>` at startup; harvest via `incorrect_for_drops` tag; `durability` = max uses; Java binds any mod item) |
| Potion plates | [Potion-Plates](Potion-Plates) |
| Shop | [Shop](Shop) | **3.12.0.0.0+** for namespaced types / tags / AutoShop fluid·gas·RF / command·stage ([Shop](Shop#since-3120000--typed-entries-tags-autoshop-fluidgasrf-commandstage)); legacy bare `item` still loads |
| Structures | [Structure-System](Structure-System) |
