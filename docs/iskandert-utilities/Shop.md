# Shop

Shop with team support, multiple currencies, categories and stages.

**Currencies** (catalog, defaults, Library types): **[Currencies](Currencies)**.

Starting with version of Iskandert's Utilites 3.1.0.0.1 & Iskandert's Library 1.1.0.0.1, the iska_utils_debug/iska_utils_library hand command provides the exact, working syntax for cases involving NBT/CompoundTag for items.

## Shop Editor (`/iska_utils_shop edit`)

In-game GUI to edit the three shop JSON workspace files on the **server** (permission level 2).

- **Command:** `/iska_utils_shop edit`
- **Lock:** only one editor at a time; if busy, the command fails with the holder’s name (no lock steal)
- **Config:** `011_shop_edit_work_path` (shop section), default `kubejs/data/iska_utils/load/iska_utils_shop` (relative to the game directory)
- **Files (same names as jar defaults):**
  - `default_currencies.json` — see [Currencies](Currencies) (Library-owned)
  - `default_categories.json`
  - `default_entries.json`
- **Bootstrap:** if missing, categories/entries are copied from Utils jar; currencies from Library jar (`data/iska_utils/load/iska_utils_shop/`). Only if a jar resource is unavailable does the editor fall back to an empty array file.
- **Load:** the editor reads only these three workspace files (not the merged runtime snapshot).
- **Autosave:** every edit writes the corresponding JSON immediately.
- **Apply live shop:** closing the editor shows a final screen explaining reload options. Autosave writes the workspace files but does not reload the live shop by itself. Prefer **`/reload`** for a full datapack reload (also picks up new files). **`/iska_utils_shop reload`** / **`/iska_lib_dev reload`** refresh shop data already known to the loader. Save before leaving if you still have edits open.

The GUI is a single screen with sub-views (nested browse of categories+entries, currencies, edit forms, Move). Resource pickers cycle `id` / `id[components]` / `#tag` (items, fluids, and gases each use their own id/tag variants); JEI ghost slots work on category icons and entry resources; Convert turns a bucket/tank into fluid/gas. Renaming a category or currency id asks whether to propagate references, delete dangling entries, or ignore. Creating or renaming an id that collides with an existing one appends `_XXXX` (4 random alphanumeric characters) instead of overwriting.

**Editor browse:** each level shows **child categories and entries interleaved by `priority`** (higher first, then id) for the current parent (`in_category`) — same mix rule as the player shop. **Root** is the opening screen of the shop/editor (everything with no parent) — it is **not** a category you create. Footer has **Add category** and **Add entry**. Click a category to enter it; Done/back goes to the parent (root Done closes with reload hint). Row actions: Edit (✎), **Move (M)**, Delete (D).

**Category edit:** id / name / description / priority / **Hide locked** toggle / **Stages** button / icon. Category stages use the same gate editor as entry stages and are written on save (no longer wiped by upsert).

**Move:** opens a category-only navigator. First row is **Place here**. Does not list the category being moved or its descendants. Confirm before placing; confirm before cancelling from the Move root (Done / X / Esc).

**Category validation:** `id` and `name` are required in the editor (live warning next to priority; autosave blocked while invalid).


## Commands

### `/iska_utils_shop` (OP level 2)

- `edit` — shop JSON editor
- `reload` — reload shop configs from files
- `info` — currency/category/entry counts
- `balance` — current team balance

### `/iska_lib_team` (Iskandert's Library)

Team membership/management (create, delete, rename, leader, assistant, invite, accept, leave, info, members, list, invitations). **Not** `iska_utils_team`.

Currency admin (OP level 2) — full docs: [Currencies](Currencies):

- `currency list`
- `currency add|remove|set <currencyId> <amount> [team <name>|player <selector>]`
- `currency move <currencyId> <amount> <toTeam> [fromTeam]`

### FTB Quests (optional, Iskandert's Library 1.10+)

When **FTB Quests** is installed, Library registers `iska_lib:iska_stage` and `iska_lib:iska_currency` (task + reward). Currency details: [Currencies](Currencies).

Quick datapack reload for Utils `load/**`: `/iska_lib_dev reload` (requires Utils wired).

