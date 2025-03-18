"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Plus,
  Save,
  Stethoscope,
  Mic,
  XCircle,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Loading from "../Loading";
import { useData } from "@/lib/store/datacontext";

// Define interfaces for type safety
interface Medication {
  nameofmedicine: string;
  dosage: string;
  frequency: "daily" | "weekly" | "monthly";
  emptyStomach: "yes" | "no";
}

interface VisitData {
  diagnosis: string[];
  precautions: string[];
  prescribe_meds: Medication[];
}

const EditorPage = () => {
  const [visitData, setVisitData] = useState<VisitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [subLoader, setSubLoader] = useState(false);
  const [isListening, setIsListening] = useState<{ [key: string]: boolean }>(
    {}
  );

  const router = useRouter();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { data } = useData();
  const patientId = data?.patientId;
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // const response = await fetch(
        //   `/api/visits?patientId=${patientId}&visitId=${visitId}`
        // );
        const ndata = data;
        console.log(ndata);
        const visitdata: VisitData = {
          diagnosis: ndata?.diagnosis || [],
          precautions: ndata?.prescriptions?.precautions || [],
          prescribe_meds: ndata?.prescriptions?.prescribe_meds || [],
        };

        setVisitData(visitdata);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load visit data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle adding fields
  const addField = (field: keyof VisitData) => {
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
  const deleteField = (field: keyof VisitData, index: number) => {
    if (!visitData) return;
    setVisitData((prev) => {
      const updatedField = [...prev![field]];
      updatedField.splice(index, 1);
      return { ...prev!, [field]: updatedField };
    });
  };

  // Handle input changes
  const handleChange = (
    field: keyof VisitData,
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

  // Handle form submission (API-ready)
  const handleDone = async () => {
    if (!visitData) return;
    console.log("Final Data:", visitData);
    try {
      setSubLoader(true);
      const response = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patientId,
          diagnosis: visitData.diagnosis,
          prescribe_meds: visitData.prescribe_meds,
          precautions: visitData.precautions,
        }),
      });
      if (response.ok) {
        // alert("Visit data saved successfully!");
        // Redirect to home page
        router.push(`/profile?id=${patientId}`);
      } else {
        alert("Error saving data.");
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("Failed to save data.");
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  // Handle voice input
  const toggleListening = (
    field: keyof VisitData,
    index: number,
    subField?: keyof Medication
  ) => {
    const fieldKey = subField
      ? `${field}-${index}-${subField}`
      : `${field}-${index}`;

    // If already listening for this field, stop listening
    if (isListening[fieldKey]) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening((prev) => ({ ...prev, [fieldKey]: false }));
      return;
    }

    // Check if browser supports speech recognition
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert(
        "Speech recognition is not supported in your browser. Please use Chrome."
      );
      return;
    }

    // Create speech recognition instance
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    // Set listening state for this field
    setIsListening((prev) => ({ ...prev, [fieldKey]: true }));

    // Handle results
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");

      // Update the field with transcript
      if (field === "prescribe_meds" && subField) {
        handleChange(field, index, transcript, subField);
      } else {
        handleChange(field, index, transcript);
      }
    };

    // Handle end of speech recognition
    recognition.onend = () => {
      setIsListening((prev) => ({ ...prev, [fieldKey]: false }));
      recognitionRef.current = null;
    };

    // Start listening
    recognition.start();
  };

  // Loader component
  if (loading) {
    return <Loading />;
  }

  // Main content (only shown when not loading)
  if (!visitData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600 font-medium">No data available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-3xl font-semibold text-gray-800 flex items-center">
            <Stethoscope className="h-8 w-8 text-purple-600 mr-3" />
            Visit Editor
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Update or add details for patient visit record
          </p>
        </div>

        {/* Diagnosis Section */}
        <section className="mb-10">
          <h2 className="text-xl font-medium text-gray-700 mb-4 flex items-center">
            <span className="h-6 w-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-2">
              D
            </span>
            Diagnosis
          </h2>

          {visitData?.diagnosis?.map((item, index) => (
            <div
              key={index}
              className="mb-4 flex items-start gap-3 group animate-fade-in"
            >
              <textarea
                value={item}
                onChange={(e) =>
                  handleChange("diagnosis", index, e.target.value)
                }
                placeholder="Enter diagnosis..."
                className="w-full p-4 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
                rows={3}
              />
              <button
                onClick={() => toggleListening("diagnosis", index)}
                className={`p-2 ${
                  isListening[`diagnosis-${index}`]
                    ? "bg-purple-100 text-purple-600"
                    : "text-gray-400 hover:text-purple-500 hover:bg-purple-50"
                } rounded-full transition-all duration-200`}
                title={
                  isListening[`diagnosis-${index}`]
                    ? "Stop voice input"
                    : "Start voice input"
                }
              >
                {isListening[`diagnosis-${index}`] ? (
                  <XCircle className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>
              {visitData.diagnosis.length > 1 && (
                <button
                  onClick={() => deleteField("diagnosis", index)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => addField("diagnosis")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center hover:bg-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Diagnosis
          </button>
        </section>

        {/* Precautions Section */}
        <section className="mb-10">
          <h2 className="text-xl font-medium text-gray-700 mb-4 flex items-center">
            <span className="h-6 w-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mr-2">
              P
            </span>
            Precautions
          </h2>
          {visitData.precautions.map((item, index) => (
            <div
              key={index}
              className="mb-4 flex items-start gap-3 group animate-fade-in"
            >
              <textarea
                value={item}
                onChange={(e) =>
                  handleChange("precautions", index, e.target.value)
                }
                placeholder="Enter precaution..."
                className="w-full p-4 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-orange-300"
                rows={3}
              />
              <button
                onClick={() => toggleListening("precautions", index)}
                className={`p-2 ${
                  isListening[`precautions-${index}`]
                    ? "bg-orange-100 text-orange-600"
                    : "text-gray-400 hover:text-orange-500 hover:bg-orange-50"
                } rounded-full transition-all duration-200`}
                title={
                  isListening[`precautions-${index}`]
                    ? "Stop voice input"
                    : "Start voice input"
                }
              >
                {isListening[`precautions-${index}`] ? (
                  <XCircle className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>
              {visitData.precautions.length > 1 && (
                <button
                  onClick={() => deleteField("precautions", index)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => addField("precautions")}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg flex items-center hover:bg-orange-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Precaution
          </button>
        </section>

        {/* Prescribed Medications Section */}
        <section className="mb-10">
          <h2 className="text-xl font-medium text-gray-700 mb-4 flex items-center">
            <span className="h-6 w-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mr-2">
              Rx
            </span>
            Prescribed Medications
          </h2>
          {visitData.prescribe_meds.map((med, index) => (
            <div
              key={index}
              className="mb-6 p-4 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group animate-fade-in bg-white"
            >
              <div className="flex items-center gap-3">
                {/* Left side - Medication Name with mic */}
                <div className="w-2/5 bg-pink-50 p-3 rounded-lg border border-pink-100">
                  <label className="block text-xs font-medium text-pink-600 mb-1">
                    Medication Name
                  </label>
                  <div className="flex items-center gap-2">
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
                      className="w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    />
                    <button
                      onClick={() =>
                        toggleListening(
                          "prescribe_meds",
                          index,
                          "nameofmedicine"
                        )
                      }
                      className={`p-2 ${
                        isListening[`prescribe_meds-${index}-nameofmedicine`]
                          ? "bg-pink-100 text-pink-600"
                          : "text-gray-400 hover:text-pink-500 hover:bg-pink-50"
                      } rounded-full transition-all duration-200`}
                      title={
                        isListening[`prescribe_meds-${index}-nameofmedicine`]
                          ? "Stop voice input"
                          : "Start voice input"
                      }
                    >
                      {isListening[`prescribe_meds-${index}-nameofmedicine`] ? (
                        <XCircle className="h-5 w-5" />
                      ) : (
                        <Mic className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Right side - Frequency, Type, and Food Requirements */}
                <div className="w-3/5 flex items-center gap-3">
                  {/* Frequency count */}
                  <div className="w-1/3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Dosage
                    </label>
                    <div className="flex items-center">
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
                        className="p-2 bg-gray-100 text-gray-700 rounded-l-lg border border-gray-200 hover:bg-gray-200 transition-all duration-200"
                        title="Decrease dosage"
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
                        className="w-full p-3 bg-white border-t border-b border-gray-200 text-center text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
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
                        className="p-2 bg-gray-100 text-gray-700 rounded-r-lg border border-gray-200 hover:bg-gray-200 transition-all duration-200"
                        title="Increase dosage"
                      >
                        <span className="font-bold">+</span>
                      </button>
                    </div>
                  </div>

                  {/* Frequency type dropdown */}
                  <div className="w-1/3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
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
                      className="w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  {/* Empty stomach dropdown */}
                  <div className="w-1/3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
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
                      className="w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="yes">After Food</option>
                      <option value="no">Empty Stomach</option>
                    </select>
                  </div>
                </div>

                {/* Delete button */}
                {visitData.prescribe_meds.length > 1 && (
                  <button
                    onClick={() => deleteField("prescribe_meds", index)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
                    title="Remove medication"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            onClick={() => addField("prescribe_meds")}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg flex items-center hover:bg-pink-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Medication
          </button>
        </section>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleCancel}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg flex items-center hover:bg-gray-300 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <XCircle className="h-5 w-5 mr-2" /> Cancel
          </button>
          <button
            onClick={handleDone}
            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-lg flex items-center hover:from-teal-700 hover:to-teal-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Save className="h-5 w-5 mr-2" />
            {subLoader ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Visit"
            )}
          </button>
        </div>
      </div>

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
      `}</style>
    </div>
  );
};

// Add TypeScript declarations for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export default EditorPage;
