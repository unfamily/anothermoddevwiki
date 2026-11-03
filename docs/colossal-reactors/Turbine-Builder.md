# Turbine Builder (from **2.6.0.0.0** modes)

GUI for sizing the turbine shell, choosing rod pattern / blade variant, dual coil materials, and simulating RF/steam before build.

Formula reference: [ModDecoded Turbine Calculator](https://moddecoded.com/tools/colossal-reactors/turbine-calculator/) (site is not edited by this mod pack docs).

## Rod patterns (cycle order)

| Mode | Role |
|------|------|
| **Website** | Paste [mdct1/mdct2 seed](turbine-website-seeds); rod mask + ring from design. |
| **Flow** | Single primary rod column (classic). |
| **HyperFlow** | Multi-rod layout = site **bestLayout**; no Chebyshev neighbor blade pre-cap (2.6). |
| **Custom** | Player-placed rod controllers / columns. |
| **None** | No auto rods. |

Blade variant: **Efficient** / **Productive** (growth profile). Coil layers are clamped to fit shell height.

## Dual coils (from **2.6**)

- **Zone coil** — material for most coil-zone cells.
- **Rod-column coil** — material on columns above Turbine Rod Controllers (steam **flow** average); other cells still drive **coilEff** (RF).

On Website pattern, changing either control rewrites the seed (`mdct2` when they differ or the coil is outside the short-id CSV table; mdct2 fields use recipe selectors with `~` for tags). See [Turbine Website Seeds](turbine-website-seeds) and [Turbine Elec Coils](turbine-elec-coils).

## Tag materials / auto-build

Coil recipes that use **block tags** (`#c:storage_blocks/gold`, …) accept any matching block in the builder buffer. Auto-build **places that buffer block** (and consumes it). It does not force the first member of the tag. Solid heat sinks on the Reactor Builder already followed the same rule.

## Simulation

Builder sim uses the same coil average as validation (`min(avg coe, avg max)`, air at `emptyCoil` unless legacy) and a HyperFlow/Website blade dry-run aligned to in-game placement (wall cap only, occupancy collisions). Steam / RF scale with **flowEff** from 2.6.

## Reference code

- `net.unfamily.colossal_reactors.turbine.TurbineBuildLogic`
- `net.unfamily.colossal_reactors.turbine.TurbineBuilderMetrics`
- `net.unfamily.colossal_reactors.client.gui.TurbineBuilderScreen`
