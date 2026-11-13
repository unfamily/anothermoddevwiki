# Another Config Manager

Another Config Manager (ACM) opens NeoForge `ModConfigSpec` trees: browse sections, edit values with a dirty session, Save/Undo, CSV tables for string lists, and declared color editors.

## Commands

| Command | Effect |
|---------|--------|
| `/another_config_manager config` | Always opens the **mod browser** (searchable list of **all loaded mods**). Title and `modId · version` stay normal. Mods **without** a NeoForge TOML config show a red third line (`No TOML config` / `Non ha config in TOML`); row click does not open an editor (status uses `no_configs`). |
| `/another_config_manager config <modId>` | Opens that mod: native factory if present (including NeoForge `ConfigurationScreen`), else ACM UI. Claimed mods always ACM. |

Requires permission level **2**. Server-type configs still need an integrated host.

## Opening policy

When opening a mod from the **command** (`config <modId>`) or a **browser row click**:

1. **Claimed** mods (toml `another_config_manager=true`, or `ConfigOpener.claim(modId)`) always use the **ACM UI**.
2. Otherwise, if the mod registered an `IConfigScreenFactory` (including NeoForge `ConfigurationScreen`), that **native** screen is used.
3. Else ACM UI is the fallback.

Claimed mods also get an ACM `IConfigScreenFactory` early at client setup so Mod Menu / Configured leave them alone.

ACM does **not** overwrite NeoForge’s (or other mods’) `ConfigurationScreen` factories.

### Mods button (title / pause)

| Flag | Effect |
|------|--------|
| `replace_mods_button` = **false** (default) | **Mods** opens NeoForge Mod List as usual. |
| `replace_mods_button` = **true** | **Mods** opens the **ACM mod browser**. |

Does not change the Config button inside NeoForge Mod List. `/another_config_manager config` is **not** gated by this flag.

On the **config type screen** (COMMON / CLIENT / SERVER list for a mod), a **Mods** button opens the same browser.

## Config types and editing

| Type | Typical file | Notes |
|------|--------------|-------|
| `common` | `*-common.toml` | Shared |
| `client` | `*-client.toml` | Client |
| `server` | `*-server.toml` | World/server; open/edit gated |
| `startup` | `*-startup.toml` | Early load |

Save commits **only dirty values**, then reloads the config file (live update without resetting untouched entries).

If any dirty value uses NeoForge `gameRestart()` / `worldRestart()`, Save (and Save from the unsaved-leave dialog) first shows a **restart warning** listing only the **top-level category names** (e.g. `mixins`), not every key. Continue writes the file; the live cached values still apply only after the required pack/game restart. ACM does not invent its own restart annotation — it reads NeoForge `ValueSpec.restartType()`.

---

## Defaults vs override (CSV and Color)

| Level | Who | Where | Manager list UI |
|-------|-----|-------|-----------------|
| **Default** | Your mod code at boot (`CsvRuleRegistry.register` / `ColorRuleRegistry.register`) | In-memory registry | **Hidden** — not listed in toml managers |
| **Override** | Packmaker / player | Root keys `csv_manager` / `color_manager` | Visible; **wins** over default for the same target |
| **Declare** | Player on **other** mods | Same lists via **Declare CSV** / **Declare Color** / select-channels | Appears after declare |

Soft hex hints may suggest Declare; they never write bindings alone.

---

## Pack / player: CSV editing

String lists without a schema open as a plain list. **Declare CSV** (separator box, default `;`, up to 8 characters) writes an override into ACM `csv_manager`.

Optional **soft CSV view** toggles a lighter table preview without changing the binding.

### Binding line format

```text
{len}{SEP}{rulePath};{modId}:{type}:{configPath};{colDef0};{colDef1};...
```

- `{len}` — decimal length of `{SEP}`
- `{SEP}` — next `len` characters (column separator for that list)
- `{rulePath}` — optional rule id / path block
- target — `modId:type:configPath`
- following fields — column definitions (`0+`, `0=key`, …), optionally typed

### Typed columns

```text
[type:{cellType}[:key=value...];]{index}[=label|+|+=label]
```

