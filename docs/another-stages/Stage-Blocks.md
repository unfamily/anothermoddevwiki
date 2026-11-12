# Stage Blocks

[← Home](Home)

Lock blocks (break / look / loot) behind stages. Locked blocks can **mimic** another block for client appearance and/or loot. **Jade** (optional) disguises the looked-at block the same way.

Block gating is **new in Another Stages** (not a Utils → Library migrate). Stage CRUD still comes from Library.

| Feature | Since |
|---------|--------|
| Datapack `another_stages:stage_block` | Another Stages 0.1.0.0.0 |
| `mimic` / `unbreakable` / messages / tooltips | Another Stages 0.1.0.0.0 |
| KubeJS `AnotherStages.blocks` | Another Stages 0.1.0.0.0 |
| KubeJS `AnotherStagesEvents.restrictions` (preferred) | Another Stages 0.1.0.0.0 |
| Client mimic mesh (`AddSectionGeometry` + `RenderShape.INVISIBLE`) | Another Stages 0.1.0.0.0 |
| `camouflage` (visual vs loot-only) | Another Stages 0.1.0.0.0 |
| Jade disguise | Another Stages 0.1.0.0.0 |
| `stop_tick` (DANGEROUS / best-effort) | Another Stages 0.1.0.0.0 |
| `mimic_mining` / `.disableMimicMining()` | Another Stages 0.1.0.0.0 |

---

## 1. KubeJS (preferred)

Prefer **`AnotherStagesEvents.restrictions`**. Legacy `AnotherStages.blocks.restrict()…` still works.

```js
AnotherStagesEvents.restrictions(event => {
  event.blocks.restrict()
    .id('pack:locked_ores') // optional
    .logicAnd()
    .stages([
      { stage_type: 'player', stage: 'bronze_age', is: false },
    ])
    .blocks(['minecraft:diamond_ore', '#c:ores']) // also @modid / regex:pattern
    .exclude(['minecraft:coal_ore'])
    .mimic('minecraft:stone')
    .camouflage(true) // default; false = keep real look, still swap loot
    // .disableMimicMining() // default on: dig/harvest as mimic; call to keep real-block mining
    .unbreakable(true)
    // .stopTick(true) // DANGEROUS: freeze BE + scheduled + random ticks (prefer world stages)
    .breakMessage(true) // opt-in default lang key (omitted = silent)
    // .breakMessage(false) // silent
    // .breakMessage('message.another_stages.block_locked') // lang key
    // .breakMessage('You cannot break this yet') // literal (not translated)
    // .breakMessage(Text.translate('pack.msg.ore_locked')) // formatted Text
    .tooltip(Text.of('Locked until bronze age'))
    .hideDefaultTooltips(false)
})
```

Auto-id: `another_stages:kjs/block/<fingerprint>`.

### Feedback messages (Kube)

Always one of:

| Call | Effect |
|------|--------|
| omitted / `""` / `.breakMessage(false)` | **Silent** (no action-bar) |
| `.breakMessage(true)` | Default lang key `message.another_stages.block_locked` |
| `.breakMessage('message.another_stages.block_locked')` | **Lang key** — dotted, no spaces → translated |
| `.breakMessage('You cannot break this')` | **Literal** — shown as-is, **not** translated |
| `.breakMessage(Text.translate('…'))` / `Text.of('…')` | Formatted Kube `Text` / `Component` (priority over string) |

Same overloads exist for `.interactMessage(...)`.

JSON string channel uses the same lang-key vs literal heuristic. Prefer Kube `Text` when you need colors / style.

---

## 2. Datapack (JSON)

| `type` | Notes |
|--------|--------|
| `another_stages:stage_block` | Canonical |

**Path:** any `data/<namespace>/load/**/*.json` with matching `type` (recommended `another_stages_blocks/` optional). Prefer **bundling**: one file, many entries in `restrictions`.

