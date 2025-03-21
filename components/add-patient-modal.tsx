"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
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
  onAddPatient: (patient: any) => void;
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

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef("");
  const isComponentMounted = useRef(true);

  // Initialize speech recognition
  const initializeSpeechRecognition = (language: string) => {
    // Clean up any existing instance first
    cleanupSpeechRecognition();

    if (!isComponentMounted.current) return;

    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      try {
        const SpeechRecognition =
          (window as any).webkitSpeechRecognition ||
          (window as any).SpeechRecognition;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;
        // Increase maxAlternatives to improve recognition
        recognition.maxAlternatives = 3;

        recognition.onresult = (event: any) => {
          if (!isComponentMounted.current) return;

          let interimTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscriptRef.current +=
                event.results[i][0].transcript + " ";
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

        recognition.onend = () => {
          if (!isComponentMounted.current) return;

          if (isRecording) {
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
          }
        };

        recognition.onerror = (event: any) => {
          if (!isComponentMounted.current) return;

          // Only log certain errors
          if (event.error !== "no-speech" && event.error !== "aborted") {
            console.error("Speech recognition error:", event.error);
            if (isComponentMounted.current) {
              setIsRecording(false);
            }
          }
        };

        recognitionRef.current = recognition;
        return recognition;
      } catch (error) {
        console.error("Error initializing speech recognition:", error);
        return null;
      }
    }
    return null;
  };

  // Clean up speech recognition
  const cleanupSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        // First remove all event handlers
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;

        // Then stop recognition
        recognitionRef.current.stop();
      } catch (error) {
        // Ignore errors during cleanup
      } finally {
        recognitionRef.current = null;
      }
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

  const startRecording = () => {
    if (isRecording) return;

    // Initialize with current language
    const recognition = initializeSpeechRecognition(
      isHindi ? "hi-IN" : "en-US"
    );

    if (recognition) {
      try {
        recognition.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error starting recording:", error);
        cleanupSpeechRecognition();
      }
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;

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
