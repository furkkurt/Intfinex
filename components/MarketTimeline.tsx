'use client'
import { useEffect } from 'react'

export default function MarketTimeline() {
  useEffect(() => {
    // Create container div
    const container = document.createElement('div')
    container.className = 'tradingview-widget-container'
    container.style.height = '100%'
    container.style.width = '100%'

    // Create widget div
    const widgetDiv = document.createElement('div')
    widgetDiv.className = 'tradingview-widget-container__widget'
    widgetDiv.style.height = '100%'
    widgetDiv.style.width = '100%'
    container.appendChild(widgetDiv)

    // Create script
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      "feedMode": "all_symbols",
      "isTransparent": false,
      "displayMode": "adaptive",
      "width": "100%",
      "height": "100%",
      "colorTheme": "dark",
      "locale": "en"
    })

    // Add everything to the mount point
    const mountPoint = document.getElementsByClassName('tradingview-timeline-container')[0]
    if (mountPoint) {
      mountPoint.appendChild(container)
      container.appendChild(script)
    }

    return () => {
      const mountPoint = document.getElementsByClassName('tradingview-timeline-container')[0]
      if (mountPoint) {
        mountPoint.innerHTML = ''
      }
    }
  }, [])

  return (
    <div className="tradingview-timeline-container bg-[#1E1E1E] rounded-3xl overflow-hidden h-[500px]" />
  )
} 