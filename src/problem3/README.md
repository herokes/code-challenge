# Problem 3: Messy React

The page should list the coins you actually hold, known chains first, with a USD value on each row. The refactor is `WalletPage.tsx`. Filtering, formatting and sorting are the `visibleBalances` function above the component.

`useWalletBalances`, `usePrices` and `classes` stay as they are in the app. `WalletRow` needs one change: it must show a placeholder such as "—" when `usdValue` is `undefined`. None of these are implemented here, and their `declare` lines are erased at compile time.

"Strict" below means TypeScript's `strict` mode. The original has 6 errors under it. ESLint with the recommended TypeScript and React Hooks rules reports 6 problems.

## Computational inefficiencies

- **`prices` is a `useMemo` dependency but is never used inside it.** `react-hooks/exhaustive-deps` reports it as unnecessary. Every price update re-filters and re-sorts every balance. The memo now depends on `balances` only. USD values are a multiplication per row, done at render.
- **`getPriority` is called twice per comparison.** A sort makes O(n log n) comparisons, so this is O(n log n) lookups for n balances. Priority is now looked up once per balance during the filter and kept on the item for the sort.
- **`getPriority` is recreated on every render.** It uses nothing from the component, so the lookup now lives at module scope, where it is created once.
- **`formattedBalances` maps every balance, then is thrown away.** The rows map `sortedBalances` a second time. Formatting now happens once, inside the memoized step.

## Bugs

- **The filter reads `lhsPriority`, which is never declared.** The first balance throws a `ReferenceError`, so nothing renders. The value it meant, `balancePriority`, is computed and ignored.
- **The filter is inverted.** It keeps `amount <= 0` and drops the balances you hold. The refactor keeps a balance when the chain is known and `amount > 0`. It is written as `!(balance.amount > 0)`, so a `NaN` amount is dropped too, because `NaN <= 0` is `false`.
- **`WalletBalance` has no `blockchain` field, but the code reads it.** Strict reports it on all three reads. The refactor adds `blockchain: string`.
- **Rows are built from `sortedBalances`, which has no `formatted` field.** Their callback annotates the item as `FormattedWalletBalance`, a type that isn't true. Strict rejects it (TS2345), and at runtime `formattedAmount` is always `undefined`. Rows now use the formatted list.
- **`toFixed()` with no argument rounds to a whole number.** `0.0034` shows as `"0"` and `1.25` as `"1"`. Amounts now use `Intl.NumberFormat` with up to 8 decimals, so `1234.5` shows as `1,234.5`.
- **A missing price gives `undefined * amount`, which is `NaN`.** Now `usdValue` is `undefined`, so `WalletRow` can show a placeholder. Showing `0` would claim the coin is worthless. The check is `price == null`, because a `null` price would otherwise give `null * amount`, which is `0`.

## Anti-patterns

- **`getPriority(blockchain: any)` turns off type checking for its input.** Chains are now `string`, and priorities are a typed `Map<string, number>`.
- **A `switch` stands in for data.** Adding a chain means adding a `case`. A lookup table keeps priorities in one place.
- **`-99` is a magic value for "unknown chain",** and the filter has to know to test `> -99`. `Map.get` returns `undefined` for an unknown chain, and the filter checks for that.
- **The sort comparator returns nothing when two priorities are equal** (Zilliqa and Neo are both 20). Its type becomes `1 | -1 | undefined`, which strict rejects. At runtime the spec converts `undefined` to `NaN`, treats that as 0, and requires a stable sort, so the order still comes out right. The defect is the type and the reliance on coercion. The comparator is now `b.priority - a.priority`.
- **`key={index}` on a list that gets re-sorted.** React matches rows by position, so after a reorder any row state and DOM nodes follow the position, not the balance. The key is now chain plus currency.
- **`children` is pulled off the props and silently dropped.** The page takes no children now, so passing some is a type error instead.
- **`Props extends BoxProps`, but the props are spread onto a plain `div`.** Box-only props end up on the DOM element. `sx` renders as `sx="[object Object]"`, and camelCase ones such as `alignItems` trigger a React warning. The page now takes `div` props. If callers need Box props, render `<Box {...props}>` instead.
- **The props are typed twice.** `React.FC<Props>` and `(props: Props)` say the same thing, and `interface Props extends BoxProps {}` is empty. The refactor is a plain function with one props type.

## Refactor notes

- **Priorities are unchanged:** Osmosis 100, Ethereum 50, Arbitrum 30, Zilliqa 20, Neo 20. Any other chain is left out, as in the original.
- **Priorities live in a `Map`, not a plain object.** An object lookup would return `Object.prototype.toString` for a chain named `toString`, and that `NaN` priority would scramble the sort.
- **The memo skips the work only when `useWalletBalances()` returns the same array again.** A hook that returns a new array on every call re-sorts every time.
- **Amounts use one `en-US` formatter,** so the server and the browser render the same text. Anything below `0.000000005` still shows as `0`.
- **`usePrices()` is typed so a lookup can be `undefined`.** The compiler then makes the missing-price case visible.
- **The key assumes one balance per chain and currency.** Use a balance id instead if the API provides one.
