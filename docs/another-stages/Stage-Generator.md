# Stage Generator

[← Home](Home)

In-game GUI that **builds stage restrictions** (items / recipes / blocks / GUIs) and **writes them to fixed files** on the server game directory (JSON under Library datapack roots, or KubeJS scripts). Ready drafts **autosave** silently; closing shows a reload hint (Shop-style).

| Feature | Since |
|---------|--------|
| Stage Generator GUI + `/edit` | Another Stages 0.1.0.0.0 |
| HOME hub (format switch + area buttons) | Another Stages 0.1.0.0.0 |
| Nested matcher / stage / string entries (Shop-like) | Another Stages 0.1.0.0.0 |
| Matcher entry Shop calibrator `← [slot] →` (id / #tag / @mod from ghost) | Another Stages 0.1.0.0.0 |
| Inventory UI on matcher-entry (player inv + calibrator ghost) | Another Stages 0.1.0.0.0 |
| Off-screen active inv slots so JEI/EMI/REI stay open | Another Stages 0.1.0.0.0 |
| Stage id EditBox + Tab autocomplete | Another Stages 0.1.0.0.0 |
| Bottom action bar; full-width content | Another Stages 0.1.0.0.0 |
| Autosave when Ready (no Save/Copy); silent write | Another Stages 0.1.0.0.0 |
| Close reload hint (`/reload`, `/iska_lib_dev reload`) | Another Stages 0.1.0.0.0 |
| List search bars; ESC/inventory blocked while EditBox focused | Another Stages 0.1.0.0.0 |
| Centered **300×240** (no leftPos shift for recipe viewers) | Another Stages 0.1.0.0.0 |
| Incomplete reason in red above Done; no restriction-id field in editor | Another Stages 0.1.0.0.0 |
| KubeJS Entry-N round-trip (load + rewrite whole category file) | Another Stages 0.1.0.0.0 |
| Known stages catalog (Tab autocomplete; JSON / Kube export) | Another Stages 0.1.0.0.0 |

---

## Open command

Permission level **2+**, player only.

| Command | When |
|---------|------|
| `/another_stages edit` | Always (AS). |
| `/iska_lib_stage edit` | Only if Another Stages registered `StageEditHooks`. |

Single Menu `another_stages:stage_generator` (**300×240**, centered). SubViews of one screen — no nested menus. ACM styling; not shop textures.

---

## UX model

- Form / list use **full panel width** (`LIST_X` … `LIST_RIGHT` ≈ `GUI_WIDTH - 8`). There is **no** empty side column reserved for actions.
- **New / Delete / Done** sit on a **bottom action bar** (no Save/Copy/Edit — rows open on click).
- Ready drafts autosave to disk silently; Incomplete drafts stay session-only until Ready.
- Nested flow: **list → single entry + Done**.
- Dry UI: no “how to click” banners. Labels only when they add info (Incomplete reason above Done, Tab autocomplete on stage ids).
- Restriction **id is never shown or edited** in the GUI (Kube `.id()` is optional and omitted; JSON keeps a silent merge id under the hood).

---

## Layout and recipe viewers

| Rule | Behavior |
|------|----------|
| Centering | GUI is centered at 300×240. **Do not** shift `leftPos` to make room for JEI. |
| Full width | Content (form / scroll list) uses the full inner width. Actions are **not** a right column. |
| Bottom bar | When inventory UI is hidden, list/form end above `BOTTOM_BAR_Y`; New/Done/… are a bottom row. |
| Inventory UI | Drawn **only** on matcher-entry: player inventory at the bottom + Shop-style calibrator ghost in the form row (`← [slot] →`). **Done** sits beside the inventory (`SIDE_BTN_*`). |
| JEI / EMI / REI | Stay fully open beside the GUI. Container slots are **always active** and permanently parked off-screen (`-10000`; `Slot.x/y` are final in 26.x). On matcher-entry the screen **draws and clicks** calibrator ghost + player inv at the visual coordinates. No `leftPos` shift, no JEI exclusion that compresses the panel. |
| Ghost drop | JEI/EMI/REI drag into the calibrator slot works only on matcher-entry. |

---

## Navigation

```
Prefer (optional)
  → HOME (format + area buttons + Known stages)
    → Known stages (list) → entry (type + id) → autosave catalog file
    → Browse (search + list; bottom New/Delete/Done; click row to edit)
      → ENTRY_EDIT (full-width form + bottom Done; autosave when Ready)
        … nested …
  → HOME Done/ESC → Close reload hint → Close
        → Matchers / Exclude / Inputs / Blocked items (list)
          → Matcher entry (← [slot] → calibrator + inv; Done beside inv)
        → Stages list
          → Stage entry (EditBox + Tab suggest)
        → Tooltips / Recipes / Menus /Slots / … (list)
          → String entry (EditBox + Done)
        → Cases (fixed toggles + bottom Done)
```

### Done (single exit control)

Each nested view has **Done** on the bottom bar (or beside inv on matcher-entry) to go up. No spare `Back` buttons in scroll content.

### HOME

Format switch JSON ↔ KubeJS + buttons Items / Recipes / Blocks / Guis. Path warning for the active export root. No inventory UI.

### Browse

Restrictions of the chosen category; **search** bar filters by summary (first matcher / recipe target / menu / stage). Bottom **New / Delete / Done** (no Edit — open a row by clicking it). Rows: icon + summary + Ready/Incomplete. Open loads the on-disk file for the active format (JSON or Kube) so entries are editable, not append-only.

### Search

Browse, matcher lists, stages list, and string lists (tooltips / recipes / menus / slots / …) have a search box above the list (`contains`, case-insensitive). Query clears when changing view.

### EditBox / ESC / inventory key

While any form EditBox (including search) is focused: **inventory key** does not close the GUI; **ESC** only unfocuses the box (does not navigate/close). Same idea as Shop `MachineGuiInput`, implemented locally in AS.

### ENTRY_EDIT

Fixed form (columns) + nav buttons with counts, **full width**. **Never** shows inventory UI. **No restriction-id field.**

When Incomplete: a **red** reason line sits **immediately above** the bottom **Done** bar (what is still missing: stage, matchers, cases, mimic, …). When Ready: no red line; the draft **autosaves** silently (no Save/Copy, no chat spam). Leaving the editor (Done / ESC) also autosaves when Ready.

### Close / reload hint

Leaving HOME (Done or ESC) shows an **Apply changes** screen (Shop-style) explaining `/reload` and `/iska_lib_dev reload` (and KubeJS script reload when that export mode is used). **Close** exits the GUI.

### Matchers (and Exclude / Inputs / Blocked items)

List of `item` / `#tag` / `@mod` strings with search. Bottom New / Delete / Done. Open a row → matcher entry.

**Matcher entry:** Shop-style calibrator row `← [slot] → [EditBox]` (same pattern as ShopEdit resource selector / Deep Drawer filter variants):

1. Drop an item into the **slot** (from player inv or JEI/EMI/REI) — that stack is the calibrator.
2. Variants are built from the stack: plain **item id**, every **`#tag`** that contains it, then **`@mod`** when the namespace is not `minecraft`.
3. **← / →** cycle those variants into the EditBox (and the matcher string). Typing in the box still works for hand-written values.
4. Player inventory is always shown on this view; **Done** sits beside it.

Booleans use a **true/false** chip (green / **red**). Multi-mode fields (consequence, recipe viewer, stage type) cycle with left/right click.

**Priority** (all categories): integer EditBox on the entry editor (default `0`). Higher wins when several rules overlap — see [Overlapping-Restrictions](Overlapping-Restrictions). Exported as JSON `priority` / Kube `.priority(n)` when non-zero.

### String lists (Tooltips / Recipes / Recipe types / Exclude recipes / Menus / Menu types / Blocked slots)

Same nesting: list → **string entry** (EditBox + bottom Done). Blocked slots accept an integer string.

### Stages

List of `type | id | is`. Bottom New / Delete / Done. Open row → stage entry:

- cycle type player/world/team (left/right click)
- toggle `is` (true/false; red when false)
- **EditBox** for stage id with **Tab / Shift+Tab** autocomplete from `ClientStageCache` ∪ session ids
- No inventory UI; bottom Done

### Cases

Fixed toggle form + bottom Done. Full width, no inventory UI.

---

## Completion (Save gating)

| Category | Ready when |
|----------|------------|
| ITEM | ≥1 named stage; ≥1 matcher; ≥1 case (or cases all) |
| RECIPE | ≥1 named stage; ≥1 of outputs / recipes / types / inputs |
| BLOCK | ≥1 named stage; ≥1 block matcher; non-empty mimic |
| GUI | ≥1 named stage; ≥1 menu_type or menu |

---

## Fixed write paths / load

Open GUI loads by export preference:

| Prefer | Load | Save / delete |
|--------|------|----------------|
| JSON | `stage_generator_*.json` under first `bootstrap.datapack_paths` | Merge/replace by silent `id`; delete by `id` |
| KubeJS | `kubejs/server_scripts/another_stages/stage_generator_*.js` | **Rewrite whole category file** in Entry-N format; delete by `//Entry` index |

### KubeJS file format (canonical)

```js
// # Warning! Don't Remove comments with # or this file can't be open by generator.
// # Dont' Remove This Line:
AnotherStagesEvents.restrictions(event => {

  //Entry 0
  event.items.restrict()
    .logicAnd()
    .stages([ ... ])
    .items([ ... ])
    ...

  //Entry 1
  ...

// # Dont' Remove This Line:
})
```

- One wrapper per file; many `//Entry N` bodies.
- **No** `.id(...)` (optional at runtime; generator never emits it).
- Save of one Ready draft: parse file → replace/append that entry → rewrite the whole file.
- Delete: remove that Entry index, renumber, rewrite.

JSON path: first `iska_lib` `bootstrap.datapack_paths` → `…/another_stages/load/stage_generator_*.json`.

---

## Known stages (Tab catalog)

HOME → **Known stages**: list of `{ stage_type, stage }` rows for command Tab autocomplete.

| Export preference | File |
|-------------------|------|
| JSON | `…/another_stages/load/stage_generator_known_stages.json` with `"type": "iska_lib:known_stages"` |
| KubeJS | `kubejs/server_scripts/another_stages/stage_generator_known_stages.js` calling `AnotherStages.registerStage(...)` |

| | |
|--|--|
| **What it does** | Registers ids in Library `StageCatalog` (typed) so `/iska_lib_stage add player …` Tab is not empty for script-only stages |
| **Does *not* do** | Does not grant stages; no `/register_stage` command |

See [Stage-Runtime — registerStage](Stage-Runtime#binding--registerstage-tab-catalog).

---

## What it does *not* do

- Does not apply restrictions live without reload.
- Does not write inside `.zip` packs.
- Does not expose or require a restriction `id` in the editor (Kube omits `.id()`; JSON id is silent merge-only).
- Does not hide, shrink, or leftPos-shift for JEI/EMI/REI.
- Does not show inventory UI outside matcher-entry.
- Does not use a separate Item/#Tag/@Mod type button — the calibrator slot + ← → provide those forms.
- Does not reserve an empty right column for actions (actions are bottom / beside inv).
- `DEF_*` / complex `when` — hand-write; see [Stage-Items](Stage-Items) (branch combination) and [Stage-Actions](Stage-Actions) / [Command Items](#/iskandert-utilities/Command-Items) / [Command Macros](#/iskandert-utilities/Command-Macros) (per-`if` indices).
