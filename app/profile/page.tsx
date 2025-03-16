"use client";
import React, { useEffect, useState } from "react";
import {
  CalendarIcon,
  Printer,
  Activity,
  AlertCircle,
  Clock,
  Heart,
  User,
  FileText,
  Menu,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

interface PrescribedMedication {
  [key: string]: string;
  nameofmedicine: string;
  frequency: string;
  dosage: string;
  emptyStomach: string;
}

interface SelectedVisit {
  id: string;
  diagnosis: string[];
  date?: string;
  prescriptions: {
    precautions: string[];
    prescribe_meds: PrescribedMedication[];
  };
}

interface Visit {
  id: string;
  date: string; // Added date for better UI
}

interface PatientDetail {
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  medicalHistory: {
    disease: string[];
    active_med: string[];
    BP: string;
    deficiencies: string[];
  };
  visits: Visit[];
}

const Report = () => {
  const [patient, setPatient] = useState<PatientDetail | undefined>();
  const [selectedVisit, setSelectedVisit] = useState<
    SelectedVisit | undefined
  >();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVisitIndex, setActiveVisitIndex] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchParams = useSearchParams();
  const patientId =
    searchParams.get("id") || "65bfbd48-0d2b-4c92-85bb-f1b81f8f3ac5";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch patient data
        const patientResponse = await fetch(
          `/api/patients?patientId=${patientId}`
        );
        const patientData = await patientResponse.json();

        // Fetch visits data
        const visitsResponse = await fetch(
          `/api/visits?patientId=${patientId}`
        );
        const visitsData = await visitsResponse.json();

        // Add mock dates to visits for better UI (in a real app these would come from API)
        const visitsWithDates = visitsData.map((visit: any, index: number) => ({
          ...visit,
          date:
            (new Date(visit.date as Date).toLocaleDateString() as string) || "",
        }));

        setPatient(patientData);
        setVisits(visitsWithDates);

        // Select the first visit by default if visits exist
        if (visitsWithDates.length > 0) {
          handleVisitChange(visitsWithDates[0].id, 0);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleVisitChange = async (visitId: string, index: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/visits?patientId=${patientId}&visitId=${visitId}`
      );
      const data = await response.json();
      setSelectedVisit(data);
      setActiveVisitIndex(index);
      // Close sidebar on mobile after selection
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error("Error fetching visit:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper function to normalize medication data
  // const normalizeMedication = (med: PrescribedMedication) => {
  //   if (med.nameofmedicine && med.frequency) {
  //     return { nameofmedicine: med.nameofmedicine, frequency: med.frequency };
  //   }
  //   // Handle the old format where med is {medName: frequency}
  //   const medName = Object.keys(med)[0];
  //   return { nameofmedicine: medName, frequency: med[medName] };
  // };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading && !patient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading patient data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-sans relative">
      {/* Mobile Header with Menu Button */}
      <div className="md:hidden bg-zinc-900 text-white p-4 flex justify-between items-center shadow-lg">
        <h2 className="text-xl font-bold flex items-center">
          <FileText className="mr-2 text-purple-400" />
          Patient Records
        </h2>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full bg-zinc-800"
        >
          {sidebarOpen ? (
            <X className="h-6 w-6 text-purple-400" />
          ) : (
            <Menu className="h-6 w-6 text-purple-400" />
          )}
        </button>
      </div>

      {/* Sidebar - Fixed position on mobile when open */}
      <div
        className={`bg-zinc-900 text-white p-6 shadow-xl print:hidden 
        ${
          sidebarOpen
            ? "fixed inset-0 z-50 pt-16 overflow-y-auto transition-all duration-300 ease-in-out"
            : "hidden"
        } 
        md:static md:block md:w-72 md:z-auto md:pt-6`}
      >
        <h2 className="text-2xl font-bold mb-8 flex items-center">
          <FileText className="mr-2 text-purple-400" />
          Patient Records
        </h2>

        <div className="space-y-3">
          {visits.map((visit, index) => (
            <button
              key={visit.id}
              onClick={() => handleVisitChange(visit.id, index)}
              className={`w-full px-5 py-3 text-left rounded-lg transition-all duration-300 hover:bg-zinc-700 flex items-center ${
                activeVisitIndex === index
                  ? "bg-zinc-700/80 border-l-4 border-purple-500 pl-4"
                  : "bg-zinc-800/50"
              }`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 
                ${
                  activeVisitIndex === index ? "bg-purple-500" : "bg-zinc-700"
                }`}
              >
                {index + 1}
              </div>
              <div>
                <div className="font-medium">Visit {index + 1}</div>
                <div className="text-xs text-zinc-400">{visit?.date}</div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handlePrint}
          className="w-full mt-8 px-5 py-3 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-all duration-300 flex items-center justify-center"
        >
          <Printer className="mr-2 h-5 w-5" />
          Print Report
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 md:p-6 text-white">
            <div className="flex items-center flex-wrap gap-y-2">
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <User className="h-6 w-6" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold break-all">
                {patient?.name}
              </h1>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-white/90 ml-0 md:ml-16">
              <p className="flex items-center">
                <span className="bg-white/20 rounded-full h-6 w-6 flex items-center justify-center mr-2">
                  {patient?.age}
                </span>
                years old
              </p>
              <p>{patient?.gender}</p>
              <p className="break-all">{patient?.phone}</p>
              <p className="break-all">{patient?.email}</p>
            </div>
          </div>

          <div className="p-4 md:p-6">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              <Heart className="h-5 w-5 text-pink-500 mr-2 flex-shrink-0" />
              Medical History
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-sm text-gray-500 mb-1">
                  Chronic Diseases
                </div>
                <div className="flex flex-wrap gap-2">
                  {patient?.medicalHistory?.disease.map((disease, i) => (
                    <span
                      key={i}
                      className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-sm"
                    >
                      {disease}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-sm text-gray-500 mb-1">
                  Active Medications
                </div>
                <div className="flex flex-wrap gap-2">
                  {patient?.medicalHistory?.active_med.map((med, i) => (
                    <span
                      key={i}
                      className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm"
                    >
                      {med}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Visit Badge for Mobile */}
        {selectedVisit && activeVisitIndex !== null && (
          <div className="md:hidden bg-zinc-800 text-white px-4 py-2 rounded-lg mb-4 flex items-center">
            <div className="h-6 w-6 rounded-full bg-purple-500 flex items-center justify-center mr-2 text-sm">
              {activeVisitIndex + 1}
            </div>
            <div>
              <span className="text-sm">Visit {activeVisitIndex + 1}</span>
              <span className="text-xs text-zinc-400 ml-2">
                {visits[activeVisitIndex].date}
              </span>
            </div>
          </div>
        )}

        {selectedVisit ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Left Column */}
            <div className="space-y-4 md:space-y-6">
              {/* Diagnosis Card */}
              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center border-b border-gray-100 pb-2">
                  <Activity className="mr-2 text-purple-600 flex-shrink-0" />
                  Diagnosis
                </h2>
                <div className="space-y-3">
                  {selectedVisit?.diagnosis?.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-3 md:p-4 rounded-xl border-l-4 border-purple-500 text-gray-700 text-sm md:text-base"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Precautions Card */}
              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center border-b border-gray-100 pb-2">
                  <AlertCircle className="mr-2 text-orange-500 flex-shrink-0" />
                  Precautions
                </h2>
                {selectedVisit?.prescriptions?.precautions && (
                  <div className="space-y-3">
                    {selectedVisit?.prescriptions?.precautions.map(
                      (item, index) => (
                        <div
                          key={index}
                          className="bg-orange-50 p-3 md:p-4 rounded-xl border-l-4 border-orange-400 text-gray-700 text-sm md:text-base"
                        >
                          {item}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 md:space-y-6">
              {/* Prescribed Medications Card */}
              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center border-b border-gray-100 pb-2">
                  <div className="h-6 w-6 bg-purple-600 rounded text-white flex items-center justify-center mr-2 flex-shrink-0">
                    Rx
                  </div>
                  Prescribed Medications
                </h2>
                <div className="overflow-x-auto">
                  <div className="rounded-xl border border-gray-200 min-w-full">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-purple-50">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm md:text-base">
                            Medication
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm md:text-base">
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-purple-500" />{" "}
                              Dosage
                            </span>
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm md:text-base">
                            Frequency
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm md:text-base">
                            Food Requirement
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedVisit?.prescriptions?.prescribe_meds.map(
                          (med, index) => {
                            // const normalizedMed = normalizeMedication(med);
                            return (
                              <tr
                                key={index}
                                className={`${
                                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                }`}
                              >
                                <td className="py-3 px-4 font-medium text-gray-700 border-t border-gray-100 text-sm md:text-base break-all">
                                  {med?.nameofmedicine}
                                </td>
                                <td className="py-3 px-4 text-gray-600 border-t border-gray-100 text-sm md:text-base">
                                  {med?.dosage}
                                </td>
                                <td className="py-3 px-4 text-gray-600 border-t border-gray-100 text-sm md:text-base">
                                  {med?.frequency}
                                </td>
                                <td className="py-3 px-4 text-gray-600 border-t border-gray-100 text-sm md:text-base">
                                  {med?.emptyStomach}
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Vital Stats Card */}
              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center border-b border-gray-100 pb-2">
                  <Activity className="mr-2 text-pink-600 flex-shrink-0" />
                  Vital Statistics
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-pink-50 p-4 rounded-xl border border-pink-100">
                    <p className="text-sm text-pink-700 mb-1">Blood Pressure</p>
                    <p className="text-xl md:text-2xl font-bold text-pink-800">
                      {patient?.medicalHistory?.BP}{" "}
                      <span className="text-sm font-normal">mmHg</span>
                    </p>
                  </div>

                  {patient?.medicalHistory?.deficiencies &&
                    patient.medicalHistory.deficiencies.length > 0 && (
                      <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <p className="text-sm text-purple-700 mb-1">
                          Deficiencies
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {patient.medicalHistory.deficiencies.map(
                            (deficiency, i) => (
                              <span
                                key={i}
                                className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm"
                              >
                                {deficiency}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow text-center">
            <div className="text-gray-500 text-lg">
              {visits.length > 0
                ? "Please select a visit from the sidebar to view details"
                : "No visit records found for this patient"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Report;
