"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Upload, Mic, ArrowLeft, FileText } from "lucide-react";
import TagInput, { SkillWithLevel } from "@/components/TagInput";
import { SKILLS_LIST } from "@/lib/skills";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type InputMethod = "resume" | "voice";

export default function SkillsSetupPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<InputMethod | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<SkillWithLevel[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Skills saving states
  const [isSavingSkills, setIsSavingSkills] = useState(false);
  const [skillsSaveSuccess, setSkillsSaveSuccess] = useState(false);
  const [skillsSaveError, setSkillsSaveError] = useState<string | null>(null);
  
  // Auto-processing states
  const [isProcessingSkills, setIsProcessingSkills] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  
  // Resume upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeUploadSuccess, setResumeUploadSuccess] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Skills loading state
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Start recording
  const startRecording = async () => {
    try {
      setError(null);
      setUploadSuccess(false);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm;codecs=opus",
        });
        await uploadRecording(audioBlob);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Failed to access microphone. Please check permissions.");
      setIsRecording(false);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
  };

  // Upload recording to backend
  const uploadRecording = async (audioBlob: Blob) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `recording-${timestamp}.webm`;
      formData.append("audio", audioBlob, filename);

      const response = await fetch("http://localhost:8000/api/recordings", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload recording");
      }

      const result = await response.json();
      setUploadSuccess(true);
      setRecordingDuration(0);
      
      // Automatically process transcription with Gemini to extract skills
      if (result.transcription && result.transcription.trim()) {
        await processTextWithGemini(result.transcription);
      }
    } catch (err) {
      console.error("Error uploading recording:", err);
      setError("Failed to upload recording. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Resume file handling
  const handleFileSelect = (file: File) => {
    setResumeError(null);
    setResumeUploadSuccess(false);
    
    // Validate file type
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      setResumeError("Invalid file type. Please upload a PDF, DOC, or DOCX file.");
      return;
    }
    
    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setResumeError("File size exceeds 10MB limit.");
      return;
    }
    
    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUploadResume = async () => {
    if (!selectedFile) return;
    
    setIsUploadingResume(true);
    setResumeError(null);
    
    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);
      
      const response = await fetch("http://localhost:8000/api/resumes", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = "Failed to upload resume";
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      setResumeUploadSuccess(true);
      setSelectedFile(null);
      
      // Automatically process extracted text with Gemini to extract skills
      if (result.text && result.text.trim()) {
        await processTextWithGemini(result.text);
      }
    } catch (err) {
      console.error("Error uploading resume:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to upload resume. Please try again.";
      setResumeError(errorMessage);
    } finally {
      setIsUploadingResume(false);
    }
  };

  // Process text with Gemini API (helper function for auto-processing)
  const processTextWithGemini = async (text: string) => {
    if (!user) {
      setProcessingError("You must be logged in to process skills.");
      return;
    }

    if (!text.trim()) {
      setProcessingError("No text content to process.");
      return;
    }

    setIsProcessingSkills(true);
    setProcessingError(null);

    try {
      const response = await fetch("http://localhost:8000/api/skills/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          user_id: user.uid,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to process text";
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Convert processed skills to SkillWithLevel format
      const skillsWithLevels: SkillWithLevel[] = result.skills.map((s: any) => ({
        skill: s.skill,
        level: s.level || "Intermediate",
      }));
      
      setSelectedSkills(skillsWithLevels);
    } catch (err) {
      console.error("Error processing text:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to process text. Please try again.";
      setProcessingError(errorMessage);
    } finally {
      setIsProcessingSkills(false);
    }
  };

  // Save skills to Firebase and backend
  const handleSaveSkills = async () => {
    if (!user) {
      setSkillsSaveError("You must be logged in to save skills.");
      return;
    }

    if (selectedSkills.length === 0) {
      setSkillsSaveError("Please add at least one skill before saving.");
      return;
    }

    setIsSavingSkills(true);
    setSkillsSaveError(null);
    setSkillsSaveSuccess(false);

    try {
      // Save skills to Firebase Firestore
      const userDocRef = doc(db, "users", user.uid);
      
      // Prepare skills data for Firebase
      const skillsData = selectedSkills.map(skill => ({
        skill: skill.skill,
        level: skill.level,
      }));

      // Update user document with skills and mark setup as complete
      await updateDoc(userDocRef, {
        skills: skillsData,
        hasCompletedSkillsSetup: true,
        skillsUpdatedAt: new Date().toISOString(),
      });

      // Also save to backend API (if needed for other services)
      try {
        const response = await fetch("http://localhost:8000/api/skills", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.uid,
            skills: selectedSkills,
          }),
        });

        if (!response.ok) {
          console.warn("Backend API save failed, but Firebase save succeeded");
        }
      } catch (backendError) {
        // Log but don't fail if backend save fails - Firebase save is primary
        console.warn("Backend API save error:", backendError);
      }

      setSkillsSaveSuccess(true);
    } catch (err) {
      console.error("Error saving skills:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to save skills. Please try again.";
      setSkillsSaveError(errorMessage);
    } finally {
      setIsSavingSkills(false);
    }
  };

  // Load existing skills from Firebase when user is available
  useEffect(() => {
    const loadExistingSkills = async () => {
      if (!user) return;

      setIsLoadingSkills(true);
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          
          // Handle different data formats
          if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
            // Check if it's an array of objects with skill and level properties
            const skillsWithLevels: SkillWithLevel[] = data.skills.map((s: any) => {
              // Handle both object format {skill: "Java", level: "Intermediate"} and string format
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
        console.error("Error loading existing skills:", err);
        // Don't show error to user - just log it, as this is a background operation
      } finally {
        setIsLoadingSkills(false);
      }
    };

    loadExistingSkills();
  }, [user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl">
        {/* Navigation */}
        <nav className="mb-8 animate-fade-in-down">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              SkillBridge
            </Link>
            <div className="flex items-center gap-3 text-sm">
              <Link 
                href="/"
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-300 hover:scale-105"
              >
                Home
              </Link>
              <Link 
                href="/dashboard"
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-300 hover:scale-105"
              >
                Dashboard
              </Link>
              <Link 
                href="/target-positions"
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-300 hover:scale-105"
              >
                Target Positions
              </Link>
              <Link 
                href="/skills-setup"
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-300 hover:scale-105"
              >
                Skills Setup
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 animate-scale-in hover:shadow-3xl transition-all duration-500">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 animate-gradient">
              Set Up Your Skills
            </div>
            <p className="text-slate-600 dark:text-slate-300 animate-fade-in-up animate-delay-100">
              Choose how you'd like to add your skills
            </p>
          </div>

          {/* Option Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 animate-fade-in-up animate-delay-200">
            {/* Resume Option */}
            <button
              onClick={() => setSelectedMethod("resume")}
              className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 transform flex items-center gap-4 ${
                selectedMethod === "resume"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105"
                  : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-blue-400"
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                selectedMethod === "resume"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600"
                  : "bg-slate-200 dark:bg-slate-600"
              }`}>
                <Upload className={`w-6 h-6 ${
                  selectedMethod === "resume" ? "text-white" : "text-slate-600 dark:text-slate-300"
                }`} />
              </div>
              <div className="text-left">
                <h3 className={`text-lg font-semibold mb-1 ${
                  selectedMethod === "resume"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-900 dark:text-white"
                }`}>
                  Upload Resume
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Upload your resume file
                </p>
              </div>
            </button>

            {/* Voice Option */}
            <button
              onClick={() => setSelectedMethod("voice")}
              className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 transform flex items-center gap-4 ${
                selectedMethod === "voice"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105"
                  : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-blue-400"
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                selectedMethod === "voice"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600"
                  : "bg-slate-200 dark:bg-slate-600"
              }`}>
                <Mic className={`w-6 h-6 ${
                  selectedMethod === "voice" ? "text-white" : "text-slate-600 dark:text-slate-300"
                }`} />
              </div>
              <div className="text-left">
                <h3 className={`text-lg font-semibold mb-1 ${
                  selectedMethod === "voice"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-900 dark:text-white"
                }`}>
                  Voice Recording
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Speak your skills aloud
                </p>
              </div>
            </button>
          </div>

          {/* Dynamic Content Area */}
          {selectedMethod && (
            <div className="animate-fade-in-up animate-delay-300">
              {selectedMethod === "resume" && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Upload your resume
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                      isDragging
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        {selectedFile ? (
                          <div className="space-y-3">
                            <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                              {selectedFile.name}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <div className="flex gap-2 justify-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedFile(null);
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = "";
                                  }
                                }}
                                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300"
                              >
                                Remove
                              </button>
                              <button
                                type="button"
                                onClick={handleUploadResume}
                                disabled={isUploadingResume}
                                className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isUploadingResume ? "Uploading..." : "Upload"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                              {isDragging ? "Drop your resume here" : "Drop your resume here"}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                              or click to browse
                            </p>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileInputChange}
                              className="hidden"
                              id="resume-upload"
                            />
                            <label
                              htmlFor="resume-upload"
                              className="inline-block px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform cursor-pointer"
                            >
                              Choose File
                            </label>
                          </>
                        )}
                        {resumeError && (
                          <p className="text-sm text-red-500 mt-3">{resumeError}</p>
                        )}
                        {resumeUploadSuccess && (
                          <p className="text-sm text-green-500 mt-3">
                            Resume uploaded successfully!
                          </p>
                        )}
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-3">
                          Supported formats: PDF, DOC, DOCX (Max 10MB)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Processing Status */}
                  {isProcessingSkills && (
                    <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                        Processing skills with AI...
                      </p>
                    </div>
                  )}

                  {/* Processing Error */}
                  {processingError && (
                    <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-600 dark:text-red-400">{processingError}</p>
                    </div>
                  )}

                  {/* Extracted Skills Display */}
                  {selectedSkills.length > 0 && (
                    <div className="mt-4 space-y-4">
                      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <p className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2">
                          ✓ Found {selectedSkills.length} skills:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedSkills.map((skill) => (
                            <span
                              key={skill.skill}
                              className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium"
                            >
                              {skill.skill} ({skill.level})
                            </span>
                          ))}
                        </div>
                      </div>

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

                      <button
                        type="button"
                        onClick={handleSaveSkills}
                        disabled={isSavingSkills}
                        className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSavingSkills ? "Saving Skills..." : "Save Skills"}
                      </button>
                      {skillsSaveError && (
                        <p className="text-sm text-red-500 mt-2 text-center">{skillsSaveError}</p>
                      )}
                      {skillsSaveSuccess && (
                        <p className="text-sm text-green-500 mt-2 text-center">
                          Skills saved successfully!
                        </p>
                      )}
                      
                      {/* Continue to Target Positions Button */}
                      {(skillsSaveSuccess || selectedSkills.length > 0) && (
                        <button
                          type="button"
                          onClick={() => router.push("/target-positions")}
                          className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                        >
                          Continue to Target Positions
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {selectedMethod === "voice" && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Record your skills
                  </label>
                  <div className="border border-slate-300 dark:border-slate-600 rounded-xl p-8 bg-slate-50 dark:bg-slate-700/50">
                    <div className="flex flex-col items-center justify-center gap-6">
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isRecording
                          ? "bg-red-500 animate-pulse"
                          : "bg-gradient-to-br from-blue-500 to-indigo-600"
                      }`}>
                        <Mic className={`w-12 h-12 text-white ${isRecording ? "animate-pulse" : ""}`} />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                          {isUploading
                            ? "Uploading..."
                            : uploadSuccess
                            ? "Recording saved!"
                            : isRecording
                            ? "Recording..."
                            : "Ready to record"}
                        </p>
                        {isRecording && (
                          <p className="text-2xl font-bold text-red-500 mb-2">
                            {formatDuration(recordingDuration)}
                          </p>
                        )}
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                          {isUploading
                            ? "Please wait while we save your recording"
                            : uploadSuccess
                            ? "Your recording has been saved successfully"
                            : isRecording
                            ? "Speak clearly about your skills"
                            : "Click the button below to start recording"}
                        </p>
                        {error && (
                          <p className="text-sm text-red-500 mb-4">{error}</p>
                        )}
                        <button
                          type="button"
                          onClick={isRecording ? stopRecording : startRecording}
                          disabled={isUploading}
                          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed ${
                            isRecording
                              ? "bg-red-600 hover:bg-red-700 text-white"
                              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                          }`}
                        >
                          {isUploading
                            ? "Uploading..."
                            : isRecording
                            ? "Stop Recording"
                            : "Start Recording"}
                        </button>
                        {isRecording && (
                          <div className="mt-4 flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Processing Status */}
                  {isProcessingSkills && (
                    <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                        Processing skills with AI...
                      </p>
                    </div>
                  )}

                  {/* Processing Error */}
                  {processingError && (
                    <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-600 dark:text-red-400">{processingError}</p>
                    </div>
                  )}

                  {/* Extracted Skills Display */}
                  {selectedSkills.length > 0 && (
                    <div className="mt-4 space-y-4">
                      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <p className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2">
                          ✓ Found {selectedSkills.length} skills:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedSkills.map((skill) => (
                            <span
                              key={skill.skill}
                              className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium"
                            >
                              {skill.skill} ({skill.level})
                            </span>
                          ))}
                        </div>
                      </div>

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

                      <button
                        type="button"
                        onClick={handleSaveSkills}
                        disabled={isSavingSkills}
                        className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSavingSkills ? "Saving Skills..." : "Save Skills"}
                      </button>
                      {skillsSaveError && (
                        <p className="text-sm text-red-500 mt-2 text-center">{skillsSaveError}</p>
                      )}
                      {skillsSaveSuccess && (
                        <p className="text-sm text-green-500 mt-2 text-center">
                          Skills saved successfully!
                        </p>
                      )}
                      
                      {/* Continue to Target Positions Button */}
                      {(skillsSaveSuccess || selectedSkills.length > 0) && (
                        <button
                          type="button"
                          onClick={() => router.push("/target-positions")}
                          className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                        >
                          Continue to Target Positions
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Helper Text */}
          {!selectedMethod && (
            <div className="text-center text-slate-500 dark:text-slate-400 animate-fade-in-up animate-delay-300">
              <p>Please select an option above to continue</p>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-slate-200 dark:border-slate-800">
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
