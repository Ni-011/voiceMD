"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Languages, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useData } from "@/lib/store/datacontext";

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPatient: (patient: Patient) => void;
}

// Add a Patient interface
interface Patient {
  id?: string;
  name: string;
  age: string | number;
  gender: string;
  phone?: string;
  email?: string;
  lastVisit?: string;
  condition?: string;
  status?: string;
}

export function AddPatientModal({
  isOpen,
  onClose,
  onAddPatient,
}: AddPatientModalProps) {
  // Form state
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [transcript, setTranscript] = useState("");

  // UI state
  const [isRecording, setIsRecording] = useState(false);
  const [isHindi, setIsHindi] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [wordDetected, setWordDetected] = useState(false);

  // Speech recognition refs
  const recognitionRef = useRef<any>(null);

  const router = useRouter();
  const { user } = useUser();
  const { setData } = useData();

  // Setup speech recognition cleanup and page unload handler
  useEffect(() => {
    // Handle page unload/close - stop recording
    const handleBeforeUnload = () => {
      setIsRecording(false);
      stopRecognition();
    };

    // Add event listener for page close/unload
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function
    return () => {
      setIsRecording(false);
      stopRecognition();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Control recording state
  useEffect(() => {
    if (isRecording) {
      startRecognition();
    } else {
      // Explicitly stop recording when isRecording is false
      stopRecognition();
    }
  }, [isRecording, isHindi]);

  // Add a clear function to properly stop recognition
  const stopRecognition = () => {
    // First, set recording state to false to prevent any restart loops
    setIsRecording(false);

    // Stop the recognition instance
    if (recognitionRef.current) {
      try {
        // Remove all event listeners to prevent any callbacks
        if (recognitionRef.current.onresult)
          recognitionRef.current.onresult = null;
        if (recognitionRef.current.onend) recognitionRef.current.onend = null;
        if (recognitionRef.current.onerror)
          recognitionRef.current.onerror = null;

        // Abort is more aggressive than stop
        recognitionRef.current.abort();
      } catch (err) {
        console.error("Error stopping recognition:", err);
      } finally {
        recognitionRef.current = null;
      }
    }

    // Force release the microphone by getting and immediately stopping all audio tracks
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const tracks = stream.getTracks();
          tracks.forEach((track) => {
            track.stop();
          });
          console.log("Successfully stopped all audio tracks");
        })
        .catch((err) => {
          console.error("Could not get audio to stop tracks:", err);
        });
    }
  };

  const startRecognition = () => {
    // Don't start if we're not in recording state
    if (!isRecording) return;

    // Clean up any existing recognition instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      } catch (err) {
        console.log("Error cleaning up previous recognition:", err);
      }
    }

    try {
      // Check if browser supports SpeechRecognition
      if (
        !("webkitSpeechRecognition" in window) &&
        !("SpeechRecognition" in window)
      ) {
        console.error("Speech recognition not supported in this browser");
        setIsRecording(false); // Prevent trying to restart
        return;
      }

      // Create speech recognition instance
      // @ts-ignore - TypeScript doesn't know about these browser-specific APIs
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      // Configure recognition
      recognition.continuous = false; // Get one phrase at a time
      recognition.interimResults = true;
      recognition.lang = isHindi ? "hi-IN" : "en-US";

      // Handle results
      recognition.onresult = (event: any) => {
        // Don't process if we've stopped recording
        if (!isRecording) return;

        const resultIndex = event.resultIndex;
        const result = event.results[resultIndex];

        if (result.isFinal) {
          const transcript = result[0].transcript.trim();
          if (transcript) {
            // Flash the word detected indicator
            setWordDetected(true);
            setTimeout(() => setWordDetected(false), 500);

            setTranscript((prev) => {
              // Add space if the previous transcript doesn't end with space
              const spacer = prev && !prev.endsWith(" ") ? " " : "";
              return prev + spacer + transcript;
            });
          }
        }
      };

      // Reset recognition after each result to prevent cumulative results
      recognition.onend = () => {
        // Don't restart if we're not supposed to be recording anymore
        if (!isRecording) {
          if (recognitionRef.current) {
            recognitionRef.current = null;
          }
          return;
        }

        // Short delay before restarting
        setTimeout(() => {
          // Check again before restarting (in case recording was stopped during timeout)
          if (!isRecording) return;

          try {
            // Create new instance to prevent result accumulation
            const newRecognition = new SpeechRecognition();
            newRecognition.continuous = false; // Set to false to get one phrase at a time
            newRecognition.interimResults = true;
            newRecognition.lang = isHindi ? "hi-IN" : "en-US";

            // Copy event handlers
            newRecognition.onresult = recognition.onresult;
            newRecognition.onend = recognition.onend;
            newRecognition.onerror = recognition.onerror;

            newRecognition.start();
            recognitionRef.current = newRecognition;
          } catch (error) {
            console.error("Error restarting recognition:", error);
            // Only try to restart if we're still supposed to be recording
            if (isRecording) {
              startRecognition(); // Try the full initialization again
            }
          }
        }, 100);
      };

      recognition.onerror = (event: any) => {
        console.error("Recognition error:", event.error);

        // Handle specific errors
        if (event.error === "no-speech" || event.error === "aborted") {
          console.log("Handling normal recognition end case:", event.error);
          // These are expected errors, no need to restart if we've intentionally stopped
          if (!isRecording) return;
        }

        // Restart on error too, but only if we're still supposed to be recording
        if (isRecording) {
          setTimeout(() => {
            startRecognition();
          }, 500);
        }
      };

      // Start recognition
      recognition.start();
      recognitionRef.current = recognition;
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      // Reset recording state if we couldn't start
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Explicitly call stopRecognition to ensure it stops
      stopRecognition();
    } else {
      setIsRecording(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const patient = {
      name,
      age,
      gender,
      phone,
      email,
      doctorId: user?.id,
      text: transcript,
    };

    setIsLoading(true);

    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patient),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        if (data.new_patient) onAddPatient(data.new_patient);
        setData(data.new_visit);
        resetForm();
        onClose();
        if (data.new_visit && data.new_visit.patientId) {
          router.push(`/editor?patientId=${data.new_visit.patientId}`);
        } else {
          console.error("No patientId available in the response");
          setIsLoading(false);
        }
      } else {
        console.error("Failed to add patient:", response.statusText);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error adding patient:", error);
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setAge("");
    setGender("Male");
    setPhone("");
    setEmail("");
    setIsRecording(false);
    setTranscript("");
    setWordDetected(false);

    // Stop speech recognition
    stopRecognition();
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] backdrop-blur-md">
          <div className="bg-white/95 rounded-xl p-10 shadow-2xl flex flex-col items-center max-w-md w-full mx-4 border border-gray-100 animate-fadeIn">
            <div className="mb-8 relative">
              <div className="absolute inset-0 -m-2 w-32 h-32">
                <div className="w-full h-full rounded-full animate-ping opacity-20 bg-black"></div>
              </div>
              <div className="relative flex items-center justify-center w-28 h-28 rounded-full bg-gray-50 border border-gray-100 shadow-sm">
                <Loader2
                  className="h-20 w-20 animate-spin text-black"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-gray-900">
              Processing Patient
            </h3>
            <p className="text-gray-500 text-center mb-6 max-w-xs">
              Please wait while we securely save your patient information
            </p>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-4">
              <div className="progress-bar"></div>
            </div>
            <p className="text-xs text-gray-400 text-center">
              This may take a few moments
            </p>

            <style jsx>{`
              .progress-bar {
                height: 100%;
                width: 100%;
                background: linear-gradient(
                  to right,
                  transparent,
                  black,
                  transparent
                );
                background-size: 200% 100%;
                animation: progressSlide 1.5s infinite ease-in-out;
              }

              @keyframes progressSlide {
                0% {
                  background-position: -100% 0;
                }
                100% {
                  background-position: 200% 0;
                }
              }

              @keyframes fadeIn {
                from {
                  opacity: 0;
                  transform: scale(0.95);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }

              .animate-fadeIn {
                animation: fadeIn 0.3s ease-out forwards;
              }
            `}</style>
          </div>
        </div>
      )}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open && !isLoading) {
            // Make sure we're not recording before closing
            if (isRecording) {
              setIsRecording(false);
            }

            // Force stop any active recognition
            stopRecognition();

            // Then cleanup and close
            resetForm();
            onClose();
          } else if (!open && isLoading) {
            // Prevent closing while loading
            return;
          }
        }}
      >
        <DialogContent
          className={`w-[850px] max-w-[95vw] md:w-[700px] lg:w-[850px] p-0 h-[90vh] md:min-h-[750px] md:max-h-[90vh] flex flex-col border-none shadow-2xl rounded-2xl bg-gradient-to-b from-white to-gray-50 ${
            isLoading ? "pointer-events-none" : ""
          }`}
          onEscapeKeyDown={() => {
            // Explicitly handle escape key to ensure recording stops
            setIsRecording(false);
            stopRecognition();
          }}
          onInteractOutside={() => {
            // Explicitly handle clicking outside to ensure recording stops
            setIsRecording(false);
            stopRecognition();
          }}
          onCloseAutoFocus={() => {
            // Ensure recording stops when dialog closes
            setIsRecording(false);
            stopRecognition();
          }}
        >
          {/* Fixed Header */}
          <div className="flex-shrink-0 sticky top-0 z-10 p-6 pb-3 border-b border-gray-100 bg-gradient-to-b from-white to-white/95">
            <DialogHeader className="mb-1">
              <DialogTitle className="text-2xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                New Patient
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Enter patient details and use voice for notes
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-grow overflow-y-auto">
            <form onSubmit={handleSubmit} className="px-6 md:px-8 py-6">
              {/* Form Content */}
              <div className="space-y-6">
                {/* Basic Info Group */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-xs font-medium text-gray-600"
                      >
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-11 rounded-xl shadow-sm border-gray-200 focus:ring-2 focus:ring-black focus:ring-offset-1 transition-shadow bg-white"
                        required
                        disabled={isLoading}
                        placeholder="Patient name"
                      />
                    </div>

                    {/* Age */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="age"
                        className="text-xs font-medium text-gray-600"
                      >
                        Age
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="h-11 rounded-xl shadow-sm border-gray-200 focus:ring-2 focus:ring-black focus:ring-offset-1 transition-shadow bg-white"
                        required
                        disabled={isLoading}
                        placeholder="Age"
                      />
                    </div>
                  </div>

                  {/* Gender Selection */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-600">
                      Gender
                    </Label>
                    <RadioGroup
                      value={gender}
                      onValueChange={setGender}
                      className="flex space-x-5"
                      disabled={isLoading}
                    >
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem
                          value="Male"
                          id="male"
                          className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                        />
                        <Label htmlFor="male" className="text-sm">
                          Male
                        </Label>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem
                          value="Female"
                          id="female"
                          className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                        />
                        <Label htmlFor="female" className="text-sm">
                          Female
                        </Label>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem
                          value="Other"
                          id="other"
                          className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                        />
                        <Label htmlFor="other" className="text-sm">
                          Other
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-xs font-medium text-gray-600"
                      >
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-11 rounded-xl shadow-sm border-gray-200 focus:ring-2 focus:ring-black focus:ring-offset-1 transition-shadow bg-white"
                        disabled={isLoading}
                        placeholder="Contact number"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-xs font-medium text-gray-600"
                      >
                        Email
                      </Label>
                      <Input
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 rounded-xl shadow-sm border-gray-200 focus:ring-2 focus:ring-black focus:ring-offset-1 transition-shadow bg-white"
                        disabled={isLoading}
                        placeholder="Email address"
                      />
                    </div>
                  </div>
                </div>

                {/* Voice Recording Section */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-xs font-medium text-gray-600">
                      Voice Notes
                    </Label>
                    <div className="flex items-center space-x-2 bg-gray-50 p-1 pl-2 pr-3 rounded-full shadow-sm border border-gray-100">
                      <Switch
                        id="language-mode"
                        checked={isHindi}
                        onCheckedChange={() => {
                          const wasRecording = isRecording;
                          if (isRecording) {
                            setIsRecording(false);
                            stopRecognition();
                          }
                          setIsHindi(!isHindi);
                          if (wasRecording) {
                            setTimeout(() => {
                              setIsRecording(true);
                            }, 200);
                          }
                        }}
                        className="data-[state=checked]:bg-black"
                        disabled={isLoading}
                      />
                      <Label
                        htmlFor="language-mode"
                        className="text-xs font-medium"
                      >
                        {isHindi ? "Hindi" : "English"}
                      </Label>
                    </div>
                  </div>

                  {/* Recording Controls */}
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant={isRecording ? "destructive" : "outline"}
                        size="sm"
                        onClick={toggleRecording}
                        className={`h-11 pl-3.5 pr-4 flex items-center justify-center gap-2 rounded-xl shadow-sm ${
                          isRecording
                            ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-none"
                            : "border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800"
                        }`}
                        disabled={isLoading}
                      >
                        {isRecording ? (
                          <>
                            <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                            <MicOff size={15} />
                            <span className="text-xs font-medium">
                              Stop Recording
                            </span>
                          </>
                        ) : (
                          <>
                            <Mic size={15} />
                            <span className="text-xs font-medium">
                              Record Voice
                            </span>
                          </>
                        )}
                      </Button>

                      {/* Tags */}
                      {!isRecording && (
                        <div className="flex flex-wrap gap-1.5">
                          <span className="px-2.5 py-1 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-100 shadow-sm">
                            Symptoms
                          </span>
                          <span className="px-2.5 py-1 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-100 shadow-sm">
                            Diagnosis
                          </span>
                          <span className="px-2.5 py-1 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-100 shadow-sm hidden md:inline-block">
                            Medication
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Recording Tips - only visible when recording */}
                    {isRecording && (
                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        {/* Header with red gradient matching modal style */}
                        <div className="bg-gradient-to-r from-red-600 to-red-700 px-3 py-2 text-white flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="relative flex-shrink-0">
                              <div
                                className="absolute inset-0 bg-white/30 rounded-full animate-ping opacity-70"
                                style={{ animationDuration: "1.5s" }}
                              ></div>
                              <div className="relative h-1.5 w-1.5 rounded-full bg-white"></div>
                            </div>
                            <p className="font-medium text-xs">
                              Voice Commands
                            </p>
                          </div>
                          <div className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                            Recording
                          </div>
                        </div>

                        {/* Command cards in 2x2 grid with red accents */}
                        <div className="p-2.5 grid grid-cols-2 gap-2">
                          <div className="flex flex-col space-y-2">
                            <div className="bg-white rounded-xl py-2 px-2 shadow-sm border border-gray-200 flex flex-col items-center hover:bg-red-50/20 group">
                              <span className="font-semibold text-xs text-red-700 group-hover:text-red-800">
                                Symptoms
                              </span>
                              <span className="text-[10px] text-gray-500 mt-0.5 font-medium">
                                Pain, duration, severity
                              </span>
                            </div>

                            <div className="bg-white rounded-xl py-2 px-2 shadow-sm border border-gray-200 flex flex-col items-center hover:bg-red-50/20 group">
                              <span className="font-semibold text-xs text-red-700 group-hover:text-red-800">
                                Diagnosis
                              </span>
                              <span className="text-[10px] text-gray-500 mt-0.5 font-medium">
                                Condition, findings
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col space-y-2">
                            <div className="bg-white rounded-xl py-2 px-2 shadow-sm border border-gray-200 flex flex-col items-center hover:bg-red-50/20 group">
                              <span className="font-semibold text-xs text-red-700 group-hover:text-red-800">
                                Medication
                              </span>
                              <span className="text-[10px] text-gray-500 mt-0.5 font-medium">
                                Dosage, frequency
                              </span>
                            </div>

                            <div className="bg-white rounded-xl py-2 px-2 shadow-sm border border-gray-200 flex flex-col items-center hover:bg-red-50/20 group">
                              <span className="font-semibold text-xs text-red-700 group-hover:text-red-800">
                                Precautions
                              </span>
                              <span className="text-[10px] text-gray-500 mt-0.5 font-medium">
                                Instructions, advice
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Footer matching modal style but with red text */}
                        <div className="px-2.5 pb-2.5 pt-0">
                          <div className="bg-gray-50 rounded-xl border border-gray-200 py-1.5 px-2 text-center shadow-sm">
                            <p className="text-[10px] text-red-600 font-medium">
                              Start by saying the heading, then dictate your
                              notes
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Transcription Area - only needed when recording */}
                    <div className="relative mt-1">
                      <Textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        className={`min-h-[140px] p-4 pr-12 rounded-xl resize-none text-sm shadow-sm border bg-white ${
                          isRecording
                            ? "border-red-300 focus-visible:ring-red-200 bg-red-50/10"
                            : "border-gray-200 focus-visible:ring-black focus-visible:ring-offset-1"
                        } transition-all`}
                        placeholder={
                          isRecording
                            ? "Recording in progress... (say each heading before content)"
                            : "Enter patient notes or use voice recording"
                        }
                        disabled={isLoading}
                      />
                      {isRecording && (
                        <div className="absolute top-3.5 right-3.5 rounded-full px-2.5 py-1 text-xs flex items-center space-x-2 bg-white shadow-sm border border-gray-100">
                          <div
                            className={`h-2.5 w-2.5 rounded-full ${
                              wordDetected
                                ? "bg-green-500"
                                : "bg-red-500 animate-pulse"
                            }`}
                          />
                          <span className="font-medium text-gray-700">
                            {wordDetected ? "Word Detected" : "Listening..."}
                          </span>
                        </div>
                      )}
                      {transcript && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setTranscript("")}
                          className="absolute right-2.5 bottom-2.5 h-8 w-8 p-0 opacity-60 hover:opacity-100 rounded-full hover:bg-gray-100"
                          disabled={isLoading}
                          aria-label="Clear transcription"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="mt-8 mb-2 flex flex-col sm:flex-row sm:justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsRecording(false);
                    stopRecognition();
                    resetForm();
                    onClose();
                  }}
                  disabled={isLoading}
                  className="border-gray-200 hover:bg-gray-50 text-gray-700 text-sm h-11 rounded-xl shadow-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-gray-800 to-black hover:from-black hover:to-gray-900 text-white text-sm h-11 rounded-xl shadow-md transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Patient...
                    </>
                  ) : (
                    "Add Patient"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
