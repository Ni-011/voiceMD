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
          className={`w-[850px] max-w-[95vw] p-4 sm:p-5 max-h-[92vh] lg:w-[600px] lg:max-w-[600px] overflow-y-auto ${
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
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl sm:text-2xl font-semibold">
              Add New Patient
            </DialogTitle>
            <DialogDescription className="text-sm -mt-1">
              Enter patient details and use voice recording for notes.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-0">
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-3">
                <Label
                  htmlFor="name"
                  className="sm:text-right text-sm font-medium"
                >
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="sm:col-span-3 py-2 text-sm"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-3">
                <Label
                  htmlFor="age"
                  className="sm:text-right text-sm font-medium"
                >
                  Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="sm:col-span-3 py-2 text-sm"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-3">
                <Label className="sm:text-right text-sm font-medium">
                  Gender
                </Label>
                <RadioGroup
                  value={gender}
                  onValueChange={setGender}
                  className="sm:col-span-3 flex flex-wrap space-x-4"
                  disabled={isLoading}
                >
                  <div className="flex items-center space-x-1.5">
                    <RadioGroupItem
                      value="Male"
                      id="male"
                      className="h-4 w-4 border-gray-300 text-black focus:ring-black cursor-pointer"
                    />
                    <Label htmlFor="male" className="text-sm cursor-pointer">
                      Male
                    </Label>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <RadioGroupItem
                      value="Female"
                      id="female"
                      className="h-4 w-4 border-gray-300 text-black focus:ring-black cursor-pointer"
                    />
                    <Label htmlFor="female" className="text-sm cursor-pointer">
                      Female
                    </Label>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <RadioGroupItem
                      value="Other"
                      id="other"
                      className="h-4 w-4 border-gray-300 text-black focus:ring-black cursor-pointer"
                    />
                    <Label htmlFor="other" className="text-sm cursor-pointer">
                      Other
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-3">
                <Label
                  htmlFor="phone"
                  className="sm:text-right text-sm font-medium"
                >
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="sm:col-span-3 py-2 text-sm"
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-3">
                <Label
                  htmlFor="email"
                  className="sm:text-right text-sm font-medium"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="sm:col-span-3 py-2 text-sm"
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-3 mt-1">
                <div className="sm:text-right">
                  <Label className="text-sm font-medium">Voice Notes</Label>
                </div>
                <div className="sm:col-span-3 flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={toggleRecording}
                    className={`h-11 w-11 p-0 flex items-center justify-center bg-gray-100 text-black hover:bg-gray-200 cursor-pointer ${
                      isRecording
                        ? "animate-pulse bg-red-600 hover:bg-red-700 text-white"
                        : ""
                    }`}
                    aria-label={
                      isRecording ? "Stop recording" : "Start recording"
                    }
                    disabled={isLoading}
                  >
                    {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
                  </Button>
                  <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
                    <Switch
                      id="language-mode"
                      checked={isHindi}
                      onCheckedChange={() => {
                        const wasRecording = isRecording;

                        // Stop current recognition if running
                        if (isRecording) {
                          setIsRecording(false);
                          stopRecognition();
                        }

                        // Toggle language
                        setIsHindi(!isHindi);

                        // Restart recording if it was active
                        if (wasRecording) {
                          setTimeout(() => {
                            setIsRecording(true);
                          }, 200);
                        }
                      }}
                      className="data-[state=checked]:bg-black cursor-pointer"
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor="language-mode"
                      className="flex items-center text-sm cursor-pointer"
                    >
                      <Languages className="mr-1.5 h-4 w-4" />
                      {isHindi ? "Hindi" : "English"}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-3 mt-1">
                <div className="sm:text-right">
                  <Label className="text-sm font-medium">Transcription</Label>
                </div>
                <div className="sm:col-span-3 relative">
                  <Textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    className={`min-h-[100px] text-sm p-3 pr-10 [&>*]:caret-black [caret-color:black] ${
                      isRecording
                        ? "border-red-400 focus-visible:ring-red-300"
                        : ""
                    }`}
                    placeholder={
                      isRecording
                        ? "Recording in progress (manual input enabled)..."
                        : "Enter notes manually or use the recording button"
                    }
                    disabled={isLoading}
                    style={{ caretColor: "black" }}
                  />
                  {isRecording && (
                    <div
                      className={`absolute top-2 right-2 flex items-center space-x-1 rounded-full px-2 py-0.5 text-xs ${
                        wordDetected
                          ? "bg-green-100 text-green-700 animate-bounce"
                          : "bg-red-100 text-red-700 animate-pulse"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          wordDetected ? "bg-green-600" : "bg-red-600"
                        }`}
                      ></div>
                      <span>
                        {wordDetected ? "Word Detected" : "Recording"}
                      </span>
                    </div>
                  )}
                  {transcript && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setTranscript("")}
                      className="absolute right-2 bottom-2 h-7 w-7 p-0"
                      disabled={isLoading}
                      aria-label="Clear transcription"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="mt-5 gap-2 flex-col sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Explicitly stop recording and reset everything
                  setIsRecording(false);
                  stopRecognition();
                  resetForm();
                  onClose();
                }}
                disabled={isLoading}
                className="bg-white text-black border-gray-200 hover:bg-gray-50 px-4 py-2 text-sm h-9 cursor-pointer w-full sm:w-auto disabled:opacity-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-black hover:bg-gray-800 text-white px-4 py-2 text-sm h-9 cursor-pointer w-full sm:w-auto disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Patient"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
