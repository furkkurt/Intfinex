'use client'
import { useState } from 'react'

interface ForexPair {
  symbol: string
  subText: string
  flag1: string
  flag2: string
  bid: string
  ask: string
  spread: string
}

const FOREX_DATA: ForexPair[] = [
  {
    symbol: 'EURJPY',
    subText: 'EURJPY',
    flag1: '🇪🇺',
    flag2: '🇯🇵',
    bid: '156.823',
    ask: '156.847',
    spread: '3'
  },
  {
    symbol: 'EURUSD',
    subText: 'EURUSD',
    flag1: '🇪🇺',
    flag2: '🇺🇸',
    bid: '1.04902',
    ask: '1.04919',
    spread: '2.1'
  }
  // Add other pairs as needed
]

export default function ForexDashboard() {
  const [selectedPair, setSelectedPair] = useState('EURUSD')

  return (
    <div className="w-full bg-black p-4">
      {/* Forex Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-gray-400 text-left">
              <th className="py-3 px-4">Symbol</th>
              <th className="py-3 px-4">BID</th>
              <th className="py-3 px-4">Ask</th>
              <th className="py-3 px-4">
                SPREAD
              </th>
            </tr>
          </thead>
          <tbody>
            {FOREX_DATA.map((pair) => (
              <tr
                key={pair.symbol}
                className="border-t border-gray-800 hover:bg-gray-800/50 cursor-pointer"
                onClick={() => setSelectedPair(pair.symbol)}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-1">
                      <span className="text-2xl">{pair.flag1}</span>
                      <span className="text-2xl">{pair.flag2}</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">{pair.symbol}</div>
                      <div className="text-gray-400 text-sm">{pair.subText}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-white">{pair.bid}</td>
                <td className="py-3 px-4 text-white">{pair.ask}</td>
                <td className="py-3 px-auto text-white">{pair.spread}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 