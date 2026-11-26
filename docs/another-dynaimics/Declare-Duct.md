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

**How keys are resolved (1.3.0.1.0+):** every public static `SoundType` field on vanilla Minecraft is accepted as its **lowercase** name (via reflection). Pack-friendly aliases: `metallic` → `metal`, `rock` → `stone`, and **`iron` → `metal`** (forced even on 26.x, where vanilla also has a separate `SoundType.IRON` that is nearly identical).

The **From** column is the earliest Minecraft/NeoForge line where that key is valid: `1.21.1+` (both builds) or `26.1.2+` (26.1.2 onward only; on 1.21.1 those fall back to `copper` with a warning). Rows are ordered **1.21.1+ first**, then **26.1.2+** at the end.

| Sound key | From | Notes |
|-----------|------|--------|
| `copper` | 1.21.1+ | Default when omitted / unknown |
| `metal`, `metallic`, `iron` | 1.21.1+ | Same metal sound (`iron` / `metallic` are aliases) |
| `stone`, `rock` | 1.21.1+ | Same stone sound |
| `amethyst` | 1.21.1+ | |
| `amethyst_cluster` | 1.21.1+ | |
| `ancient_debris` | 1.21.1+ | |
| `anvil` | 1.21.1+ | |
| `azalea` | 1.21.1+ | |
| `azalea_leaves` | 1.21.1+ | |
| `bamboo` | 1.21.1+ | |
| `bamboo_sapling` | 1.21.1+ | |
| `bamboo_wood` | 1.21.1+ | |
| `bamboo_wood_hanging_sign` | 1.21.1+ | |
| `basalt` | 1.21.1+ | |
| `big_dripleaf` | 1.21.1+ | |
| `bone_block` | 1.21.1+ | |
| `calcite` | 1.21.1+ | |
| `candle` | 1.21.1+ | |
| `cave_vines` | 1.21.1+ | |
| `chain` | 1.21.1+ | |
| `cherry_leaves` | 1.21.1+ | |
| `cherry_sapling` | 1.21.1+ | |
| `cherry_wood` | 1.21.1+ | |
| `cherry_wood_hanging_sign` | 1.21.1+ | |
| `chiseled_bookshelf` | 1.21.1+ | |
| `cobweb` | 1.21.1+ | |
| `copper_bulb` | 1.21.1+ | |
| `copper_grate` | 1.21.1+ | |
| `coral_block` | 1.21.1+ | |
| `crop` | 1.21.1+ | |
| `decorated_pot` | 1.21.1+ | |
| `decorated_pot_cracked` | 1.21.1+ | |
| `deepslate` | 1.21.1+ | |
| `deepslate_bricks` | 1.21.1+ | |
| `deepslate_tiles` | 1.21.1+ | |
| `dripstone_block` | 1.21.1+ | |
| `empty` | 1.21.1+ | Vanilla empty SoundType |
| `flowering_azalea` | 1.21.1+ | |
| `froglight` | 1.21.1+ | |
| `frogspawn` | 1.21.1+ | |
| `fungus` | 1.21.1+ | |
| `gilded_blackstone` | 1.21.1+ | |
| `glass` | 1.21.1+ | |
| `glow_lichen` | 1.21.1+ | |
| `grass` | 1.21.1+ | |
| `gravel` | 1.21.1+ | |
| `hanging_roots` | 1.21.1+ | |
| `hanging_sign` | 1.21.1+ | |
| `hard_crop` | 1.21.1+ | |
| `heavy_core` | 1.21.1+ | |
| `honey_block` | 1.21.1+ | |
| `ladder` | 1.21.1+ | |
| `lantern` | 1.21.1+ | |
| `large_amethyst_bud` | 1.21.1+ | |
| `lily_pad` | 1.21.1+ | |
| `lodestone` | 1.21.1+ | |
| `mangrove_roots` | 1.21.1+ | |
| `medium_amethyst_bud` | 1.21.1+ | |
| `moss` | 1.21.1+ | |
| `moss_carpet` | 1.21.1+ | |
| `mud` | 1.21.1+ | |
| `mud_bricks` | 1.21.1+ | |
| `muddy_mangrove_roots` | 1.21.1+ | |
| `nether_bricks` | 1.21.1+ | |
| `nether_gold_ore` | 1.21.1+ | |
| `nether_ore` | 1.21.1+ | |
| `nether_sprouts` | 1.21.1+ | |
| `nether_wart` | 1.21.1+ | |
| `nether_wood` | 1.21.1+ | |
| `nether_wood_hanging_sign` | 1.21.1+ | |
| `netherite_block` | 1.21.1+ | |
| `netherrack` | 1.21.1+ | |
| `nylium` | 1.21.1+ | |
| `packed_mud` | 1.21.1+ | |
| `pink_petals` | 1.21.1+ | |
| `pointed_dripstone` | 1.21.1+ | |
| `polished_deepslate` | 1.21.1+ | |
| `polished_tuff` | 1.21.1+ | |
| `powder_snow` | 1.21.1+ | |
| `rooted_dirt` | 1.21.1+ | |
| `roots` | 1.21.1+ | |
| `sand` | 1.21.1+ | |
| `scaffolding` | 1.21.1+ | |
| `sculk` | 1.21.1+ | |
| `sculk_catalyst` | 1.21.1+ | |
| `sculk_sensor` | 1.21.1+ | |
| `sculk_shrieker` | 1.21.1+ | |
| `sculk_vein` | 1.21.1+ | |
| `shroomlight` | 1.21.1+ | |
| `slime_block` | 1.21.1+ | |
| `small_amethyst_bud` | 1.21.1+ | |
| `small_dripleaf` | 1.21.1+ | |
| `snow` | 1.21.1+ | |
| `soul_sand` | 1.21.1+ | |
| `soul_soil` | 1.21.1+ | |
| `sponge` | 1.21.1+ | |
| `spore_blossom` | 1.21.1+ | |
| `stem` | 1.21.1+ | |
| `suspicious_gravel` | 1.21.1+ | |
| `suspicious_sand` | 1.21.1+ | |
| `sweet_berry_bush` | 1.21.1+ | |
| `trial_spawner` | 1.21.1+ | |
| `tuff` | 1.21.1+ | |
| `tuff_bricks` | 1.21.1+ | |
| `twisting_vines` | 1.21.1+ | |
| `vault` | 1.21.1+ | |
| `vine` | 1.21.1+ | |
| `wart_block` | 1.21.1+ | |
| `weeping_vines` | 1.21.1+ | |
| `wet_grass` | 1.21.1+ | |
| `wet_sponge` | 1.21.1+ | |
| `wood` | 1.21.1+ | |
| `wool` | 1.21.1+ | |
| `cactus_flower` | 26.1.2+ | |
| `copper_golem_statue` | 26.1.2+ | |
| `creaking_heart` | 26.1.2+ | |
| `dried_ghast` | 26.1.2+ | |
| `leaf_litter` | 26.1.2+ | |
| `resin` | 26.1.2+ | |
| `resin_bricks` | 26.1.2+ | |
| `shelf` | 26.1.2+ | |
| `spawner` | 26.1.2+ | |

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

### `unknown_flux` (experimental)

Requires optional **Iskandert's Library** (`iska_lib`). Same field shape as `forge_energy` (`extract`, `transfer`, `rate`, `ray_alpha`, etc.), but amounts are **Unknown Flux** (`long`), not FE — no FE conversion.

| Field | Description |
|-------|-------------|
| `extract` | Default extract per action |
| `transfer` | Legacy transfer field (compatibility) |
| `rate.default` / `rate.min` | Ticks between actions |
| `ray_color` | Optional; default `#2b576c` if omitted |
| `ray_alpha` | Path visibility (client uses `iska_lib:unknown_flux_hit`) |

If `iska_lib` is not loaded, the `unknown_flux` `can_transport` row is **skipped** (other lanes on the same duct still load). AD 1.3.0.1.0 does not ship a builtin duct with this `dec`.

### `mek_heat`

| Field | Description |
|-------|-------------|
| `insulation` | Heat moved per action |

If Mekanism is missing or chemical/heat APIs are unavailable (see [Tags and Compatibility](Tags-and-Compatibility)), `mek_gas` / `mek_heat` entries are **skipped** at load with a warning.

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
