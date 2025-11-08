"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import TagInput, { SkillWithLevel } from "@/components/TagInput";
import { SKILLS_LIST } from "@/lib/skills";
import { useAuth, UserDocument } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function UserSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<SkillWithLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        router.push("/login"); // Redirect to login if no user
        return;
      }

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data() as UserDocument;
          setDisplayName(data.displayName || "");
          setEmail(data.email || "");
          setCompany(data.company || "");
          
          if (data.skills && Array.isArray(data.skills)) {
            const skillsWithLevels: SkillWithLevel[] = data.skills.map((s: any) => {
              if (typeof s === "string") {
                return { skill: s, level: "Intermediate" };
              } else if (s && typeof s === "object") {
                return {
                  skill: s.skill || s,
                  level: s.level || "Intermediate",
                };
              }
              return { skill: String(s), level: "Intermediate" };
            });
            setSelectedSkills(skillsWithLevels);
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, router]);

  const handleSave = async () => {
    if (!user) {
      setError("You must be logged in to save settings.");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const userDocRef = doc(db, "users", user.uid);
      
      const skillsData = selectedSkills.map(skill => ({
        skill: skill.skill,
        level: skill.level,
      }));

      await updateDoc(userDocRef, {
        displayName: displayName,
        email: email,
        company: company,
        skills: skillsData,
        skillsUpdatedAt: new Date().toISOString(),
      });

      setSaveSuccess(true);
    } catch (err) {
      console.error("Error saving user settings:", err);
      setError("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600 dark:text-slate-300">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <Navbar />
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 animate-scale-in hover:shadow-3xl transition-all duration-500">
            <div className="text-center mb-8 animate-fade-in-up">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 animate-gradient">
                User Settings
              </div>
              <p className="text-slate-600 dark:text-slate-300 animate-fade-in-up animate-delay-100">
                Manage your profile information and skills
              </p>
            </div>

            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  disabled // Email is typically managed by Firebase Auth directly
                />
              </div>

              {/* Company Field */}
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>

              {/* Skills Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Edit your skills (add or remove)
                </label>
                <TagInput
                  skills={SKILLS_LIST}
                  selectedSkills={selectedSkills}
                  onSkillsChange={setSelectedSkills}
                  placeholder="Type to search skills..."
                />
              </div>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving Settings..." : "Save Settings"}
              </button>

              {error && (
                <p className="text-sm text-red-500 mt-2 text-center">{error}</p>
              )}
              {saveSuccess && (
                <p className="text-sm text-green-500 mt-2 text-center">
                  Settings saved successfully!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
