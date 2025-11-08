"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Type, Upload, Mic, ArrowLeft, FileText, Keyboard } from "lucide-react";
import TagInput from "@/components/TagInput";
import { SKILLS_LIST } from "@/lib/skills";

type InputMethod = "typing" | "resume" | "voice";

export default function SkillsSetupPage() {
  const [selectedMethod, setSelectedMethod] = useState<InputMethod | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error uploading recording:", err);
      setError("Failed to upload recording. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-4xl">
        {/* Back to Home Link */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-300 mb-8 animate-fade-in-down hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in-up animate-delay-200">
            {/* Typing Option */}
            <button
              onClick={() => setSelectedMethod("typing")}
              className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 transform flex items-center gap-4 ${
                selectedMethod === "typing"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105"
                  : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-blue-400"
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                selectedMethod === "typing"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600"
                  : "bg-slate-200 dark:bg-slate-600"
              }`}>
                <Keyboard className={`w-6 h-6 ${
                  selectedMethod === "typing" ? "text-white" : "text-slate-600 dark:text-slate-300"
                }`} />
              </div>
              <div className="text-left">
                <h3 className={`text-lg font-semibold mb-1 ${
                  selectedMethod === "typing"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-900 dark:text-white"
                }`}>
                  Type It Out
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Manually enter your skills
                </p>
              </div>
            </button>

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
              {selectedMethod === "typing" && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Enter your skills
                  </label>
                  <TagInput
                    skills={SKILLS_LIST}
                    selectedSkills={selectedSkills}
                    onSkillsChange={setSelectedSkills}
                    placeholder="Type to search skills..."
                  />
                </div>
              )}

              {selectedMethod === "resume" && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Upload your resume
                  </label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-12 text-center hover:border-blue-400 transition-all duration-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                          Drop your resume here
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                          or click to browse
                        </p>
                        <button
                          type="button"
                          className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                        >
                          Choose File
                        </button>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-3">
                          Supported formats: PDF, DOC, DOCX (Max 10MB)
                        </p>
                      </div>
                    </div>
                  </div>
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
  );
}

