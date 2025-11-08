import Link from "next/link";
import { Rocket, TrendingUp, Target, Route, BarChart, User, Building2, Check } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 animate-fade-in-down">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-fade-in hover:scale-105 transition-transform duration-300">
            SkillBridge
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium animate-fade-in-up animate-delay-100">
            <Rocket className="w-4 h-4 animate-float" />
            Career Readiness Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent leading-tight animate-fade-in-up animate-delay-200">
            Bridge the Gap Between
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
              Your Skills & Market Demands
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animate-delay-300">
            Compare your technical and professional skills against real-time job market demands. 
            Get personalized learning paths to boost your employability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animate-delay-400">
            <Link href="/login" className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-110 transform">
              Start Your Analysis
            </Link>
            <button className="px-8 py-4 rounded-full border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-105 transform">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="mt-20 max-w-5xl mx-auto animate-fade-in-up animate-delay-500">
          <div className="relative rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700 hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] transform">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4 animate-slide-in-left">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white hover:scale-110 transition-transform duration-300">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Current Skills: 65%</p>
                  </div>
                </div>
                <div className="space-y-2 pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    JavaScript
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    React
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Node.js
                  </div>
                </div>
              </div>
              <div className="space-y-4 animate-slide-in-right">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white hover:scale-110 transition-transform duration-300">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out" style={{ width: '90%' }}></div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Market Demands: 90%</p>
                  </div>
                </div>
                <div className="space-y-2 pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    TypeScript
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Next.js
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    AWS
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
                <BarChart className="w-5 h-5" />
                <span>Gap Analysis: 25%</span>
                <span className="text-slate-400">→</span>
                <Route className="w-5 h-5 text-green-600 dark:text-green-400" />
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
          <div className="p-8 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:scale-110 hover:-translate-y-2 animate-fade-in-up animate-delay-100">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Real-Time Analysis</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Compare your skills against live job market data. Get instant insights into what employers are looking for right now.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:scale-110 hover:-translate-y-2 animate-fade-in-up animate-delay-200">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-4 hover:scale-110 transition-transform duration-300">
              <Target className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Gap Identification</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Intelligently identify skill gaps between your current abilities and market requirements. Know exactly what to learn next.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:scale-110 hover:-translate-y-2 animate-fade-in-up animate-delay-300">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 hover:scale-110 transition-transform duration-300">
              <Route className="w-7 h-7 text-white" />
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
            <div className="flex gap-6 items-start animate-fade-in-up animate-delay-100 hover:scale-105 transition-transform duration-300">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl hover:scale-110 transition-transform duration-300">
                1
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Home page</h3>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  Input your current technical and professional skills. Our system analyzes your profile comprehensively.
                </p>
              </div>
            </div>
            <div className="flex gap-6 items-start animate-fade-in-up animate-delay-200 hover:scale-105 transition-transform duration-300">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl hover:scale-110 transition-transform duration-300">
                2
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Compare with Market</h3>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  We match your skills against real-time job market demands. See exactly where you stand and what's missing.
                </p>
              </div>
            </div>
            <div className="flex gap-6 items-start animate-fade-in-up animate-delay-300 hover:scale-105 transition-transform duration-300">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl hover:scale-110 transition-transform duration-300">
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
        <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-2xl animate-scale-in hover:scale-105 transition-transform duration-500">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white animate-fade-in-up">
            Ready to Bridge the Gap?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto animate-fade-in-up animate-delay-100">
            Join thousands of students who are taking control of their career readiness. 
            Get started today and unlock your potential.
          </p>
          <Link href="/login" className="inline-block px-10 py-5 rounded-full bg-white text-blue-600 text-lg font-semibold hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-110 transform animate-fade-in-up animate-delay-200">
            Start Your Free Analysis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            SkillBridge
          </div>
          <div className="flex gap-6 text-sm text-slate-600 dark:text-slate-400">
            <Link href="/privacy-policy" className="hover:text-slate-900 dark:hover:text-white transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-slate-900 dark:hover:text-white transition-colors duration-300">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-slate-900 dark:hover:text-white transition-colors duration-300">
              Contact
            </Link>
          </div>
        </div>
        <div className="text-center mt-6 text-sm text-slate-500 dark:text-slate-500">
          © 2024 SkillBridge. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
