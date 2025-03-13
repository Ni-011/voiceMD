"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Languages } from "lucide-react";

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
  const [condition, setCondition] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isHindi, setIsHindi] = useState(false);

  // For speech recognition
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

    // Reset transcript
    setTranscript("");
    finalTranscriptRef.current = "";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = {
      name,
      age: Number.parseInt(age),
      gender,
      condition: condition || transcript,
      lastVisit: new Date().toISOString().split("T")[0],
    };
    onAddPatient(patient);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName("");
    setAge("");
    setGender("Male");
    setCondition("");
    setTranscript("");
    setIsRecording(false);
    finalTranscriptRef.current = "";
    cleanupSpeechRecognition();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:min-w-[500px] sm:max-w-[500px] md:min-w-[600px] md:max-w-[600px] lg:min-w-[600px] lg:max-w-[600px] xl:min-w-[600px] xl:max-w-[600px] p-4 sm:p-5 w-[95vw] sm:w-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="gap-0 text-center sm:text-left">
          <DialogTitle className="text-xl sm:text-2xl font-semibold leading-none mb-0">
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
                htmlFor="condition"
                className="sm:text-right text-sm font-medium"
              >
                Condition
              </Label>
              <Input
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="sm:col-span-3 py-2 text-sm"
                placeholder="Or use voice recording below"
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
                >
                  {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
                </Button>
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
                  <Switch
                    id="language-mode"
                    checked={isHindi}
                    onCheckedChange={toggleLanguage}
                    className="data-[state=checked]:bg-black cursor-pointer"
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
              <Textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="sm:col-span-3 min-h-[100px] text-sm p-3"
                placeholder={
                  isRecording
                    ? "Speak now..."
                    : "Transcription will appear here"
                }
              />
            </div>
          </div>
          <DialogFooter className="mt-5 gap-2 flex-col sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-white text-black border-gray-200 hover:bg-gray-50 px-4 py-2 text-sm h-9 cursor-pointer w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 text-sm h-9 cursor-pointer w-full sm:w-auto"
            >
              Add Patient
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
