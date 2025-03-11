'use client'
import Link from 'next/link'

export default function Hero() {
  return (
      <div className="container mx-auto px-4 min-h-[80vh] flex flex-col lg:flex-row items-center justify-between">
        {/* Left side - Content */}
        <div className="w-full lg:w-1/2 flex flex-col space-y-8 mb-12 lg:mb-0 px-4 lg:pl-32 pt-8 lg:pt-0">
          {/* Hero Text */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Trade Anytime<span className="text-[#00ffd5]">,</span>{' '}
              <span className="block">
                Anywhere<span className="text-[#00ffd5]">!</span>
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-300 mt-4 max-w-lg mx-auto lg:mx-0">
              Trade over 1,800 products safely, quickly and easily
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link 
              href="/register"
              className="px-8 py-3 bg-[#00ffd5] text-black font-semibold rounded-full hover:bg-[#00e6c0] transition-colors text-center"
            >
              Register
            </Link>
            <Link 
              href="/demo"
              className="px-8 py-3 border-2 border-[#00ffd5] text-[#00ffd5] font-semibold rounded-full hover:bg-[#00ffd5] hover:text-black transition-colors text-center"
            >
              Try Demo
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="mt-12 lg:mt-16">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {/* Stats items */}
              {[
                { value: '350,000', label: 'Clients worldwide' },
                { value: '165,000', label: 'Daily executed trades' },
                { value: '12+ years', label: 'Experience in the industry' }
              ].map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    {stat.value}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Video */}
        <div className="w-full lg:w-1/3 rounded-xl overflow-hidden">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover shadow-2xl"
          >
            <source src="/HeroAnimation.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
  )
} 