## Player Shop / AutoShop browse filters

Search row (left → right): **search bar** → **scope** (A/B/S/C) → **currency** → **visibility (H/S)** → **sort**.

| Button | Letters | Meaning |
|--------|---------|---------|
| Scope | A / B / S / C | All / Buyable / Sellable / Categories (categories list only) |
| Currency | symbol or Any | Restrict to one currency |
| Visibility | **S** (default) / **H** | **S** show all browsable entries · **H** hide entries you can neither buy nor sell (also hides stage-locked) |
| Sort | cycles | **Priority** (default: categories+entries mixed by `priority`) · Buy price ↑/↓ · Sell price ↑/↓ |

Left-click cycles forward; right-click cycles backward (visibility toggles either way).

**Persisted prefs:** scope, currency filter, visibility, and sort are saved on the player (`iska_utils_shop_ui` NBT) and restored when opening the shop / portable shop / AutoShop picker.

**Overlays (player shop rows):**
- **Red** — stage locked, or every trade side the entry supports is blocked by limits
- **Yellow** — buy-only or sell-only by definition, or both sides exist but limits block exactly one side
- Stage lock is always red (never yellow)

**Buy / Sell tooltips:** when a non-`always` repeatable rule applies, show **Used: Y/X** and **resets at** (local time). Same info appears in the AutoShop item picker tooltips.

`hide_when_locked` on an entry or category (JSON / editor) hides that row when stage requirements fail, independent of the H/S visibility button.

## Configuration Files

The shop uses three JSON kinds under `load/iska_utils_shop/`:

1. **Currencies** — owned by Library; see **[Currencies](Currencies)** (`iska_lib:shop_currency`, aliases `iska_utils:shop_currency` / `shop_valute`).
2. **Categories** — Utilities (`iska_utils:shop_category`).
3. **Entries** — Utilities (`iska_utils:shop_entry`).

### 1. shop_category.json - Categories
Defines product categories in the shop.

```json
{
  "type": "iska_utils:shop_category",
  "overwritable": true,
  "categories": [
    {
      "id": "000_default",
      "name": "shop.category.default",
      "description": "shop.category.default.desc",
      "item": "minecraft:gold_nugget",
      "priority": 0
    },
    {
      "id": "tools",
      "name": "shop.category.tools",
      "description": "shop.category.tools.desc",
      "item": "minecraft:diamond_pickaxe",
      "priority": 10
    },
    {
      "id": "tools_advanced",
      "name": "Advanced Tools",
      "description": "Nested under tools",
      "item": "minecraft:netherite_pickaxe",
      "in_category": "tools",
      "priority": 5
    },
    {
      "id": "ores",
      "name": "Ores & Minerals",
      "description": "Sell/Buy Ores & Minerals",
      "item": "minecraft:emerald",
      "priority": -5
    }
  ]
}
```

**Category fields:**
- `id`: Unique identifier for the category (**required** in editor)
- `name`: Translation key (or plain string) for the category name (**required** in editor)
- `description`: Translation key (or plain string) for the category description (optional)
- `item`: Item ID used as icon for the category (optional)
- `priority`: Display order (optional, default 0). Higher value = shown first when mixed with sibling entries (same mix as player shop).
- `in_category`: Parent category id (**optional**). Omit or null = **root** — meaning the shop’s **first / top-level screen** (all root children), **not** a real category id. Missing parent → treated as root (with a load warning).
- `stages`: Array of required stage **gates** (optional). Same shape as entry gates (`stage` / `stage_type` / `is`). If any fail, the category (and browsing into it) is locked for that player.
- `hide_when_locked`: If true, a stage-locked category is **hidden** from browse instead of only showing a red overlay (optional, default false).

> **Note:** Before **3.12.0.0.0**, the editor forced entry `in_category` to `"000_default"` when omitted. From **3.12.0.0.0** onward that is no longer required: both **categories and entries** may omit `in_category` to sit at **root** (top-level screen, not a category), and categories may nest under other categories.

### 2. shop_entry.json - Shop Products
Defines specific products available in the shop.


