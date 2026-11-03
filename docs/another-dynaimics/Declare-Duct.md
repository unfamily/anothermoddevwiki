# Declare Duct

**Type:** `another_dynamics:declare_duct`  
**Path:** `data/<namespace>/load/**/*.json`  
**Reload:** `/reload`

Defines a **logical duct id**: transport kinds, quantity/rate/speed, Sequential Stacks, filter bank sizes, module slots, rendering, and feature restrictions. Creative stacks use the shared duct item + logical-id component; you do not register a new block class from datapack alone (builtin items already cover shipped types).

## Minimal example

```json
{
  "type": "another_dynamics:declare_duct",
  "id": "mypack:fast_item_duct",
  "name": "duct.mypack.fast_item_duct",
  "put_in_creative_menu": true,
  "module_slots": 1,
  "can_transport": [
    {
      "dec": "item",
      "batch": { "default": 64, "max": -1 },
      "seq_stack": { "default": 1, "max": 16 },
      "rate": { "default": 5, "min": 1 },
      "speed": { "default": 5, "min": 2 },
      "filter": {
        "deny": 8,
        "allow": 8,
        "deny_hybrid": 4,
        "allow_hybrid": 4
      }
    }
  ],
  "connect_with_compatbile": true,
  "disabled_features": [],
  "rendering": {
    "always_opaque": false,
    "default_texture": "another_dynamics:block/duct/item/item_duct_0_light",
    "model_default": "another_dynamics:block/simple_duct_default",
    "model_line": "another_dynamics:block/simple_duct_line"
  }
}
```

## Top-level fields

