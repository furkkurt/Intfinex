const API_KEY = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY
const BASE_URL = 'https://v6.exchangerate-api.com/v6'

// Add error handling for missing API key
if (!API_KEY) {
  console.error('Exchange Rate API key is not configured')
}

export interface ForexQuote {
  fromCurrency: string
  toCurrency: string
  exchangeRate: number
  lastRefreshed: string
  timeZone: string
}

export async function getRealTimeForexRate(fromCurrency: string, toCurrency: string): Promise<ForexQuote> {
  try {
    const response = await fetch(
      `${BASE_URL}/${API_KEY}/pair/${fromCurrency}/${toCurrency}`
    )
    
    const data = await response.json()
    
    if (data.result === 'error') {
      throw new Error(data['error-type'])
    }

    return {
      fromCurrency: data.base_code,
      toCurrency: data.target_code,
      exchangeRate: data.conversion_rate,
      lastRefreshed: new Date(data.time_last_update_unix * 1000).toISOString(),
      timeZone: 'UTC'
    }
  } catch (error) {
    console.error('Forex API Error:', error)
    throw error
  }
}

export interface TimeSeriesData {
  timestamp: string
  open: number
  high: number
  low: number
  close: number
}

// For time series, we'll need to use a different approach since ExchangeRate-API doesn't provide historical data in free tier
export async function getForexTimeSeries(fromCurrency: string, toCurrency: string): Promise<TimeSeriesData[]> {
  try {
    // For demo, we'll generate some fake historical data based on the current rate
    const currentRate = await getRealTimeForexRate(fromCurrency, toCurrency)
    const data: TimeSeriesData[] = []
    const now = new Date()
    
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() - i * 3600000).toISOString()
      const baseRate = currentRate.exchangeRate
      const variance = baseRate * 0.002 // 0.2% variance
      
      data.push({
        timestamp,
        open: baseRate + (Math.random() - 0.5) * variance,
        high: baseRate + Math.random() * variance,
        low: baseRate - Math.random() * variance,
        close: baseRate + (Math.random() - 0.5) * variance
      })
    }
    
    return data.reverse()
  } catch (error) {
    console.error('Time Series API Error:', error)
    throw error
  }
}

// Simulated time series data since the free API doesn't provide historical data
export function generateMockTimeSeriesData(baseRate: number) {
  const data = []
  const now = Date.now()
  for (let i = 0; i < 24; i++) {
    const timestamp = now - (i * 3600000) // hourly data points
    const variance = baseRate * 0.002 // 0.2% variance
    data.push({
      timestamp,
      value: baseRate + (Math.random() - 0.5) * variance
    })
  }
  return data.reverse()
} 