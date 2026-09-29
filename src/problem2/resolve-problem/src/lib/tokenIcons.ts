const ICON_FILES: Record<string, string> = {
  RATOM: 'rATOM',
  STATOM: 'stATOM',
  STEVMOS: 'stEVMOS',
  STLUNA: 'stLUNA',
  STOSMO: 'stOSMO',
}

export function iconFile(symbol: string): string {
  return ICON_FILES[symbol] ?? symbol
}