```json
{
  "type": "iska_utils:shop_entry",
  "overwritable": true,
  "entries": [
    {
      "id": "bread_default",
      "in_category": "000_default",
      "item": "minecraft:bread",
      "item_count": 1,
      "currency": "null_coin",
      "buy": 1.0,
      "sell": 0.5,
      "priority": 0,
      "free": false
    },
    {
      "id": "diamond_pickaxe_silk",
      "in_category": "tools",
      "item": "minecraft:diamond_pickaxe[custom_name='\"Silky\"',repair_cost=1,enchantments={levels:{\"minecraft:silk_touch\":1}}]",
      "item_count": 1,
      "currency": "emerald",
      "buy": 50.0,
      "sell": 25.0,
      "priority": 10,
      "stages": [
        {
          "stage": "advanced_tools",
          "stage_type": "world",
          "is": true
        }
      ]
    }
  ]
}
```

**Fields:**
- `id`: Unique identifier for the product
- `in_category`: Parent category id (**optional**). Omit or null = **root** — the shop’s **first / top-level screen**, **not** a real category (same as categories). Before **3.12.0.0.0** the editor defaulted omitted values to `"000_default"`; from **3.12.0.0.0** that is no longer required.
- `type`: Namespaced entry type id. Canonical values: `iska_utils:item` | `iska_utils:fluid` | `iska_utils:gas` | `iska_utils:rf` | `iska_utils:command` | `iska_utils:stage` | `iska_utils:currency`. Optional; blank or bare legacy `item` → `iska_utils:item`. **Since 3.12.0.0.0** (extensible via addon type handlers)
- `item`: Item ID / components / `#item_tag` when type is `iska_utils:item`
- `fluid`: Fluid ID or `#fluid_tag` when type is `iska_utils:fluid`
- `gas`: Gas/chemical ID (no tags) when type is `iska_utils:gas`
- `display`: Lang key for the entry label when type is `iska_utils:command` or `iska_utils:stage` (required). Optional for `iska_utils:rf` and `iska_utils:currency` (currency falls back to `Convert %s into %s`).
- `icon`: Optional file stem under `assets/iska_utils/textures/gui/icons/` (e.g. `command_icon`, `stage_icon`, `rf_icon`, `currency_icon`). Omitted = type default. Shop icon cycle lists every PNG under the Utils `iska_utils` folder (Utils + KubeJS). Shared Library icons live under `assets/iska_lib/textures/gui/icons/` (e.g. FTB Quests uses `iska_lib:.../currency_icon.png`).
- `commands`: String array of server commands (player-bound, including `@s`) when type is `iska_utils:command`
- `stage`: Stage reward object array granted on buy when type is `iska_utils:stage`. Each object uses `stage`, `stage_type` (`player`, `world`, or `team`) and `is` (add when true, remove when false). Legacy string values are still read as player-stage grants.
- `amount`: Quantity (item count, fluid/gas mB, RF, or destination currency units for convert). Default 1. Not used for command/stage.
- `item_count`: Legacy alias for `amount` (still accepted)
- `currency`: Currency ID paid for this product (source currency for `iska_utils:currency`)
- `target_currency`: Destination currency ID when type is `iska_utils:currency`
- `buy`: Price to buy (source units paid for convert). Command/stage entries support normal prices and `free`, but execute their payload only once per click. Convert scales with Ctrl/Shift quantity.
- `sell`: Price to sell (ignored / forced 0 for command/stage/currency)
- `priority`: Display order mixed with sibling categories (optional, default 0). Higher value = shown first.
- `free`: If true, can be bought at no cost even when buy is 0 (optional, default false).
- `stages`: Array of required stage **gates** (optional; not the same as type `iska_utils:stage`)
- `hide_when_locked`: If true, a stage-locked entry is **hidden** from browse instead of only showing a red overlay (optional, default false). Editable under **Rules**.
- `repeatable`: Optional side-specific trade-limit rules: `{ "buy": {...}, "sell": {...} }`. Defaults to unlimited trades when omitted. Legacy flat objects are read as buy-only rules.

### Rules editor

The entry editor's **Rules** button opens one hub with **Hide locked**, **Stages Rules** (trade gates), **Repeatable Buy**, and **Repeatable Sell**. Gate rows are labelled `is true type:id` / `is false type:id`; stage reward rows are labelled `add type:id` / `remove type:id`. Stage entries expose a separate **Result** button whose rows are stage reward objects; command entries use Result for their command list. Categories expose their own **Stages** button on the category form (same gate editor).

