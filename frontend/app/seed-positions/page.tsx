"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Database, Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { seedPositions } from "@/lib/seedPositions";

export default function SeedPositionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSeed = async () => {
    if (!user) {
      setResult({ success: false, message: "You must be logged in to seed positions" });
      return;
    }

    setSeeding(true);
    setResult(null);

    try {
      await seedPositions();
      setResult({ success: true, message: "Positions seeded successfully!" });
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "Failed to seed positions. Check console for details.",
      });
    } finally {
      setSeeding(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-300">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="container mx-auto px-6 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-300 mb-8 animate-fade-in-down hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="max-w-2xl mx-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg animate-scale-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Seed Positions Database
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Add sample tech industry positions to Firestore
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                This will add 20 sample positions across various tech industries including:
              </p>
              <ul className="mt-2 text-sm text-blue-800 dark:text-blue-400 list-disc list-inside space-y-1">
                <li>Software Engineering (Frontend, Backend, Full Stack, Mobile)</li>
                <li>Data Science</li>
                <li>DevOps</li>
                <li>Product Management</li>
                <li>UI/UX Design</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-900 dark:text-yellow-300">
                <strong>Note:</strong> This will only add positions if the database is empty. If positions already exist, the seed will be skipped to avoid duplicates.
              </p>
            </div>
          </div>

          {result && (
            <div
              className={`p-4 rounded-lg mb-6 flex items-start gap-3 ${
                result.success
                  ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              }`}
            >
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p
                  className={`text-sm ${
                    result.success
                      ? "text-green-900 dark:text-green-300"
                      : "text-red-900 dark:text-red-300"
                  }`}
                >
                  {result.message}
                </p>
                {!result.success && result.message.includes("Permission denied") && (
                  <div className="mt-3 p-3 rounded bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                    <p className="text-xs text-red-800 dark:text-red-300 font-semibold mb-2">
                      Quick Fix:
                    </p>
                    <ol className="text-xs text-red-700 dark:text-red-400 list-decimal list-inside space-y-1">
                      <li>Go to Firebase Console → Firestore Database → Rules</li>
                      <li>Copy the rules from <code className="bg-red-200 dark:bg-red-800 px-1 rounded">firestore.rules</code> file</li>
                      <li>Paste and click "Publish"</li>
                    </ol>
                    <p className="text-xs text-red-700 dark:text-red-400 mt-2">
                      See <code className="bg-red-200 dark:bg-red-800 px-1 rounded">FIRESTORE_RULES_SETUP.md</code> for detailed instructions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleSeed}
            disabled={seeding}
            className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform ${
              seeding
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            }`}
          >
            {seeding ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Seeding positions...
              </span>
            ) : (
              "Seed Positions Database"
            )}
          </button>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Link
              href="/target-positions"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors"
            >
              View Target Positions →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

