# Problem 3: Messy React

The page should list coins you actually hold, known chains first, with a USD value on each row. The page is `WalletPage.tsx`. Filtering and sorting are `visibleBalances.ts`. Hooks, `WalletRow`, and `classes` stay as they are in the app.

## Bugs

- Filter reads `lhsPriority`, which is never declared, so the first balance throws and nothing renders.
- After that name is fixed, the filter still keeps `amount <= 0` and drops positive balances.
- `formattedBalances` is built and ignored. Rows map `sortedBalances`, so `formattedAmount` is always undefined.
- Sort returns nothing when priorities match (Zilliqa and Neo are both 20). That becomes `NaN`, and the order is up to the engine.
- `WalletBalance` has no `blockchain`, but the code reads it. Unknown chain falls through to `-99` and gets dropped.
- `toFixed()` with no digits turns `1.25` into `"1"`. The new code passes `0` on purpose, same display as before.
- A missing price is `undefined * amount`, which is `NaN`. Missing price is treated as `0`.
- `children` is pulled off props and never rendered.
- `BoxProps` is spread onto a `div`, so non-DOM props land on the element.
- `key={index}` sticks to position. After a sort, React reuses the wrong row. Key is chain plus currency, which assumes one row for that pair.

## Wasted work

- `prices` is a `useMemo` dependency and is never used inside it, so every price change re-filters and re-sorts.
- `getPriority` is recreated every render and called twice per comparison. It now sits next to a lookup table and runs once per balance.
- Two `.map` passes, and the first result is discarded. `visibleBalances` filters and formats together, then sorts.

## Rewrite

- Same priorities: Osmosis 100, Ethereum 50, Arbitrum 30, Zilliqa 20, Neo 20. Anything else is left out.
- Keep a row when the chain is known and the amount is greater than 0. Higher priority comes first.
- Sort depends only on balances. USD value is calculated in `rows` when the page renders.
- The memo skips the sort only when `useWalletBalances()` returns the same array again. A new array on every call sorts every time.
- `useWalletBalances`, `usePrices`, `WalletRow`, and `classes` are not implemented here. The `declare` lines are erased at compile time.
