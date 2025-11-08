"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Target, AlertCircle, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db, fetchUserJobs, fetchFocusedPositions } from "@/lib/firebase";

interface Position {
  id: string;
  title: string;
  industry: string;
  requiredSkills: string[];
  description?: string;
  company?: string;
  isCustom?: boolean;
  userId?: string;
}

interface SkillGap {
  skill: string;
  jobCount: number;
  percentage: number;
  priority: "High" | "Medium" | "Low";
}

export default function SkillGapAnalysisPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [customJobs, setCustomJobs] = useState<Position[]>([]);
  const [focusedPositionIds, setFocusedPositionIds] = useState<Set<string>>(new Set());
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchUserSkills();
      fetchPositions();
      fetchAndSetUserJobs();
      fetchFocusedPositionsIds();
    }
  }, [user]);

  const fetchAndSetUserJobs = async () => {
    if (!user) return;
    try {
      const userJobs = await fetchUserJobs(user.uid);
      setCustomJobs(userJobs);
    } catch (error) {
      console.error("Error fetching user's custom jobs:", error);
    }
  };

  const fetchFocusedPositionsIds = async () => {
    if (!user) return;
    try {
      const focusedIds = await fetchFocusedPositions(user.uid);
      setFocusedPositionIds(new Set(focusedIds));
    } catch (error) {
      console.error("Error fetching focused positions:", error);
    }
  };

  const fetchUserSkills = async () => {
    if (!user) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.skills) {
          if (Array.isArray(data.skills)) {
            if (data.skills.length > 0 && typeof data.skills[0] === 'string') {
              setUserSkills(data.skills);
            } else {
              setUserSkills(data.skills.map((s: any) => s.skill || s));
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user skills:", error);
    }
  };

  const fetchPositions = async () => {
    try {
      const positionsCollection = collection(db, "positions");
      const positionsSnapshot = await getDocs(positionsCollection);
      const positionsData: Position[] = [];
      positionsSnapshot.forEach((doc) => {
        positionsData.push({
          id: doc.id,
          ...doc.data(),
        } as Position);
      });
      setPositions(positionsData);
      setLoadingData(false);
    } catch (error) {
      console.error("Error fetching positions:", error);
      setLoadingData(false);
    }
  };

  const skillGaps: SkillGap[] = useMemo(() => {
    // Get all target jobs
    const allTargetJobs = [...positions, ...customJobs.filter(job => job.userId === user?.uid)];
    
    // Filter to only focused jobs
    const focusedJobs = allTargetJobs.filter((job) => focusedPositionIds.has(job.id));
    
    // If no focused jobs, return empty array
    if (focusedJobs.length === 0) {
      return [];
    }

    // Extract all unique skills from focused jobs
    const allSkillsSet = new Set<string>();
    focusedJobs.forEach((job) => {
      job.requiredSkills?.forEach((skill) => {
        allSkillsSet.add(skill);
      });
    });

    // Filter out skills user already has (case-insensitive)
    const userSkillsLower = userSkills.map((skill) => skill.toLowerCase().trim());
    const missingSkills = Array.from(allSkillsSet).filter((skill) => {
      const skillLower = skill.toLowerCase().trim();
      return !userSkillsLower.includes(skillLower);
    });

    // Count occurrences of each missing skill across focused jobs
    const skillCounts = new Map<string, number>();
    missingSkills.forEach((skill) => {
      const skillLower = skill.toLowerCase().trim();
      let count = 0;
      focusedJobs.forEach((job) => {
        const jobSkillsLower = job.requiredSkills?.map((s) => s.toLowerCase().trim()) || [];
        if (jobSkillsLower.includes(skillLower)) {
          count++;
        }
      });
      skillCounts.set(skill, count);
    });

    // Convert to array and sort by count (highest first)
    const gaps: SkillGap[] = Array.from(skillCounts.entries())
      .map(([skill, jobCount]) => {
        const percentage = (jobCount / focusedJobs.length) * 100;
        let priority: "High" | "Medium" | "Low";
        if (jobCount >= Math.ceil(focusedJobs.length * 0.5)) {
          priority = "High";
        } else if (jobCount >= Math.ceil(focusedJobs.length * 0.25)) {
          priority = "Medium";
        } else {
          priority = "Low";
        }
        return {
          skill,
          jobCount,
          percentage,
          priority,
        };
      })
      .sort((a, b) => b.jobCount - a.jobCount);

    return gaps;
  }, [positions, customJobs, userSkills, user, focusedPositionIds]);

  const getProgressColor = (priority: "High" | "Medium" | "Low") => {
    switch (priority) {
      case "High":
        return "from-orange-500 to-orange-600";
      case "Medium":
        return "from-yellow-500 to-yellow-600";
      case "Low":
        return "from-blue-500 to-blue-600";
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-300">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const allTargetJobs = [...positions, ...customJobs.filter(job => job.userId === user?.uid)];
  const focusedJobs = allTargetJobs.filter((job) => focusedPositionIds.has(job.id));
  const hasNoFocusedJobs = focusedJobs.length === 0;
  const hasNoGaps = skillGaps.length === 0 && !hasNoFocusedJobs;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-down">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-slate-900 dark:text-white">
            Skill Gap Analysis
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Identify skills you need to develop for your target positions
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg animate-fade-in-up">
          {hasNoFocusedJobs ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                No Focused Jobs Selected
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Focus on target jobs to enable skill gap analysis
              </p>
              <Link
                href="/target-positions"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Target className="w-5 h-5" />
                Browse Target Positions
              </Link>
            </div>
          ) : hasNoGaps ? (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-green-500 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                All Skills Covered!
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                No outstanding skills required for focused jobs
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Missing Skills by Priority
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Skills are prioritized by how many of your focused jobs require them
                </p>
              </div>
              <div className="space-y-4">
                {skillGaps.map((gap, index) => (
                  <div key={gap.skill} className="space-y-2 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-slate-900 dark:text-white">
                          {gap.skill}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Required by {gap.jobCount} {gap.jobCount === 1 ? 'job' : 'jobs'}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        gap.priority === "High"
                          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                          : gap.priority === "Medium"
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      }`}>
                        {gap.priority} Priority
                      </span>
                    </div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getProgressColor(gap.priority)} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${gap.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {gap.percentage.toFixed(1)}% of focused jobs require this skill
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
