# Turbine Website seeds (`mdct1` / `mdct2`)

> **From version 2.5.0.0.0** (`mdct1`). **`mdct2` + rod-column coil / recipe selectors: from 2.6.0.0.0.**

The Turbine Builder **Website** pattern accepts design codes from the [ModDecoded Turbine Calculator](https://moddecoded.com/tools/colossal-reactors/turbine-calculator/) (paste bare code or share URL). The calculator is the formula reference; this page documents what Colossal Reactors reads.

## Formats

```
mdct1.X.Z.Y.{f|c}.ring.coil.coilLayers.{a|o}.steam.rodsB64
mdct2.X.Z.Y.{f|c}.ring.coil.rodCoil.coilLayers.{a|o}.steam.rodsB64
```

| Token | Meaning |
|-------|---------|
| `X` `Z` `Y` | Exterior casing size (blocks), inclusive. |
| `f` / `c` | Blade profile: **full** (same ring every layer) / **climb**. |
| `ring` | Design blade-ring cap (Website / HyperFlow target). |
| `coil` | Zone coil: **mdct1** short id (`gold`, `air`, …); **mdct2** recipe selector (`~c:storage_blocks/gold`, `minecraft:air`, …). |
| `rodCoil` | (**mdct2 only**) Coil on columns above rod controllers; same token rules as `coil`. |
| `coilLayers` | Coil layers above the closure deck (1–63). |
| `a` / `o` | Fill flag: all zone / one block. **Builder always fills the whole zone** (`a`); `o` is decoded but ignored on import (ModDecoded builder contract). |
| `steam` | mB/t hint or `-` (uncapped). |
| `rodsB64` | One bit per interior cell `x*(Z-2)+z`, LSB first, base64url. |

### Selectors vs short ids

- In **mdct2**, materials are datapack selectors. Tags use **`~` instead of `#`** (so share URLs are not cut at `#`). Example: datapack `#c:storage_blocks/gold` → seed `~c:storage_blocks/gold`. Plain block ids stay as `minecraft:…`.
- In **mdct1**, only short ids from the optional config table `website.000_coil_selector_map` (plus `air`). That CSV is an **alias table**, not required: without it, non-`air` coils encode as **mdct2** with selectors resolved from `elec_coils` `valid_blocks`.
- Decode accepts both short ids and selectors in mdct2 fields (same as the calculator’s `coilTok`).

**When is mdct2 used?** When zone coil ≠ rod-column coil, **or** the zone coil is not a short CSV/mdct1 id. Same short material on both → mdct1. Cycling zone / rod-column coil in the builder rewrites the seed accordingly.

## Apply on the Turbine Builder

1. Pattern **Website**, paste code into the design field.
2. Exterior size, rod mask, climb profile, blade ring cap, coil layers, zone coil, and rod-column coil are set from the seed (selectors match `valid_blocks` exactly; short ids use the optional CSV).
3. Build / sim fill the **entire** coil zone (ignore `o`).

See also [Turbine Builder](turbine-builder) and [Turbine Elec Coils](turbine-elec-coils).

## Reference code

- `net.unfamily.colossal_reactors.builder.web.ModDecodedTurbineDesign`
- `net.unfamily.colossal_reactors.builder.web.BuilderWebsiteDesigns`
- `net.unfamily.colossal_reactors.builder.web.WebsiteSelectorMaps`
