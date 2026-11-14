# Stage Items

> **Moved** — JSON **stage items** are now documented in **[Another Stages](#/another-stages/Home)**, which takes over item gating when installed (Library skips its item handler to avoid double-filter). Utilities / Library only ever provided stage items and stage actions, JSON only; recipe / block / GUI gating and KubeJS APIs are new in Another Stages.

**History (unchanged JSON surface):**

1. **Iskandert's Utilities** — original `iska_utils:stage_item` (any `data/<ns>/load/**`; recommended `load/iska_utils_stage_items/`).
2. **Iskandert's Library `1.12.0.0.0+`** — alias `iska_lib:stage_item`.
3. **Another Stages** — canonical docs + new fields and KubeJS APIs; legacy types still load.

> **Backward compatibility is JSON only.** Old `iska_utils:` / `iska_lib:` JSON files keep working, but there was never a KubeJS API for stages in Utilities or Library: KubeJS stage scripts (managers, recipe / block / GUI locks) require **Another Stages**.

Canonical docs: [Stage Items](#/another-stages/Stage-Items) · [Recipes](#/another-stages/Stage-Recipes) · [Blocks](#/another-stages/Stage-Blocks) · [Guis](#/another-stages/Stage-Guis)

Historical Utils Stage pages: [Stage-Items](Stage-Items) · [Stage-Actions](Stage-Actions) · [Utils wiki](Home)

Stage **CRUD** (`/iska_lib_stage …`) stays in Library. **[Stage Actions](#/another-stages/Stage-Actions)** moved to Another Stages.
