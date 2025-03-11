import { useState, useEffect } from 'react'

// Define types
export interface ForexData {
  timestamp: number
  price: number
  volume: number
  pair: string
}

export function useForexData() {
  const [data, setData] = useState<ForexData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // For now, return mock data
        const mockData: ForexData[] = Array.from({ length: 50 }, (_, i) => ({
          timestamp: Date.now() - i * 3600000, // hourly data points
          price: 1.2045 + (Math.random() - 0.5) * 0.01,
          volume: Math.floor(Math.random() * 1000000),
          pair: 'EUR/USD'
        }))

        setData(mockData)
        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch forex data'))
        setIsLoading(false)
      }
    }

    fetchData()

    // Refresh data every minute
    const interval = setInterval(fetchData, 60000)

    return () => clearInterval(interval)
  }, [])

  return { data, isLoading, error }
} 