"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import {
  X,
  Plus,
  Save,
  Stethoscope,
  Mic,
  MicOff,
  XCircle,
  Loader2,
  ClipboardList,
  ShieldAlert,
  Pill,
  AlertCircle,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Loading from "../Loading";
import { useData } from "@/lib/store/datacontext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Define interfaces for type safety
interface Medication {
  nameofmedicine: string;
  dosage: string;
  frequency: "daily" | "weekly" | "monthly";
  emptyStomach: "yes" | "no";
  duration: string;
  durationType: "weeks" | "days" | "months";
}

interface VisitData {
  symptoms: string;
  diagnosis: string[];
  precautions: string[];
  prescribe_meds: Medication[];
  extraPrescriptions?: string;
}

// Type for fields that are arrays (not including extraPrescriptions)
type ArrayField = Exclude<keyof VisitData, "extraPrescriptions">;

// Create a separate component that uses useSearchParams
function EditorContent() {
  const [visitData, setVisitData] = useState<VisitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Audio recording states
  const [isListening, setIsListening] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [wordDetected, setWordDetected] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [isHindi, setIsHindi] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] =
    useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams.get("patientId");
  const visitId = searchParams.get("visitId");
  const { data } = useData();
  // Reference for speech recognition
  const recognitionRef = useRef<any>(null);
  const currentFieldRef = useRef<string | null>(null);

  // Check browser compatibility
  useEffect(() => {
    const checkBrowserCompatibility = () => {
      const isSupported =
        "webkitSpeechRecognition" in window || "SpeechRecognition" in window;

      setIsSpeechRecognitionSupported(isSupported);

      if (!isSupported) {
        console.warn("Speech recognition not supported in this browser");
        toast.error("Speech Recognition Not Available", {
          description:
            "Your browser doesn't support voice recording. Please try a different browser like Chrome.",
        });
      }
    };

    checkBrowserCompatibility();
  }, []);

  // Setup speech recognition cleanup
  useEffect(() => {
    // Handle page unload/close - stop recording
    const handleBeforeUnload = () => {
      stopRecognition();
    };

    // Add event listener for page close/unload
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function
    return () => {
      stopRecognition();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("Patient ID from URL:", patientId);
        console.log("Visit ID from URL:", visitId);
        console.log("Context data:", data);

        // const response = await fetch(
        //   `/api/visits?patientId=${patientId}&visitId=${visitId}`
        // );
        const ndata = data;

        if (!ndata) {
          console.warn("No data available from context");
        }

        // Add default duration fields to each medication if they don't exist
        const prescribeMeds = ndata?.prescriptions?.prescribe_meds || [];

        const visitdata: VisitData = {
          symptoms: ndata?.symptoms || "",
          diagnosis: ndata?.diagnosis || [],
          precautions: ndata?.prescriptions?.precautions || [],
          prescribe_meds: prescribeMeds,
          extraPrescriptions: ndata?.prescriptions?.extraPrescriptions || "",
        };

        console.log("Prepared visit data:", visitdata);
        setVisitData(visitdata);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load visit data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId, visitId, data]);

  // Add a clear function to properly stop recognition
  const stopRecognition = () => {
    console.log("Stopping speech recognition");
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
        console.log("Successfully aborted recognition");
      } catch (err) {
        console.error("Error stopping recognition:", err);
      } finally {
        recognitionRef.current = null;
        currentFieldRef.current = null;
        // Reset all listening states
        setIsListening({});
        console.log("Reset all listening states");
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

  // Start speech recognition for a specific field
  const startRecognition = (fieldKey: string) => {
    // Don't start if we're not in recording state
    if (!isListening[fieldKey]) return;

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
        toast.error("Speech Recognition Not Supported", {
          description: "Your browser doesn't support voice recording.",
        });
        setIsListening((prev) => ({ ...prev, [fieldKey]: false }));
        return;
      }

      // First request microphone permissions explicitly
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          // Stop the stream immediately, we just needed permission
          stream.getTracks().forEach((track) => track.stop());

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
            if (!isListening[fieldKey]) return;

            const resultIndex = event.resultIndex;
            const result = event.results[resultIndex];

            if (result.isFinal) {
              const transcript = result[0].transcript.trim();
              if (transcript) {
                console.log(`Detected speech: "${transcript}"`);
                // Flash the word detected indicator
                setWordDetected((prev) => ({ ...prev, [fieldKey]: true }));
                setTimeout(
                  () =>
                    setWordDetected((prev) => ({ ...prev, [fieldKey]: false })),
                  500
                );

                // Parse the field key to determine which field to update
                updateFieldWithTranscript(fieldKey, transcript);
              }
            }
          };

          // Reset recognition after each result to prevent cumulative results
          recognition.onend = () => {
            console.log("Recognition ended, checking if should restart");
            // Don't restart if we're not supposed to be recording anymore
            if (!isListening[fieldKey]) {
              if (recognitionRef.current) {
                recognitionRef.current = null;
              }
              return;
            }

            // Short delay before restarting
            setTimeout(() => {
              // Check again before restarting (in case recording was stopped during timeout)
              if (!isListening[fieldKey]) return;

              // Just restart the recognition
              try {
                startRecognition(fieldKey);
              } catch (error) {
                console.error("Error restarting recognition:", error);
              }
            }, 100);
          };

          recognition.onerror = (event: any) => {
            console.error("Recognition error:", event.error);

            // Handle specific errors
            if (event.error === "no-speech" || event.error === "aborted") {
              console.log("Handling normal recognition end case:", event.error);
              // These are expected errors, no need to restart if we've intentionally stopped
              if (!isListening[fieldKey]) return;
            } else if (
              event.error === "not-allowed" ||
              event.error === "service-not-allowed"
            ) {
              // Permission denied
              toast.error("Microphone Access Denied", {
                description:
                  "Please allow microphone access in your browser settings.",
              });
              setIsListening((prev) => ({ ...prev, [fieldKey]: false }));
              return;
            }

            // Restart on error too, but only if we're still supposed to be recording
            if (isListening[fieldKey]) {
              setTimeout(() => {
                startRecognition(fieldKey);
              }, 500);
            }
          };

          // Start recognition
          recognition.start();
          console.log("Speech recognition started for", fieldKey);
          recognitionRef.current = recognition;
          currentFieldRef.current = fieldKey;
        })
        .catch((err) => {
          console.error("Microphone permission denied:", err);
          toast.error("Microphone Access Denied", {
            description:
              "Please allow microphone access to use voice recording.",
          });
          setIsListening((prev) => ({ ...prev, [fieldKey]: false }));
        });
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      setIsListening((prev) => ({ ...prev, [fieldKey]: false }));
      toast.error("Recording Failed", {
        description: "Could not start voice recording. Please try again.",
      });
    }
  };

  // Update the appropriate field with the transcript
  const updateFieldWithTranscript = (fieldKey: string, transcript: string) => {
    if (!visitData) return;

    const parts = fieldKey.split("-");
    const field = parts[0] as keyof VisitData;
    const index = parseInt(parts[1]);

    if (isNaN(index)) return;

    if (field === "symptoms") {
      setVisitData((prev) => ({
        ...prev!,
        symptoms: prev!.symptoms + (prev!.symptoms ? " " : "") + transcript,
      }));
    } else if (field === "extraPrescriptions") {
      setVisitData((prev) => ({
        ...prev!,
        extraPrescriptions:
          (prev!.extraPrescriptions || "") +
          (prev!.extraPrescriptions || "" ? " " : "") +
          transcript,
      }));
    } else if (field === "diagnosis") {
      setVisitData((prev) => {
        const updatedDiagnosis = [...prev!.diagnosis];
        updatedDiagnosis[index] =
          updatedDiagnosis[index] +
          (updatedDiagnosis[index] ? " " : "") +
          transcript;
        return { ...prev!, diagnosis: updatedDiagnosis };
      });
    } else if (field === "precautions") {
      setVisitData((prev) => {
        const updatedPrecautions = [...prev!.precautions];
        updatedPrecautions[index] =
          updatedPrecautions[index] +
          (updatedPrecautions[index] ? " " : "") +
          transcript;
        return { ...prev!, precautions: updatedPrecautions };
      });
    } else if (field === "prescribe_meds") {
      const subField = parts[2] as keyof Medication;
      if (subField && subField === "nameofmedicine") {
        setVisitData((prev) => {
          const updatedMeds = [...prev!.prescribe_meds];
          updatedMeds[index] = {
            ...updatedMeds[index],
            nameofmedicine:
              updatedMeds[index].nameofmedicine +
              (updatedMeds[index].nameofmedicine ? " " : "") +
              transcript,
          };
          return { ...prev!, prescribe_meds: updatedMeds };
        });
      }
    }
  };

  // Handle adding fields
  const addField = (field: ArrayField) => {
    if (!visitData) return;

    setVisitData((prev) => {
      if (field === "prescribe_meds") {
        return {
          ...prev!,
          prescribe_meds: [
            ...prev!.prescribe_meds,
            {
              nameofmedicine: "",
              dosage: "1",
              frequency: "daily",
              emptyStomach: "no",
              duration: "1", // Change default duration from 2 to 1
              durationType: "weeks", // Default duration type
            },
          ],
        };
      } else {
        return {
          ...prev!,
          [field]: [...prev![field], ""],
        };
      }
    });
  };

  // Handle deleting fields
  const deleteField = (field: ArrayField, index: number) => {
    if (!visitData) return;

    setVisitData((prev) => {
      const updatedField = [...prev![field]];
      updatedField.splice(index, 1);
      return { ...prev!, [field]: updatedField };
    });
  };

  // Handle input changes
  const handleChange = (
    field: ArrayField,
    index: number,
    value: string,
    subField?: keyof Medication
  ) => {
    if (!visitData) return;

    setVisitData((prev) => {
      if (field === "prescribe_meds" && subField) {
        const updatedMeds = [...prev!.prescribe_meds];
        updatedMeds[index] = { ...updatedMeds[index], [subField]: value };
        return { ...prev!, prescribe_meds: updatedMeds };
      } else {
        const updatedField = [...prev![field]];
        updatedField[index] = value;
        return { ...prev!, [field]: updatedField };
      }
    });
  };

  // Handle toggling the speech recognition
  const toggleListening = (
    field: keyof VisitData,
    index: number,
    subField?: keyof Medication
  ) => {
    const fieldKey = subField
      ? `${field}-${index}-${subField}`
      : `${field}-${index}`;

    // Check if speech recognition is supported
    if (!isSpeechRecognitionSupported) {
      toast.error("Speech Recognition Not Available", {
        description:
          "Your browser doesn't support voice recording. Please try a different browser like Chrome.",
      });
      return;
    }

    // If already in "listening" state for this field, stop the recording
    if (isListening[fieldKey]) {
      console.log(`Stopping recording for ${fieldKey}`);
      stopRecognition();
      setIsListening((prev) => ({ ...prev, [fieldKey]: false }));
    } else {
      // Stop any other recording that might be happening
      if (recognitionRef.current) {
        stopRecognition();
      }

      console.log(`Starting voice input for ${fieldKey}`);
      currentFieldRef.current = fieldKey;

      // Set this field to listening state - the useEffect will handle starting the recording
      setIsListening((prev) => {
        // First clear any existing listening states
        const newState = {};
        // Then set only this field to listening
        return { ...newState, [fieldKey]: true };
      });
    }
  };

  // Add effect to control speech recognition based on isListening state
  useEffect(() => {
    // Check if any field is in listening state
    const activeFieldKey = Object.entries(isListening).find(
      ([key, value]) => value
    )?.[0];

    if (activeFieldKey) {
      console.log(`Starting recognition for active field: ${activeFieldKey}`);
      currentFieldRef.current = activeFieldKey;
      startRecognition(activeFieldKey);
    } else {
      // If no field is in listening state, ensure recognition is stopped
      if (recognitionRef.current) {
        console.log("No active fields, stopping any ongoing recognition");
        stopRecognition();
      }
    }

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        stopRecognition();
      }
    };
  }, [isListening]);

  // Handle form submission (API-ready)
  const handleDone = async () => {
    if (!visitData) return;
    console.log("Final Data:", visitData);
    console.log("PatientId:", patientId); // Log patientId for debugging

    if (!patientId) {
      toast.error("Patient ID is missing", {
        description: "Please go back and try again.",
      });
      return;
    }

    setSaving(true);
    try {
      // Create properly structured request body that matches the API expectations
      const requestBody = {
        patientId: patientId,
        symptoms: visitData.symptoms,
        diagnosis: visitData.diagnosis || [],
        prescriptions: {
          prescribe_meds: visitData.prescribe_meds || [],
          precautions: visitData.precautions || [],
          extraPrescriptions: visitData.extraPrescriptions || "",
        },
      };

      console.log("Request Body:", requestBody);

      // Add detailed logging to debug data structure
      console.log("Diagnosis count:", visitData.diagnosis?.length);
      console.log("Symptoms:", visitData.symptoms);
      console.log("Precautions count:", visitData.precautions?.length);
      console.log("Medications count:", visitData.prescribe_meds?.length);

      const response = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        // Replace modal with toast for success
        toast.success("Visit data saved successfully!", {
          description: "Patient record has been updated",
          duration: 5000,
          className: "minimal-success-toast",
        });
        // Navigate after a short delay
        setTimeout(() => {
          router.push(`/profile?id=${patientId}`);
        }, 2000);
      } else {
        // Try to get the error message from the response
        try {
          const errorData = await response.json();
          toast.error("Error saving data", {
            description: errorData.error || "Please try again.",
            duration: 5000,
            className: "minimal-error-toast",
          });
        } catch {
          toast.error("Error saving data", {
            description: `Server returned ${response.status}. Please try again.`,
            duration: 5000,
            className: "minimal-error-toast",
          });
        }
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Failed to save data", {
        description: "Please check your connection and try again.",
        duration: 5000,
        className: "minimal-error-toast",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  // Close the cancel modal
  const closeCancelModal = () => {
    setShowCancelModal(false);
  };

  // Confirm cancellation and navigate away
  const confirmCancel = () => {
    router.push("/");
  };

  // Handler for displaying visual indicator on UI when word is detected
  const verifyRecognitionWorks = async () => {
    if (recognitionRef.current) {
      toast.info("Speech recognition is already active", {
        description: "Try speaking into your microphone",
      });
      return;
    }

    try {
      const isSupported =
        "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
      if (!isSupported) {
        toast.error("Speech Recognition Not Supported", {
          description: "Your browser doesn't support the Web Speech API.",
        });
        return;
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());

      toast.success("Microphone permission granted", {
        description: "You can now use voice input for any field.",
      });

      // Create a test recognition instance
      // @ts-ignore
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const testRecognition = new SpeechRecognition();
      testRecognition.continuous = false;
      testRecognition.interimResults = false;
      testRecognition.lang = "en-US";

      // Start it and immediately stop it as a test
      testRecognition.start();
      setTimeout(() => {
        try {
          testRecognition.stop();
          toast.success("Speech recognition initialized successfully", {
            description: "Voice input should now work on all fields.",
          });
        } catch (err) {
          console.error("Error stopping test recognition:", err);
        }
      }, 500);
    } catch (err) {
      console.error("Error testing speech recognition:", err);
      toast.error("Speech Recognition Failed", {
        description:
          "Could not access your microphone. Please check your browser settings.",
      });
    }
  };

  // Loader component
  if (loading) {
    return <Loading />;
  }

  // Main content (only shown when not loading)
  if (!visitData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-md w-full text-center">
          <XCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mx-auto mb-3 sm:mb-4" />
          <p className="text-lg sm:text-xl text-gray-800 font-medium mb-2">
            Error loading data
          </p>
          <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6">
            {!patientId
              ? "No patient ID provided. Please select a patient first."
              : "Failed to load visit data. Please try again."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10 px-3 py-4 sm:px-4 sm:py-6 font-sans">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-4 sm:p-8 border border-gray-100">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4 sm:pb-6 mb-5 sm:mb-8">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-blue-50 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
                Visit Editor
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Microphone test button */}
              <button
                onClick={verifyRecognitionWorks}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-xs font-medium text-gray-700 transition-colors"
                title="Test microphone access"
              >
                <Mic className="h-3.5 w-3.5" /> Test Mic
              </button>

              {/* Language toggle switch */}
              <div className="flex items-center space-x-2 bg-gray-50 p-1.5 pl-2 pr-3 rounded-full shadow-sm border border-gray-200">
                <Switch
                  id="language-mode"
                  checked={isHindi}
                  onCheckedChange={(checked) => {
                    // Stop any active recording before changing language
                    if (recognitionRef.current) {
                      stopRecognition();
                    }
                    setIsHindi(checked);
                  }}
                  className="data-[state=checked]:bg-black"
                />
                <label
                  htmlFor="language-mode"
                  className="text-xs font-medium cursor-pointer"
                >
                  {isHindi ? "Hindi" : "English"}
                </label>
              </div>
            </div>
          </div>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500 ml-1">
            Update or add details for patient visit record
          </p>
        </div>

        {/* Diagnosis Section */}
        <section className="mb-7 sm:mb-10">
          <h2 className="text-lg sm:text-xl font-medium text-gray-700 mb-3 sm:mb-4 flex items-center">
            <span className="h-7 w-7 sm:h-8 sm:w-8 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mr-2.5 flex-shrink-0">
              <ClipboardList className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </span>
            Diagnosis
          </h2>

          {visitData?.diagnosis?.map((item, index) => (
            <div
              key={index}
              className="mb-3 sm:mb-4 flex items-start gap-2 sm:gap-3 group animate-fade-in"
            >
              <div className="relative w-full">
                <textarea
                  value={item}
                  onChange={(e) =>
                    handleChange("diagnosis", index, e.target.value)
                  }
                  placeholder="Enter diagnosis..."
                  className={`w-full p-3.5 sm:p-4 bg-white border ${
                    isListening[`diagnosis-${index}`]
                      ? "border-blue-300 focus:ring-blue-200 bg-blue-50/10"
                      : "border-gray-200 focus:ring-blue-400"
                  } rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-blue-200 text-sm sm:text-base shadow-sm`}
                  rows={3}
                />
                {isListening[`diagnosis-${index}`] && (
                  <div className="absolute top-0 right-0 mt-1 mr-1">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                      Recording
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => toggleListening("diagnosis", index)}
                  className={`p-2.5 ${
                    isListening[`diagnosis-${index}`]
                      ? "bg-blue-100 text-blue-500"
                      : "text-gray-400 hover:text-blue-400 hover:bg-blue-50"
                  } rounded-full transition-all duration-200 flex-shrink-0 shadow-sm`}
                  title={
                    isListening[`diagnosis-${index}`]
                      ? "Stop voice input"
                      : "Start voice input"
                  }
                  aria-label={
                    isListening[`diagnosis-${index}`]
                      ? "Stop voice input"
                      : "Start voice input"
                  }
                >
                  {isListening[`diagnosis-${index}`] ? (
                    <>
                      <div className="absolute -left-1 -top-1">
                        {wordDetected[`diagnosis-${index}`] && (
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-ping opacity-75" />
                        )}
                      </div>
                      <MicOff className="h-5 w-5 sm:h-5 sm:w-5" />
                    </>
                  ) : (
                    <Mic className="h-5 w-5 sm:h-5 sm:w-5" />
                  )}
                </button>
                {visitData.diagnosis.length > 1 && (
                  <button
                    onClick={() => deleteField("diagnosis", index)}
                    className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-50 rounded-full opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 flex-shrink-0 shadow-sm"
                    aria-label="Delete diagnosis"
                  >
                    <X className="h-5 w-5 sm:h-5 sm:w-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            onClick={() => addField("diagnosis")}
            className="px-4 py-2.5 sm:px-4 sm:py-2.5 bg-blue-500 text-white rounded-lg flex items-center hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base mt-2"
          >
            <Plus className="h-4 w-4 sm:h-4 sm:w-4 mr-2" /> Add Diagnosis
          </button>
        </section>

        {/* Symptoms and Observations Section */}
        <section className="mb-7 sm:mb-10">
          <h2 className="text-lg sm:text-xl font-medium text-gray-700 mb-3 sm:mb-4 flex items-center">
            <span className="h-7 w-7 sm:h-8 sm:w-8 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mr-2.5 flex-shrink-0">
              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </span>
            Symptoms and Observations
          </h2>
          <div className="mb-3 sm:mb-4 group animate-fade-in flex items-start gap-2 sm:gap-3">
            <div className="relative w-full">
              <textarea
                value={visitData.symptoms}
                onChange={(e) =>
                  setVisitData((prev) => ({
                    ...prev!,
                    symptoms: e.target.value,
                  }))
                }
                placeholder="Enter patient symptoms and clinical observations..."
                className={`w-full p-3.5 sm:p-4 bg-white border ${
                  isListening[`symptoms-0`]
                    ? "border-amber-300 focus:ring-amber-200 bg-amber-50/10"
                    : "border-gray-200 focus:ring-amber-400"
                } rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-amber-200 text-sm sm:text-base shadow-sm`}
                rows={4}
              />
              {isListening[`symptoms-0`] && (
                <div className="absolute top-0 right-0 mt-1 mr-1">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                    Recording
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => toggleListening("symptoms", 0)}
              className={`p-2.5 relative ${
                isListening[`symptoms-0`]
                  ? "bg-amber-100 text-amber-500"
                  : "text-gray-400 hover:text-amber-400 hover:bg-amber-50"
              } rounded-full transition-all duration-200 flex-shrink-0 shadow-sm mt-1`}
              title={
                isListening[`symptoms-0`]
                  ? "Stop voice input"
                  : "Start voice input"
              }
              aria-label={
                isListening[`symptoms-0`]
                  ? "Stop voice input"
                  : "Start voice input"
              }
            >
              {isListening[`symptoms-0`] ? (
                <>
                  <div className="absolute -left-1 -top-1">
                    {wordDetected[`symptoms-0`] && (
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-ping opacity-75" />
                    )}
                  </div>
                  <MicOff className="h-5 w-5 sm:h-5 sm:w-5" />
                </>
              ) : (
                <Mic className="h-5 w-5 sm:h-5 sm:w-5" />
              )}
            </button>
          </div>
        </section>

        {/* Precautions Section */}
        <section className="mb-7 sm:mb-10">
          <h2 className="text-lg sm:text-xl font-medium text-gray-700 mb-3 sm:mb-4 flex items-center">
            <span className="h-7 w-7 sm:h-8 sm:w-8 bg-green-50 text-green-500 rounded-full flex items-center justify-center mr-2.5 flex-shrink-0">
              <ShieldAlert className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </span>
            Precautions
          </h2>
          {visitData.precautions.map((item, index) => (
            <div
              key={index}
              className="mb-3 sm:mb-4 flex items-start gap-2 sm:gap-3 group animate-fade-in"
            >
              <div className="relative w-full">
                <textarea
                  value={item}
                  onChange={(e) =>
                    handleChange("precautions", index, e.target.value)
                  }
                  placeholder="Enter precaution..."
                  className={`w-full p-3.5 sm:p-4 bg-white border ${
                    isListening[`precautions-${index}`]
                      ? "border-green-300 focus:ring-green-200 bg-green-50/10"
                      : "border-gray-200 focus:ring-green-400"
                  } rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-green-200 text-sm sm:text-base shadow-sm`}
                  rows={3}
                />
                {isListening[`precautions-${index}`] && (
                  <div className="absolute top-0 right-0 mt-1 mr-1">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                      Recording
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => toggleListening("precautions", index)}
                  className={`p-2.5 relative ${
                    isListening[`precautions-${index}`]
                      ? "bg-green-100 text-green-500"
                      : "text-gray-400 hover:text-green-400 hover:bg-green-50"
                  } rounded-full transition-all duration-200 flex-shrink-0 shadow-sm`}
                  title={
                    isListening[`precautions-${index}`]
                      ? "Stop voice input"
                      : "Start voice input"
                  }
                  aria-label={
                    isListening[`precautions-${index}`]
                      ? "Stop voice input"
                      : "Start voice input"
                  }
                >
                  {isListening[`precautions-${index}`] ? (
                    <>
                      <div className="absolute -left-1 -top-1">
                        {wordDetected[`precautions-${index}`] && (
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-ping opacity-75" />
                        )}
                      </div>
                      <MicOff className="h-5 w-5 sm:h-5 sm:w-5" />
                    </>
                  ) : (
                    <Mic className="h-5 w-5 sm:h-5 sm:w-5" />
                  )}
                </button>
                {visitData.precautions.length > 1 && (
                  <button
                    onClick={() => deleteField("precautions", index)}
                    className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-50 rounded-full opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 flex-shrink-0 shadow-sm"
                    aria-label="Delete precaution"
                  >
                    <X className="h-5 w-5 sm:h-5 sm:w-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            onClick={() => addField("precautions")}
            className="px-4 py-2.5 sm:px-4 sm:py-2.5 bg-green-500 text-white rounded-lg flex items-center hover:bg-green-600 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base mt-2"
          >
            <Plus className="h-4 w-4 sm:h-4 sm:w-4 mr-2" /> Add Precaution
          </button>
        </section>

        {/* Prescribed Medications Section */}
        <section className="mb-7 sm:mb-10">
          <h2 className="text-lg sm:text-xl font-medium text-gray-700 mb-3 sm:mb-4 flex items-center">
            <span className="h-7 w-7 sm:h-8 sm:w-8 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mr-2.5 flex-shrink-0">
              <Pill className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </span>
            Prescribed Medications
          </h2>
          {visitData.prescribe_meds.map((med, index) => (
            <div
              key={index}
              className="mb-5 sm:mb-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-all duration-200 group animate-fade-in overflow-hidden"
            >
              {/* Card Header with Medicine Name and Delete Button */}
              <div className="bg-purple-50/80 p-4 sm:p-5 border-b border-purple-100 flex justify-between items-center">
                <div className="flex items-center gap-2 flex-grow">
                  <Pill className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 flex-shrink-0" />
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={med.nameofmedicine}
                      onChange={(e) =>
                        handleChange(
                          "prescribe_meds",
                          index,
                          e.target.value,
                          "nameofmedicine"
                        )
                      }
                      placeholder="Enter medication name"
                      className="w-full p-2 sm:p-2.5 bg-white border border-purple-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 text-sm sm:text-base shadow-sm"
                    />
                    {isListening[`prescribe_meds-${index}-nameofmedicine`] && (
                      <div className="absolute top-0 right-0 mt-1 mr-1">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium animate-pulse">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                          Recording
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {visitData.prescribe_meds.length > 1 && (
                  <button
                    onClick={() => deleteField("prescribe_meds", index)}
                    className="ml-2 p-2 text-red-400 hover:text-white bg-white hover:bg-red-400 rounded-lg transition-all duration-200 flex-shrink-0 shadow-sm border border-red-100"
                    title="Remove medication"
                    aria-label="Remove medication"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                )}
              </div>

              {/* Card Body with Settings */}
              <div className="p-4 sm:p-5">
                {/* Dosage Section - Grouped together with a background */}
                <div className="bg-blue-50/30 p-3 sm:p-4 rounded-lg border border-blue-100 mb-4">
                  <h3 className="text-sm font-medium text-blue-700 mb-3 flex items-center">
                    <span className="h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center mr-1.5">
                      <span className="text-blue-600 text-xs font-bold">1</span>
                    </span>
                    Dosage Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Dosage Amount */}
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-gray-600 mb-2">
                        Amount
                      </label>
                      <div className="flex items-center h-10 rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white">
                        <button
                          onClick={() => {
                            const currentValue = parseInt(med.dosage) || 0;
                            if (currentValue > 1) {
                              handleChange(
                                "prescribe_meds",
                                index,
                                (currentValue - 1).toString(),
                                "dosage"
                              );
                            }
                          }}
                          className="h-full bg-gray-100 text-gray-700 w-10 flex justify-center items-center hover:bg-gray-200 transition-all duration-200"
                          title="Decrease dosage"
                          aria-label="Decrease dosage"
                        >
                          <span className="font-bold">−</span>
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={med.dosage}
                          onChange={(e) =>
                            handleChange(
                              "prescribe_meds",
                              index,
                              e.target.value,
                              "dosage"
                            )
                          }
                          className="h-full w-full text-center bg-white text-gray-700 focus:outline-none focus:ring-inset focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-sm sm:text-base"
                        />
                        <button
                          onClick={() => {
                            const currentValue = parseInt(med.dosage) || 0;
                            handleChange(
                              "prescribe_meds",
                              index,
                              (currentValue + 1).toString(),
                              "dosage"
                            );
                          }}
                          className="h-full bg-gray-100 text-gray-700 w-10 flex justify-center items-center hover:bg-gray-200 transition-all duration-200"
                          title="Increase dosage"
                          aria-label="Increase dosage"
                        >
                          <span className="font-bold">+</span>
                        </button>
                      </div>
                    </div>

                    {/* Frequency type dropdown */}
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-gray-600 mb-2">
                        Frequency
                      </label>
                      <select
                        value={med.frequency}
                        onChange={(e) =>
                          handleChange(
                            "prescribe_meds",
                            index,
                            e.target.value as "daily" | "weekly" | "monthly",
                            "frequency"
                          )
                        }
                        className="h-10 rounded-lg bg-white border border-gray-200 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-sm sm:text-base shadow-sm appearance-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 0.5rem center",
                          backgroundSize: "1.5em 1.5em",
                          paddingRight: "2.5rem",
                        }}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    {/* Empty stomach dropdown */}
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-gray-600 mb-2">
                        Food Requirement
                      </label>
                      <select
                        value={med.emptyStomach}
                        onChange={(e) =>
                          handleChange(
                            "prescribe_meds",
                            index,
                            e.target.value as "yes" | "no",
                            "emptyStomach"
                          )
                        }
                        className="h-10 rounded-lg bg-white border border-gray-200 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-sm sm:text-base shadow-sm appearance-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 0.5rem center",
                          backgroundSize: "1.5em 1.5em",
                          paddingRight: "2.5rem",
                        }}
                      >
                        <option value="yes">After Food</option>
                        <option value="no">Empty Stomach</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Duration section with combined controls - separate visual section */}
                <div className="bg-amber-50/30 p-3 sm:p-4 rounded-lg border border-amber-100">
                  <h3 className="text-sm font-medium text-amber-700 mb-3 flex items-center">
                    <span className="h-5 w-5 bg-amber-100 rounded-full flex items-center justify-center mr-1.5">
                      <span className="text-amber-600 text-xs font-bold">
                        2
                      </span>
                    </span>
                    Treatment Duration
                  </h3>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center h-10 rounded-lg overflow-hidden border border-gray-200 shadow-sm flex-grow max-w-[180px] bg-white">
                      <button
                        onClick={() => {
                          const currentValue = parseInt(med.duration) || 0;
                          if (currentValue > 1) {
                            handleChange(
                              "prescribe_meds",
                              index,
                              (currentValue - 1).toString(),
                              "duration"
                            );
                          }
                        }}
                        className="h-full bg-gray-100 text-gray-700 w-10 flex justify-center items-center hover:bg-gray-200 transition-all duration-200"
                        title="Decrease duration"
                        aria-label="Decrease duration"
                      >
                        <span className="font-bold">−</span>
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={med?.duration}
                        onChange={(e) =>
                          handleChange(
                            "prescribe_meds",
                            index,
                            e.target.value,
                            "duration"
                          )
                        }
                        className="h-full w-full text-center bg-white text-gray-700 focus:outline-none focus:ring-inset focus:ring-2 focus:ring-amber-400 transition-all duration-200 text-sm sm:text-base"
                      />
                      <button
                        onClick={() => {
                          const currentValue = parseInt(med.duration) || 0;
                          handleChange(
                            "prescribe_meds",
                            index,
                            (currentValue + 1).toString(),
                            "duration"
                          );
                        }}
                        className="h-full bg-gray-100 text-gray-700 w-10 flex justify-center items-center hover:bg-gray-200 transition-all duration-200"
                        title="Increase duration"
                        aria-label="Increase duration"
                      >
                        <span className="font-bold">+</span>
                      </button>
                    </div>
                    <select
                      value={med.durationType}
                      onChange={(e) =>
                        handleChange(
                          "prescribe_meds",
                          index,
                          e.target.value as "weeks" | "days" | "months",
                          "durationType"
                        )
                      }
                      className="h-10 rounded-lg bg-white border border-gray-200 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 text-sm sm:text-base shadow-sm appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 0.5rem center",
                        backgroundSize: "1.5em 1.5em",
                        paddingRight: "2.5rem",
                      }}
                    >
                      <option value="weeks">Weeks</option>
                      <option value="days">Days</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={() => addField("prescribe_meds")}
            className="px-4 py-2.5 sm:px-4 sm:py-2.5 bg-purple-500 text-white rounded-lg flex items-center hover:bg-purple-600 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base mt-2"
          >
            <Plus className="h-4 w-4 sm:h-4 sm:w-4 mr-2" /> Add Medication
          </button>
        </section>

        {/* Extra Prescriptions Section */}
        <section className="mb-7 sm:mb-10">
          <h2 className="text-lg sm:text-xl font-medium text-gray-700 mb-3 sm:mb-4 flex items-center">
            <span className="h-7 w-7 sm:h-8 sm:w-8 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mr-2.5 flex-shrink-0">
              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </span>
            Extra Prescriptions
          </h2>
          <div className="mb-3 sm:mb-4 group animate-fade-in flex items-start gap-2 sm:gap-3">
            <div className="relative w-full">
              <textarea
                value={visitData.extraPrescriptions || ""}
                onChange={(e) =>
                  setVisitData((prev) => ({
                    ...prev!,
                    extraPrescriptions: e.target.value,
                  }))
                }
                placeholder="Enter any additional prescriptions or instructions not covered in the medication section..."
                className={`w-full p-3.5 sm:p-4 bg-white border ${
                  isListening[`extraPrescriptions-0`]
                    ? "border-orange-300 focus:ring-orange-200 bg-orange-50/10"
                    : "border-gray-200 focus:ring-orange-400"
                } rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-orange-200 text-sm sm:text-base shadow-sm`}
                rows={4}
              />
              {isListening[`extraPrescriptions-0`] && (
                <div className="absolute top-0 right-0 mt-1 mr-1">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                    Recording
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => toggleListening("extraPrescriptions", 0)}
              className={`p-2.5 relative ${
                isListening[`extraPrescriptions-0`]
                  ? "bg-orange-100 text-orange-500"
                  : "text-gray-400 hover:text-orange-400 hover:bg-orange-50"
              } rounded-full transition-all duration-200 flex-shrink-0 shadow-sm mt-1`}
              title={
                isListening[`extraPrescriptions-0`]
                  ? "Stop voice input"
                  : "Start voice input"
              }
              aria-label={
                isListening[`extraPrescriptions-0`]
                  ? "Stop voice input"
                  : "Start voice input"
              }
            >
              {isListening[`extraPrescriptions-0`] ? (
                <>
                  <div className="absolute -left-1 -top-1">
                    {wordDetected[`extraPrescriptions-0`] && (
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-ping opacity-75" />
                    )}
                  </div>
                  <MicOff className="h-5 w-5 sm:h-5 sm:w-5" />
                </>
              ) : (
                <Mic className="h-5 w-5 sm:h-5 sm:w-5" />
              )}
            </button>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 mt-8 sticky bottom-0 pt-3 border-t border-gray-100 bg-white">
          <button
            onClick={handleCancel}
            className="px-4 py-3 sm:px-6 sm:py-3 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base w-full sm:w-auto font-medium"
            disabled={saving}
          >
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-2" />
            Cancel
          </button>
          <button
            onClick={handleDone}
            disabled={saving}
            className="px-4 py-3 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 text-white rounded-lg flex items-center justify-center hover:from-blue-600 hover:via-teal-600 hover:to-green-600 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base w-full sm:w-auto font-medium"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-2" /> Save
                Visit
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="sm:max-w-md rounded-xl border border-gray-100 shadow-md p-5 sm:p-6 bg-white max-w-[92%] mx-auto">
          <DialogHeader className="mb-3 sm:mb-4">
            <DialogTitle className="text-base sm:text-lg font-medium text-gray-800 flex items-center">
              <AlertCircle className="h-5 w-5 sm:h-5 sm:w-5 text-red-500 mr-2 flex-shrink-0" />
              Discard changes?
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-gray-500 mt-1.5">
              Unsaved changes will be lost if you leave this page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center sm:justify-end border-t border-gray-100 pt-4 sm:pt-4 mt-2 sm:mt-2">
            <button
              onClick={closeCancelModal}
              className="px-4 py-2.5 sm:px-4 sm:py-2.5 border border-gray-200 text-gray-600 text-sm rounded-md hover:bg-gray-50 transition-colors w-full sm:w-auto font-medium"
            >
              Continue editing
            </button>
            <button
              onClick={confirmCancel}
              className="px-4 py-2.5 sm:px-4 sm:py-2.5 bg-gradient-to-r from-red-500 to-red-400 text-white text-sm rounded-md hover:from-red-600 hover:to-red-500 transition-colors shadow-sm w-full sm:w-auto font-medium"
            >
              Discard changes
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom CSS for Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        @media (max-width: 640px) {
          textarea,
          input,
          select {
            font-size: 16px; /* Prevents iOS zoom on focus */
          }

          /* Improve tap targets on mobile */
          button,
          select,
          input[type="number"] {
            min-height: 44px;
          }

          /* Remove browser default appearance */
          select::-ms-expand {
            display: none;
          }
        }

        /* Make all buttons have cursor pointer */
        button {
          cursor: pointer;
        }

        /* Fix text cursor in textareas and inputs */
        textarea,
        input[type="text"],
        input[type="number"] {
          caret-color: #6366f1; /* Indigo color for better visibility */
        }
      `}</style>
    </div>
  );
}

// Main component that wraps EditorContent in Suspense
const EditorPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
};

export default EditorPage;
