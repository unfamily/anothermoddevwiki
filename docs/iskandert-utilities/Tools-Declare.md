# Tool JSON (Iskandert's Library)

**Requires: Iskandert's Library `1.12.0.0.0+`**

JSON tools are **startup scripts**: each entry creates a Library item `iska_lib:<id>` and binds AOE behavior. **New ids require a full game restart** — `/reload` only refreshes AOE overlays for items already registered. Item stats are applied at registration (startup); changing them needs a restart.

**Owner:** Iskandert's Library.

## Path

- Any `data/<namespace>/load/…` with matching `type` (also scanned at mod construction from configured bootstrap datapack paths)
- Recommended: `load/iska_lib_tools/`
- Sidecar (one tool per file): `iska_lib/tools/`

## Type

Root field (required): `"type": "iska_lib:tools"`

## Example

```json
{
  "type": "iska_lib:tools",
  "id": "super_pick",
  "behavior": "paxel",
  "range": 1,
  "durability": 1000,
  "mining_speed": 12.0,
  "attack_damage": 7.0,
  "attack_speed": -2.8,
  "enchantability": 22,
  "incorrect_for_drops": "minecraft:incorrect_for_netherite_tool",
  "repair": "#minecraft:netherite_tool_materials",
  "fire_resistant": true,
  "rarity": "epic",
  "harvest_tags": ["minecraft:mineable/pickaxe", "minecraft:mineable/axe", "minecraft:mineable/shovel"]
}
```

Creates `iska_lib:super_pick`. Provide client assets under `assets/iska_lib/` (26+: also `items/<id>.json`).

There is **no `tier` field**. Harvest level is the block tag `incorrect_for_drops` (vanilla examples: `minecraft:incorrect_for_wooden_tool`, `…_stone_tool`, `…_iron_tool`, `…_diamond_tool`, `…_netherite_tool`, and on 26+ `…_copper_tool` / `…_gold_tool`).

## Fields

| Field | Description |
|-------|-------------|
| `type` | `iska_lib:tools` (required) |
| `id` | Path-only or `iska_lib:<path>` (required). **Other mod namespaces are Java-only** |
| `behavior` | `lumberjack`, `excavator`, `scythe`, or `paxel` (required) |
| `range` | AOE radius; default `1` |
| `harvest_tags` | Optional block tags for AOE filter (`#` optional) |
| `durability` | Max damage the item can take (vanilla max durability). Omit = `250`. `-1` = unbreakable. Example: `1000` = 1000 damage points. AOE extras cost 1 damage each (vanilla); unbreakable skips AOE wear |
| `incorrect_for_drops` | Block tag for harvest level (required for meaningful mining). Omit = `minecraft:incorrect_for_iron_tool` |
| `mining_speed` | Mining speed. Omit = `6.0` |
| `attack_damage` | Total mainhand attack damage. Omit = behavior default |
| `attack_speed` | Attack speed modifier (e.g. `-2.8`). Omit = behavior default |
| `enchantability` | Enchantability. Omit = `14` |
| `repair` | `#namespace:tag` or `namespace:item`. Omit = iron ingot / iron tool materials |
| `disable_blocking` | Seconds shields are disabled on hit (26+). Omit = `0` |
| `fire_resistant` | `true` / `false`. Omit = `false` |
| `rarity` | `common`, `uncommon`, `rare`, `epic` |

## Behaviors

- **lumberjack** — connected logs above the broken block
- **excavator** — cube (pickaxe/shovel by default)
- **paxel** — cube (pickaxe/axe/shovel by default)
- **scythe** — horizontal disk (crops/flowers/hoe by default)

## Java API

Binds AOE to **any existing item id** (any mod) without creating an item. Item-stat fields do not apply.

```java
ToolBehaviorLoader.register(
        ResourceLocation.fromNamespaceAndPath(YourMod.MOD_ID, "my_paxel"),
        ToolBehaviorType.PAXEL,
        1);
```

## Bootstrap paths

External JSON is merged at **mod construction** from Library config `bootstrap.datapack_paths` (KubeJS, Open Loader, Global Packs, datapacks). Zip packs are read in place.

## Reload

`/reload` refreshes AOE overlays only. **New ids or item-stat changes need a restart.**