| Field | Required | Description |
|-------|----------|-------------|
| `type` | yes | `another_dynamics:declare_duct` |
| `id` | yes | Logical duct id (`namespace:path`) |
| `name` | no | Lang key for display |
| `put_in_creative_menu` | no | Default false if omitted by loader rules; builtin files set `true` |
| `sound` | no | Place/break/step sound key (case-insensitive). Default / unknown → `copper`. See [Sound list](#sound-list) |
| `module_slots` | no | Face module capacity (integer ≥ 0) |
| `can_transport` | yes | Array of transport entries (see below) |
| `connect_with_compatbile` | no | Typo alias kept; whether to connect with compatible networks |
| `disabled_features` | no | Feature keys always off (alias `disabled_feathures`) |
| `forbidden_features` | no | Same vocabulary; locked until a module is present on the face/duct (aliases `module_features`, `upgrade_features`) |
| `restrictions` | no | Optional object wrapping the feature fields above instead of root |
| `rendering` | no | Textures / models / `always_opaque` |
| `neoforge:conditions` | no | Standard NeoForge load conditions (e.g. `mod_loaded`) |

## Sound list

Optional top-level `sound`. Matching is case-insensitive. Blank or unknown values fall back to **`copper`** (unknown values also log a warning).

Keys currently accepted by the shipped mod:

| Sound key | Notes |
|-----------|--------|
| `copper` | Default when omitted / unknown |
| `metal`, `metallic`, `iron` | Same metal sound |
| `rock`, `stone` | Same stone sound |
| `glass` | |
| `wood` | |
| `wool` | |
| `sand` | |
| `gravel` | |
| `grass` | |
| `lily_pad` | |
| `snow` | |
| `powder_snow` | |
| `ladder` | |
| `anvil` | |
| `slime_block` | |
| `honey_block` | |
| `coral_block` | |
| `bamboo` | |
| `bamboo_sapling` | |
| `scaffolding` | |
| `sweet_berry_bush` | |
| `crop` | |
| `hard_crop` | |
| `vine` | |
| `nether_wart` | |
| `lantern` | |
| `stem` | |
| `nylium` | |
| `fungus` | |
| `roots` | |
| `shroomlight` | |
| `weeping_vines` | |
| `twisting_vines` | |
| `soul_sand` | |
| `soul_soil` | |
| `basalt` | |
| `wart_block` | |
| `netherrack` | |
| `nether_bricks` | |
| `nether_sprouts` | |
| `nether_ore` | |
| `bone_block` | |
| `netherite_block` | |
| `ancient_debris` | |
| `lodestone` | |
| `chain` | |
| `nether_gold_ore` | |
| `gilded_blackstone` | |
| `candle` | |
| `amethyst` | |
| `amethyst_cluster` | |
| `small_amethyst_bud` | |
| `medium_amethyst_bud` | |
| `large_amethyst_bud` | |
| `tuff` | |
| `calcite` | |
| `dripstone_block` | |
| `pointed_dripstone` | |
| `cave_vines` | |
| `spore_blossom` | |
| `azalea` | |
| `flowering_azalea` | |
| `moss_carpet` | |
| `pink_petals` | |
| `moss` | |
| `big_dripleaf` | |
| `small_dripleaf` | |
| `rooted_dirt` | |
| `hanging_roots` | |
| `azalea_leaves` | |
| `sculk_sensor` | |
| `sculk_catalyst` | |
| `sculk` | |
| `sculk_vein` | |
| `sculk_shrieker` | |
| `glow_lichen` | |
| `deepslate` | |
| `deepslate_bricks` | |
| `deepslate_tiles` | |
| `polished_deepslate` | |
| `froglight` | |
| `frogspawn` | |
| `mangrove_roots` | |
| `muddy_mangrove_roots` | |
| `mud` | |
| `mud_bricks` | |
| `packed_mud` | |
| `hanging_sign` | |
| `nether_wood_hanging_sign` | |
| `bamboo_wood_hanging_sign` | |
| `bamboo_wood` | |
| `nether_wood` | |
| `cherry_wood` | |
| `cherry_sapling` | |
| `cherry_leaves` | |
| `cherry_wood_hanging_sign` | |
| `chiseled_bookshelf` | |
| `suspicious_sand` | |
| `suspicious_gravel` | |
| `decorated_pot` | |
| `decorated_pot_cracked` | |

Builtin packs typically use `metallic` or `copper`.

## `can_transport[]`

Each entry needs `dec` plus kind-specific stats.

### `item` / `fluid` / `mek_gas`

| Field | Description |
|-------|-------------|
| `batch.default` / `batch.max` | Transfer quantity per shipment; `max: -1` = uncapped |
| `seq_stack.default` / `seq_stack.max` | **Sequential Stacks** (from **1.3.0.0.0**): how many extract/retrieve shipments to schedule per rate tick (default 1, hard cap 16); modules can raise the setting cap |
| `rate.default` / `rate.min` | Action interval (ticks); lower = faster |
| `speed.default` / `speed.min` | Travel time along ducts; lower = faster |
| `filter.allow` / `deny` / `allow_hybrid` / `deny_hybrid` | Base filter line counts |
| `move_radioactive` | (`mek_gas` only) allow radioactive chemicals |

**`seq_stack` key aliases** (same object; first match wins): `seq_stack`, `seq_stacks`, `sequential_stack`, `sequential_stacks`, `seq`, `seqs`, `stack`, `stacks`.

### `forge_energy`

| Field | Description |
|-------|-------------|
| `extract` | Default extract amount |
| `transfer` | Max transfer |
| `ray_color` | Optional hex color for energy ray visuals |

### `mek_heat`

| Field | Description |
|-------|-------------|
| `insulation` | Heat moved per action |

If Mekanism chemical/heat APIs are unavailable or gated off (see [Tags and Compatibility](Tags-and-Compatibility)), `mek_gas` / `mek_heat` entries are **skipped** at load with a warning.

## Feature keys (`disabled_features` / `forbidden_features`)

Keys are lowercased by the loader. Unknown keys log a warning (any string starting with `mode:`, `routing:`, `list:`, `filter:`, or `special:` counts as “known” for that check).

### `disabled` vs `forbidden`

| Set | Behavior |
|-----|----------|
| `disabled_features` | Feature is **always unavailable** |
| `forbidden_features` | Feature is locked **until a module** is present (face/duct check depending on the feature); same key vocabulary |

Alias: `special:upgrades` → `special:modules`. Field aliases for the forbidden set: `module_features`, `upgrade_features`.

### Special

| Key | Effect |
|-----|--------|
| `special:channel` | Channel / multi-lane controls |
| `special:modules` | Module slots UI/behavior (`special:upgrades` alias) |

### Filter syntax families

| Key | What it gates |
|-----|----------------|
| `filter:item` | Exact item id lines (no special prefix) |
| `filter:tag` | Lines starting with `#` |
| `filter:modid` | Lines starting with `@` |
| `filter:nbt` | Lines starting with `?` |
| `filter:predefined` | Lines starting with `&` macros |
| `filter:remote_node` | Remote destination binding (tool / GUI), not a filter-line prefix |

### Modes

| Key |
|-----|
| `mode:none` |
| `mode:extraction` |
| `mode:filtering_insertion` |
| `mode:extraction_filtering` |
| `mode:retrieving` |
| `mode:retrieving_extraction` |

### Routing

| Key |
|-----|
| `routing:nearest` |
| `routing:farthest` |
| `routing:middlest` |
| `routing:round_robin` |
| `routing:random` |

### Lists (allow / deny / precedence)

Suffix is always one of: `allow`, `deny`, `precedence`.

**Simple modes** (no bank segment):

| Key pattern |
|-------------|
| `list:extraction:<suffix>` |
| `list:filtering_insertion:<suffix>` |
| `list:retrieving:<suffix>` |

**`mode:none`** (bank = `extractor` \| `retriever` \| `filter`):

| Key pattern |
|-------------|
| `list:none:<bank>:<suffix>` |

**Hybrid modes** (bank = `extractor` \| `filter` \| `retriever`):

| Key pattern |
|-------------|
| `list:extraction_filtering:<bank>:<suffix>` |
| `list:retrieving_extraction:<bank>:<suffix>` |

Examples: `list:extraction:allow`, `list:extraction_filtering:extractor:deny`, `list:retrieving_extraction:retriever:precedence`, `list:none:filter:allow`.

Use these to strip modes, routing options, filter syntax, or list editing from a duct type without changing Java.

## Builtin logical ids (shipped)

| Id | Notes |
|----|--------|
| `another_dynamics:item_duct` | Items |
| `another_dynamics:fluid_duct` | Fluids |
| `another_dynamics:flux_duct` | FE |
| `another_dynamics:gas_duct` | Mek gas + `neoforge:mod_loaded` mekanism |
| `another_dynamics:heat_duct` | Heat insulation 10; `module_slots: 1`; Mek condition |
| `another_dynamics:universal_duct` | All kinds in one definition |

Project ducts are a separate block (not a `declare_duct` logical type for conversion targets).

## Pack tips

- Override balance by shipping replacement JSON with the **same `id`** and higher datapack priority, or add new ids and wire recipes/items yourself.
- Extra module slots or alternate tiers need both datapack definitions and matching registered items/recipes.
- Prefer `disabled_features` over forking Java for simple pack constraints.
