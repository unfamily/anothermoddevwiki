# Stage Items

Restrict items based on player or world stages.

**Path:** any `data/<namespace>/load/…` file with matching `type` (namespace and subfolder are free) — **Library `1.12.0.0.0+`**. Recommended: `load/iska_utils_stage_items/`.

**Type:** canonical `iska_utils:stage_item` (alias `iska_lib:stage_item` also accepted — **Library `1.12.0.0.0+`**).

## JSON File Format

JSON files should follow this format:

```json
{
  "type": "iska_utils:stage_item",
  "overwritable": true,
  "restrictions": [
    {
      "stages_logic": "AND",
      "stages": [
          {"stage_type": "player", "stage": "example_stage", "is": false},
          {"stage_type": "world", "stage": "example_world_stage", "is": false}
      ],
      "containers_whitelist": true,
      "containers_list": [
        "net.namespace.inventory.container.ExampleContainer"
      ],
      "other_case":[
        "right_click",
        "left_click",
        "main_hand",
        "off_hand"
      ],
      "items":[
        "minecraft:example_item",
        "#c:example_tag",
        "@rep_ae2_bridge"
      ],
      "consequence":"block_drop"
    }
  ]
}
```

## Exclude Example

Use the optional `exclude` array to exempt specific items from the rule (same format as `items`):

```json
{
  "type": "iska_utils:stage_item",
  "overwritable": true,
  "restrictions": [
    {
      "stages_logic": "AND",
      "stages": [{"stage_type": "player", "stage": "no_advanced", "is": false}],
      "items": ["@minecraft", "#c:ingots", "iska_utils:dolly"],
      "exclude": ["minecraft:diamond", "#c:ingots/lead", "@iska_utils"],
      "consequence": "drop"
    }
  ]
}
```

Here, diamond, lead (from the tag), and all iska_utils items are exempt and will not be dropped.

## DEF_OR Example

You can use DEF_OR logic to apply different restrictions based on specific conditions:

```json
{
  "type": "iska_utils:stage_item",
  "overwritable": true,
  "restrictions": [
    {
      "stages_logic": "DEF_OR",
      "stages": [
          {"stage_type": "player", "stage": "example_stage", "is": false},
          {"stage_type": "world", "stage": "example_world_stage", "is": false},
          {"stage_type": "player", "stage": "admin", "is": true}
      ],
      "if":[
        {
          "conditions":[0],
          "containers_whitelist": true,
          "containers_list": [
              "net.namespace.inventory.container.ExampleCraftingContainer"
          ],
          "items":[
            "minecraft:diamond_sword"
          ],
          "consequence":"drop"
        },
        {
          "conditions":[1],
          "containers_list": [
              "net.namespace.inventory.container.ExampleChestContainer"
          ],
          "other_case":[
              "right_click",
              "left_click"
          ],
          "items":[
            "minecraft:nether_star"
          ],
          "consequence":"block_delete"
        }
      ]
    }
  ]
}
```

A specific case to apply this to is with a curio item; you can drop/delete the curio item if the player doesn't have the required stage.
The container class for Curios in Minecraft 1.21.1 is `top.theillusivec4.curios.common.inventory.container.CuriosContainer`.
Note that the Curios mod author has a habit of changing the container class name with each Minecraft version update.

## Available Logic Types

- `AND`: All conditions must be true
- `OR`: At least one condition must be true
- `DEF_OR`: Custom logic using the `if` attribute, where any condition set can match
- `DEF_AND`: Custom logic where all conditions in `if` must be true

## Container Filtering

Container filtering is controlled by two parameters:

- `containers_whitelist`: When `true`, only the containers in the list are affected; when `false`, all containers EXCEPT those in the list are affected
- `containers_list`: A list of container class names to include or exclude based on the whitelist setting

## Items List Format

Each entry in the `items` array can be:

- **Item ID**: exact match, e.g. `minecraft:diamond_sword`
- **#tag**: item tag, e.g. `#c:ingots` matches all items in that tag
- **@modid**: all items from a mod, e.g. `@rep_ae2_bridge` matches every item whose namespace is `rep_ae2_bridge`

The optional **`exclude`** array (default empty) uses the same format. Any item matching an exclude entry is exempt from the rule even if it matches `items`. Example: `items` has `@minecraft`, `#c:ingots`, `iska_utils:dolly` and `exclude` has `minecraft:diamond`, `#c:ingots/lead`, `@iska_utils` — then diamond, lead ingots, and all iska_utils items are not affected.

## Other Case Contexts

The `other_case` field allows specifying additional contexts where restrictions should be applied:

- `right_click`: Block right-click usage of the item
- `left_click`: Block left-click usage of the item
- `main_hand`: Apply restriction when item is in main hand
- `off_hand`: Apply restriction when item is in off hand

These are all optional and can be used in any combination, in both regular restrictions and inside `if` conditions.

## Mod conditions (3.5.0.0.0+)

**Requires Iskandert's Utilities `3.5.0.0.0` or newer.**

Each object in `restrictions[]` supports the same mod fields as other load JSON:

| Field | Description |
|-------|-------------|
| `mods` | Without `mods_logic: DEF_*`, **all** conditions must pass at load or the rule is skipped. |
| `mods_logic` | `DEF_AND` / `DEF_OR` — enables `mod_conditions` in `if` branches. |
| `mod_conditions` | Indices into the parent rule's `mods` array (used inside `if`, parallel to `conditions`). |

When both `conditions` and `mod_conditions` are present in an `if` branch, both groups must pass.

## Possible Consequences

- `drop`: Drops the item on the ground
- `delete`: Completely removes the item
- `block`: Blocks usage of the item without removing it (applies to other_case contexts)
- `block_drop`: Blocks usage of the item and drops it (for non-container contexts specified in other_case)
- `block_delete`: Blocks usage of the item and deletes it (for non-container contexts specified in other_case)

## Reloading Configurations

Configurations are loaded at server startup. Reload: `/iska_lib_dev reload` (quick) or `/reload` (full).

## Messages

The system will display a message to the player when an item restriction is applied. This helps players understand why certain items are being removed from containers they access. The message will indicate whether items were dropped, deleted, or blocked based on the restriction settings.
