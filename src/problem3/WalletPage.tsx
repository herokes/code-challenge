import { useMemo, type ComponentProps, type ReactElement } from "react";
import { visibleBalances, type WalletBalance } from "./visibleBalances";

// From the app. These declarations are erased at compile time.
interface WalletRowProps {
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}

declare function useWalletBalances(): readonly WalletBalance[] | undefined;
declare function usePrices(): Readonly<Record<string, number>>;
declare const WalletRow: (props: WalletRowProps) => ReactElement;
declare const classes: { readonly row: string };

type WalletPageProps = Omit<ComponentProps<"div">, "children">;

export function WalletPage(props: WalletPageProps) {
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(
    () => visibleBalances(balances ?? []),
    [balances],
  );

  const rows = sortedBalances.map((balance) => {
    const price = prices[balance.currency];
    const usdValue = price == null ? 0 : price * balance.amount;
    return (
      <WalletRow
        className={classes.row}
        key={`${balance.blockchain}:${balance.currency}`}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    );
  });

  return <div {...props}>{rows}</div>;
}
