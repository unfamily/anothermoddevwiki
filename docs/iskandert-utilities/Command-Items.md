# Command Items

Command items are custom items defined by datapack JSON. Each item runs scripted actions on use, tick, entity hit, and other events. Registered items appear in the creative tab **Iskandert's Command Items** when `creative_tab` is true.

> **Mod version:** Command items exist in older releases. The **improved `message` action** (hex `color`, `in`: `chat` / `action_bar` / `title`, `distance`, shared with Suspicious Delivery) requires **`3.4.0.0.0+`**. See [Message action](#message-action) and [Suspicious-Delivery](Suspicious-Delivery).

## Datapack location

```text
data/<namespace>/load/iska_utils_command_items/
```

Or `data/<namespace>/load/<file>.json` with `"type": "iska_utils:command_item"`.

**Reload:** `/iska_lib_dev reload` or `/reload`.  
The jar no longer ships example command items; add your own JSON under the path above.

## Format

The format is JSON with the following structure:

```json
{
  "type": "iska_utils:command_item",
  "overwritable": true,
  "items": [
    {
    "id": "unique-item-id",
      "creative_tab": true,
      "stack_size": 64,
      "is_foil": false,
      "cooldown": 20,
      "stages_logic": "AND",
      "stages": [
        {
          "stage_type": "player",
          "stage": "some_stage",
          "is": true
        }
      ],
      "do": [
        {
          "onUse": [
            {"execute": "say Hello World!"}
          ]
        },
        {
          "onTick": [
            {"delay": 20},
            {"execute": "say Tick!"}
          ]
        }
      ]
    }
  ]
}
```

## Fields

### General Fields
- `id`: Unique identifier for the command item (required)
- `creative_tab`: Whether the item should appear in the creative tab (optional, default: true)
- `stack_size`: Maximum stack size for this item (optional, default: 64, range: 1-64)
- `is_foil`: Whether the item should have an enchantment glint (optional, default: false)
- `cooldown`: Cooldown in ticks (20 ticks = 1 second) between actions (optional, default: 0)
- `stages_logic`: Logic for evaluating stages (optional, values: "AND", "OR", "DEF_AND", "DEF_OR", default: "AND")
  - "AND": All stages must be satisfied
  - "OR": At least one stage must be satisfied
  - "DEF_AND": Stages are defined per action with AND logic
  - "DEF_OR": Stages are defined per action with OR logic
- `stages`: List of stage conditions that must be met for the item to function
- `mods`: **3.5.0.0.0+** Mod presence conditions (see [Mod conditions](#mod-conditions-3500000))
- `mods_logic`: **3.5.0.0.0+** `DEF_AND` or `DEF_OR` for `mod_conditions` in `if` blocks (default `DEF_AND`)

### Special Stage System for DEF Logic
When using `stages_logic: "DEF_AND"` or `stages_logic: "DEF_OR"`, you can create a special initialization system:

1. Include a stage called `initialized` in your item definition:
```json
"stages": [
  {
    "stage_type": "player",
    "stage": "initialized",
    "is": true
  }
]
```

2. In your tick actions, set this stage:
```json
{
  "onTick": [
    {"execute": "iska_lib_stage add player self initialized true"}
  ]
}
```

3. The system will automatically check if the item has been initialized.
   If not, it will be removed from inventory after the first tick.
   This is useful for one-time use items that should be removed if their
   initialization fails for any reason.

### Item Properties
- `stack_size`: The number of items in the stack (optional, default: 64)
- `is_foil`: Whether the item is a foil (optional, default: false)
- `cooldown`: The cooldown in ticks (20 ticks = 1 second) between actions (optional, default: 0)

### Stage Condition Fields
- `stage_type`: Type of stage, e.g., "player", "world", or "team" (optional, default: "player")
- `stage`: Name of the stage (required)
- `is`: Whether the stage should be set (true) or not set (false) (optional, default: true)

### Action Blocks
- `onTick`: Actions to perform every tick
- `onUse`: Actions to perform when the item is used
- `onFinishUse`: Actions to perform when the item use is finished
- `onUseOn`: Actions to perform when the item is used on a block
- `onHitEntity`: Actions to perform when the item hits an entity
- `onSwing`: Actions to perform when the item is swung
- `onDrop`: Actions to perform when the item is dropped
- `onReleaseUsing`: Actions to perform when the use is released

### Action Types
- `execute`: Execute a command (e.g., `{"execute": "say Hello World!"}`)
- `message`: Send a localized message to player(s) (see [Message action](#message-action))
- `delay`: Delay next actions by ticks (e.g., `{"delay": 20}`)
- `item`: Perform an item action (e.g., `{"item": "consume"}`)
- `if`: Conditional execution based on stage and mod conditions (see examples below)

### Mod conditions (3.5.0.0.0+)

**Requires Iskandert's Utilities `3.5.0.0.0` or newer.**

Same semantics as [Suspicious Delivery — Mod conditions](Suspicious-Delivery#mod-conditions-3500000):

- **`mods` without `mods_logic: DEF_*`** — load-time gate (implicit AND). The command item is not registered if any condition fails.
- **`mods_logic: DEF_AND` / `DEF_OR`** — `mods` is used only in `if` blocks via `mod_conditions` indices. Stage `conditions` and `mod_conditions` both apply when present (AND between groups).

Example (world init reloads optional mods only when loaded):

```json
{
  "mods_logic": "DEF_AND",
  "mods": [
    { "mod": "kubejs", "is": true },
    { "mod": "custommachinery", "is": true }
  ],
  "do": [{
    "onTick": [{
      "if": [
        { "mod_conditions": [0, 1] },
        { "execute": "kubejs reload server-scripts" },
        { "execute": "custommachinery reload" }
      ]
    }]
  }]
}
```

### Message action

Same format as [Suspicious Delivery](Suspicious-Delivery) messages:

```json
{
  "message": {
    "target": "@a",
    "distance": 0,
    "color": "#FF0000",
    "in": "action_bar",
    "text": "message.iska_utils.world_init.initializing"
  }
}
```

| Field | Description |
|-------|-------------|
| `target` | Entity selector for players (default `@a`), e.g. `@s`, `@p` |
| `distance` | If greater than 0, only players within this block radius from the action origin receive the message |
| `color` | Hex color `#RRGGBB` (default `#FFFFFF`) |
| `in` | `chat`, `action_bar` / `actionbar`, or `title` |
| `text` | Translation key (resolved via lang files, not raw chat text) |

### Item Action Values
- `consume`: Consume one item from the stack
- `delete`: Delete the item in hand
- `delete_all`: Delete all items of this type in inventory
- `drop`: Drop the item in hand
- `drop_all`: Drop all items of this type in inventory
- `damage`: Damage the item

## Important Notes

- **Final Actions**: The actions like `drop`, `drop_all`, `delete` and `delete_all` must always be the last in a command block to ensure the correct execution of subsequent commands.

- **Logical Spinlocks**: Stages can be used to create logical spinlocks, as demonstrated in the World Initializer example.

## Example: World Initialization Item

```json
{
  "id": "world_init",
  "creative_tab": true,
  "stack_size": 1,
  "stages_logic": "DEF_AND",
  "stages": [
    {
      "stage_type": "world",
      "stage": "initialized",
      "is": true
    }
  ],
  "do": [
    {
      "onTick": [
        {"execute": "iska_lib_stage add world initialized true"},
        {"execute": "say World initialized!"},
        {"item": "consume"}
      ]
    }
  ]
}
```

## Conditional Example with IF

```json
{
  "onTick": [
    {"if": [
        {"conditions":[0,1]},
        {"execute": "say Condition met!"},
        {"item": "delete_all"}
    ]}
  ]
}
```

## Notes

- Command items load from all datapacks under `load/iska_utils_command_items/` (and flat `load/` files with the correct `type`). Definitions are **merged** by item `id`; later packs can override the same id depending on load order.
- Built-in defaults (e.g. `iska_utils-world_init`) ship in the mod jar; datapack files extend or override them.
- Item ids use the form `iska_utils-<id>` in JSON (`id` field without namespace prefix in the file; the registry adds the mod prefix).
- Set `overwritable: false` on generated defaults you edit by hand so dump/regeneration does not overwrite them.
- For a full server reload including macros, use `/reload` or a macro that runs it; `/iska_lib_dev reload` reloads load-tree JSON (command items, stage actions, shop, structures, **Suspicious Delivery**, etc.) without restarting the server.