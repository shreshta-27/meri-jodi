 
const AIMatchmaking = () => {
  const features = [
    {
      title: "AI Match Recommendations",
      description: "Get personalized partner suggestions based on personality, interests, values, and compatibility scores.",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      title: "AI Chat Assistant",
      description: "An intelligent chatbot helps users start conversations, break the ice, and improve communication between matches.",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      title: "Compatibility Analysis",
      description: "AI analyzes lifestyle preferences, career goals, habits, and relationship expectations for better long-term compatibility.",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: "Secure & Verified Profiles",
      description: "Every profile goes through verification checks to ensure safer and more genuine matchmaking.",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: "Daily Match Suggestions",
      description: "Receive fresh match recommendations every day based on your activity and preferences.",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 3V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: "Privacy & Control",
      description: "Choose who can view your profile, photos, and contact details with advanced privacy settings.",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <section id="about" className="bg-white py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl sm:text-4xl font-serif text-gray-900 mb-4 tracking-wide">
          Smart AI Features for Better Matchmaking
        </h2>
        <p className="text-gray-500 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          Our Intelligent Matchmaking Assistant Goes Beyond Basic Biodata Matching And Helps Users Build Meaningful Connections With Confidence.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="flex items-start p-6 bg-white border border-gray-200 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[#F1AEB4] hover:border-[#ED5463] transition-shadow duration-300"
          >
            {/* Icon Wrapper using #842029 */}
            <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-[#842029] mr-4 shadow-sm">
              {feature.icon}
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#842029] mb-2 leading-snug">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AIMatchmaking;