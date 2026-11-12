# Command Macros

This directory allows you to create command macros that can be executed directly in the game.

> **Mod version:** Macros exist in older releases. **`message` steps** in macro `do` lists (same improved text format as command items and Suspicious Delivery) require **`3.4.0.0.0+`**. See [Command-Items](Command-Items#message-action).

Macros are reloadable by /reload or /reloader. For other configs (command items, stage actions, shop, structures, Suspicious Delivery) use `/iska_lib_dev reload` for a quick reload.
If you change a default generated file, set overwritable to false in the file.

## Format

```json
{
  "type": "iska_utils:commands_macro",
  "overwritable": true,
  "commands": [
    {
      "command": "reloader",
      "level": 2,
      "do": [
        {"execute": "kubejs reload server-scripts"},
        {"execute": "reload"},
        {"delay": 60},
        {"execute": "custommachinery reload"}
      ]
    },
    {
      "command": "echo",
      "level": 0,
      "parameters": [
        {
          "type": "string",
          "required": true
        }
      ],
      "do": [
        {"execute": "say #0"}
      ]
    },
    {
      "command": "spawnmob",
      "level": 0,
      "parameters": [
        {
          "type": "static",
          "list": [
            {"declare": "zombie"},
            {"declare": "skeleton"},
            {"declare": "creeper"}
          ]
        }
      ],
      "do": [
        {"execute": "summon minecraft:#0 ~ ~ ~"}
      ]
    },
    {
      "command": "staged_example",
      "level": 0,
      "stages_logic": "AND",
      "stages": [
        {"stage": "example_stage_0", "stage_type": "player", "is": true}
      ],
      "do": [
        {"execute": "say example_stage_0"}
      ]
    },
    {
      "command": "staged_def",
      "level": 0,
      "stages_logic": "DEF_AND",
      "stages": [
        {"stage": "example_stage_0", "stage_type": "player", "is": true},
        {"stage": "example_stage_1", "stage_type": "player", "is": true},
        {"stage": "example_stage_2", "stage_type": "player", "is": true}
      ],
      "do": [
        {"if": [
            {"conditions": [0, 2]},
            {"execute": "say example_stage_0_and_2"}
        ]},
        {"if": [
            {"conditions": [1, 2]},
            {"execute": "say example_stage_1_and_2"}
        ]}
      ]
    }
  ]
}
```

## Fields

### File Fields
- `type`: Must be **"iska_utils:commands_macro"** [**required**]
- `overwritable`: Whether the macros in this file can be overwritten by other files loaded later [optional, default: true]
- `commands`: Array of command macro definitions [**required**]

### Macro Fields
- `command`: Unique identifier for the macro, which becomes the command name (e.g., `/reloader`) [**required**]
- `level`: Required permission level (0-4) [optional, default: 0]
  - 0: Any player
  - 1-4: OP level required
- `stages_logic`: Logic for stage requirements evaluation [optional, default: AND]
  - `AND`: All stages must be satisfied
  - `OR`: At least one stage must be satisfied
  - `DEF_AND` / `DEF_OR`: Top-level gate always passes; each `if` in `do[]` evaluates `conditions` indices into `stages[]` (`DEF_AND` = all, `DEF_OR` = any). Every passing `if` runs. This is per-`if` indices, not the [Stage Items](#/another-stages/Stage-Items#logic) branch-combination model.
- `stages`: Array of game stages that must be unlocked to use this macro [optional]
  - `{"stage": "stage_id", "stage_type": "player", "is": true}`: ID of a required game stage and its type
    - `stage_type` can be: "player" (default), "world", or "team"
    - `is`: Whether the stage must be present (`true`, default) or absent (`false`)
- `mods`: **3.5.0.0.0+** Mod presence conditions (see [Mod conditions](#mod-conditions-3500000)) [optional]
- `mods_logic`: **3.5.0.0.0+** `AND` (default if omitted), `OR`, `DEF_AND`, or `DEF_OR`. `DEF_*` is for `mod_conditions` in `if` blocks. Only `DEF_OR` is OR for those indices; stage group and mod group combine with AND.
- `parameters`: Array of parameter definitions for the command [optional]
  - `type`: Type of parameter (`string`, `word`, `int`, `float`, `double`, `boolean`, `target`, `static`) [**required**]
  - `required`: Whether the parameter is required (true) or optional (false) [optional, default: true]
  - `list`: For static type only, array of allowed values for autocomplete [**required for static type**]
    - `{"declare": "value"}`: Defines a static value for the parameter
- `do`: Array of actions to execute in sequence [**required**]
  - `{"execute": "command"}`: Execute a server command
  - `{"delay": ticks}`: Wait for specified ticks (20 ticks = 1 second)
  - `{"if": [ {"conditions": [0, 1]}, {"execute": "command"} ]}`: Conditional execution based on stage indices
  - `{"if": [ {"mod_conditions": [0, 1]}, {"execute": "command"} ]}`: **3.5.0.0.0+** Conditional execution based on mod indices (requires `mods_logic: DEF_*`)

### Mod conditions (3.5.0.0.0+)

**Requires Iskandert's Utilities `3.5.0.0.0` or newer.**

Same field names as [Suspicious Delivery — Mod and stage gates](Suspicious-Delivery#mod-and-stage-gates-3500000):

- Omitted `mods_logic` = `AND`.
- **`AND` / `OR`** — the macro is **not registered at load** if the mod gate fails. At load, `OR` is treated as `AND`.
- **`DEF_AND` / `DEF_OR`** — always registered; use `mod_conditions` in `if` blocks. When both `conditions` and `mod_conditions` are set, both groups must pass. Only `DEF_OR` is OR for mod indices.

### Parameter Types
- `string`: Any text (greedily captures all remaining text)
- `word`: A single word without spaces
- `int`: An integer number
- `float`/`double`: A decimal number
- `boolean`: true or false
- `target`: Entity selector (@p, @a, @r, @e, @s, @n or player name)
- `static`: Value from a predefined list with autocomplete (like vanilla command arguments)

### Parameter Usage in Commands
Parameters can be used in commands using `#index` notation where index is the parameter's position (0-based).
For example, `#0` refers to the first parameter, `#1` to the second, etc.
You can escape the # character by using ##, which will be converted to a single # in the command.

### Game Stages
The game stages system allows you to lock macros behind progression milestones. There are three types of stages:

- **Player Stages**: Related to individual player progression (default type)
- **World Stages**: Related to global world state or events
- **Team Stages**: Related to the player's team progression

You can specify the stage type using the `stage_type` field in each stage requirement.

### Sub-Command Implementation
You can implement sub-commands using the static parameter type and conditional execution with stages. Here's a complete example of how to create a powerful recursive sub-command system:

```json
{
  "type": "iska_utils:commands_macro",
  "overwritable": false,
  "commands": [
    {
      "command": "sub_command",
      "level": 0,
      "stages_logic": "DEF_AND",
      "stages": [
        {"stage": "sub_command_condition_0", "stage_type": "player", "is": true},
        {"stage": "sub_command_condition_1", "stage_type": "player", "is": true},
        {"stage": "sub_command_condition_2", "stage_type": "player", "is": true},

        {"stage": "sub_command_condition_0", "stage_type": "player", "is": false},
        {"stage": "sub_command_condition_1", "stage_type": "player", "is": false},
        {"stage": "sub_command_condition_2", "stage_type": "player", "is": false}
      ],
      "parameters": [
          {
            "type": "static",
            "list": [
              {"declare": "condition_0"},
              {"declare": "condition_1"},
              {"declare": "condition_2"}
            ]
          }
        ],

      "do": [
      {"if": [
        {"conditions":[3,4,5]},
        {"execute": "iska_lib_stage add player @s sub_command_#0 true"},
        {"delay": 5},
        {"execute": "sub_commad #0"}
      ]},
        {"if": [
            {"conditions": [0]},
            {"execute": "tellraw @s \"condition_0\""},
            {"execute": "iska_lib_stage remove player @s sub_command_#0 true"}
        ]},
        {"if": [
            {"conditions": [1]},
            {"execute": "tellraw @s \"condition_1\""},
            {"execute": "iska_lib_stage remove player @s sub_command_#0 true"}
        ]},
        {"if": [
            {"conditions": [2]},
            {"execute": "tellraw @s \"condition_1\""},
            {"execute": "iska_lib_stage remove player @s sub_command_#0 true"}
        ]}
      ]
    }
  ]
}
```

This advanced pattern works by:
1. Defining a command with a static parameter that offers multiple sub-command options (`condition_0`, `condition_1`, `condition_2`)
2. Using the `DEF_AND` stages logic for deferred evaluation of conditions
3. Leveraging both positive and negative stage conditions:
   - Indexes 0-2: Positive conditions checking if stages are present
   - Indexes 3-5: Negative conditions checking if stages are absent
4. Using recursion for efficient handling:
   - The first `if` block checks if no stages are active (negative conditions)
   - It then adds the appropriate stage and recursively calls itself
   - On the second call, one of the positive condition blocks will match
   - The matching block executes its command and cleans up by removing the stage

The key advantages of this approach:
- Clean recursive implementation that separates stage setting from execution
- Only one stage is active at a time, preventing conflicts
- Tab completion for sub-commands comes built-in
- Easy to add new sub-commands by extending the static list and adding corresponding conditions
- Each sub-command has its own dedicated code block for maximum flexibility

Additionally, you can use the `is` field to create negative requirements:
- `"is": true` (default): The player/world/team MUST have the specified stage
- `"is": false`: The player/world/team MUST NOT have the specified stage

This allows you to create conditions like "player must have stage A but must not have stage B".

### Conditional Execution with IF
The IF action type allows you to conditionally execute commands based on specific stage conditions.
When using `DEF_AND` or `DEF_OR` stage logic, you can use the `if` action type in your `do` array:

```json
{"if": [
    {"conditions": [0, 2]},
    {"execute": "say condition met"}
]}
```

The `conditions` array contains indices that refer to the stages defined in the command's `stages` array.
In the example above, the command will execute only if stages at index 0 and 2 are satisfied.

With `DEF_AND` logic, ALL specified conditions must be met.
With `DEF_OR` logic, ANY ONE of the specified conditions must be met.

## Notes

- Commands are executed in the context of the player who triggered the macro
- If executed by a command block, the position of the command block is used
- Changes require a game restart to apply
- For security reasons, macros are limited to players with the appropriate permission level
- When macros with the same command name are found in multiple files:
  - If a file has `overwritable: false`, its macros cannot be overwritten
  - If a file has `overwritable: true` or no overwritable field, its macros can be overwritten by later files
  - Files are processed in alphabetical order

## Adding Macros

Place your own JSON files under `data/<namespace>/load/iska_utils_macros/` (for example via KubeJS). The jar no longer ships example macros.

## Example Use Cases

### Reload Scripts and Configurations
A macro that reloads various mod systems with appropriate delays between commands.

### Parametrized Commands
Commands like `/echo Hello World` or `/msg player1 Hello there` that take parameters.

### Static Parameter Commands
Custom commands with tab-completion like `/spawnmob zombie` or `/setbiome desert` that provide convenient shortcuts with predefined options.

### Progression-Based Commands
Commands that are only available once players have reached certain milestones or completed specific quests.

### Per-Action Stage Requirements with DEF_AND and DEF_OR

#### DEF_AND Example
Using `DEF_AND` means each action requires ALL of its stage conditions to be met:

```json
{
  "command": "dungeon_rewards",
  "level": 0,
  "stages_logic": "DEF_AND",
  "stages": [
    {"stage": "dungeon_boss_defeated", "stage_type": "player", "is": true},
    {"stage": "dungeon_curse", "stage_type": "player", "is": false},
    {"stage": "dungeon_secret_found", "stage_type": "player", "is": true}
  ],
  "do": [
    {
      "execute": "say Welcome to the dungeon rewards system!"
    },
    {
      "if": [
        {"conditions": [0, 1]},
        {"execute": "give @s minecraft:diamond 5"}
      ]
    },
    {
      "if": [
        {"conditions": [0, 2]},
        {"execute": "give @s minecraft:netherite_ingot 1"}
      ]
    }
  ]
}
```

In this example:
- The first action always executes (no conditions)
- The second action only executes if conditions 0 and 1 are met (player has beaten the boss AND does NOT have the curse)
- The third action only executes if conditions 0 and 2 are met (player has beaten the boss AND found the secret)

#### DEF_OR Example
Using `DEF_OR` means each action requires ANY of its stage conditions to be met:

```json
{
  "command": "guild_benefits",
  "level": 0,
  "stages_logic": "DEF_OR",
  "stages": [
    {"stage": "guild_healer", "stage_type": "player", "is": true},
    {"stage": "guild_tank", "stage_type": "player", "is": true},
    {"stage": "guild_warrior", "stage_type": "player", "is": true}
  ],
  "do": [
    {
      "execute": "say Guild Benefits System Activated!"
    },
    {
      "if": [
        {"conditions": [0]},
        {"execute": "effect give @s minecraft:regeneration 60 1"}
      ]
    },
    {
      "if": [
        {"conditions": [1]},
        {"execute": "effect give @s minecraft:resistance 60 1"}
      ]
    },
    {
      "if": [
        {"conditions": [2]},
        {"execute": "effect give @s minecraft:strength 60 1"}
      ]
    }
  ]
}
```

In this example:
- The first action always executes (no conditions)
- The second action executes if the player has the "guild_healer" stage
- The third action executes if the player has the "guild_tank" stage
- The fourth action executes if the player has the "guild_warrior" stage

The key difference between these examples is how the stage conditions are evaluated for each action:
- With `DEF_AND`, each action requires ALL of its conditions to be met
- With `DEF_OR`, each action requires ANY ONE of its conditions to be met

### Time Cycle Demonstration
A macro that cycles through different times of day with delays between changes.

### Weather Control
A macro that changes weather conditions with appropriate timing.