Examples:

```text
type:color_r_int;0+=Red
type:color_hex:order=rgb:prefix=0x;0=tint
```

| cellType | Notes |
|----------|-------|
| `color_r_int` / `color_g_int` / `color_b_int` / `color_a_int` | Channel 0–255 |
| `color_*_float` / `color_*_percent` | 0–1 or 0–100 scales |
| `color_hex` | Hex cell; see hex dialect |
| `color_int_packed` | Packed int / `0x…` string; `order` default `argb` |
| `string` / `int` / `float` / `bool` / `long` | Generics (default = string) |

### Table structure ops

In the CSV table (subject to the active rule):

- **Move cell** — same row, between allowed columns
- **Move / insert / delete column** — insert in the middle when the rule is open (`N+` / `N+=`) or when editing a `csv_manager` override; closed built-in schemas without `+` disallow insert

---

## Colors

### Hex dialect

**Read** accepts bare hex, `#`, `0x` / `0X` (aggressive strip). Digits: 3/4 (nibble expand), 6 (`rgb`), 8 (`argb` or declared `order`).

**Write** uses declared `prefix=` (`none` \| `#` \| `0x`), `order=`, `case=`.

Channel **order** is never guessed: default binding order is **`argb`**; use `rgb` for three-channel layouts.

### Color binding (non-CSV paths)

```text
{storage};{order};{modId}:{type}:{primaryPath};{extra...}
```

| storage | Meaning |
|---------|---------|
| `hex` | String hex |
| `int` | Packed int |
| `csv` | Components in one list/string (`{len}{SEP}` prefix like CSV bindings) |
| `paths` | Separate config values (e.g. three ints 0–255) |

**Declare Color** on a value, or **Select color channels** from the category menu (multi-select sibling values without opening each parameter) writes into `color_manager`.

Your own mods register defaults with `ColorRuleRegistry.register` (hidden from the manager list).

Picker UI uses Library’s shared HSV widget.

---

## Developer API

### Register a default CSV schema (no toml write)

```java
CsvRuleRegistry.register(
    "my_mod",
    "section.my_list",
    ";my_mod:section/my_list;0=my_mod.config.csv.key;type:color_hex:order=rgb:prefix=none;1=my_mod.config.csv.color"
);
```

Optional type overload: `register(modId, ModConfig.Type.COMMON, path, ruleString)`.

### Register a default color rule

```java
ColorRuleRegistry.register("my_mod", ModConfig.Type.CLIENT, "theme.accent", "hex;rgb;prefix=none");
```

### Claim ACM UI for your mod

In `neoforge.mods.toml`:

```toml
[modproperties.my_mod]
another_config_manager=true
```

Or at runtime: `ConfigOpener.claim("my_mod");`

### Open programmatically

```java
ConfigOpener.open("my_mod");
ConfigOpener.open("my_mod", true);                   // prefer ACM over ConfigurationScreen
ConfigOpener.open("my_mod", ModConfig.Type.COMMON);
ConfigOpener.openModBrowser();
```

### ACM common toml (root keys)

| Key | Default | Meaning |
|-----|---------|---------|
| `csv_manager` | `[]` | CSV override bindings |
| `color_manager` | `[]` | Color override bindings |
| `replace_mods_button` | `false` | Title/pause Mods → ACM browser |
| `soft_csv_view` | `false` | Soft CSV table toggle default |

---

## Mod browser

`/another_config_manager config` always opens a searchable list of **all loaded mods** (not only mods with registered configs).

- Rows show mod logo (when available), display name, `modId · version` (always normal styling — no gray/strikethrough on the title).
- If the mod has **no** NeoForge TOML config, a **red** third line shows `No TOML config` (EN) / `Non ha config in TOML` (IT); otherwise that line is empty.
- Click a row with configs → `ConfigOpener.open(modId)`.
- Click a row without configs → no-op; optional status message `commands.another_config_manager.config.no_configs`.
- Empty list (no mods loaded) → `browser.empty` (`No mods loaded.` / `Nessuna mod caricata.`).
