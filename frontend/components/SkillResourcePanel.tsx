import React, { useEffect, useState } from "react";
import { X, BookOpen, ExternalLink } from "lucide-react";
import { getResourcesForSkills } from "@/lib/learningResources";

interface LearningResource {
  id: string;
  title: string;
  platform: string;
  url: string;
  description: string;
}

interface SkillResourcePanelProps {
  skill: string;
  onClose: () => void;
}

export default function SkillResourcePanel({
  skill,
  onClose,
}: SkillResourcePanelProps) {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResources() {
      setLoading(true);
      try {
        const resourcesData = getResourcesForSkills([skill]);
        setResources(resourcesData);
      } catch (error) {
        console.error("Error fetching resources:", error);
        setResources([]);
      } finally {
        setLoading(false);
      }
    }

    if (skill) {
      fetchResources();
    }
  }, [skill]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Learning Resources for {skill}
              </h2>
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
        <div className="p-6">
          {loading ? (
            <p className="text-slate-600 dark:text-slate-400">Loading resources...</p>
          ) : resources.length > 0 ? (
            <div className="space-y-4">
              {resources.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors duration-200 border border-slate-200 dark:border-slate-600"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                        {resource.title}
                        <ExternalLink className="w-4 h-4" />
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                        {resource.description}
                      </p>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Platform: {resource.platform}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-400">
              No learning resources found for {skill}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

