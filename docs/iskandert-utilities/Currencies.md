# Currencies (Iskandert's Library)

Team shop currencies are owned by **Iskandert's Library**. The catalog (ids, names, symbols) loads from datapack JSON; balances live on teams via Library (`/iska_lib_team currency …`).

**Iskandert's Utilities** still uses the same currency ids for shop prices, AutoShop, and the in-game shop editor. With Utils installed, the shop loader and editor share this catalog; without Utils, Library alone still exposes currencies for team balances and optional FTB Quests.

## Path

```text
data/<namespace>/load/iska_utils_shop/
```

Built-in default (`null_coin`) ships in the **Library** jar at:

```text
data/iska_utils/load/iska_utils_shop/default_currencies.json
```

Same load path as Utils shop files; the Library jar contributes Utils-namespace data. Packs/KubeJS may use any namespace under `load/iska_utils_shop/`.

Editor workspace (Utils) default folder: `kubejs/data/iska_utils/load/iska_utils_shop` — currencies file `default_currencies.json` is bootstrapped from the Library jar when missing.

## JSON type

| Type | Role |
|------|------|
| `iska_lib:shop_currency` | **Canonical** (new files / editor writes) |
| `iska_utils:shop_currency` | Accepted alias (existing packs keep working) |
| `iska_utils:shop_valute` | Legacy alias |

Before Utilities **3.1.0.0.0**, some files used an unprefixed type; loaders still accept that for compatibility.

```json
{
  "type": "iska_lib:shop_currency",
  "overwritable": true,
  "currencies": [
    {
      "id": "null_coin",
      "name": "shop.currency.null_coin",
      "char_symbol": "∅"
    },
    {
      "id": "emerald",
      "name": "shop.currency.emerald",
      "char_symbol": "💎",
      "priority": 10
    }
  ]
}
```

**Fields:**

- `id` — Unique currency id (referenced by shop entries and team balances)
- `name` — Translation key (Library ships `shop.currency.null_coin`)
- `char_symbol` — Symbol in GUIs / cycle buttons
- `priority` — Optional display order (default `0`; higher = earlier)

## Integration with Utilities Shop

| Piece | Where |
|-------|--------|
| Currency catalog + datapack reload | Library (`ShopCurrencyCatalog`) |
| Team balances / `/iska_lib_team currency` | Library |
| Shop categories & entries | Utilities |
| Shop prices using `currency` ids | Utilities |
| `/iska_utils_shop edit` currencies tab | Utilities (writes `iska_lib:shop_currency`; reads old aliases) |
| Bootstrap `default_currencies.json` | From Library jar into editor work path |
| Live apply | `/reload` (or `/iska_lib_dev reload` / shop reload as documented on [Shop](Shop)) |

When Utils is present it registers as the `ShopCurrencyHooks` listener so team UI and FTB see the same catalog the shop uses.

## Commands

Under **`/iska_lib_team`** (OP level 2 for currency admin):

- `currency list`
- `currency add|remove|set <currencyId> <amount> [team <name>|player <selector>]`
- `currency move <currencyId> <amount> <toTeam> [fromTeam]`

Shop-side: `/iska_utils_shop info` (counts), `/iska_utils_shop balance`, browse filters by currency — see [Shop](Shop).

## FTB Quests (optional, Library 1.10+)

| Type ID | Role |
|---------|------|
| `iska_lib:iska_currency` | Task / reward — team shop currency balance |

Default icon uses the Library `null_coin` texture. Related: `iska_lib:iska_stage` (see stages docs / [Shop](Shop)).

## Related

- [Shop](Shop) — categories, entries, editor, player/AutoShop GUI
- [Home](Home) — command index
