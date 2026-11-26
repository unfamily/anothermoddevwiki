# Declare Module

**Type:** `another_dynamics:declare_module`  
**Legacy type (still accepted):** `another_dynamics:declare_upgrade`  
**Path:** `data/<namespace>/load/**/*.json`  
**Reload:** `/reload`

Defines effects for a **module item id** when inserted into a duct face module slot.

Builtin items: `another_dynamics:inc_module_0` … `inc_module_4` (Increment Modules I–V).

## Stacking rules

When multiple modules contribute modifiers (normally one slot / mutually exclusive):

| Operator | Behavior |
|----------|----------|
| `set` | Best (highest) `set` wins |
| `add` | Summed |
| `mult` | Multiplied |

Energy/heat quantity uses the same operators under `extract` / `quantity`.

**Note:** Energy action interval is fixed in code (1 tick); heat interval is fixed (5 ticks). `rate` keys on those kinds do not change that cadence. Module effects for energy/heat apply from **any face** on the block.

## Minimal example

```json
{
  "type": "another_dynamics:declare_module",
  "id": "another_dynamics:inc_module_0",
  "affects": [
    {
      "for": "item",
      "quantity": { "set": 16 },
      "filter": {
        "allow": { "add": 6 },
        "deny": { "add": 6 },
        "allow_hybrid": { "add": 3 },
        "deny_hybrid": { "add": 3 }
      },
      "speed": { "mult": 0.9 },
      "rate": { "mult": 0.75 }
    },
    {
      "for": "energy",
      "extract": { "mult": 2.5 },
      "rate": { "mult": 0.75 }
    }
  ],
  "stack": 1,
  "max_slots": 1,
  "incompatible_with": [
    "#another_dynamics:increment_modules"
  ]
}
```

## Top-level fields

| Field | Description |
|-------|-------------|
| `id` | Module item id (must match a registered item that the game treats as a duct module) |
| `stack` | Max stack size metadata for definition (default 64) |
| `max_slots` | How many of this module may occupy slots (default 1) |
| `incompatible_with` | Array of item ids or `#tags` that conflict |
| `incompatibility_activation` | Threshold for incompatibility checks (default 1; typo alias `incompatibiliy_activation`) |
| `matching_item_tags` | Optional `#tag` list: stacks in those tags count as this module when they lack a declaration component (KubeJS-only items, etc.) |
| `affects` | Array of per-transport effect objects |

## `affects[].for`

| `for` | Quantity field | Notes |
|-------|----------------|-------|
| `item` | `quantity` | + optional `rate`, `speed`, `seq_stack`, `filter` |
| `fluid` | `quantity` | + `rate`, `speed`, `seq_stack`, `filter` |
| `gas` | `quantity` | Mek chemicals; + `rate`, `speed`, `seq_stack`, `filter` |
| `energy` | **`extract`** (not `quantity`) | + `rate`, `speed` |
| `heat` | `quantity` | + `rate`, `speed` |

### Quantity / extract / rate / speed / seq_stack objects

Each may contain any of:

```json
{ "set": 64, "add": 0, "mult": 0.5 }
```

- Lower `rate` / `speed` **mult** = faster actions / travel (values are multipliers on the duct base).
- `speed` mult `0.0` is used on the top module for near-instant travel.
- **`seq_stack` (Sequential Stacks)** — present from **1.3.0.0.0**. Uses the same `set` / `add` / `mult` operators. Raises how many extract/retrieve shipments fire per rate tick (default 1 without support). Builtin III/IV/V use `set` 2 / 4 / 8.
- **`seq_stack` key aliases** (same modifiers; first non-empty wins): `seq_stack`, `seq_stacks`, `sequential_stack`, `sequential_stacks`, `seq`, `seqs`, `stack`, `stacks`.


### Filter slot modifiers

Under `affects[].filter`:

```json
"filter": {
  "allow": { "add": 6 },
  "deny": { "add": 6 },
  "allow_hybrid": { "add": 3 },
  "deny_hybrid": { "add": 3 }
}
```

Only `add` (and stacking via set/mult if present) is used in shipped modules.

## Builtin progression (shipped stats)

| Item | Display | Role |
|------|---------|------|
| `inc_module_0` | I | Mild quantity / filter / FE boost; heat `set` 400 |
| `inc_module_1` | II | Stronger quantity / filters / FE; heat `set` 8000 |
| `inc_module_2` | III | Large filter banks; Sequential Stacks `set` 2; FE ×100; heat `set` 100000 |
| `inc_module_3` | IV | Fluid/gas 256k; Sequential Stacks `set` 4; FE ×250000; heat `set` 100000 |
| `inc_module_4` | V | Instant travel; Sequential Stacks `set` 8; max-int style caps (incl. heat) |

All are tagged `#another_dynamics:increment_modules` and list that tag under `incompatible_with`.

## Pack tips

- To add a module: register the item in Java (or your item API), add `declare_module` JSON, recipes, models, and tag membership.
- To rebalance: override the same `id` via datapack priority.
