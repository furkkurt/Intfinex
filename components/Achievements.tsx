export default function Achievements() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mt-16 bg-[#111] rounded-3xl p-8 md:p-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
          Our Achievements
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Achievement Cards */}
          {[
            {
              number: "10K+",
              label: "Active Traders",
              icon: "👥"
            },
            {
              number: "$100M+",
              label: "Monthly Volume",
              icon: "📈"
            },
            {
              number: "99.9%",
              label: "Execution Rate",
              icon: "⚡"
            },
            {
              number: "24/7",
              label: "Support Available",
              icon: "🌍"
            }
          ].map((achievement, index) => (
            <div 
              key={index} 
              className="bg-[#1E1E1E] rounded-2xl p-6 text-center transform hover:scale-105 transition-all hover:bg-[#2A2A2A]"
            >
              <span className="text-4xl mb-4 block">{achievement.icon}</span>
              <h3 className="text-2xl md:text-3xl font-bold text-[#00ffd5] mb-2">
                {achievement.number}
              </h3>
              <p className="text-gray-400">{achievement.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 