# Another Stages

> **Under construction** — packdev docs are incomplete and may change.  
> **Mod beta:** `0.1.0.0.0` — NeoForge / Minecraft **26.1.2** and **1.21.1**.

Stage gating for pack developers (items, blocks, recipes, GUIs, dimensions, and more).

**Requires:** [Iskandert's Library](https://www.curseforge.com/minecraft/mc-mods/iskanderts-library) + Another Config Manager.

## Heritage

Stage **item** gating did **not** start here:

1. **Iskandert's Utilities** — original datapack surface (`iska_utils:stage_item`, …). Historical pages: [Stage-Items](#/iskandert-utilities/Stage-Items) (and other `Stage-*` on the [Utils wiki](#/iskandert-utilities/Home)).
2. **Iskandert's Library** — shared stage registry / CRUD (`/iska_lib_stage`), free `load/` paths + `iska_lib:` type aliases (**Library `1.12.0.0.0+`**).
3. **Another Stages** — owns item / recipe / block / GUI **gating** when installed; Library skips its item handler to avoid double-filter. Pre-AS JSON `type` values still work under any `data/<ns>/load/**`.

Stage **CRUD** (add/remove/list/…) stays on Library. **JSON stage actions** are documented here: [Stage-Actions](Stage-Actions). This mod adds gating + packdev APIs (Kube managers, JEI, …).

Kube **runtime** (`stageChanged`, mutators, `registerStage`, `call_action` §cJSON ONLY§r): **[Stage-Runtime](Stage-Runtime)**.

## Packdev docs

Prefer **KubeJS** `AnotherStagesEvents.restrictions(e => { e.items… / e.recipes… / e.blocks… / e.guis… })` in `server_scripts`. Legacy top-level `AnotherStages.items` / `.recipes` / `.blocks` / `.guis` still work. Datapack JSON remains fully supported. Stage **queries + mutators** (`AnotherStages.playerHasStage` / `addPlayerStage` / …) and `registerStage` — see [Stage-Runtime](Stage-Runtime) and [Stage-Items § bindings](Stage-Items#3-stage-bindings-query--mutate). React to stage add/remove with `AnotherStagesEvents.stageChanged` ([Stage-Runtime](Stage-Runtime)).

**Datapack tip:** any folder under `data/<ns>/load/` is fine if `"type"` matches; recommended subfolders are conventions only. Bundle many rules in one JSON (`restrictions` array). Library `bootstrap.datapack_paths` (KubeJS / Open Loader / Global Packs / zips) are scanned at bootstrap.

- [Stage Runtime](Stage-Runtime) — `stageChanged`, mutators, `registerStage`, `call_action` §cJSON ONLY§r
- [Stage Actions](Stage-Actions) — JSON actions run on stage add/remove (`iska_utils:stage_actions`)
- [Stage Items](Stage-Items) — managers → datapack → queries (migrated from Utils / Library)
- [Stage Recipes](Stage-Recipes) — [full support](Stage-Recipes#compatibility-list-full-support) + [vanilla path coverage](Stage-Recipes#vanilla-path-coverage)
- [Stage Blocks](Stage-Blocks)
- [Stage Guis](Stage-Guis) — menu open / force-close / slots
- [Stage Generator](Stage-Generator) — in-game Menu (`/another_stages edit`) → fixed JSON/Kube files (+ known stages catalog)

| Version | Support Status |
|--------|---------------|
| 26.1.2 | Supported |
| 1.21.1 | Supported |
| 1.20.1 | Not Supported |
| Older Versions | Not Supported |

**26.1.2 vs 1.21.1:** same packdev JSON/Kube surface on both lines. Internals differ where Neo 21.1 / recipe APIs differ (e.g. result lookup via `HolderLookup.Provider`).

### Feature matrix (mod `0.1.0.0.0` on 26.1.2 and 1.21.1)

| Area | Notes |
|------|--------|
| Items | Migrated Utils→Library→AS; managers + JSON; AS adds `recipe_viewer`, `hide_item_name` / `hidden_item_name`, `cases`/`other_case` (+ `inventory`), `can_pickup` |
| Recipes | New in AS (Library bridge API); managers + JSON matchers; JEI hide/overlay |
| Blocks | New in AS; managers + JSON; `mimic` + `camouflage`; Jade; `stop_tick` (dangerous opt-in) |
| Guis | New in AS; managers + JSON; close on open; slot gates |
| Stage Generator | `/another_stages edit` (+ Library `edit` if AS); Menu+ghost+tables; fixed-path JSON/Kube save; known-stages catalog |
| Jade | Optional; stage_block mimic/unknown + stage_item rename/hardcore |
| Hardcore item | `another_stages:stage_locked_hardcore` always hidden from JEI/EMI/REI |
| Kube binding | `AnotherStages` only |
| Stage Runtime | `stageChanged`, mutators, `registerStage(type,id)`, `call_action` §cJSON ONLY§r — [Stage-Runtime](Stage-Runtime) |

## Contributing

Pull requests that integrate **additional mods** into recipe/process path coverage are **greatly appreciated**. Merged work will be **credited** to the contributor. Issue requests still help prioritize what lands next; PRs that ship a working gate (and docs on [Stage-Recipes](Stage-Recipes) when relevant) are especially welcome.

## Commands

Stage CRUD stays in Library: `/iska_lib_stage …`  
Another Stages mirror: `/another_stages …` (same CRUD via redirect)  
Manual stage actions (**§cJSON ONLY§r**): `/iska_lib_stage call_action …` and `/another_stages call_action …` — see [Stage-Runtime](Stage-Runtime)  
Stage Generator GUI: `/another_stages edit` (and `/iska_lib_stage edit` when AS is installed) — see [Stage Generator](Stage-Generator)
