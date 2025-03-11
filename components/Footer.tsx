import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-800/30 border-t border-gray-700 backdrop-blur-sm mt-24">
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-[#00ffd5] mb-4">About Us</h3>
            <p className="text-gray-400">
              Leading global trading platform offering CFDs on Forex, Stocks, Commodities, Indices, and Cryptocurrencies.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-[#00ffd5] mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-white transition-colors">Email: info@intfinex.com</li>
              <li className="hover:text-white transition-colors">Tel: +90 (212) 555 0000</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#00ffd5] mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/forex" 
                  className="text-gray-400 hover:text-[#00ffd5] transition-colors"
                >
                  Exchange Rates
                </Link>
              </li>
              <li>
                <Link href="/analysis" className="text-gray-400 hover:text-white transition-colors">
                  Market Analysis
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#00ffd5] mb-4">Address</h3>
            <p className="text-gray-400">
              London, UK
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">&copy; 2025 Intfinex. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 