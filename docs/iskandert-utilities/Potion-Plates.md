# Potion Plates

This directory contains configuration files for custom potion effect plates.

## Configuration Format

```json
{
  "type": "iska_utils:plates",
  "overwritable": true,
  "plates": [
    {
      "plate_type": "effect",
      "id": "iska_utils-poison",
      "effect": "minecraft:poison",
      "amplifier": 0,
      "duration": 100,
      "delay": 40,
      "hide_particles": false,
      "affects_players": true,
      "affects_mobs": true,
      "creative_tab": true,
      "player_shift_disable": true
    },
    {
      "plate_type": "damage",
      "id": "iska_utils-damage",
      "damage_type": "minecraft:generic",
      "damage": 2.0,
      "delay": 20,
      "affects_players": true,
      "affects_mobs": true,
      "creative_tab": true,
      "player_shift_disable": true,
      "tooltip_lines": 1
    },
    {
      "plate_type": "special",
      "id": "iska_utils-fire",
      "apply": "fire",
      "duration": 60,
      "delay": 40,
      "affects_players": true,
      "affects_mobs": true,
      "creative_tab": true,
      "player_shift_disable": true
    }
  ]
}
```

## Fields

### General Fields (all plate types)
- `plate_type`: The type of plate (`effect`, `damage`, or `special`) [required]
- `id`: Unique identifier for the plate [optional, auto-generated if not provided]
- `affects_players`: Whether this plate affects players [optional, default: true]
- `affects_mobs`: Whether this plate affects non-player entities [optional, default: true]
- `delay`: Delay in ticks between applying effects (20 ticks = 1 second) [optional, type-specific defaults]
- `creative_tab`: Whether this plate should appear in the creative tab [optional, default: true]
- `player_shift_disable`: Whether players can avoid the effect by sneaking [optional, default: true]
- `tooltip_lines`: Number of tooltip description lines to display [optional, default: 0]
  - If set to 1, displays one tooltip line using the key `tooltip.iska_utils.{plate_id}.desc0`
  - If set to 2, displays two tooltip lines using `desc0` and `desc1`, and so on
  - The `{plate_id}` in the translation key uses underscores instead of hyphens (e.g., `iska_utils-damage` becomes `iska_utils_damage`)
  - Example: For a plate with `id: "iska_utils-damage"` and `tooltip_lines: 1`, add to your lang file:
    ```json
    "tooltip.iska_utils.iska_utils_damage.desc0": "Your tooltip text here"
    ```

### Effect Plate Fields
- `effect`: The effect to apply, e.g., `minecraft:poison` [required]
- `amplifier`: The amplifier (level) of the effect, starting at 0 [optional, default: 0]
- `duration`: Duration in ticks (20 ticks = 1 second) [optional, default: 100, minimum: 60]
- `hide_particles`: Whether to hide the effect particles [optional, default: false]

### Damage Plate Fields
- `damage_type`: The damage type to apply, e.g., `minecraft:generic` [required]
- `damage`: The amount of damage to apply [required]

### Special Plate Fields
- `apply`: Special effect type (`fire`, `freeze`, `slow`; deprecated alias `no_move`) [required]
- `duration`: Duration in ticks (20 ticks = 1 second) [required for fire/freeze; optional for `slow`]
- For `slow`, `delay` may be `1` (continuous cobweb-like slow on horizontal velocity); other specials use a minimum delay of 40
- `no_move` remains accepted as an alias for `slow` (legacy configs)

## Notes

- You can place potion plates like regular blocks. Entities standing on the plate will receive the configured effect.
- If a plate configuration with the same ID is found in multiple files, the behavior depends on the `overwritable` flag:
  - If a plate configuration has `overwritable: false`, it cannot be overwritten by other configurations
  - If a plate configuration has `overwritable: true`, it can be overwritten by configurations loaded later
  - The global `overwritable` flag applies to all plates in a file if not specified individually
- Plates are sorted alphabetically by ID for registration purposes.
- When `player_shift_disable` is true, players can avoid the effect by sneaking (shift key)
- When `creative_tab` is false, the plate won't appear in creative tabs but can still be used with commands

## Tooltip Translations

When using `tooltip_lines`, you need to add the corresponding translation keys to your language files.

The translation key format is: `tooltip.iska_utils.{plate_id}.desc{X}`

- `{plate_id}` is the plate's ID with hyphens (`-`) replaced by underscores (`_`)
- `{X}` is the line number starting from 0 (desc0, desc1, desc2, etc.)

**Example:**

For a plate with `id: "iska_utils-damage"` and `tooltip_lines: 1`, add to your lang file (e.g., `assets/iska_utils/lang/en_us.json`):

```json
{
  "tooltip.iska_utils.iska_utils_damage.desc0": "Damage: 2 (not player)"
}
```

For multiple tooltip lines (e.g., `tooltip_lines: 2`), add both keys:

```json
{
  "tooltip.iska_utils.iska_utils_damage.desc0": "First line of tooltip",
  "tooltip.iska_utils.iska_utils_damage.desc1": "Second line of tooltip"
}
```

## Example File Locations

- KubeJS: `kubejs/external_scripts/iska_utils_plates/custom_plates.json`

## Default Plates

Default plates (poison, weakness, slowness, damage, improved_damage, lethal_damage, fire, freeze, cobweb) are registered internally and always available.
Configuration files in this directory override the internal defaults.

Changes require a game restart to apply.}
```

## Example File Locations

- KubeJS: `kubejs/external_scripts/iska_utils_plates/custom_plates.json`

## Default Plates

Default plates (poison, weakness, slowness, damage, improved_damage, lethal_damage, fire, freeze, cobweb) are registered internally and always available.
Configuration files in this directory override the internal defaults.

Changes require a game restart to apply.