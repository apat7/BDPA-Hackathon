export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            SkillBridge
          </div>
          <div className="flex gap-6">
            <button className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              Features
            </button>
            <button className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              How It Works
            </button>
            <button className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-2 mb-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
            🚀 Career Readiness Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent leading-tight">
            Bridge the Gap Between
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Your Skills & Market Demands
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Compare your technical and professional skills against real-time job market demands. 
            Get personalized learning paths to boost your employability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform">
              Start Your Analysis
            </button>
            <button className="px-8 py-4 rounded-full border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="relative rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                    You
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Current Skills: 65%</p>
                  </div>
                </div>
                <div className="space-y-2 pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                  <div className="text-sm text-slate-600 dark:text-slate-400">✓ JavaScript</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">✓ React</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">✓ Node.js</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                    Market
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Market Demands: 90%</p>
                  </div>
                </div>
                <div className="space-y-2 pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
                  <div className="text-sm text-slate-600 dark:text-slate-400">✓ TypeScript</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">✓ Next.js</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">✓ AWS</div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
                <span>📊 Gap Analysis: 25%</span>
                <span className="text-slate-400">→</span>
                <span className="text-green-600 dark:text-green-400">Personalized Learning Path</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Powerful features designed to accelerate your career growth
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-8 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all hover:scale-105">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl mb-4">
              📈
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Real-Time Analysis</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Compare your skills against live job market data. Get instant insights into what employers are looking for right now.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all hover:scale-105">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-2xl mb-4">
              🎯
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Gap Identification</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Intelligently identify skill gaps between your current abilities and market requirements. Know exactly what to learn next.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all hover:scale-105">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-2xl mb-4">
              🛤️
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Learning Paths</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Receive personalized, actionable learning paths tailored to your career goals. Step-by-step guidance to close the gap.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
            How It Works
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Get started in three simple steps
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                1
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Assess Your Skills</h3>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  Input your current technical and professional skills. Our system analyzes your profile comprehensively.
                </p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl">
                2
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Compare with Market</h3>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  We match your skills against real-time job market demands. See exactly where you stand and what's missing.
                </p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                3
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Get Your Path</h3>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  Receive a personalized learning path with actionable steps. Start closing the gap and boost your employability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Bridge the Gap?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are taking control of their career readiness. 
            Get started today and unlock your potential.
          </p>
          <button className="px-10 py-5 rounded-full bg-white text-blue-600 text-lg font-semibold hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform">
            Start Your Free Analysis
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            SkillBridge
          </div>
          <div className="flex gap-6 text-sm text-slate-600 dark:text-slate-400">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Contact</span>
          </div>
        </div>
        <div className="text-center mt-6 text-sm text-slate-500 dark:text-slate-500">
          © 2024 SkillBridge. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
