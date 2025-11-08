"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Target, Filter, X, Building2, Briefcase, LogOut, Settings, User, PlusCircle, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db, saveUserJob, fetchUserJobs, deleteUserJob, saveFocusedPosition, removeFocusedPosition, fetchFocusedPositions } from "@/lib/firebase";
import AddJobModal from "@/components/AddJobModal";
import PositionDetailModal from "@/components/PositionDetailModal";

interface Position {
  id: string;
  title: string;
  industry: string;
  requiredSkills: string[];
  description?: string;
  company?: string;
  isCustom?: boolean; // Added for custom jobs
  jobUrl?: string; // Added for custom jobs
  userId?: string; // Added to link custom jobs to users
}

interface PositionWithProgress extends Position {
  completionPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  isFocused?: boolean;
}

export default function TargetPositionsPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [customJobs, setCustomJobs] = useState<Position[]>([]); // New state for custom jobs
  const [loadingData, setLoadingData] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [filterByMySkills, setFilterByMySkills] = useState(false);
  const [filterCustomJobsOnly, setFilterCustomJobsOnly] = useState(false);
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
  const [focusedPositionIds, setFocusedPositionIds] = useState<Set<string>>(new Set());
  const [selectedPosition, setSelectedPosition] = useState<PositionWithProgress | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [courseraRecommendations, setCourseraRecommendations] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchUserSkills();
      fetchPositions();
      fetchAndSetUserJobs(); // Fetch custom jobs for the user
      fetchFocusedPositionsIds(); // Fetch focused positions
    }
  }, [user]);

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
        // Handle different data formats
        if (data.skills) {
          if (Array.isArray(data.skills)) {
            // Check if it's an array of strings or objects
            if (data.skills.length > 0 && typeof data.skills[0] === 'string') {
              // Array of strings
              setUserSkills(data.skills);
            } else {
              // Array of objects with skill property
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

  const positionsWithProgress: PositionWithProgress[] = useMemo(() => {
    const allPositions = [...positions, ...customJobs.filter(job => job.userId === user?.uid)]; // Include custom jobs
    return allPositions.map((position) => {
      const { percentage, matching, missing } = calculateCompletionPercentage(
        position.requiredSkills,
        userSkills
      );
      return {
        ...position,
        completionPercentage: percentage,
        matchingSkills: matching,
        missingSkills: missing,
        isFocused: focusedPositionIds.has(position.id),
      };
    });
  }, [positions, customJobs, userSkills, user, focusedPositionIds]);

  const industries = useMemo(() => {
    const uniqueIndustries = Array.from(
      new Set(positions.map((p) => p.industry))
    ).sort();
    return uniqueIndustries;
  }, [positions]);

  const allSkills = useMemo(() => {
    const skillsSet = new Set<string>();
    positions.forEach((position) => {
      position.requiredSkills.forEach((skill) => {
        skillsSet.add(skill);
      });
    });
    return Array.from(skillsSet).sort();
  }, [positions]);

  const filteredPositions = useMemo(() => {
    let filtered = positionsWithProgress;

    // Filter by custom jobs only
    if (filterCustomJobsOnly) {
      filtered = filtered.filter((p) => p.isCustom === true);
    }

    // Filter by industry
    if (selectedIndustry !== "all") {
      filtered = filtered.filter((p) => p.industry === selectedIndustry);
    }

    // Filter by selected skills
    if (selectedSkills.length > 0) {
      filtered = filtered.filter((position) => {
        const positionSkillsLower = position.requiredSkills.map((s) =>
          s.toLowerCase().trim()
        );
        return selectedSkills.some((selectedSkill) =>
          positionSkillsLower.includes(selectedSkill.toLowerCase().trim())
        );
      });
    }

    // Filter by user's existing skills (only show positions where user has at least one matching skill)
    if (filterByMySkills) {
      filtered = filtered.filter((position) => position.matchingSkills.length > 0);
    }

    return filtered;
  }, [positionsWithProgress, selectedIndustry, selectedSkills, filterByMySkills, filterCustomJobsOnly]);

  const handleAddCustomJob = async (jobDetails: { title: string; company: string; industry: string; description: string; requiredSkills: string }) => {
    if (!user) return;
    const newCustomJob: Position = {
      id: `custom-${Date.now()}`, // Unique ID for custom job
      title: jobDetails.title,
      company: jobDetails.company,
      industry: jobDetails.industry,
      requiredSkills: jobDetails.requiredSkills.split(",").map((skill) => skill.trim()).filter(Boolean),
      description: jobDetails.description,
      isCustom: true,
      userId: user.uid, // Link to the current user
    };
    try {
      await saveUserJob(user.uid, newCustomJob); // Save to Firebase
      // Refetch custom jobs from Firebase to ensure the new job appears with correct data
      await fetchAndSetUserJobs();
      setIsAddJobModalOpen(false); // Close modal after successful submission
    } catch (error: any) {
      console.error("Error saving custom job to Firebase:", error);
      // Show more detailed error message
      const errorMessage = error?.message || error?.code || "Unknown error";
      alert(`Failed to save custom job: ${errorMessage}. Please try again.`);
    }
  };

  const handleDeleteCustomJob = async (id: string) => {
    if (!user) return;
    try {
      await deleteUserJob(user.uid, id); // Delete from Firebase
      setCustomJobs((prev) => prev.filter((job) => job.id !== id));
    } catch (error) {
      console.error("Error deleting custom job from Firebase:", error);
      // Optionally, show an error message to the user
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleSkillFilter = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const handlePositionClick = (position: PositionWithProgress) => {
    setSelectedPosition(position);
    setIsDetailModalOpen(true);
    if (position.missingSkills.length > 0) {
      fetchCourseraRecommendations(position.missingSkills);
    } else {
      setCourseraRecommendations([]);
    }
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedPosition(null);
    setCourseraRecommendations([]); // Clear recommendations when modal closes
  };

  const handleToggleFocus = async (positionId: string) => {
    if (!user) return;
    
    const isCurrentlyFocused = focusedPositionIds.has(positionId);
    
    try {
      if (isCurrentlyFocused) {
        await removeFocusedPosition(user.uid, positionId);
        setFocusedPositionIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(positionId);
          return newSet;
        });
      } else {
        await saveFocusedPosition(user.uid, positionId);
        setFocusedPositionIds((prev) => new Set(prev).add(positionId));
      }
      
      // Update selected position if modal is open
      if (selectedPosition && selectedPosition.id === positionId) {
        setSelectedPosition({
          ...selectedPosition,
          isFocused: !isCurrentlyFocused,
        });
      }
    } catch (error) {
      console.error("Error toggling focus:", error);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return "from-green-500 to-green-600";
    if (percentage >= 50) return "from-blue-500 to-blue-600";
    if (percentage >= 25) return "from-yellow-500 to-yellow-600";
    return "from-orange-500 to-orange-600";
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
      {/* Navigation Header */}
      <nav className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              SkillBridge
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-300 hover:scale-105"
              >
                Dashboard
              </Link>
              <Link
                href="/skills-setup"
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-300 hover:scale-105"
              >
                Skills Setup
              </Link>
              <button className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-105">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-105">
                <User className="w-5 h-5" />
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 hover:scale-105"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-down">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-slate-900 dark:text-white">
            Target Positions
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Explore positions and see how your skills match
          </p>
          <button
            onClick={() => setIsAddJobModalOpen(true)}
            className="mt-4 px-6 py-3 rounded-full bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 animate-fade-in-up"
          >
            <PlusCircle className="w-5 h-5" />
            Add Custom Job
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Filters</h2>
          </div>

          <div className="space-y-4">
            {/* Industry Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Industry
              </label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full md:w-64 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="all">All Industries</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by My Skills Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="filterByMySkills"
                checked={filterByMySkills}
                onChange={(e) => setFilterByMySkills(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <label
                htmlFor="filterByMySkills"
                className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Show only positions matching my skills
              </label>
            </div>

            {/* Filter by Custom Jobs Only Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="filterCustomJobsOnly"
                checked={filterCustomJobsOnly}
                onChange={(e) => setFilterCustomJobsOnly(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <label
                htmlFor="filterCustomJobsOnly"
                className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Show only custom jobs
              </label>
            </div>

            {/* Skills Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Filter by Skills
              </label>
              <div className="flex flex-wrap gap-2">
                {allSkills.slice(0, 20).map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkillFilter(skill)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedSkills.includes(skill)
                        ? "bg-blue-600 text-white shadow-lg scale-105"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              {selectedSkills.length > 0 && (
                <button
                  onClick={() => setSelectedSkills([])}
                  className="mt-3 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear skill filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Positions Grid */}
        {filteredPositions.length === 0 ? (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-12 border border-slate-200 dark:border-slate-700 shadow-lg text-center animate-fade-in-up">
            <Briefcase className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              No positions found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Try adjusting your filters to see more positions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPositions.map((position, index) => (
              <div
                key={position.id}
                onClick={() => handlePositionClick(position)}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in-up cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex-1">
                      {position.title}
                      {position.isCustom && (
                        <span className="ml-2 px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                          Custom
                        </span>
                      )}
                      {position.isFocused && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 inline-block ml-2" />
                      )}
                    </h3>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                        {position.completionPercentage}%
                      </div>
                      {position.isCustom && position.userId === user?.uid && (
                        <button
                          onClick={() => handleDeleteCustomJob(position.id)}
                          className="p-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                          title="Delete custom job"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    {position.company && (
                      <>
                        <Building2 className="w-4 h-4" />
                        <span>{position.company}</span>
                      </>
                    )}
                    <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {position.industry}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getProgressColor(
                        position.completionPercentage
                      )} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${position.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Description */}
                {position.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                    {position.description}
                  </p>
                )}

                {/* Skills Tags */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">
                      Skills You Have ({position.matchingSkills.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {position.matchingSkills.length > 0 ? (
                        position.matchingSkills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          None
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-2">
                      Skills Needed ({position.missingSkills.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {position.missingSkills.length > 0 ? (
                        position.missingSkills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          All skills covered!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <AddJobModal
        isOpen={isAddJobModalOpen}
        onClose={() => setIsAddJobModalOpen(false)}
        onSubmit={handleAddCustomJob}
      />
      <PositionDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseModal}
        position={selectedPosition}
        onToggleFocus={() => selectedPosition && handleToggleFocus(selectedPosition.id)}
        courseraRecommendations={courseraRecommendations}
        loadingRecommendations={loadingRecommendations}
      />
    </div>
  );
}