```json
{
  "type": "another_stages:stage_block",
  "restrictions": [
    {
      "stages_logic": "AND",
      "stages": [
        { "stage_type": "player", "stage": "bronze_age", "is": false }
      ],
      "blocks": ["minecraft:diamond_ore", "#c:ores"],
      "exclude": ["minecraft:coal_ore"],
      "mimic": "minecraft:stone",
      "camouflage": true,
      "mimic_mining": true,
      "unbreakable": true,
      "break_message": "message.another_stages.block_locked",
      "tooltips": ["Locked until bronze age"],
      "hide_default_tooltips": false
    }
  ]
}
```

### Method / field reference

| Kube | JSON | Default | What it does |
|------|------|---------|--------------|
| `.logicAnd()` / `.logicOr()` | `stages_logic` | `AND` | How stage conditions combine: `AND` or `OR` only. |
| `.stages([...])` | `stages` | empty (= always apply if matchers hit) | `{ stage_type, stage, is }`. `is` default `false` = lock while stage **missing**. |
| `.blocks([...])` | `blocks` / `block` | empty | Matchers: block id, `#tag`, `@modid`, `regex:<pattern>`. |
| `.exclude([...])` | `exclude` | empty | Never lock these blocks for this rule. |
| `.mimic('id')` | `mimic` | `minecraft:stone` | Loot replacement always; client mesh only if `camouflage` is true. Dig/harvest when `mimic_mining` is on. |
| `.camouflage(bool)` | `camouflage` | `true` | See **camouflage** below. |
| `.disableMimicMining()` / `.mimicMining(bool)` | `mimic_mining` | `true` | See **mimic_mining** below. Prefer `.disableMimicMining()` to opt out. |
| `.unbreakable(bool)` | `unbreakable` | `false` | Break speed 0 + cancel break while the rule applies. Wins over `mimic_mining`. |
| `.stopTick(bool)` | `stop_tick` | `false` | **DANGEROUS** — see detail below. |
| `.breakMessage(true\|false\|string\|Text)` | `break_message` | **silent** (omit / `""`); `true` → lang default | Action-bar on break attempt. Lang key **or** literal; Kube `Text` preferred for formatting. |
| `.interactMessage(true\|false\|string\|Text)` | `interact_message` | silent | Same string/`Text` rules as break (reserved interact feedback). |
| `.tooltip(Text…)` | (component tooltips) | none | Extra client tooltip line (Kube only). |
| `.tooltips([...])` | `tooltips` | empty | String tips: lang key (dotted, no spaces) **or** literal. |
| `.hideDefaultTooltips(bool)` | `hide_default_tooltips` | `false` | Clear default tips before custom ones. |

### `mimic` (detail)

| | |
|--|--|
| **What it does** | While the rule applies: **loot** and **block XP** use this block’s drops/`getExpDrop` (via `BlockDropsEvent.setDroppedExperience`). If `camouflage` is true, client also draws this block’s mesh. If `mimic_mining` is true, dig speed / harvest also use this block. |
| **Default** | `minecraft:stone` |
| **Accepted values** | Block registry id string |
| **How it combines** | Per active rule; first matching rule wins for that block |
| **Side effects** | Loot + XP are **server-side** (`BlockDropsEvent`). Ore mimicking stone drops stone loot and **0 XP**. Visuals (when camouflage on): hides the real mesh (`RenderShape.INVISIBLE`) and injects mimic geometry via `AddSectionGeometryEvent`. Break-crack overlay, hit sparks, and destroy-burst particles use the mimic model (1.21.1 + 26). Chunks rebuild when stages sync. Jade shows the mimic when camouflage is on. |
| **What it does *not* do** | Does **not** change collision, hitbox, outline, or server block state. With `camouflage: false` it does **not** hide the real look. Config `mixins.block_appearance` gates the client mixins. With `unbreakable: true` break speed is 0, so cracks may never advance. Does **not** rewrite XP from other sources (mob farms, bottles, etc.). |

### `mimic_mining` / `.disableMimicMining()` (detail)

