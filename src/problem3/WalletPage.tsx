import { useMemo, type ComponentProps, type ReactElement } from "react";

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface VisibleBalance extends WalletBalance {
  priority: number;
  formatted: string;
}

interface WalletRowProps {
  className?: string;
  amount: number;
  usdValue: number | undefined;
  formattedAmount: string;
}

declare function useWalletBalances(): readonly WalletBalance[];
declare function usePrices(): Readonly<Partial<Record<string, number>>>;
declare const WalletRow: (props: WalletRowProps) => ReactElement;
declare const classes: { readonly row: string };

const BLOCKCHAIN_PRIORITY = new Map<string, number>([
  ["Osmosis", 100],
  ["Ethereum", 50],
  ["Arbitrum", 30],
  ["Zilliqa", 20],
  ["Neo", 20],
]);

const amountFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 8,
});

function visibleBalances(
  balances: readonly WalletBalance[],
): VisibleBalance[] {
  return balances
    .flatMap((balance) => {
      const priority = BLOCKCHAIN_PRIORITY.get(balance.blockchain);
      if (priority === undefined || !(balance.amount > 0)) return [];
      return [
        {
          ...balance,
          priority,
          formatted: amountFormat.format(balance.amount),
        },
      ];
    })
    .sort((a, b) => b.priority - a.priority);
}

type WalletPageProps = Omit<ComponentProps<"div">, "children">;

export function WalletPage(props: WalletPageProps) {
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(() => visibleBalances(balances), [balances]);

  const rows = sortedBalances.map((balance) => {
    const price = prices[balance.currency];
    const usdValue = price == null ? undefined : price * balance.amount;
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
