"use client";

import { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";

export interface SkillWithLevel {
  skill: string;
  level: string;
}

interface TagInputProps {
  skills: string[];
  selectedSkills: SkillWithLevel[];
  onSkillsChange: (skills: SkillWithLevel[]) => void;
  placeholder?: string;
}

const EXPERIENCE_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
];

export default function TagInput({
  skills,
  selectedSkills,
  onSkillsChange,
  placeholder = "Type to search skills...",
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const selectedSkillNames = selectedSkills.map((s) => s.skill);
    const filtered = skills
      .filter(
        (skill) =>
          skill.toLowerCase().includes(inputValue.toLowerCase()) &&
          !selectedSkillNames.includes(skill)
      )
      .slice(0, 10); // Limit to 10 suggestions

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setSelectedIndex(-1);
  }, [inputValue, skills, selectedSkills]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSelectSkill = (skill: string) => {
    const selectedSkillNames = selectedSkills.map((s) => s.skill);
    if (!selectedSkillNames.includes(skill)) {
      onSkillsChange([...selectedSkills, { skill, level: "Intermediate" }]);
    }
    setInputValue("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onSkillsChange(selectedSkills.filter((s) => s.skill !== skillToRemove));
  };

  const handleLevelChange = (skill: string, level: string) => {
    onSkillsChange(
      selectedSkills.map((s) => (s.skill === skill ? { ...s, level } : s))
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter" && inputValue.trim() !== "") {
        // Try to add the input as a new skill if it matches
        const selectedSkillNames = selectedSkills.map((s) => s.skill);
        const exactMatch = skills.find(
          (skill) => skill.toLowerCase() === inputValue.trim().toLowerCase()
        );
        if (exactMatch && !selectedSkillNames.includes(exactMatch)) {
          handleSelectSkill(exactMatch);
        }
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSkill(suggestions[selectedIndex]);
        } else if (suggestions.length > 0) {
          handleSelectSkill(suggestions[0]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative">
      {/* Selected Skills Chips */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 overflow-visible">
          {selectedSkills.map((skillWithLevel) => (
            <SkillChip
              key={skillWithLevel.skill}
              skillWithLevel={skillWithLevel}
              onLevelChange={handleLevelChange}
              onRemove={handleRemoveSkill}
            />
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400 focus:scale-[1.01] transform"
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto animate-fade-in-up"
          >
            {suggestions.map((skill, index) => (
              <button
                key={skill}
                type="button"
                onClick={() => handleSelectSkill(skill)}
                className={`w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                  index === selectedIndex
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : ""
                } ${
                  index === 0 ? "rounded-t-lg" : ""
                } ${
                  index === suggestions.length - 1 ? "rounded-b-lg" : ""
                }`}
              >
                <span className="text-slate-900 dark:text-white font-medium">
                  {skill}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Skill Chip Component
function SkillChip({
  skillWithLevel,
  onLevelChange,
  onRemove,
}: {
  skillWithLevel: SkillWithLevel;
  onLevelChange: (skill: string, level: string) => void;
  onRemove: (skill: string) => void;
}) {
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);
  const levelDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        levelDropdownRef.current &&
        !levelDropdownRef.current.contains(event.target as Node)
      ) {
        setShowLevelDropdown(false);
      }
    };

    if (showLevelDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showLevelDropdown]);

  return (
    <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium animate-fade-in-up transition-all duration-300 relative ${!showLevelDropdown ? 'hover:scale-105' : ''}`}>
      <span>{skillWithLevel.skill}</span>
      <div className="relative z-10" ref={levelDropdownRef}>
        <button
          type="button"
          onClick={() => setShowLevelDropdown(!showLevelDropdown)}
          className="ml-1 px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 transition-colors text-xs flex items-center gap-1"
        >
          <span>{skillWithLevel.level}</span>
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showLevelDropdown ? 'rotate-180' : ''}`} />
        </button>
        {showLevelDropdown && (
          <div className="absolute z-[100] mt-1 right-0 top-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl min-w-[120px] overflow-hidden">
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => {
                  onLevelChange(skillWithLevel.skill, level);
                  setShowLevelDropdown(false);
                }}
                onMouseDown={(e) => e.preventDefault()}
                className={`w-full text-left px-3 py-2 text-sm transition-colors duration-150 whitespace-nowrap ${
                  skillWithLevel.level === level
                    ? "bg-blue-50 dark:bg-blue-900/20 font-semibold text-slate-900 dark:text-white"
                    : "text-slate-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20"
                } ${
                  level === EXPERIENCE_LEVELS[0] ? "rounded-t-lg" : ""
                } ${
                  level === EXPERIENCE_LEVELS[EXPERIENCE_LEVELS.length - 1]
                    ? "rounded-b-lg"
                    : ""
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onRemove(skillWithLevel.skill)}
        className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
        aria-label={`Remove ${skillWithLevel.skill}`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

