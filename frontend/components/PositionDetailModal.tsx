import React from "react";
import { X, Star, Building2, Target, CheckCircle, AlertCircle, BookOpen, ExternalLink } from "lucide-react";

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

interface PositionWithProgress extends Position {
  completionPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  isFocused?: boolean;
}

interface EdxRecommendation {
  id: string;
  title: string;
  platform: string;
  url: string;
  description: string;
}

interface PositionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: PositionWithProgress | null;
  onToggleFocus: () => void;
  edxRecommendations: EdxRecommendation[];
  loadingRecommendations: boolean;
}

export default function PositionDetailModal({
  isOpen,
  onClose,
  position,
  onToggleFocus,
  edxRecommendations,
  loadingRecommendations,
}: PositionDetailModalProps) {
  if (!isOpen || !position) return null;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return "from-green-500 to-green-600";
    if (percentage >= 50) return "from-blue-500 to-blue-600";
    if (percentage >= 25) return "from-yellow-500 to-yellow-600";
    return "from-orange-500 to-orange-600";
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {position.title}
              </h2>
              {position.isCustom && (
                <span className="px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                  Custom
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              {position.company && (
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  <span>{position.company}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                <span>{position.industry}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors ml-4"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Completion Percentage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Skill Match
              </span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {position.completionPercentage}%
              </span>
            </div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
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
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Job Description
              </h3>
              <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                {position.description}
              </p>
            </div>
          )}

          {/* Skills Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills You Have */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                  Skills You Have ({position.matchingSkills.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {position.matchingSkills.length > 0 ? (
                  position.matchingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    None
                  </span>
                )}
              </div>
            </div>

            {/* Skills Needed */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-400">
                  Skills Needed ({position.missingSkills.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {position.missingSkills.length > 0 ? (
                  position.missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    All skills covered!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Learning Resources */}
          {position.missingSkills.length > 0 && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                  Learning Resources
                </h3>
              </div>
              {loadingRecommendations ? (
                <p className="text-slate-600 dark:text-slate-400">Loading recommendations...</p>
              ) : edxRecommendations.length > 0 ? (
                <div className="space-y-3">
                  {edxRecommendations.map((course) => (
                    <a
                      key={course.id}
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors duration-200"
                    >
                      <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        {course.title} <ExternalLink className="w-4 h-4" />
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {course.description}
                      </p>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Platform: {course.platform}
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 dark:text-slate-400">No learning resources found for missing skills.</p>
              )}
            </div>
          )}

          {/* Focus Button */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={onToggleFocus}
              className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                position.isFocused
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white"
              }`}
            >
              <Star
                className={`w-5 h-5 ${
                  position.isFocused ? "fill-current" : ""
                }`}
              />
              {position.isFocused
                ? "Remove from Focus"
                : "Focus on This Position"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
