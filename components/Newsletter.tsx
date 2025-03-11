import Image from 'next/image'

export default function Newsletter() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mt-16 bg-[#111] rounded-3xl p-8 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Stay Updated with Market News
            </h2>
            <p className="text-gray-400 mb-6">
              Subscribe to our newsletter to receive the latest market news, updates, and special offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 bg-[#1E1E1E] rounded-full text-white focus:outline-none focus:ring-2 focus:ring-[#00ffd5] transition-all"
              />
              <button className="px-8 py-3 bg-[#00ffd5] text-black font-semibold rounded-full hover:bg-[#00e6c0] transition-all transform hover:scale-105">
                Subscribe
              </button>
            </div>
          </div>
          <div className="relative h-[300px] lg:h-[400px]">
            <Image
              src="/newsletterright.png"
              alt="Newsletter"
              width={500}
              height={400}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 