### Repeatable purchase limits

```json
"repeatable": {
  "buy": {
    "scope": "player",
    "when": "weekly",
    "reset_time": "06:00",
    "reset_day": 1,
    "count": 3
  },
  "sell": {
    "scope": "team",
    "when": "timed",
    "duration_ticks": 72000,
    "reset_on_saturate": false,
    "count": 16
  }
}
```

- `scope`: `team` (default), `player`, or `all`
- `when`: `always` (default = no limit / unlimited), `daily`, `weekly`, `monthly`, `yearly`, `only` (lifetime limit), or **`timed`** (rolling window of `duration_ticks`)
- `reset_time`: Server timezone (`ZoneId.systemDefault()`) `HH:mm` period boundary (calendar modes only)
- `reset_day`: Monday=1 through Sunday=7 for weekly; day of month for monthly/yearly
- `reset_month`: Month 1–12 for yearly
- `count`: Maximum successful trade units on that side in the period (default 1; ignored when `when` is `always`)
- `duration_ticks`: Window length in game ticks when `when` is `timed` (editor exposes hours / minutes / seconds / ticks that convert automatically)
- `reset_on_saturate`: Only for `timed` (default **false**). **true** = start a new window as soon as the count saturates. **false** = timer starts on the **first** trade of that side (buy and sell windows are independent)
- Omitted fields use defaults; a fully default `repeatable` object is omitted from saved JSON.

## Since 3.12.0.0.0 — typed entries, tags, AutoShop fluid/gas/RF, command/stage

### Entry types (canonical)
| `type` | Editor label | Resource / payload | Tags `#` | Player Shop GUI | AutoShop |
|--------|--------------|-------------------|----------|-----------------|----------|
| `iska_utils:item` | `ITEM` | `item` | Yes — **sell only** | Yes (buy/sell) | Yes |
| `iska_utils:fluid` | `FLUID` | `fluid` | Yes — **sell only** | Catalog only (trade via AutoShop) | Yes |
| `iska_utils:gas` | `GAS` | `gas` | No | Catalog only (Mekanism) | Yes (Mekanism) |
| `iska_utils:rf` | `RF/FE` | optional `display` + `icon` | No | Catalog only | Yes |
| `iska_utils:command` | `COMMAND` | `display` + `commands[]` | No | **Buy only** (runs commands server-side) | No |
| `iska_utils:stage` | `STAGE` | `display` + `stage[]` reward objects | No | **Buy only** (set/clear world/player/team stages) | No |
| `iska_utils:currency` | `CURRENCY` | optional `display` + `icon`; pay `buy` of `currency`, get `amount` of `target_currency` | No | **Buy only** (team currency convert) | No |

**Legacy:** only bare `item` (or omitted `type`) is accepted as an alias for `iska_utils:item` (pre-typed packs). Short `fluid` / `gas` / `other` are **not** accepted.

**Extensibility:** addons register new type ids via `ShopEntryTypeRegistry` (handler supplies `editorLabel()`, validation, icons, buy/sell, editor hints) without mixins.

### Tags (`#namespace:path`)
- Valid on `item` and `fluid` selectors only.
- Tag entries cannot be bought (`buy` forced to `0`, `free` forced to `false`).
- Selling matches any inventory stack / tank fluid that belongs to the tag.

### `amount`
Generic quantity replacing `item_count` for amount-using types. `item_count` remains a legacy alias. For `iska_utils:rf`, `amount` is RF per trade and AutoShop buffer capacity. Command/stage entries do not use `amount`.

### AutoShop fluid/gas tanks
Tanks behave like the item encapsulated slot: capacity is one shop unit (`amount`). Auto-buy runs only when the tank is empty; if it already holds fluid/gas, no further purchase. Tooltip shows current amount only (not max capacity). Dump buttons empty tanks (content discarded). Gas dump is disabled for radioactive chemicals.

