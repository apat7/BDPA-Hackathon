"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart, TrendingUp, Target, BookOpen, CheckCircle, AlertCircle, Clock, ExternalLink } from "lucide-react";
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
  jobUrl?: string;
  userId?: string;
}

interface SkillGap {
  skill: string;
  jobCount: number;
  percentage: number;
  priority: "High" | "Medium" | "Low";
}

interface PositionWithProgress extends Position {
  completionPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  isFocused?: boolean;
}

interface CourseraRecommendation {
  id: string;
  title: string;
  platform: string;
  url: string;
  description: string;
}

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [customJobs, setCustomJobs] = useState<Position[]>([]);
  const [focusedPositionIds, setFocusedPositionIds] = useState<Set<string>>(new Set());
  const [courseraRecommendations, setCourseraRecommendations] = useState<CourseraRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
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

  const calculateCompletionPercentage = (
    requiredSkills: string[],
    userSkills: string[]
  ): { percentage: number; matching: string[]; missing: string[] } => {
    if (requiredSkills.length === 0) {
      return { percentage: 0, matching: [], missing: [] };
    }

    const userSkillsLower = userSkills.map((skill) => skill.toLowerCase().trim());
    const matching: string[] = [];
    const missing: string[] = [];

    requiredSkills.forEach((skill) => {
      const skillLower = skill.toLowerCase().trim();
      if (userSkillsLower.includes(skillLower)) {
        matching.push(skill);
      } else {
        missing.push(skill);
      }
    });

    const percentage = Math.round((matching.length / requiredSkills.length) * 100);
    return { percentage, matching, missing };
  };

  const focusedPositionsWithProgress: PositionWithProgress[] = useMemo(() => {
    return positions
      .filter(position => focusedPositionIds.has(position.id))
      .map((position) => {
        const { percentage, matching, missing } = calculateCompletionPercentage(
          position.requiredSkills,
          userSkills
        );
        return {
          ...position,
          completionPercentage: percentage,
          matchingSkills: matching,
          missingSkills: missing,
          isFocused: true,
        };
      });
  }, [positions, userSkills, focusedPositionIds]);

  const aggregatedMissingSkills = useMemo(() => {
    const skillsSet = new Set<string>();
    focusedPositionsWithProgress.forEach(position => {
      position.missingSkills.forEach(skill => skillsSet.add(skill));
    });
    return Array.from(skillsSet);
  }, [focusedPositionsWithProgress]);

  const totalFocusedPositions = focusedPositionIds.size;

  const averageSkillMatchRate = useMemo(() => {
    if (focusedPositionsWithProgress.length === 0) return 0;
    const totalPercentage = focusedPositionsWithProgress.reduce(
      (sum, pos) => sum + pos.completionPercentage,
      0
    );
    return Math.round(totalPercentage / focusedPositionsWithProgress.length);
  }, [focusedPositionsWithProgress]);

  const totalMissingSkills = useMemo(() => {
    return aggregatedMissingSkills.length;
  }, [aggregatedMissingSkills]);

  const totalLearningPaths = useMemo(() => {
    return courseraRecommendations.length;
  }, [courseraRecommendations]);

  const topSkills = useMemo(() => {
    return skillGaps.slice(0, 4);
  }, [skillGaps]);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) {
      return "bg-red-500"; // Very high need
    } else if (percentage >= 50) {
      return "bg-orange-500"; // High need
    } else if (percentage >= 25) {
      return "bg-yellow-500"; // Medium need
    } else {
      return "bg-green-500"; // Low need
    }
  };

  useEffect(() => {
    if (aggregatedMissingSkills.length > 0) {
      fetchCourseraRecommendations(aggregatedMissingSkills);
    } else {
      setCourseraRecommendations([]);
    }
  }, [aggregatedMissingSkills]);

  const fetchCourseraRecommendations = async (skills: string[]) => {
    setLoadingRecommendations(true);
    try {
      const response = await fetch("/api/coursera-recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ skills }),
      });
      const data = await response.json();
      if (response.ok) {
        setCourseraRecommendations(data.recommendations);
      } else {
        console.error("Failed to fetch Coursera recommendations:", data.error);
        setCourseraRecommendations([]);
      }
    } catch (error) {
      console.error("Error fetching Coursera recommendations:", error);
      setCourseraRecommendations([]);
    } finally {
      setLoadingRecommendations(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in-down">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-slate-900 dark:text-white">
            Welcome back!
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Here's your skill gap analysis overview
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in-up animate-delay-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <BarChart className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                {averageSkillMatchRate > 0 ? `+${averageSkillMatchRate}%` : "0%"}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {averageSkillMatchRate}%
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Avg. Skill Match Rate</p>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in-up animate-delay-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-orange-600 dark:text-orange-400 font-semibold">
                {totalMissingSkills}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {totalMissingSkills}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Skills to Learn</p>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in-up animate-delay-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                {totalLearningPaths}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {totalLearningPaths}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Learning Paths</p>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in-up animate-delay-400">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                {totalFocusedPositions}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {totalFocusedPositions}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Focused Positions</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skill Gap Analysis */}
          <div className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg animate-fade-in-up animate-delay-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Skill Gap Analysis</h2>
              <Link 
                href="/skill-gap-analysis"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                View Details
              </Link>
            </div>
            {topSkills.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600 dark:text-slate-400">
                  Focus on target jobs to see skill gaps
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {topSkills.map((gap, index) => (
                  <div key={gap.skill} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">{gap.skill}</span>
                      <span className="text-slate-900 dark:text-white font-semibold">{gap.priority} Priority</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(gap.percentage)} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${gap.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg animate-fade-in-up animate-delay-600">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Completed React course</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Started TypeScript path</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">1 day ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Skill gap updated</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Paths Section */}
        <div className="mt-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg animate-fade-in-up animate-delay-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recommended Learning Paths</h2>
            {/* <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              View All
            </button> */}
          </div>
          {loadingRecommendations ? (
            <p className="text-slate-600 dark:text-slate-400">Loading recommendations...</p>
          ) : courseraRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courseraRecommendations.slice(0, 3).map((course, index) => {
                const colors = [
                  "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800",
                  "from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-800",
                  "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800",
                ];
                const iconColors = [
                  "bg-blue-600",
                  "bg-indigo-600",
                  "bg-purple-600",
                ];
                const linkColors = [
                  "text-blue-600 dark:text-blue-400",
                  "text-indigo-600 dark:text-indigo-400",
                  "text-purple-600 dark:text-purple-400",
                ];
                const currentColor = colors[index % colors.length];
                const currentIconColor = iconColors[index % iconColors.length];
                const currentLinkColor = linkColors[index % linkColors.length];

                return (
                  <a
                    key={course.id}
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block p-4 rounded-xl bg-gradient-to-br ${currentColor} border hover:shadow-lg transition-all duration-300 hover:scale-105`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg ${currentIconColor} flex items-center justify-center`}>
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white flex-1">
                        {course.title}
                      </h3>
                      <ExternalLink className={`w-4 h-4 ${currentLinkColor}`} />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Platform: {course.platform}</span>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-400">No Coursera recommendations found for your missing skills from focused positions.</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-slate-200 dark:border-slate-800 mt-12">
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
