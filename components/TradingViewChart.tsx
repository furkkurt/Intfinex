'use client'
import { useEffect } from 'react'

export default function TradingViewChart() {
  useEffect(() => {
    // Create container div
    const container = document.createElement('div')
    container.className = 'tradingview-widget-container'
    container.style.height = '100%'
    container.style.width = '100%'

    // Create widget div
    const widgetDiv = document.createElement('div')
    widgetDiv.className = 'tradingview-widget-container__widget'
    widgetDiv.style.height = 'calc(100% - 32px)'
    widgetDiv.style.width = '100%'
    container.appendChild(widgetDiv)

    // Create copyright div
    const copyrightDiv = document.createElement('div')
    copyrightDiv.className = 'tradingview-widget-copyright'
    const link = document.createElement('a')
    link.href = 'https://www.tradingview.com/'
    link.rel = 'noopener nofollow'
    link.target = '_blank'
    const span = document.createElement('span')
    span.className = 'blue-text'
    span.textContent = 'Track all markets on TradingView'
    link.appendChild(span)
    copyrightDiv.appendChild(link)
    container.appendChild(copyrightDiv)

    // Create script
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": "NASDAQ:AAPL",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "withdateranges": true,
      "range": "YTD",
      "hide_side_toolbar": false,
      "allow_symbol_change": true,
      "details": true,
      "hotlist": true,
      "calendar": false,
      "show_popup_button": true,
      "popup_width": "1000",
      "popup_height": "650",
      "support_host": "https://www.tradingview.com"
    })

    // Add everything to the mount point
    const mountPoint = document.getElementsByClassName('tradingview-chart-container')[0]
    if (mountPoint) {
      mountPoint.appendChild(container)
      container.appendChild(script)
    }

    return () => {
      const mountPoint = document.getElementsByClassName('tradingview-chart-container')[0]
      if (mountPoint) {
        mountPoint.innerHTML = ''
      }
    }
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="tradingview-chart-container bg-[#1E1E1E] rounded-3xl overflow-hidden" style={{ height: '700px' }}>
        {/* Widget will be injected here */}
      </div>
    </div>
  )
} 