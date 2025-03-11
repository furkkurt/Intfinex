'use client'
import { useEffect } from 'react'

export default function MarketTicker() {
  useEffect(() => {
    // Create script element
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
    script.type = 'text/javascript'
    script.async = true
    
    // Configure the widget
    script.innerHTML = JSON.stringify({
      symbols: [
        { description: "USD INDEX", proName: "TVC:DXY" },
        { description: "EURO / U.S. DOLLAR", proName: "FOREXCOM:EURUSD" },
        { description: "BRITISH POUND / U.S. DOLLAR", proName: "FOREXCOM:GBPUSD" },
        { description: "U.S. DOLLAR / JAPANESE YEN", proName: "FOREXCOM:USDJPY" },
        { description: "U.S. DOLLAR / SWISS FRANC", proName: "FOREXCOM:USDCHF" },
        { description: "U.S. DOLLAR / CANADIAN DOLLAR", proName: "FOREXCOM:USDCAD" },
        { description: "AUSTRALIAN DOLLAR / U.S. DOLLAR", proName: "FOREXCOM:AUDUSD" },
        { description: "NEW ZEALAND DOLLAR / U.S. DOLLAR", proName: "FOREXCOM:NZDUSD" },
        { description: "U.S. DOLLAR / TURKISH LIRA", proName: "FOREXCOM:USDTRY" },
        { description: "U.S. DOLLAR / OFFSHORE CHINESE YUAN", proName: "FOREXCOM:USDCNH" },
        { description: "U.S. DOLLAR / MEXICAN PESO", proName: "FOREXCOM:USDMXN" },
        { description: "GOLD (US$/OZ)", proName: "TVC:GOLD" },
        { description: "SILVER (US$/OZ)", proName: "TVC:SILVER" },
        { description: "WTI CRUDE OIL", proName: "TVC:USOIL" },
        { description: "BRENT CRUDE OIL", proName: "TVC:UKOIL" },
        { description: "DOW JONES 30 SPOT", proName: "CFI:US30" },
        { description: "NASDAQ 100 SPOT", proName: "CFI:US100" },
        { description: "S&P 500 SPOT", proName: "CFI:US500" },
        { description: "FTSE 100 SPOT", proName: "CFI:UK100" },
        { description: "DAX 40 SPOT", proName: "CFI:GER30" },
        { description: "BITCOIN / USD", proName: "CRYPTOCOM:BTCUSD" }
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "en"
    })

    // Add the widget container
    const container = document.getElementsByClassName('tradingview-widget-container')[0]
    if (container) {
      const widget = document.createElement('div')
      widget.className = 'tradingview-widget-container__widget'
      container.appendChild(widget)
      container.appendChild(script)
    }

    return () => {
      // Cleanup
      const container = document.getElementsByClassName('tradingview-widget-container')[0]
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [])

  return (
    <div className="relative max-w-6xl mx-auto px-4">
      {/* Fade effect containers */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black to-transparent z-20"></div>
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent z-20"></div>
      
      {/* Widget container */}
      <div className="tradingview-widget-container relative z-10 bg-[#1E1E1E] rounded-xl overflow-hidden">
        <div className="tradingview-widget-container__widget"></div>
        <div className="tradingview-widget-copyright hidden">
          <a
            href="https://www.tradingview.com/"
            rel="noopener nofollow"
            target="_blank"
            className="text-xs text-gray-400 hover:text-[#00ffd5]"
          >
            Track all markets on TradingView
          </a>
        </div>
      </div>
    </div>
  )
} 