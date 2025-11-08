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

interface LinkedInData {
  access_token: string;
  linkedin_id: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture: string;
  connected_at: string;
}

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
  
  // LinkedIn connection states
  const [linkedinData, setLinkedinData] = useState<LinkedInData | null>(null);
  const [isConnectingLinkedIn, setIsConnectingLinkedIn] = useState(false);
  const [linkedinError, setLinkedinError] = useState<string | null>(null);

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
          
          // Load LinkedIn connection data if exists
          if (data.linkedin) {
            setLinkedinData(data.linkedin as LinkedInData);
          }
          
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

  // Handle LinkedIn OAuth connection
  const handleConnectLinkedIn = async () => {
    if (!user) {
      setLinkedinError("You must be logged in to connect LinkedIn.");
      return;
    }

    setIsConnectingLinkedIn(true);
    setLinkedinError(null);

    try {
      // Get authorization URL from backend
      const response = await fetch("http://localhost:8000/api/linkedin/authorize");
      if (!response.ok) {
        throw new Error("Failed to get LinkedIn authorization URL");
      }

      const { auth_url } = await response.json();

      // Open popup window for OAuth
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        auth_url,
        "LinkedIn OAuth",
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
      );

      if (!popup) {
        throw new Error("Popup blocked. Please allow popups for this site.");
      }

      // Listen for message from popup
      const messageHandler = async (event: MessageEvent) => {
        // Security: In production, verify event.origin
        if (event.data.success && event.data.data) {
          const linkedinProfile: LinkedInData = event.data.data;
          
          // Save to Firestore
          try {
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
              linkedin: linkedinProfile,
            });

            setLinkedinData(linkedinProfile);
            setLinkedinError(null);
            popup.close();
            window.removeEventListener("message", messageHandler);
          } catch (err) {
            console.error("Error saving LinkedIn data:", err);
            setLinkedinError("Failed to save LinkedIn connection. Please try again.");
            popup.close();
            window.removeEventListener("message", messageHandler);
          }
        } else if (event.data.error) {
          setLinkedinError(event.data.error);
          popup.close();
          window.removeEventListener("message", messageHandler);
        }
      };

      window.addEventListener("message", messageHandler);

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener("message", messageHandler);
          setIsConnectingLinkedIn(false);
        }
      }, 500);

    } catch (err) {
      console.error("Error connecting LinkedIn:", err);
      setLinkedinError(err instanceof Error ? err.message : "Failed to connect LinkedIn. Please try again.");
    } finally {
      setIsConnectingLinkedIn(false);
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
            {/* Header with LinkedIn Connect Button */}
            <div className="flex justify-between items-start mb-8">
              <div className="text-center flex-1 animate-fade-in-up">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 animate-gradient">
                  User Settings
                </div>
                <p className="text-slate-600 dark:text-slate-300 animate-fade-in-up animate-delay-100">
                  Manage your profile information and skills
                </p>
              </div>
              
              {/* LinkedIn Connection Section */}
              <div className="flex flex-col items-end gap-3">
                {linkedinData ? (
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-3">
                      {linkedinData.profile_picture && (
                        <img
                          src={linkedinData.profile_picture}
                          alt={linkedinData.name}
                          className="w-12 h-12 rounded-full border-2 border-blue-500"
                        />
                      )}
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {linkedinData.name}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                          Connected!
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectLinkedIn}
                    disabled={isConnectingLinkedIn}
                    className="px-4 py-2 rounded-lg bg-[#0077b5] hover:bg-[#006399] text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isConnectingLinkedIn ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        Connect LinkedIn
                      </>
                    )}
                  </button>
                )}
                {linkedinError && (
                  <p className="text-xs text-red-500 text-right max-w-[200px]">
                    {linkedinError}
                  </p>
                )}
              </div>
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
