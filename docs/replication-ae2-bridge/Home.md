# Replication AE2 Bridge — Dev Wiki

Developer notes for datapack / KubeJS authors. In-game machines, GUIs, and player guides live in **GuideME**, not here.

This page covers the **Matter Foundry** recipe format and how **custom Replication matter** is handled by the bridge.

---

## Custom matter (Replication KubeJS)

Matter types are registered by **Replication** (KubeJS startup). The bridge does **not** invent matter types.

From **3.0.0.0.0** onward, for every **non-builtin** matter type the bridge does two things automatically:

1. **Reference item** — a dedicated item used only as a handle for JEI / EMI / REI (and drag-and-drop into AE2 slots / filters / patterns). It is **not** real storage by itself.
2. **AE2 key type** — in parallel, the matching **AE2 matter key** (`ReplicationMatterKey`) so terminals, cells, patterns, and buses treat that matter as a first-class AE2 resource.

You do **not** need models, textures, `rep_ae2_bridge_matters.json`, or manual item IDs for custom types.

Builtin Replication types (`earth`, `nether`, `organic`, `ender`, `metallic`, `precious`, `living`, `quantum`) already have dedicated items and are skipped by auto-registration.

### Example (Replication base — KubeJS)

```javascript
// kubejs/startup_scripts/custom_matter.js
StartupEvents.registry('replication:matter_types', event => {
    event.create('crystal')
        .color(0.8, 0.4, 1.0, 0.8)
        .max(5000)

    event.create('plasma')
        .color(0.2, 0.7, 1.0, 1.0)
        .max(10000)
})
```

After this, ids such as `kubejs:crystal` / `kubejs:plasma` work in Foundry recipes and AE2; the bridge creates the reference items and AE2 keys automatically.

---

## Matter Foundry recipes

- Recipe type: `rep_ae2_bridge:matter_foundry`
- Pack authors typically use an **iska_lib-style bundle**: one JSON with an `entries` array; each entry becomes one Foundry recipe.

### Fields (per entry)

| Field | Meaning |
|--------|---------|
| `energy` | FE cost for the craft |
| `inputs` | Up to **5** item inputs (`item` or `tag` + optional `count`) |
| `matter` | List of `{ "matter": "<id>", "amount": <int> }` |
| `output` | `{ "id": "<item>", "count": <int> }` |

`matter` ids are registry ids (e.g. `replication:metallic` or `kubejs:crystal`).

### GUI buffer (X / Y)

When inputs match a recipe, the Foundry GUI shows only the **required** matter types:

- **Y** — amount required by the recipe  
- **X** — amount currently buffered in the machine (Replication network and/or AE2 export). May be `0` or greater than **Y**.

With **no** valid recipe, the matter grid stays empty (the internal buffer can hold more types than the 18 display slots).

### Example bundle

```json
{
  "type": "rep_ae2_bridge:matter_foundry",
  "entries": [
    {
      "energy": 2500,
      "inputs": [
        { "item": "minecraft:copper_ingot", "count": 4 },
        { "tag": "c:gems/fluix", "count": 4 }
      ],
      "matter": [
        { "matter": "replication:metallic", "amount": 50 },
        { "matter": "kubejs:crystal", "amount": 10 }
      ],
      "output": {
        "id": "rep_ae2_bridge:fluixing_replica_alloy",
        "count": 10
      }
    }
  ]
}
```

Place under `data/<namespace>/recipe/` (or your pack’s recipe path). Reload datapacks / restart as usual.

### Single recipe (child format) and KubeJS `event.custom`

A **child** is one array element written as a standalone recipe: the element's fields plus `"type"`, with **no** `recipes` / `entries` / `sources` / `valid_blocks` array. It works both as a datapack file and with KubeJS `event.custom`.

`event.custom` runs **after** Iskandert's Library has split the bundles, so a bundle passed to `event.custom` is **not** expanded: always pass a single child object.

Datapack file (e.g. `data/<ns>/recipe/foundry_glass.json`):

```json
{
  "type": "rep_ae2_bridge:matter_foundry",
  "energy": 1000,
  "inputs": [
    { "item": "minecraft:sand", "count": 1 }
  ],
  "matter": [
    { "matter": "replication:earth", "amount": 10 }
  ],
  "output": { "id": "minecraft:glass", "count": 1 }
}
```

KubeJS:

```js
ServerEvents.recipes(event => {
  event.custom({
    type: 'rep_ae2_bridge:matter_foundry',
    energy: 1000,
    inputs: [{ item: 'minecraft:sand', count: 1 }],
    matter: [{ matter: 'replication:earth', amount: 10 }],
    output: { id: 'minecraft:glass', count: 1 }
  }).id('kubejs:foundry/glass')
})
```

