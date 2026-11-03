# Another Dynamics — Pack Developers Documentation

This wiki documents **datapack APIs**, tags, config, and version gates for pack makers and integrators. It is **not** a player guide (see the CurseForge / Modrinth description for that).

Authors: Unfamily, Iskandert · Loader: **NeoForge only**.

## Notices

| Minecraft | Mod version | Notes |
|-----------|-------------|--------|
| **1.21.1** | **1.1.0.0.0** | Mekanism gas/heat and Pipez Retriever import work when those mods are present. |
| **26.1.2** | **1.0.0.0.0** | Code for Mekanism gas/heat and Pipez Retriever remains, but **runtime gates are off** until those APIs ship for this MC. |

- **1.20.1 and older** are not supported.
- Reload: vanilla `/reload` reloads `data/*/load/**/*.json` duct and module definitions.
- Typo aliases in JSON are accepted where noted (`disabled_feathures`, `connect_with_compatbile`, `declare_upgrade`, `special:upgrades` → `special:modules`).

## Load pipeline

| Pipeline | Scanned path | Purpose |
|----------|--------------|---------|
| **Load data** | `data/<namespace>/load/**/*.json` | `another_dynamics:declare_duct`, `another_dynamics:declare_module` |

Builtin examples:

- `data/another_dynamics/load/duct/*.json`
- `data/another_dynamics/load/module/increment_module_*.json`

Any namespace under `load/` is scanned; folder names are arbitrary (`duct` / `module` are conventions only).

## Table of Contents

1. [Declare Duct](Declare-Duct)
2. [Declare Module](Declare-Module)
3. [Tags and Compatibility](Tags-and-Compatibility)
4. [Configuration](Configuration)

## Index

| Page | `type` / topic | Typical location |
|------|----------------|------------------|
| [Declare Duct](Declare-Duct) | `another_dynamics:declare_duct` | `data/<ns>/load/**/*.json` |
| [Declare Module](Declare-Module) | `another_dynamics:declare_module` (legacy `declare_upgrade`) | `data/<ns>/load/**/*.json` |
| [Tags and Compatibility](Tags-and-Compatibility) | Item tags, wrench, facades, Mek/Pipez gates | `data/*/tags/…` + Java flags |
| [Configuration](Configuration) | Common config `dev` / `logistics` | `another_dynamics-common.toml` |

## Builtin transport kinds (`can_transport[].dec`)

| `dec` | Meaning |
|-------|---------|
| `item` | Items |
| `fluid` | Fluids (mB) |
| `forge_energy` | Forge Energy (FE) |
| `mek_gas` | Mekanism chemical (skipped if Mek chemical API unavailable / gated) |
| `mek_heat` | Mekanism heat (skipped if Mek heat API unavailable / gated) |

## Shipped balance (overview)

- Ducts: item, fluid, flux, gas, heat, universal.
- Increment modules **I–V** (`inc_module_0` … `inc_module_4`), including heat `quantity` / rate modifiers on `heat_duct` (`module_slots: 1`).
