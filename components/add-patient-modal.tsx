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

  // Add references for our audio streaming setup
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef("");
  const isComponentMounted = useRef(true);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const restartTimeoutRef = useRef<any>(null);
  const hasTranscriptionCompleted = useRef(false);
  const [autoRestartRecording, setAutoRestartRecording] = useState(true);

  // Add a safety check function for mediaDevices
  const hasMediaDevices = () => {
    try {
      return !!(
        typeof navigator !== "undefined" &&
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === "function"
      );
    } catch (err) {
      console.warn("Error checking for mediaDevices availability:", err);
      return false;
    }
  };

  // Clean up speech recognition and audio stream
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

    // Clear any restart timeouts
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    // Release audio context if it exists
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch (err) {
        console.log("Error closing AudioContext:", err);
      }
      audioContextRef.current = null;
    }

    // Release media stream if it exists
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        mediaStreamRef.current = null;
        console.log("Media stream tracks stopped");
      } catch (err) {
        console.log("Error stopping media stream tracks:", err);
      }
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

  // Add better detection for Chrome on Android
  const isChromeOnAndroid = () => {
    const userAgent =
      navigator.userAgent || navigator.vendor || (window as any).opera;
    return /android/i.test(userAgent) && /chrome/i.test(userAgent);
  };

  // Initialize speech recognition
  const initializeSpeechRecognition = (language: string) => {
    // Clean up any existing instance first
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.log("Error stopping existing recognition:", err);
      }
      recognitionRef.current = null;
    }

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

      // Configure recognition based on device type
      if (isMobileBrowser()) {
        // On mobile, we need to be careful with continuous flag
        recognition.continuous = false; // Will restart manually to simulate continuous mode
        recognition.interimResults = false; // Only get final results for stability on mobile
      } else {
        // On desktop, we can use continuous mode directly
        recognition.continuous = true;
        recognition.interimResults = true;
      }

      recognition.lang = language;
      recognition.maxAlternatives = 1;

      // Configure result handling
      recognition.onresult = (event: any) => {
        if (!isComponentMounted.current) return;

        let interimTranscript = "";
        let hasFinalResult = false;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += event.results[i][0].transcript + " ";
            hasFinalResult = true;
            hasTranscriptionCompleted.current = true;
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

      // Configure recognition end handling
      recognition.onend = () => {
        console.log("Speech recognition ended");
        if (!isComponentMounted.current) return;

        // If we're still in recording mode, restart recognition
        if (isRecording) {
          // Schedule a restart with a small delay to prevent rapid restarts
          restartTimeoutRef.current = setTimeout(() => {
            if (isRecording && isComponentMounted.current) {
              console.log("Restarting recognition after end event");
              const newRecognition = initializeSpeechRecognition(
                isHindi ? "hi-IN" : "en-US"
              );
              if (newRecognition) {
                try {
                  newRecognition.start();
                } catch (err) {
                  console.log("Error restarting recognition:", err);
                }
              }
            }
          }, 300);
        }
      };

      // Configure recognition start handling
      recognition.onstart = () => {
        console.log("Speech recognition started");
        if (isComponentMounted.current) {
          setIsRecording(true);
          hasTranscriptionCompleted.current = false;
        }
      };

      // Configure error handling
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
        } else if (event.error === "no-speech") {
          // No speech detected - silently restart
          if (isRecording) {
            restartTimeoutRef.current = setTimeout(() => {
              if (isRecording && isComponentMounted.current) {
                console.log("Restarting after no-speech error");
                const newRecognition = initializeSpeechRecognition(
                  isHindi ? "hi-IN" : "en-US"
                );
                if (newRecognition) {
                  try {
                    newRecognition.start();
                  } catch (err) {
                    console.log("Error restarting after no-speech:", err);
                  }
                }
              }
            }, 300);
          }
        } else {
          // For other errors, try to restart if still recording
          if (isRecording) {
            restartTimeoutRef.current = setTimeout(() => {
              if (isRecording && isComponentMounted.current) {
                console.log("Restarting after general error:", event.error);
                const newRecognition = initializeSpeechRecognition(
                  isHindi ? "hi-IN" : "en-US"
                );
                if (newRecognition) {
                  try {
                    newRecognition.start();
                  } catch (err) {
                    console.log("Error restarting after general error:", err);
                  }
                }
              }
            }, 500);
          }
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
    // Check browser compatibility at load time
    const hasSpeechRecognition = "SpeechRecognition" in window;
    const hasWebkitSpeechRecognition = "webkitSpeechRecognition" in window;

    if (!hasSpeechRecognition && !hasWebkitSpeechRecognition) {
      console.warn("This browser doesn't support speech recognition");
    }
  }, []);

  // Setup audio context and stream with a persistent connection
  const setupAudioStream = async () => {
    if (!hasMediaDevices()) {
      console.log("MediaDevices API not available");
      toast.error("Microphone access not available", {
        description: "Your browser doesn't support microphone access.",
      });
      return false;
    }

    try {
      // Release any existing stream first
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }

      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }

      // Get user media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      mediaStreamRef.current = stream;
      console.log("Media stream acquired successfully");

      // Create and connect audio context
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current = new AudioContext();
        const source = audioContextRef.current.createMediaStreamSource(stream);

        // On mobile, we need to create a minimal audio processing pipeline
        // to keep the audio context active
        if (isMobileBrowser()) {
          // Create a silent node to keep the audio context alive without output
          const silentNode = audioContextRef.current.createGain();
          silentNode.gain.value = 0; // Completely silent
          source.connect(silentNode);
          silentNode.connect(audioContextRef.current.destination);
          console.log("Silent audio pipeline created for mobile");
        } else {
          // For desktop, we can just keep the source active without output
          // to avoid echo
          const gainNode = audioContextRef.current.createGain();
          gainNode.gain.value = 0;
          source.connect(gainNode);
          // Don't connect to destination to avoid echo
        }
      }

      return true;
    } catch (error) {
      console.error("Error accessing microphone:", error);

      if (error instanceof DOMException && error.name === "NotAllowedError") {
        toast.error("Microphone Access Denied", {
          description: "Please allow microphone access to use voice recording.",
        });
      } else {
        toast.error("Microphone Error", {
          description:
            "Could not access your microphone. Please check your settings.",
        });
      }

      return false;
    }
  };

  // Start recording implementation with getUserMedia
  const startRecording = async () => {
    console.log("Starting recording with persistent audio stream...");
    if (isRecording) return;

    // First, set up the persistent audio stream
    const streamReady = await setupAudioStream();
    if (!streamReady) {
      console.log("Failed to set up audio stream");
      return;
    }

    // Once we have the stream, initialize and start speech recognition
    const recognition = initializeSpeechRecognition(
      isHindi ? "hi-IN" : "en-US"
    );
    if (recognition) {
      try {
        recognition.start();
        console.log("Speech recognition started");
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        toast.error("Failed to start recording", {
          description:
            "Please check your microphone permissions and try again.",
        });
        cleanupSpeechRecognition();
      }
    }
  };

  // Stop recording implementation
  const stopRecording = () => {
    console.log("Stopping recording...");
    if (!isRecording) return;

    // Clean up resources
    cleanupSpeechRecognition();
    setIsRecording(false);
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
                    } ${
                      isMobileBrowser()
                        ? "active:bg-gray-300 touch-manipulation"
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
                      {isChromeOnAndroid() ? (
                        <>
                          <strong>Chrome on Android tips:</strong>
                          <ul className="list-disc pl-4 mt-1 space-y-1">
                            <li>
                              <strong>
                                Just tap once and speak continuously
                              </strong>{" "}
                              - recording will automatically continue after each
                              pause
                            </li>
                            <li>
                              You'll hear beeps during recording as it processes
                              chunks of speech - keep speaking normally
                            </li>
                            <li>
                              The recording will automatically restart after
                              each chunk is processed
                            </li>
                            <li>
                              Tap the mic button again only when you're
                              completely finished recording
                            </li>
                          </ul>
                        </>
                      ) : (
                        <>
                          <strong>Mobile recording tip:</strong> Tap mic once
                          and speak continuously. The recording will
                          automatically restart after each pause. You'll hear
                          beeps as it processes, which is normal. Just keep
                          speaking until finished.
                        </>
                      )}
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
