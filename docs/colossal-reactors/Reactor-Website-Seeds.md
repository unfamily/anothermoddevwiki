# Reactor Website seeds (`mdcr1` / `mdcr2`)

> **From version 2.5.0.0.0** (`mdcr1`). **`mdcr2` recipe selectors: from 2.6.0.0.0.**

The Reactor Builder **Website** pattern accepts design codes from the [ModDecoded Reactor Calculator](https://moddecoded.com/tools/colossal-reactors/reactor-calculator/) (paste bare code or share URL).

## Formats

```
mdcr1.{n|w}.{u|a|r}.X.Z.Y.palette.cellsB64
mdcr2.{n|w}.{u|a|r}.X.Z.Y.palette.cellsB64
```

| Token | Meaning |
|-------|---------|
| `n` / `w` | Coolant none / water. |
| `u` / `a` / `r` | Fuel uranium / azurite / red cake. |
| `X` `Z` `Y` | Exterior size. |
| `palette` | Comma-separated cell types in first-seen order: `rod`, or a heat sink. **mdcr1**: short id (`gold`, `air`, …). **mdcr2**: recipe selector (`~c:storage_blocks/gold`, `minecraft:air`, …). |
| `cellsB64` | Palette index per interior column `x*(Z-2)+z`, bit-packed LSB first, base64url. |

### Selectors vs short ids

- Tags in seeds use **`~` instead of `#`** (URL-safe). Example: `#c:water` → `~c:water`.
- Short ids come from the optional config table `website.001_heatsink_selector_map`. Without the CSV, non-`air` sinks that are not short aliases encode as **mdcr2** with selectors from heat-sink `valid_blocks` / `valid_liquids`.
- **mdcr2** is used when any palette sink is outside the short-id table.

## Apply on the Reactor Builder

1. Pattern **Website**, paste the seed.
2. Size, rod/heat-sink mask, preferred heat-sink option, and sim fuel/coolant are applied from the design.
3. Selectors resolve by exact datapack match first; short ids use the optional CSV alias.

## Reference code

- `net.unfamily.colossal_reactors.builder.web.ModDecodedReactorDesign`
- `net.unfamily.colossal_reactors.builder.web.BuilderWebsiteDesigns`
- `net.unfamily.colossal_reactors.builder.web.WebsiteSelectorMaps`
