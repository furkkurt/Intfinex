import Link from "next/link";

export default function AccountTypes() {
  return (
    <div className="mt-16">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
            Type of Accounts
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ECN Account */}
            <div className="bg-[#111] rounded-3xl p-6 relative overflow-hidden">
            <div className="border-b border-gray-800 pb-4 mb-6">
                <h3 className="text-[#00ffd5] text-2xl font-bold">ECN</h3>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                <span className="text-gray-400">Min. Deposits (USD)</span>
                <span className="text-white">$1,000</span>
                </div>
                <div className="flex justify-between items-center">
                <span className="text-gray-400">Max Leverage</span>
                <span className="text-white">1:1000</span>
                </div>
                <div className="flex justify-between items-center">
                <span className="text-gray-400">Spreads</span>
                <span className="text-white">0.1 pip</span>
                </div>
                <div className="flex justify-between items-center">
                <span className="text-gray-400">Margin call</span>
                <span className="text-white">50%</span>
                </div>
                <div className="flex justify-between items-center">
                <span className="text-gray-400">Stop Out</span>
                <span className="text-white">30%</span>
                </div>
                <div className="flex justify-between items-center">
                <span className="text-gray-400">Commission</span>
                <span className="text-white">Yes</span>
                </div>
                <div className="flex justify-between items-center">
                <span className="text-gray-400">Dedicated Account Manager</span>
                <span className="text-[#00ffd5]">✓</span>
                </div>
            </div>

            {/* Gradient Effect */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#00ffd5]/10 to-transparent"></div>
            </div>

            {/* Classic Account */}
            <div className="bg-[#111] rounded-3xl p-6 relative overflow-hidden">
            <div className="border-b border-gray-800 pb-4 mb-6">
                <div className="flex items-center gap-3">
                <h3 className="text-[#00ffd5] text-2xl font-bold">Classic</h3>
                <span className="bg-[#00ffd5] text-black text-sm px-3 py-1 rounded-full">
                    Popular
                </span>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                <span className="text-gray-400">Min. Deposits (USD)</span>
                <span className="text-white">$20</span>
                </div>
                <div className="flex justify-between items-center">
                <span className="text-gray-400">Max Leverage</span>
                <span className="text-white">1:1000</span>
                </div>
                <div className="flex justify-between items-center">
                <span className="text-gray-400">Spreads</span>
                <span className="text-white">1.4 pip</span>
                </div>
                <div className="flex justify-between items-center">
                <span className="text-gray-400">Margin call</span>
                <span className="text-white">50%</span>
                </div>
                <div className="flex justify-between items-center">
                <span className="text-gray-400">Stop Out</span>
                <span className="text-white">30%</span>
                </div>
                <div className="flex justify-between items-center">
                <span className="text-gray-400">Commission</span>
                <span className="text-white">No</span>
                </div>
                <div className="flex justify-between items-center">
                <span className="text-gray-400">Dedicated Account Manager</span>
                <span className="text-red-500">✗</span>
                </div>
            </div>

            {/* Gradient Effect */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#00ffd5]/10 to-transparent"></div>
            </div>

            {/* Prime Account */}
            <div className="bg-[#111] rounded-3xl p-6 relative overflow-hidden">
            <div className="border-b border-gray-800 pb-4 mb-6">
                <h3 className="text-[#00ffd5] text-2xl font-bold">Prime</h3>
            </div>

        <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Min. Deposits (USD)</span>
          <span className="text-white">$1,000</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Max Leverage</span>
          <span className="text-white">1:1000</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Spreads</span>
          <span className="text-white">0.7 pip</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Margin call</span>
          <span className="text-white">50%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Stop Out</span>
          <span className="text-white">30%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Commission</span>
          <span className="text-white">No</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Dedicated Account Manager</span>
          <span className="text-[#00ffd5]">✓</span>
        </div>
      </div>

      {/* Gradient Effect */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#00ffd5]/10 to-transparent"></div>
    </div>
  </div>

  {/* Register Button */}
  <div className="mt-12 text-center">
    <Link
      href="/register"
      className="inline-block px-8 py-3 bg-[#00ffd5] text-black font-semibold rounded-full hover:bg-[#00e6c0] transition-colors"
    >
      Register
    </Link>
  </div>
</div>

  )
}