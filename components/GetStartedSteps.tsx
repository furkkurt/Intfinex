import Image from 'next/image'

export default function GetStartedSteps() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mt-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
          How to Get Started
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create Account */}
          <div className="bg-[#111] rounded-3xl p-8 text-center transform hover:scale-105 transition-all hover:bg-[#161616]">
            <Image
              src="/createacc.png"
              alt="Create Account"
              width={96}
              height={96}
              className="mx-auto mb-6"
            />
            <h3 className="text-xl font-bold text-white mb-3">Create Account</h3>
            <p className="text-gray-400 text-sm">
              Fill in your details to create a trading account with us
            </p>
          </div>

          <div className="bg-[#111] rounded-3xl p-8 text-center transform hover:scale-105 transition-all hover:bg-[#161616]">
            <Image
              src="/fundacc.png"
              alt="Fund Account"
              width={96}
              height={96}
              className="mx-auto mb-6"
            />
            <h3 className="text-xl font-bold text-white mb-3">Fund Account</h3>
            <p className="text-gray-400 text-sm">
              Fund your account using a wide range of funding methods
            </p>
          </div>

          <div className="bg-[#111] rounded-3xl p-8 text-center transform hover:scale-105 transition-all hover:bg-[#161616]">
            <Image
              src="/tradingacc.png"
              alt="Start Trading"
              width={96}
              height={96}
              className="mx-auto mb-6"
            />
            <h3 className="text-xl font-bold text-white mb-3">Start Trading</h3>
            <p className="text-gray-400 text-sm">
              Trade and invest in your favorite instruments
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 