### AutoShop RF energy
When an `iska_utils:rf` entry is selected, the RF buffer capacity equals `amount`. Buy only when the buffer is empty (fills `amount` RF); sell when stored ≥ `amount` (extracts `amount`). Energy bar is under the close (X) button (8×32, like other machines); hover shows red `stored / capacity RF`. Default icon: `iska_utils:textures/gui/icons/rf_icon.png` (Utils). Library also ships `iska_lib:textures/gui/icons/rf_icon.png` for shared/lib UI. Optional `display` / `icon` work like command/stage in the editor (Display field + icon cycle; list button shows the translated name when `display` is set).

### Currency convert (`iska_utils:currency`)
- Debits `buy` units of `currency` (source) and credits `amount` units of `target_currency` (destination) to the buyer's shop team.
- Buy-only; `sell` forced to `0`. Ctrl/Shift quantity scales both sides.
- Optional `display`; if omitted, default name is `Convert %s into %s` using translated currency names.
- Default icon stem: `currency_icon` (`iska_utils` for shop cycle; Library FTB Quests uses `iska_lib:textures/gui/icons/currency_icon.png`).
- Not selectable in AutoShop.
- Editor: Display + icon cycle; compact **From** / **To** currency buttons; **Pay** (`buy`) / **Get** (`amount`) / priority; Free + Rules.

