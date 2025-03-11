import Image from 'next/image'

export default function TradeOnGo() {
  return (
    <div className="mt-16 bg-[#111] rounded-3xl p-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <Image
          src="/tradeongo.png"
          alt="Trading Platform"
          width={600}
          height={400}
          className="w-full rounded-xl"
        />
        <div>
          <h2 className="text-4xl font-bold text-white mb-6">
            Trade on the go
          </h2>
          <p className="text-gray-400 mb-8">
            An outstanding global trading platform and the world&apos;s leading CFD
            and spread betting provider. Trade on MT4, MT5 or cTrader with CPT
            Markets.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-[#1E1E1E] rounded-full text-white hover:bg-[#2A2A2A] transition-colors">
              MetaTrader 4
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-[#1E1E1E] rounded-full text-white hover:bg-[#2A2A2A] transition-colors">
              MetaTrader 5
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-[#1E1E1E] rounded-full text-white hover:bg-[#2A2A2A] transition-colors">
              cTrader
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 