"use client";
import React, { useState, useEffect } from "react";
import { X, Plus, Save, Stethoscope } from "lucide-react";
import { useSearchParams } from "next/navigation";

// Define interfaces for type safety
interface Medication {
  nameofmedicine: string;
  frequency: string;
}

interface VisitData {
  diagnosis: string[];
  precautions: string[];
  prescribe_meds: Medication[];
}

const EditorPage = () => {
  const [visitData, setVisitData] = useState<VisitData | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");
  const visitId = searchParams.get("visitId");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // await new Promise((resolve) => setTimeout(resolve, 1500));

        // Real API call example (uncomment and adjust):
        /*
        const response = await fetch("/api/visits?visitId=some-id");
        const data = await response.json();
        */
        const response = await fetch(
          `/api/visits?patientId=${patientId}&visitId=${visitId}`
        );
        const ndata = await response.json();
        console.log(ndata);
        const data: VisitData = {
          diagnosis: ndata?.diagnosis || [],
          precautions: ndata?.prescriptions?.precautions || [],
          prescribe_meds: ndata?.prescriptions?.prescribe_meds || [],
        };

        setVisitData(data);
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
            { nameofmedicine: "", frequency: "" },
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
      const response = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patientId,
          visitId: visitId,
          visit: visitData,
          diagnosis: visitData.diagnosis,
          prescribe_meds: visitData.prescribe_meds,
          precautions: visitData.precautions,
        }),
      });
      if (response.ok) {
        alert("Visit data saved successfully!");
        // Redirect to report page: window.location.href = "/report?id=65bfbd48-0d2b-4c92-85bb-f1b81f8f3ac5";
      } else {
        alert("Error saving data.");
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("Failed to save data.");
    }
  };

  // Loader component
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 font-medium">
            Loading visit data...
          </p>
        </div>
      </div>
    );
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
              className="mb-4 flex items-center gap-3 group animate-fade-in"
            >
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
                placeholder="Medication Name"
                className="w-1/2 p-4 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 hover:border-pink-300"
              />
              <input
                type="text"
                value={med.frequency}
                onChange={(e) =>
                  handleChange(
                    "prescribe_meds",
                    index,
                    e.target.value,
                    "frequency"
                  )
                }
                placeholder="Dosage/Frequency"
                className="w-1/2 p-4 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 hover:border-pink-300"
              />
              {visitData.prescribe_meds.length > 1 && (
                <button
                  onClick={() => deleteField("prescribe_meds", index)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => addField("prescribe_meds")}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg flex items-center hover:bg-pink-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Medication
          </button>
        </section>

        {/* Done Button */}
        <div className="flex justify-end">
          <button
            onClick={handleDone}
            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-lg flex items-center hover:from-teal-700 hover:to-teal-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Save className="h-5 w-5 mr-2" /> Save Visit
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

export default EditorPage;
