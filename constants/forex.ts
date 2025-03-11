export const CURRENCY_PAIRS = [
  { id: 'USD_TRY', name: 'USD/TRY', from: 'USD', to: 'TRY' },
  { id: 'EUR_TRY', name: 'EUR/TRY', from: 'EUR', to: 'TRY' },
  { id: 'GBP_TRY', name: 'GBP/TRY', from: 'GBP', to: 'TRY' },
  { id: 'EUR_USD', name: 'EUR/USD', from: 'EUR', to: 'USD' }
]

export interface CurrencyPair {
  id: string
  name: string
  from: string
  to: string
} 