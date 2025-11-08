import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-300 mb-6 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
              Terms of Service
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                By accessing and using SkillBridge, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">2. Use License</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Permission is granted to temporarily use SkillBridge for personal, non-commercial purposes. This license does not include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
                <li>Modifying or copying the materials</li>
                <li>Using the materials for any commercial purpose</li>
                <li>Removing any copyright or other proprietary notations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">3. User Accounts</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
                <li>Maintaining the confidentiality of your account</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and complete information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">4. Prohibited Uses</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                You may not use SkillBridge:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
                <li>In any way that violates applicable laws or regulations</li>
                <li>To transmit any malicious code or viruses</li>
                <li>To impersonate any person or entity</li>
                <li>To collect or store personal data about other users</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">5. Disclaimer</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                The materials on SkillBridge are provided on an 'as is' basis. SkillBridge makes no warranties, expressed or implied, and hereby disclaims all other warranties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">6. Contact Information</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                For questions about these Terms of Service, please contact us through our <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact</Link> page.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

