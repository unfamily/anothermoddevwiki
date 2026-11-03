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
| Gas ducts / `mek_gas` | Live when Mek loaded | **`GAS_SUPPORT_ENABLED = false`** in `MekanismChemicalCompat` |
| Heat ducts / `mek_heat` | Live when Mek loaded | **`HEAT_SUPPORT_ENABLED = false`** in `MekanismHeatCompat` |

Builtin gas/heat `declare_duct` JSON still carries `neoforge:conditions` → `mod_loaded` `mekanism`. On 26.x the Java gates keep chemical/heat transport out of the registry path even if a datapack is present.

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
| **JEI** | Ghost ingredients into filter UI |
| **FTB Ultimine** | Mass-break only: same logical duct type on the same connected network (Project Duct: same scaffold network). Does **not** mass-place. |

## Hard dependencies

None beyond **NeoForge**.
