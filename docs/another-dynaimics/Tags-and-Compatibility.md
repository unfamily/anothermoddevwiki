# Tags and Compatibility

## Item tags

### `#another_dynamics:increment_modules`

Members: `inc_module_0` … `inc_module_4`. Used for mutual exclusion in `incompatible_with` and creative/tooling groupings.

Path: `data/another_dynamics/tags/item/increment_modules.json`

### Wrench tags (common)

Any item in these tags can disconnect/reconnect duct arms like the Bulky Wrench:

- `#c:wrench`
- `#c:tools/wrench`
- `#c:wrenches`
- `#c:tools/wrenches`

## Cable Facades

Compatibility with Cable Facades covers: you can hide ducts behind facades from that mod. When you convert Project Duct into a real duct, the facade cover is kept and is not dropped as an item.

## Mekanism

| Feature | 1.21.1 | 26.1.2 |
|---------|--------|--------|
| Gas ducts / `mek_gas` | Live when Mek loaded | Live when Mek loaded (`GAS_SUPPORT_ENABLED = true`; version-locked Mek in Gradle) |
| Heat ducts / `mek_heat` | Live when Mek loaded | Live when Mek loaded (`HEAT_SUPPORT_ENABLED = true`; version-locked Mek in Gradle) |

Builtin gas/heat `declare_duct` JSON still carries `neoforge:conditions` → `mod_loaded` `mekanism`. If Mek is missing, `mek_gas` / `mek_heat` `can_transport` rows are skipped with a warning.

## Iskandert's Library (`iska_lib`)

| Feature | 1.21.1 | 26.1.2 |
|---------|--------|--------|
| Unknown Flux duct transport (`dec: unknown_flux`) | Soft dep: skipped without `iska_lib` | Same |

Optional local JAR (`libs/iska_lib-1.14.0.1.0.jar`) for compile/runtime dev; `neoforge.mods.toml` lists `iska_lib` as optional. Rays use `iska_lib:unknown_flux_hit` (tint `#2b576c`). No builtin AD duct JSON ships this lane in 1.3.0.1.0.

Radioactive chemical routing is controlled per duct entry via `move_radioactive`.

## Pipez

| Feature | 1.21.1 | 26.1.2 |
|---------|--------|--------|
| Whole-pipe → Settings Copier import | Soft dep | Soft dep |
| Pipez upgrade filter import | Soft dep | Soft dep |
| Pipez Retriever face mapping | When Retriever mod present | **`RETRIEVER_SUPPORT_ENABLED = false`** in `PipezPipeSettingsImport` |

Import is **one-way** (Pipez → Settings Copier). The mod never writes Pipez NBT from AD.

## Other soft deps

| Mod | Role |
|-----|------|
| **iska_lib** | Unknown Flux logistics + ray particles (optional) |
| **JEI** | Ghost ingredients into filter UI |
| **FTB Ultimine** | Mass-break only: same logical duct type on the same connected network (Project Duct: same scaffold network). Does **not** mass-place. |

## Hard dependencies

None beyond **NeoForge**.
