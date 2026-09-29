const BLOCKCHAIN_PRIORITY: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

// Original toFixed() passed no argument, which means 0 digits. 1.25 renders as "1".
const AMOUNT_FRACTION_DIGITS = 0;

const getPriority = (blockchain: string): number =>
  BLOCKCHAIN_PRIORITY[blockchain] ?? -99;

export interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

export interface VisibleBalance extends WalletBalance {
  priority: number;
  formatted: string;
}

export function visibleBalances(
  balances: readonly WalletBalance[],
): VisibleBalance[] {
  return balances
    .flatMap((balance) => {
      const priority = getPriority(balance.blockchain);
      if (priority <= -99 || balance.amount <= 0) return [];
      return [
        {
          ...balance,
          priority,
          formatted: balance.amount.toFixed(AMOUNT_FRACTION_DIGITS),
        },
      ];
    })
    .sort((a, b) => b.priority - a.priority);
}
