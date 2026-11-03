# Structure System

**Requires Iskandert's Utilities `3.0.0.0.0` or newer** (datapack `load/` layout).

Multi-block structures defined in JSON: place with Structure Placer items, the Structure Placer Machine, monouse reward items, or OP commands. Patterns use a 3D character grid; each character maps to block alternatives in `key`.

## Related

| Topic | Page |
|-------|------|
| Stages (gates on structures) | [Home — Internal Stages](Home#internal-stages) |
| Stage actions | [Stage-Actions](Stage-Actions) |

## Datapack locations

Two JSON types, both under `data/<namespace>/load/`:

| Type | `"type"` field | Typical folder |
|------|----------------|----------------|
| Structure definitions | `iska_utils:structure` | `load/iska_utils_structure_definitions/` |
| Monouse items | `iska_utils:structure_monouse_item` | `load/iska_utils_structures_monouse/` |

Or `data/<namespace>/load/<file>.json` with the correct `"type"` (routed like other IskaUtils load files).

- **One file, many structures:** the `structure` array can hold several definitions in the same JSON file.
- **Many files:** all definitions from all matching files are loaded and merged.

**Reload:** `/reload`, `/iska_lib_dev reload`, or `/iska_utils_structure reload`.

### Overwritable

| Value | Behaviour |
|-------|-----------|
| `"overwritable": true` | Later packs / reloads may replace this definition when merging the same id |
| `"overwritable": false` | Protected from overwrite — use for pack content you want to keep |

---

## Structure definition (`iska_utils:structure`)

```json
{
  "type": "iska_utils:structure",
  "overwritable": false,
  "structure": [
    {
      "id": "my_mod-my_structure",
      "name": "My Custom Structure",
      "description": "Tooltip text",
      "icon": {
        "type": "minecraft:item",
        "item": "minecraft:diamond_block",
        "count": 1
      },
      "pattern": [[["AAA"], ["ABA"], ["AAA"]]],
      "key": {
        "A": {
          "display": "minecraft.stone",
          "alternatives": [
            { "block": "minecraft:stone" },
            { "block": "minecraft:cobblestone" }
          ]
        },
        "B": {
          "display": "minecraft.chest",
          "alternatives": [{ "block": "minecraft:chest" }]
        }
      }
    }
  ]
}
```

### Fields per structure

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `id` | yes | — | Unique id: `modid-name` (used in commands and monouse `place`) |
| `name` | yes | — | Display name |
| `pattern` | yes | — | 3D layout (see **Patterns**) |
| `key` | yes | — | Maps pattern characters to blocks |
| `description` | no | — | Tooltip |
| `icon` | no | — | Item icon in machine GUI (`type`, `item`, `count`) |
| `can_force` | no | `false` | Allow shift+place on placer item and `place … force` command |
| `can_replace` | no | `[]` | Blocks/tags/tokens that may be overwritten (see **Replacement**) |
| `slower` | no | `false` | 5-tick delay between blocks |
| `place_like_player` | no | `false` | Place as player (events, mod hooks) |
| `refresh` | no | `false` | Schedule one block tick after each placement (redstone, observers) |
| `stages` | no | `[]` | **All** listed stages required ([`/iska_lib_stage`](Home#commands-added-by-the-mod)) |
| `machine` | no | `true` | Show in Structure Placer Machine GUI |
| `hidden` | no | `false` | Commands only; hidden from normal placement |

### Patterns

`pattern` is a 3D array **`[Y][Z][row]`** (each inner string is one row along X):

| Axis | Meaning |
|------|---------|
| **Y** | Layer index (height), bottom to top |
| **Z** | Row index (north–south) |
| **Characters in a row** | West → east |

| Character | Meaning |
|-----------|---------|
| `@` | Structure **center** (anchor for placement / machine) |
| space | Skip (no block) |
| any other | Must exist in `key` |

#### Pattern example — 3×3 platform

```json
"pattern": [
  [["AAA"], ["AAA"], ["AAA"]]
],
"key": {
  "A": {
    "display": "minecraft.stone",
    "alternatives": [{ "block": "minecraft:stone" }]
  }
}
```

#### Pattern example — vertical stack with center

```json
"pattern": [
  [[" @ "], [" A "], [" B "], [" C "]]
],
"key": {
  "A": { "display": "minecraft.stone", "alternatives": [{ "block": "minecraft:stone" }] },
  "B": { "display": "minecraft.iron_block", "alternatives": [{ "block": "minecraft:iron_block" }] },
  "C": { "display": "minecraft.gold_block", "alternatives": [{ "block": "minecraft:gold_block" }] },
  "@": { "display": "minecraft.air", "alternatives": [{ "block": "minecraft:air" }] }
}
```

#### Pattern example — 5×5 foundation

```json
"pattern": [
  [["CCCCC"], ["WWWWW"], ["WWWWW"]],
  [["CCCCC"], ["W   W"], ["W   W"]],
  [["CC@CC"], ["W   W"], ["W   W"]],
  [["CCCCC"], ["W   W"], ["W   W"]],
  [["CCCCC"], ["WWWWW"], ["WWWWW"]]
],
"key": {
  "C": { "display": "minecraft.cobblestone", "alternatives": [{ "block": "minecraft:cobblestone" }] },
  "W": { "display": "minecraft.oak_planks", "alternatives": [{ "block": "minecraft:oak_planks" }] },
  "@": { "display": "minecraft.cobblestone", "alternatives": [{ "block": "minecraft:cobblestone" }] }
}
```

### `key` entries

Each letter in the pattern points to:

| Field | Description |
|-------|-------------|
| `display` | Tooltip/GUI label (`minecraft.stone` style) |
| `alternatives` | Ordered list; first valid block is preferred when placing |

Each alternative:

```json
{ "block": "minecraft:oak_stairs", "properties": { "facing": "north", "half": "bottom" } }
```

#### Multiple wood types (one pattern letter)

```json
"W": {
  "display": "minecraft.planks",
  "alternatives": [
    { "block": "minecraft:oak_planks" },
    { "block": "minecraft:birch_planks" },
    { "block": "minecraft:spruce_planks" }
  ]
}
```

### Replacement (`can_replace`)

A position is cleared only if the existing block matches an entry in `can_replace` (unless `can_force` / `aggressive` applies).

| Form | Example |
|------|---------|
| Block id | `"minecraft:dirt"` |
| Tag | `"#minecraft:flowers"` |
| Token | `"$replaceable"`, `"$air"`, `"$fluids"`, `"$plants"`, `"$dirt"`, `"$logs"`, `"$stone"`, `"$ores"`, … |

Match order: exact block → `$` tokens → `#` tags. If nothing matches and `can_force` is false, placement stops at that cell.

#### `can_force` example

```json
{
  "id": "my_mod-force_structure",
  "name": "Bulldozer Structure",
  "can_force": true,
  "can_replace": [
    "minecraft:dirt",
    "minecraft:grass_block",
    "$replaceable",
    "#minecraft:flowers"
  ],
  "pattern": ["..."],
  "key": { "..." }
}
```

- **Structure Placer item:** shift + right-click (second click) to force within `can_replace` rules.
- **Command:** `/iska_utils_structure place <id> <x> <y> <z> force` — requires `can_force: true`; overwrites every cell in the pattern.

### Other placement flags

| Flag | Effect |
|------|--------|
| `refresh: true` | Tick each placed block once (redstone contraptions) |
| `slower: true` | 5 ticks between blocks |
| `place_like_player: true` | Player placement semantics (slower, mod-compatible) |

```json
{
  "id": "my_mod-redstone_gadget",
  "refresh": true,
  "place_like_player": true,
  "pattern": ["..."],
  "key": { "..." }
}
```

### Stages

```json
"stages": ["chapter_1_complete", "has_nether_star"]
```

All listed stages must be satisfied for the player placing the structure. Empty array = no requirement.

---

## Monouse items (`iska_utils:structure_monouse_item`)

Right-click consumable: gives items, places a structure, consumes the stack.

```json
{
  "type": "iska_utils:structure_monouse_item",
  "overwritable": false,
  "structure": [
    {
      "id": "iska_utils-wither_grinder",
      "place": "iska_utils-wither_grinder",
      "aggressive": false,
      "give": [
        { "item": "minecraft:wither_skeleton_skull", "count": 3 },
        { "item": "minecraft:soul_sand", "count": 4 },
        { "item": "iska_utils:wither_proof_block", "count": 26 }
      ]
    }
  ]
}
```

| Field | Description |
|-------|-------------|
| `id` | Entry id in this file |
| `place` | Structure `id` to place (must exist in a structure definition) |
| `give` | Items granted on use |
| `aggressive` | If `true`, place over **any** existing block (can destroy builds). Unlike `can_force`, no `can_replace` filter |

---

## Placement in-game

| Method | Notes |
|--------|-------|
| **Structure Placer** item | Manual placement at targeted block |
| **Structure Placer Machine** | Automated; RF/FE per block (server config); pulls materials; respects `stages` |
| **Monouse item** | One-shot reward + place |
| **Commands** | OP — see below |

### Structure Placer Machine

| Topic | Detail |
|-------|--------|
| Energy | RF/FE per block placed (configurable; `0` disables consumption) |
| Materials | Uses `alternatives` order from `key` |
| Redstone | Ignore / low / high / pulse modes |
| GUI | Lists structures with `machine: true` and met `stages` |

---

## Commands (OP 2)

| Command | Description |
|---------|-------------|
| `/iska_utils_structure list` | List loaded structure ids |
| `/iska_utils_structure reload` | Reload definitions and sync clients |
| `/iska_utils_structure info <id>` | Size, center, flags |
| `/iska_utils_structure place <id> <x> <y> <z>` | Place respecting `can_replace` |
| `/iska_utils_structure place <id> <x> <y> <z> force` | Overwrite all pattern cells (`can_force: true` required) |

---

## Examples

### 1. Simple wooden house

```json
{
  "type": "iska_utils:structure",
  "overwritable": false,
  "structure": [
    {
      "id": "example-simple_house",
      "name": "Simple Wooden House",
      "description": "Starter house",
      "icon": { "type": "minecraft:item", "item": "minecraft:oak_planks" },
      "can_replace": ["$replaceable", "$air", "$plants"],
      "pattern": [
        [["WWWWW"], ["W   W"], ["W @ W"], ["W   W"], ["WWWWW"]],
        [["WWWWW"], ["W   W"], ["W   W"], ["W   W"], ["WWWWW"]],
        [["WWWWW"], ["W   W"], ["W   W"], ["W   W"], ["WWWWW"]],
        [["RRRRR"], ["RRRRR"], ["RRRRR"], ["RRRRR"], ["RRRRR"]]
      ],
      "key": {
        "W": {
          "display": "minecraft.oak_planks",
          "alternatives": [
            { "block": "minecraft:oak_planks" },
            { "block": "minecraft:birch_planks" },
            { "block": "minecraft:spruce_planks" }
          ]
        },
        "R": {
          "display": "minecraft.oak_slab",
          "alternatives": [
            { "block": "minecraft:oak_slab", "properties": { "type": "bottom" } }
          ]
        }
      }
    }
  ]
}
```

### 2. Redstone machine (stages + force)

```json
{
  "type": "iska_utils:structure",
  "overwritable": false,
  "structure": [
    {
      "id": "example-redstone_machine",
      "name": "Automated Redstone Machine",
      "description": "Pistons and dispensers",
      "icon": { "type": "minecraft:item", "item": "minecraft:redstone" },
      "can_force": true,
      "slower": true,
      "place_like_player": true,
      "can_replace": ["$replaceable", "$air", "$dirt"],
      "stages": ["redstone_engineer"],
      "pattern": [
        [["SSSSS"], ["S   S"], ["S@RRS"], ["S   S"], ["SSSSS"]],
        [["     "], ["  P  "], ["  D  "], ["  H  "], ["     "]]
      ],
      "key": {
        "S": {
          "display": "minecraft.stone",
          "alternatives": [
            { "block": "minecraft:stone" },
            { "block": "minecraft:cobblestone" }
          ]
        },
        "R": {
          "display": "minecraft.redstone_wire",
          "alternatives": [{ "block": "minecraft:redstone_wire" }]
        },
        "P": {
          "display": "minecraft.piston",
          "alternatives": [{ "block": "minecraft:piston", "properties": { "facing": "up" } }]
        },
        "D": {
          "display": "minecraft.dispenser",
          "alternatives": [{ "block": "minecraft:dispenser", "properties": { "facing": "up" } }]
        },
        "H": {
          "display": "minecraft.hopper",
          "alternatives": [{ "block": "minecraft:hopper", "properties": { "facing": "down" } }]
        }
      }
    }
  ]
}
```

---

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Structure not in list | JSON syntax error, wrong `"type"`, or failed load — check log |
| Blocks skip / stop mid-build | Block not in `can_replace` and `can_force` false |
| Wrong block state | Fix `properties` on the alternative |
| “Cannot place” with stages | Player missing a stage in `stages` |
| `force` command fails | Structure lacks `can_force: true` |

After editing datapacks: `/iska_lib_dev reload` or `/iska_utils_structure reload`.
