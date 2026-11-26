# Liquid & Gas JSON (Iskandert's Library)

**Requires: Iskandert's Library `1.12.0.0.0+`**

Define fluids via datapack JSON. **Gases are a special kind of liquid**: they do **not** spread horizontally — they rise and dissipate (“fly away”). They still use the fluid/bucket stack, but world behaviour and JSON fields differ where noted below.

| Kind | Type | Path |
|------|------|------|
| Liquid | `iska_lib:liquid` | `data/<namespace>/iska_lib/liquids/<id>.json` **or** any `data/<namespace>/load/…` with matching `type` |
| Gas | `iska_lib:gas` | `data/<namespace>/iska_lib/gases/<id>.json` **or** any `data/<namespace>/load/…` with matching `type` |

KubeJS / Open Loader / Global Packs / instance datapacks are scanned from disk at Library init
(config `bootstrap.datapack_paths`; zip packs are read without extraction) so new fluids can register
before registries freeze. Fluid ids are always **`iska_lib:<id>`**.

If at least one Library JSON bucket exists, a creative tab **Iskandert's Library Fluids** is created (icon = first bucket found).

## Shared root fields

| Field | Notes |
|-------|--------|
| `type` | Required: `iska_lib:liquid` or `iska_lib:gas` |
| `id` | Path id (default: file name) |
| `tint` | `#RRGGBB` / `#AARRGGBB` or int |
| `description_id` | Lang key (optional) |
| `light` | 0–15 |
| `type_properties` | FluidType flags (same keys for both; defaults differ) |
| `dimension_ticks` | Periodic transforms per dimension (liquids and gases) |

### Shared `type_properties`

| Field | Notes |
|-------|--------|
| `motion_scale` | Entity motion in the fluid |
| `can_push_entity` | Push entities |
| `can_swim` / `can_drown` | Swim / drown |
| `fall_distance_modifier` | Fall damage scale |
| `can_extinguish` | Extinguish fire |
| `can_convert_to_source` | Infinite source conversion |
| `supports_boating` | Boats |
| `can_hydrate` | Farmland / sponge-like hydrate |
| `density` / `temperature` / `viscosity` | FluidType numbers |

---

## Liquids (`iska_lib:liquid`)

Horizontal flowing fluid (water-like). Fluid id = always `iska_lib:<id>`.

### Liquid-only fields

| Field | Notes |
|-------|--------|
| `bucket` | Register bucket (default `true`) |
| `infinity` | Infinite source overlay |
| `loggable` | Water-like hydrate / boat / extinguish defaults (not vanilla `WATERLOGGED`) |
| `still` / `flow` / `overlay` | Texture ids (default `still`/`flow`: vanilla water sprites + tint) |
| `flow_properties` | Horizontal flow: tick / slope / level / blast resistance |

### Liquid example

```json
{
  "type": "iska_lib:liquid",
  "id": "example_gel",
  "tint": "#3A8CFF",
  "light": 0,
  "bucket": true,
  "infinity": false,
  "loggable": true,
  "still": "minecraft:block/water_still",
  "flow": "minecraft:block/water_flow",
  "type_properties": {
    "can_convert_to_source": false,
    "supports_boating": true,
    "can_hydrate": true,
    "can_swim": true,
    "can_drown": true,
    "can_extinguish": true,
    "temperature": 300,
    "viscosity": 1000,
    "density": 1000
  },
  "flow_properties": {
    "tick_rate": 5,
    "slope_find_distance": 4,
    "level_decrease_per_block": 1,
    "explosion_resistance": 100
  },
  "dimension_ticks": [
    {
      "dimension": "minecraft:the_nether",
      "interval": 20,
      "effect": "evaporate"
    }
  ]
}
```

### `dimension_ticks[]` (liquids and gases)

| Field | Notes |
|-------|--------|
| `dimension` | Dimension id (required) |
| `interval` | Ticks between runs (default 20) |
| `transform_to` | Optional fluid/block id to convert into |
| `effect` | `evaporate`, `remove`, `convert_to`, `damage` |

### Liquid reload

- **`/reload`:** overlays for already-registered fluids: `infinity`, `loggable`, `dimension_ticks`.
- **New fluid ids** need a **restart**. Datapacks cannot create brand-new fluid blocks after registries freeze.

### Liquid Java API

`LiquidSpec` / registers use the **hosting mod** id (not `iska_lib`).

```java
CONDENSED = IskaLibLiquids.registerLiquid(
        modEventBus,
        new LiquidRegistrationRegisters(FLUID_TYPES, FLUIDS, BLOCKS, ITEMS),
        LiquidSpec.withThinVanillaWaterSprites(
                YourMod.MOD_ID,
                "condensed_knowledge",
                0xFF55FF88,
                "fluid.your_mod.condensed_knowledge",
                10,
                true));
```

Library-owned jar fluids use `registerLibraryLiquid`.

---

## Gases (`iska_lib:gas`)

Rising fluid that dissipates instead of spreading. Registered ids:

- source fluid: `<namespace>:gas_fluid_<id>`
- block: `<namespace>:gas_<id>`
- bucket: `<namespace>:gas_<id>_bucket` (always registered)

World rendering uses the shared Library gas block model (`iska_lib:block/gas`) + tint — **no** `still` / `flow` / `overlay` JSON.

**Do not use** liquid-only fields on gases: `flow_properties`, `still` / `flow` / `overlay`, `loggable`, `infinity`, `bucket`. If `flow_properties` is present it is **ignored** (warned in log).

`dimension_ticks` **are** supported (same schema as liquids) and take priority over rising while a matching dimension transform is active.

### Gas-only fields

| Field | Notes |
|-------|--------|
| `tick_interval` | How often the gas column rises / dissipates when no dimension transform applies (default `10`) |

### Gas example

```json
{
  "type": "iska_lib:gas",
  "id": "example_vapor",
  "tint": "#A0E0FF",
  "light": 0,
  "tick_interval": 10,
  "type_properties": {
    "motion_scale": 0.014,
    "can_push_entity": false,
    "can_swim": false,
    "can_drown": false,
    "fall_distance_modifier": 0.5,
    "can_extinguish": false,
    "can_convert_to_source": false,
    "supports_boating": false,
    "can_hydrate": false,
    "density": -1000,
    "temperature": 300,
    "viscosity": 100
  },
  "dimension_ticks": [
    {
      "dimension": "minecraft:the_nether",
      "interval": 20,
      "effect": "evaporate"
    }
  ]
}
```

### Gas reload

- Jar JSON under `data/iska_lib/iska_lib/gases/` registers at Library init via `registerLibraryGas`.
- **`/reload`:** updates `dimension_ticks` overlays; **new gas ids still need a restart**.

### Gas Java API

```java
EXAMPLE = IskaLibGases.registerGas(
        modEventBus,
        new GasRegistrationRegisters(FLUID_TYPES, FLUIDS, BLOCKS, ITEMS),
        new GasSpec(YourMod.MOD_ID, "example_vapor", 0xFFA0E0FF));
```

Library-owned jar gases use `registerLibraryGas`.
