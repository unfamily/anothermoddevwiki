# Overlapping restrictions

[← Home](Home)

## What this page covers

When **two or more** stage restriction rules match the **same target** (same block / item / recipe / menu) and their stage conditions are active at the same time, Another Stages must pick which rule “wins” for exclusive effects (mimic, JEI mode, hidden name, GUI message, …).

This page documents that **resolution flow** and the shared **`priority`** field.

It does **not** teach matchers or stage conditions — use:

- [Stage Items](Stage-Items)
- [Stage Recipes](Stage-Recipes)
- [Stage Blocks](Stage-Blocks)
- [Stage Guis](Stage-Guis)

---

## Resolution flow

Numbered runtime path (all four systems share the same idea):

1. **Load** restrictions from Kube (`AnotherStagesEvents.restrictions` / legacy managers) and datapack JSON (`another_stages:stage_*` and legacy item types).
2. At runtime, **collect candidates** whose matchers hit the target (block id / item / recipe / menu).
3. **Filter by stage conditions** (`stages` + `stages_logic`). Rules whose stages do not apply are dropped.
4. If **zero** candidates remain → unlocked / no lock for that check.
5. If **one** remains → that rule applies (`priority` is irrelevant).
6. If **several** remain → sort by **`priority` descending** (default `0`). **Higher wins.** Equal priority → **load / registration order** (stable; **no crash**, silent pick).

Craft / process lock on recipes still blocks if **any** stage-active rule matches (a lower-priority rule cannot “unlock” a higher one). `priority` decides **which exclusive presentation** wins (JEI mode, badge corner, …).

---

## `priority` field reference

| | |
|--|--|
| **Kube** | `.priority(n)` on `event.items` / `.recipes` / `.blocks` / `.guis` builders |
| **JSON** | `"priority": n` on each restriction object |
| **Default** | `0` if omitted |
| **Accepted values** | Any `int` (negative allowed; still “higher wins”) |
| **What it does** | Among stage-active overlapping rules, selects the **winner** for exclusive effects (see per-system notes). |
| **How it combines** | Compared **across** rules only. Does **not** replace `stages_logic` AND/OR **inside** one rule. Does **not** merge mimics / messages — one winner. |
| **Side effects** | Server + client evaluation paths both respect it. Stage Generator JSON/Kube export round-trips non-zero values. |
| **What it does *not* do** | Does **not** merge two mimics into one. Does **not** require `registerStage` for ids listed in `.stages([...])` — those ids are already contributed to the Tab catalog. Does **not** enable `DEF_*` on recipes/blocks/guis. Omit it when only one rule can apply. |

| Feature | Since |
|---------|--------|
| `priority` / `.priority(n)` on items, recipes, blocks, guis | Another Stages 1.0.0.0.0 |

---

## When you need it

Use `priority` only when **several rules can be active at once** on the same target and the winner would otherwise depend on opaque load order.

If matchers or stage conditions already make rules mutually exclusive, leave `priority` at the default `0`.

---

## Simple example (blocks)

Two rules on `minecraft:iron_block`. Both can apply when the player has **neither** `stage_a` nor `stage_b`; then `priority(10)` wins (redstone mimic).

```js
// No registerStage: ids in .stages([...]) are already contributed to the Tab catalog.
AnotherStagesEvents.restrictions(event => {
  event.blocks.restrict()
    .id('pack:iron_as_redstone')
    .priority(10)
    .logicAnd()
    .stages([{ stage_type: 'player', stage: 'stage_a', is: false }])
    .blocks(['minecraft:iron_block'])
    .mimic('minecraft:redstone_block')
    .camouflage(true)

  event.blocks.restrict()
    .id('pack:iron_as_lapis')
    .priority(0) // default; written for clarity
    .logicAnd()
    .stages([{ stage_type: 'player', stage: 'stage_b', is: false }])
    .blocks(['minecraft:iron_block'])
    .mimic('minecraft:lapis_block')
    .camouflage(true)
})
```

**Manual check**

| Player stages | Active rules | Visible mimic |
|---------------|--------------|---------------|
| none | both | **redstone** (`priority` 10) |
| `stage_a` only | lapis rule | lapis |
| `stage_a` + `stage_b` | none | real iron |
| none again | both | redstone |

Commands: `/iska_lib_stage add player @s stage_a` (and `stage_b`). Same API exists on items / recipes / guis.

---

## Per-system notes

| System | Winner semantics |
|--------|------------------|
| **Blocks** | Single winner: mimic, camouflage, unbreakable, messages, tooltips from the highest-`priority` active rule. |
| **Recipes** | Craft/process stays locked if **any** active rule matches. JEI `recipe_viewer` / overlay corner / exclusive presentation use the highest-`priority` rule. |
| **Guis** | Sorted by priority; message / primary close feedback prefer the highest-`priority` `block_open` rule. Slot / item gates may still OR across active rules. |
| **Items** | Priority picks **primary** for exclusive presentation (viewer mode, hidden name). Some effects (cases, consequences) may still **stack** across active rules. |

---

## See also

- [Stage Items](Stage-Items)
- [Stage Recipes](Stage-Recipes)
- [Stage Blocks](Stage-Blocks)
- [Stage Guis](Stage-Guis)
- [Home](Home)
