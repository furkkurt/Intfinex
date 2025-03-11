'use client'
import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface ForexChartProps {
  fromCurrency: string
  toCurrency: string
}

export default function ForexChart({ fromCurrency, toCurrency }: ForexChartProps) {
  const [data, setData] = useState<number[]>([])
  const [labels, setLabels] = useState<string[]>([])

  useEffect(() => {
    // Generate mock data
    const mockData = Array.from({ length: 20 }, (_, i) => {
      const baseValue = fromCurrency === 'EUR' ? 1.05 : fromCurrency === 'GBP' ? 1.27 : 149.5
      return baseValue + (Math.random() - 0.5) * 0.01
    })
    
    const timeLabels = Array.from({ length: 20 }, (_, i) => {
      const date = new Date()
      date.setMinutes(date.getMinutes() - (20 - i))
      return date.toLocaleTimeString()
    })

    setData(mockData)
    setLabels(timeLabels)
  }, [fromCurrency, toCurrency])

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: `${fromCurrency}/${toCurrency} Exchange Rate`,
        color: '#94a3b8'
      }
    },
    scales: {
      x: {
        grid: {
          color: '#1f2937'
        },
        ticks: {
          color: '#94a3b8'
        }
      },
      y: {
        grid: {
          color: '#1f2937'
        },
        ticks: {
          color: '#94a3b8'
        }
      }
    }
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: `${fromCurrency}/${toCurrency}`,
        data,
        borderColor: 'rgb(0, 255, 213)',
        backgroundColor: 'rgba(0, 255, 213, 0.5)',
        tension: 0.1
      }
    ]
  }

  return (
    <div className="h-full w-full p-4">
      <Line data={chartData} options={options} />
    </div>
  )
} 