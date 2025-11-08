import React, { useState } from "react";
import { X } from "lucide-react";

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobDetails: { title: string; company: string; industry: string; description: string; requiredSkills: string }) => void;
}

export default function AddJobModal({ isOpen, onClose, onSubmit }: AddJobModalProps) {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState(""); // Comma-separated string for now

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobTitle.trim() && company.trim() && industry.trim() && description.trim()) {
      onSubmit({
        title: jobTitle,
        company: company,
        industry: industry,
        description: description,
        requiredSkills: requiredSkills,
      });
      setJobTitle("");
      setCompany("");
      setIndustry("");
      setDescription("");
      setRequiredSkills("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl w-full max-w-md mx-4 border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Add Custom Job</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Job Title
            </label>
            <input
              type="text"
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Software Engineer"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="company" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Company
            </label>
            <input
              type="text"
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g., Tech Solutions Inc."
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="industry" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Industry
            </label>
            <input
              type="text"
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g., Software Development"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter job description here..."
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="requiredSkills" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Required Skills (comma-separated)
            </label>
            <input
              type="text"
              id="requiredSkills"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              placeholder="e.g., React, JavaScript, Python"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all duration-300 shadow-md"
            >
              Add Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
