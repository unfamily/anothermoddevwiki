# Stage Actions

> **Moved** — JSON-only **stage actions** (`iska_utils:stage_actions` / `iska_lib:stage_actions`) are now documented in **[Another Stages](#/another-stages/Home)**.

**History (unchanged JSON surface):**

1. **Iskandert's Utilities** — original `iska_utils:stage_actions` (recommended `load/iska_utils_stage_actions/`).
2. **Iskandert's Library `1.12.0.0.0+`** — any `data/<ns>/load/…` path + alias `iska_lib:stage_actions`.
3. **Another Stages** — canonical docs; legacy types still load.

> **Backward compatibility is JSON only.** Old `iska_utils:` / `iska_lib:` JSON files keep working, but there was never a KubeJS API for stages in Utilities or Library: KubeJS stage scripts (managers, recipe / block / GUI locks) require **Another Stages**.

Canonical docs: [Stage Actions](#/another-stages/Stage-Actions) · [Stage Runtime](#/another-stages/Stage-Runtime)
