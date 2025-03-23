"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Languages, Loader2, X } from "lucide-react";
import { toast } from "sonner";

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

// Define SpeechRecognitionEvent type if needed
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    isFinal: boolean;
    [index: number]: {
      transcript: string;
    }[];
  }[];
}

export function AddPatientModal({
  isOpen,
  onClose,
  onAddPatient,
}: AddPatientModalProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isHindi, setIsHindi] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { setData } = useData();

  // We'll use a more generic type that's sufficient for our needs
  type SpeechRecognitionInstance = {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    onresult: Function;
    onend: Function;
    onstart: Function;
    onerror: Function;
    start: () => void;
    stop: () => void;
  };

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef("");
  const isComponentMounted = useRef(true);

  // Clean up speech recognition
  const cleanupSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        // First remove all event handlers
        recognitionRef.current.onresult = null as any;
        recognitionRef.current.onend = null as any;
        recognitionRef.current.onerror = null as any;
        recognitionRef.current.onstart = null as any;

        // Then stop recognition
        recognitionRef.current.stop();
      } catch (error) {
        // Ignore errors during cleanup
        console.log("Error during cleanup:", error);
      } finally {
        recognitionRef.current = null;
      }
    }

    // Additional cleanup: try to release any microphone streams
    try {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          stream.getTracks().forEach((track) => {
            track.stop();
            console.log("Released audio track");
          });
        })
        .catch((err) => {});
    } catch (err) {
      // Ignore errors during extra cleanup
    }
  };

  // Add a function to detect mobile browsers
  const isMobileBrowser = () => {
    const userAgent =
      navigator.userAgent || navigator.vendor || (window as any).opera;
    return /android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    );
  };

  // Initialize speech recognition
  const initializeSpeechRecognition = (language: string) => {
    // Clean up any existing instance first
    cleanupSpeechRecognition();

    if (!isComponentMounted.current) return null;

    // Check if browser supports Speech Recognition API
    const hasSpeechRecognition = "SpeechRecognition" in window;
    const hasWebkitSpeechRecognition = "webkitSpeechRecognition" in window;

    if (!hasSpeechRecognition && !hasWebkitSpeechRecognition) {
      toast.error("Speech Recognition Not Supported", {
        description:
          "Your browser doesn't support speech recognition. Please try Chrome or Edge.",
      });
      return null;
    }

    try {
      // Use the appropriate constructor based on browser support
      let recognition;

      if (hasSpeechRecognition) {
        recognition = new (window as any).SpeechRecognition();
      } else if (hasWebkitSpeechRecognition) {
        recognition = new (window as any).webkitSpeechRecognition();
      } else {
        throw new Error("No speech recognition support available");
      }

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      // Increase maxAlternatives to improve recognition
      recognition.maxAlternatives = 3;

      // We'll use a generic event type for simplicity
      recognition.onresult = (event: any) => {
        if (!isComponentMounted.current) return;

        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += event.results[i][0].transcript + " ";
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        // Ensure transcript doesn't exceed reasonable limits
        if (finalTranscriptRef.current.length > 10000) {
          finalTranscriptRef.current = finalTranscriptRef.current.substring(
            finalTranscriptRef.current.length - 10000
          );
        }

        setTranscript(finalTranscriptRef.current + interimTranscript);
      };

      recognition.onstart = () => {
        console.log("Speech recognition started");
        if (isComponentMounted.current) {
          setIsRecording(true);
        }
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        if (!isComponentMounted.current) return;

        // Don't auto-restart on mobile browsers as it can cause conflicts
        if (isRecording && !isMobileBrowser()) {
          try {
            // Restart recognition more quickly
            setTimeout(() => {
              if (
                recognitionRef.current &&
                isRecording &&
                isComponentMounted.current
              ) {
                recognitionRef.current.start();
              }
            }, 100); // Reduced from 300ms to 100ms
          } catch (error) {
            console.error("Failed to restart recording:", error);
            if (isComponentMounted.current) {
              setIsRecording(false);
            }
          }
        } else if (isRecording && isMobileBrowser()) {
          // For mobile, explicitly set recording state to false when recognition ends
          setIsRecording(false);
        }
      };

      recognition.onerror = (event: { error: string }) => {
        console.error("Speech recognition error:", event.error);
        if (!isComponentMounted.current) return;

        // Handle specific errors
        if (
          event.error === "not-allowed" ||
          event.error === "service-not-allowed"
        ) {
          toast.error("Microphone Access Denied", {
            description:
              "Please allow microphone access to use voice recording.",
          });
          setIsRecording(false);
        } else if (event.error === "network") {
          toast.error("Network Error", {
            description: "Check your internet connection and try again.",
          });
          setIsRecording(false);
        } else if (event.error === "aborted") {
          // This is normal when stopping - don't show error
          console.log("Recognition aborted");
        } else if (event.error === "no-speech") {
          // No speech detected - don't show error
          console.log("No speech detected");
        } else {
          // For any other errors on mobile, show a user-friendly message
          if (isMobileBrowser()) {
            toast.error("Recording Error", {
              description:
                "Please close other apps that might be using the microphone.",
            });
          }
          console.error("Speech recognition error:", event.error);
          setIsRecording(false);
        }
      };

      recognitionRef.current = recognition;
      return recognition;
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
      toast.error("Failed to initialize speech recognition", {
        description: "Please try again or check browser permissions.",
      });
      return null;
    }
  };

  // Effect for component mount/unmount
  useEffect(() => {
    isComponentMounted.current = true;

    return () => {
      isComponentMounted.current = false;
      cleanupSpeechRecognition();
    };
  }, []);

  // Effect for language changes
  useEffect(() => {
    if (isRecording) {
      // If we're already recording, restart with new language
      stopRecording();
      // Small delay before starting with new language
      setTimeout(() => {
        if (isComponentMounted.current) {
          startRecording();
        }
      }, 500);
    }
  }, [isHindi]);

  // Add a separate effect for component mount to handle browser detection
  useEffect(() => {
    // Check if browser supports Speech Recognition API
    const hasSpeechRecognition = "SpeechRecognition" in window;
    const hasWebkitSpeechRecognition = "webkitSpeechRecognition" in window;

    if (!hasSpeechRecognition && !hasWebkitSpeechRecognition) {
      console.warn("This browser doesn't support speech recognition");
    }
  }, []);

  // Debug effect to help identify state issues
  useEffect(() => {
    console.log("Recording state changed:", isRecording);
  }, [isRecording]);

  const startRecording = () => {
    console.log("Starting recording...");
    if (isRecording) return;

    // First check if browser supports the API
    const hasSpeechRecognition = "SpeechRecognition" in window;
    const hasWebkitSpeechRecognition = "webkitSpeechRecognition" in window;

    if (!hasSpeechRecognition && !hasWebkitSpeechRecognition) {
      toast.error("Speech Recognition Not Supported", {
        description:
          "Your browser doesn't support speech recognition. Please try Chrome or Edge.",
      });
      return;
    }

    // Force release any existing microphone access before requesting new permissions
    try {
      // Get all media devices and stop them
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          // Stop all tracks to ensure microphone is fully released
          stream.getTracks().forEach((track) => {
            track.stop();
          });

          // Small delay before requesting microphone again
          setTimeout(() => {
            // After ensuring mic is released, initialize recognition
            initializeMicrophoneAccess();
          }, 300);
        })
        .catch((error) => {
          console.error("Error releasing microphone:", error);
          // Try to initialize anyway
          initializeMicrophoneAccess();
        });
    } catch (error) {
      console.error("Error managing media devices:", error);
      // Try to initialize anyway as a fallback
      initializeMicrophoneAccess();
    }
  };

  const initializeMicrophoneAccess = () => {
    // Request microphone permission explicitly
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        // For mobile browsers, we need to handle the stream differently
        // Store the stream to release it properly later
        const audioTracks = stream.getAudioTracks();

        // On mobile, we can safely stop the stream after permission is granted
        // This prevents the "chrome is recording" conflict
        audioTracks.forEach((track) => {
          // Keep the track enabled but stop it - this signals we have permission
          // but aren't currently using it
          track.enabled = true;
          // Don't actually stop it yet as it might cause issues with recognition
        });

        // After permission is granted, initialize recognition
        const recognition = initializeSpeechRecognition(
          isHindi ? "hi-IN" : "en-US"
        );

        if (recognition) {
          try {
            recognition.start();
            console.log("Recognition started");
            // The onstart event will set isRecording to true
          } catch (error) {
            console.error("Error starting recording:", error);
            toast.error("Failed to start recording", {
              description: "Please check your microphone permissions.",
            });
            cleanupSpeechRecognition();
            // Make sure to stop all tracks if recognition fails
            audioTracks.forEach((track) => track.stop());
          }
        } else {
          toast.error("Speech Recognition Failed", {
            description:
              "Could not initialize speech recognition. Please try again.",
          });
          // Make sure to stop all tracks if recognition fails
          audioTracks.forEach((track) => track.stop());
        }
      })
      .catch((error) => {
        console.error("Microphone permission denied:", error);
        toast.error("Microphone Access Denied", {
          description: "Please allow microphone access to use voice recording.",
        });
      });
  };

  const stopRecording = () => {
    console.log("Stopping recording...");
    if (!isRecording) return;

    try {
      cleanupSpeechRecognition();
      console.log("Recording stopped successfully");

      // Additional cleanup for mobile: ensure any active media streams are stopped
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          stream.getTracks().forEach((track) => track.stop());
        })
        .catch((err) => console.log("No active stream to clean up"));
    } catch (error) {
      console.error("Error stopping recording:", error);
    } finally {
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const toggleLanguage = () => {
    setIsHindi(!isHindi);
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
    cleanupSpeechRecognition();
  };

  const clearTranscript = () => {
    setTranscript("");
    finalTranscriptRef.current = "";
  };

  // Loading overlay component
  const LoadingOverlay = () => (
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
  );

  return (
    <>
      {isLoading && <LoadingOverlay />}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open && !isLoading) {
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
                    className={`h-11 w-12 p-0 flex items-center justify-center bg-gray-100 text-black hover:bg-gray-200 cursor-pointer ${
                      isRecording
                        ? "animate-pulse bg-red-600 hover:bg-red-700 text-white"
                        : ""
                    }`}
                    aria-label={
                      isRecording ? "Stop recording" : "Start recording"
                    }
                    disabled={isLoading}
                  >
                    {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
                  </Button>
                  <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
                    <Switch
                      id="language-mode"
                      checked={isHindi}
                      onCheckedChange={toggleLanguage}
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
                  {/* Mobile hint message */}
                  {isMobileBrowser() && (
                    <div className="w-full mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-md border border-amber-100">
                      <strong>Mobile tip:</strong> For best results, close other
                      apps using your microphone before recording.
                    </div>
                  )}
                  {/* DevTool for debugging voice recognition */}
                  {process.env.NODE_ENV === "development" && (
                    <div className="ml-auto" title="Debug Voice Recognition">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log(
                            "Current recognition ref:",
                            recognitionRef.current
                          );
                          console.log("Is recording:", isRecording);
                          console.log("Transcript:", transcript);
                          console.log("Is mobile:", isMobileBrowser());

                          if (!isRecording) {
                            // Force recreation of recognition instance
                            cleanupSpeechRecognition();
                            setTimeout(() => startRecording(), 100);
                          } else {
                            stopRecording();
                            setTimeout(() => {
                              setIsRecording(false);
                              finalTranscriptRef.current = "";
                            }, 100);
                          }
                        }}
                        className="text-xs px-2 py-1 h-7"
                      >
                        Reset Audio
                      </Button>
                    </div>
                  )}
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
                    className="min-h-[100px] text-sm p-3 pr-10"
                    placeholder={
                      isRecording
                        ? "Speak now..."
                        : "Transcription will appear here"
                    }
                    disabled={isLoading}
                  />
                  {transcript && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={clearTranscript}
                      className="absolute right-2 top-2 h-7 w-7 p-0"
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
                onClick={onClose}
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