### Command / stage purchases
- Normal `buy` and `free` fields apply. Clicking Buy runs the **entire** `commands` / `stage` list once; Ctrl/Shift multipliers do not scale the payload or price.
- Effects run server-side: commands use a player-bound source; stage rewards apply `stage` / `stage_type` / `is` via `StageRegistry` (world, player, or the buyer's shop team).
- Not selectable in AutoShop.
- Editor:
  - Type button shows `COMMAND` / `STAGE`
  - **Display** field is the lang key only (no live preview beside it)
  - The **entries list** button shows the **translated** display name
  - Next to Display, an **icon cycle** button (icon drawn on the button itself) cycles every PNG in `assets/iska_utils/textures/gui/icons/`:
    - Utils ships `command_icon` / `stage_icon` / `rf_icon` / `currency_icon`
    - Library shared icons live under `assets/iska_lib/textures/gui/icons/` (`currency_icon`, `rf_icon`) — not duplicated under `iska_utils`
    - KubeJS can add more PNGs under the Utils `iska_utils` icons folder
  - RF / currency entries use Display (optional) + icon cycle; RF keeps amount/buy/sell; currency uses From/To + Pay/Get; neither has a Result list
  - **Result (N)** opens the command list or stage-reward editor (command/stage only)

### AutoShop trade-limit identity
AutoShop persists the placer UUID. Player-scoped repeatable rules use that UUID for manual and automatic item/fluid/gas/RF trades; team-scoped rules use the owner team key. A player-scoped trade is blocked if the AutoShop has no placer UUID.

### Player shop balances
Currency list shows **compact** balances (K/M/B…). Hovering a currency line shows the **full** value in a tooltip. `/iska_utils_shop balance [extended]` prints compact by default; pass `true` for full numbers.

### Mekanism (optional)
- Gas entries require Mekanism as an **optional** dependency (reflection bridge).
- On NeoForge **26.x**, gas support is disabled (`GAS_SUPPORT_ENABLED=false`) until Mekanism ships for that loader; gas entries are skipped at load and the gas bar is masked in the AutoShop GUI.
- On **1.21.1**, gas is enabled when Mekanism is installed.

### Examples (3.12.0.0.0+)

```json
{
  "type": "iska_utils:shop_entry",
  "overwritable": true,
  "entries": [
    {
      "id": "copper_ingots_tag",
      "in_category": "000_default",
      "type": "iska_utils:item",
      "item": "#c:ingots/copper",
      "amount": 1,
      "currency": "null_coin",
      "buy": 0,
      "sell": 2.0
    },
    {
      "id": "water",
      "in_category": "000_default",
      "type": "iska_utils:fluid",
      "fluid": "minecraft:water",
      "amount": 1000,
      "currency": "null_coin",
      "buy": 5.0,
      "sell": 2.0
    },
    {
      "id": "lava_tag",
      "in_category": "000_default",
      "type": "iska_utils:fluid",
      "fluid": "#minecraft:lava",
      "amount": 1000,
      "currency": "null_coin",
      "buy": 0,
      "sell": 3.0
    },
    {
      "id": "oxygen",
      "in_category": "000_default",
      "type": "iska_utils:gas",
      "gas": "mekanism:oxygen",
      "amount": 1000,
      "currency": "null_coin",
      "buy": 8.0,
      "sell": 4.0
    },
    {
      "id": "rf_pack",
      "in_category": "000_default",
      "type": "iska_utils:rf",
      "amount": 10000,
      "currency": "null_coin",
      "buy": 5.0,
      "sell": 2.5
    },
    {
      "id": "welcome_kit",
      "in_category": "000_default",
      "type": "iska_utils:command",
      "display": "shop.entry.welcome_kit",
      "commands": [
        "give @s minecraft:bread 16",
        "say Welcome!"
      ],
      "currency": "null_coin",
      "buy": 1.0,
      "sell": 0
    },
    {
      "id": "convert_null_to_gem",
      "in_category": "000_default",
      "type": "iska_utils:currency",
      "icon": "currency_icon",
      "currency": "null_coin",
      "buy": 10,
      "target_currency": "gem_coin",
      "amount": 1,
      "priority": 0
    },
    {
      "id": "unlock_vip",
      "in_category": "000_default",
      "type": "iska_utils:stage",
      "display": "shop.entry.unlock_vip",
      "stage": [
        {
          "stage": "vip_player",
          "stage_type": "player",
          "is": true
        }
      ],
      "currency": "null_coin",
      "buy": 100.0,
      "sell": 0
    }
  ]
}
```

## Stages

Stages allow unlocking products **and categories** based on player/world/team progress.

Gates may appear on **entries** (`stages` on `shop_entry`) and **categories** (`stages` on `shop_category`). Buying/selling an entry also walks ancestor category gates. Use `hide_when_locked` on the entry or category to hide locked rows from browse.

```json
"stages": [
  {
    "stage": "advanced_tools",
    "stage_type": "world",
    "is": true
  },
  {
    "stage": "vip_player",
    "stage_type": "player",
    "is": true
  },
  {
    "stage": "team_premium",
    "stage_type": "team",
    "is": true
  }
]
```

**Stage Types:**
- `world`: World stage (all players)
- `player`: Player stage (single player)
- `team`: Team stage (all team members)

**Fields:**
- `stage`: Stage name
- `stage_type`: Stage type (world/player/team)
- `is`: true = stage must be active, false = stage must be inactive

## Compound tag support

The `item` field supports compound tags to specify items with custom properties.

### Compound Tag Examples:

**1. Enchanted Item:**
```json
"item": "minecraft:diamond_pickaxe[enchantments={levels:{\"minecraft:silk_touch\":1,\"minecraft:efficiency\":5}}]"
```

**2. Custom Named Item:**
```json
"item": "minecraft:diamond_sword[custom_name='\"Excalibur\"',repair_cost=0]"
```

**3. Damaged Item:**
```json
"item": "minecraft:diamond_pickaxe[damage=100]"
```

**4. Item with Lore:**
```json
"item": "minecraft:diamond_helmet[custom_name='\"Magic Helmet\"',display={lore:['\"Special helmet\"','\"With magic powers\"']}]"
```

**5. Colored Item:**
```json
"item": "minecraft:leather_chestplate[display={color:16711680}]"
```

**6. Complex NBT Item:**
```json
"item": "minecraft:book[pages:['\"{\\\"text\\\":\\\"Magical spell\\\"}\"'],title:\"Spellbook\",author:\"Wizard\"]"
```

## Reloading

Reload: `/iska_lib_dev reload` (quick) or `/reload` (full). Also `/iska_utils_shop reload` for shop only.

After using **`/iska_utils_shop edit`**, prefer a full **`/reload`** so the workspace files under `011_shop_edit_work_path` are applied like other datapack/KubeJS shop JSON. The editor autosaves files but does not reload the live shop by itself.

## Overwritable

- `overwritable: false` = File cannot be overwritten by other files
- `overwritable: true` = File can be overwritten by files loaded later
- Files are processed in alphabetical order

## Subdirectory Search

The system automatically searches for files in all subdirectories of the shop directory.