| | |
|--|--|
| **What it does** | While the rule applies and `unbreakable` is false: **break speed** (`PlayerEvent.BreakSpeed`) and **harvest/tool** (`PlayerEvent.HarvestCheck`) use the `mimic` block instead of the real block. Example: diamond ore mimicking stone breaks like stone (hand / wood pick). |
| **Default** | `true` (omit / absent = on). |
| **Accepted values** | JSON boolean. Kube: `.disableMimicMining()` sets false; `.mimicMining(bool)` also accepted. |
| **How it combines** | Independent of `camouflage` (visual-only). **`unbreakable` wins**: speed 0 + no harvest regardless of `mimic_mining`. Does not change loot (loot always uses `mimic`). |
| **Side effects** | Server + client dig feedback. Re-entry guarded so nested dig-speed events on the mimic itself are not rewritten again. |
| **What it does *not* do** | Does **not** change collision, block state, or client mesh (that is `camouflage`). Does **not** replace loot by itself (loot always swaps to `mimic` while the rule is active). With `false`, players mine the **real** hardness/tool requirements while still getting mimic loot / optional camouflage. |

### `camouflage` (detail)

| | |
|--|--|
| **What it does** | `true` = hide real mesh + draw `mimic` (and Jade shows mimic). `false` = keep real appearance; loot still uses `mimic`; Jade shows the **real** block clearly. |
| **Default** | `true` |
| **Accepted values** | boolean |
| **How it combines** | Independent of `unbreakable` / messages; only gates visual / Jade mimic path |
| **Side effects** | Client mesh + appearance + break overlay/particles; Jade ray-trace rewrite when true |
| **What it does *not* do** | Does not disable loot swap or unbreakable. With `false`, Jade does **not** hide name/id. |

### `break_message` / `.breakMessage` (detail)

| | |
|--|--|
| **What it does** | Sends an action-bar message when the player tries to break a locked block |
| **Default** | **Silent** when omitted |
| **Accepted values** | `true` (default lang key), `false` / `""` (silent), string lang key, string literal, Kube `Text`/`Component` |
| **How it combines** | Kube `Text` wins over string; blank string disables |
| **Side effects** | Server → client action-bar (`sendSystemMessage(..., true)`) |
| **What it does *not* do** | Does not cancel break by itself (use `unbreakable`); literals are **not** looked up in lang files |

### `stop_tick` / `.stopTick` (detail) — DANGEROUS / best-effort

| | |
|--|--|
| **What it does** | While the rule is active: skip **BlockEntity** ticks (`LevelChunk.BoundTickingBlockEntity`), **scheduled** `tickBlock` / `tickFluid`, and **random** block/fluid ticks at that position. |
| **Default** | `false` (opt-in only). |
| **Accepted values** | boolean. |
| **How it combines** | Requires an active rule (`findActiveRule` with `player == null` for autonomous ticks). Prefer `stage_type: world` (or `is: false` world locks). Player/team stages without a subject usually do **not** match → no freeze. |
| **Side effects** | Server-only. Can soft-lock machines, leave energy mid-cycle, break anim/sync. Config `mixins.block_stop_tick` (default true) disables all stop_tick mixins if a compat crash occurs. |
| **What it does *not* do** | Does **not** stop client-only logic, packet-driven machines, or mod tick loops outside vanilla BE/scheduled/random. Not a universal freeze. Does not change collision or camouflage. |

---

## 3. Jade (optional)

With Jade installed:

- Rule active + `camouflage: true` → tooltip/icon as the **mimic** block
- Rule active + `camouflage: false` → real block shown clearly (name / mod / id unchanged)

---

## 4. Queries (exceptional)

```js
if (AnotherStages.playerHasStage(player, 'bronze_age')) { /* … */ }
AnotherStages.addPlayerStage(player, 'bronze_age') // see Stage-Items bindings
if (AnotherStages.teamHasStage(player, 'team_unlock')) { /* … */ }
```

Full table: [Stage Items → Query](Stage-Items#3-stage-bindings-query--mutate).

---

## Reload

- `/iska_lib_dev reload` — Utils quick reload **and** AS stage JSON + Kube soft-reload
- `/iska_lib_stage reload` or `/another_stages reload` — datapack restrictions
- `/kubejs reload server_scripts` — all KubeJS stage rules
- `/reload` — full datapack reload
