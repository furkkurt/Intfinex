import Link from "next/link";
import Image from 'next/image'

export default function TradingJourney() {
  return (
    <div className="mt-16 bg-[#111] rounded-3xl p-12 relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column - Features */}
        <div className="space-y-8">
          <h2 className="text-4xl font-bold text-white mb-8">
            Start Your Trading Journey
          </h2>

          {/* Advanced Platforms */}
          <div className="flex items-start gap-4">
            <Image
              src="/advance.svg"
              alt="Advanced Platforms"
              width={32}
              height={32}
              className="w-8 h-8 mt-1"
            />
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Advanced Platforms
              </h3>
              <p className="text-gray-400">
                Trading platforms with user-friendly interfaces provide comprehensive tools for price analysis and technical analysis.
              </p>
            </div>
          </div>

          {/* Flexibility */}
          <div className="flex items-start gap-4">
            <Image
              src="/flex.svg"
              alt="Flexibility"
              width={32}
              height={32}
              className="w-8 h-8 mt-1"
            />
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Flexibility
              </h3>
              <p className="text-gray-400">
                Support tailored to your needs. Whenever you have a special request, we are happy to help.
              </p>
            </div>
          </div>

          {/* Support */}
          <div className="flex items-start gap-4">
            <Image
              src="/support.svg"
              alt="Support"
              width={32}
              height={32}
              className="w-8 h-8 mt-1"
            />
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Support
              </h3>
              <p className="text-gray-400">
                Creative support and free marketing materials, including banners, business cards, newsletters, and promotional materials
              </p>
            </div>
          </div>

          {/* Innovation */}
          <div className="flex items-start gap-4">
            <Image
              src="/innovation.svg"
              alt="Innovation"
              width={32}
              height={32}
              className="w-8 h-8 mt-1"
            />
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Innovation
              </h3>
              <p className="text-gray-400">
                Cutting-edge and intuitive trading platform for on-the-go traders.
              </p>
            </div>
          </div>

          {/* Register Button */}
          <div className="mt-8">
            <Link
              href="/register"
              className="inline-block px-8 py-3 bg-[#00ffd5] text-black font-semibold rounded-full hover:bg-[#00e6c0] transition-colors"
            >
              Register
            </Link>
          </div>
        </div>

        {/* Right Column - Image */}
        <div className="relative">
          <div className="relative h-full">
            {/* Floating Coins */}
            <div className="absolute top-0 right-0 animate-float">
              <div className="w-12 h-12 bg-[#00ffd5] rounded-full opacity-20"></div>
            </div>
            <div className="absolute bottom-20 right-20 animate-float-delayed">
              <div className="w-8 h-8 bg-[#00ffd5] rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Gradient */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#00ffd5]/10 to-transparent"></div>
    </div>
  )
}