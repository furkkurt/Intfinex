import Image from 'next/image'

export default function Solutions() {
  return (
    <div className="mt-16"> 
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">
          Customized Solutions for Partners & Traders
        </h2>
        <div className="flex justify-center gap-4">
          <button className="px-6 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors">
            For Traders
          </button>
          <button className="px-6 py-2 border border-white text-white rounded-full hover:bg-white/10 transition-colors">
            For Partners
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card - Portfolio */}
        <div className="bg-[#111] rounded-2xl overflow-hidden">
          <div className="p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Portfolio Diversification
            </h3>
            <p className="text-gray-400 mb-6">
              At CPT Markets, you can unleash a diverse trading arsenal. Explore a vast
              selection of instruments – stocks, forex, and even commodities – all on a
              single, user-friendly platform. This empowers you to spread your risk
              across different markets, capitalize on various opportunities, and
              potentially maximize your return as market conditions evolve.
            </p>
            <Image
              src="/portfolio.webp"
              alt="Portfolio Diversification"
              width={400}
              height={300}
              className="w-full rounded-lg"
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Top Right Card - Secure Transactions */}
          <div className="bg-[#111] rounded-2xl overflow-hidden">
            <div className="p-8 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Secure Transactions
                </h3>
                <p className="text-gray-400">
                  We offer a wide range of secure payment methods,
                  including trusted options like credit cards, bank
                  transfers, and popular e-wallets.
                </p>
              </div>
              <Image
                src="/transaction.webp"
                alt="Secure Transactions"
                width={32}
                height={32}
                className="w-32 h-32 object-contain"
              />
            </div>
          </div>
          <div className="bg-[#111] rounded-2xl overflow-hidden">
            <div className="p-8 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Fast Execution
                </h3>
                <p className="text-gray-400">
                  This agility allows you to make informed decisions and
                  react instantly to market shifts, potentially enhancing
                  your trading success.
                </p>
              </div>
              <Image
                src="/execution.webp"
                alt="Fast Execution"
                width={32}
                height={32}
                className="w-32 h-32 object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}