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
  ChevronRight,
  Stethoscope,
  Pill,
  Calendar,
  BarChart2,
  Mic,
  ArrowLeft,
  Home,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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

  // Add print-specific styles
  useEffect(() => {
    // Add ah style element for print media
    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        @page {
          size: portrait;
          margin: 1cm;
        }
        body {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        .shadow-sm, .shadow-md, .hover\\:shadow-md {
          box-shadow: none !important;
        }
        .rounded-xl, .rounded-lg {
          border-radius: 4px !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
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
    // Add a small delay to ensure the print dialog opens after any state updates
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading && !patient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading patient data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-sans relative print:bg-white print:min-h-0">
      {/* Mobile Header with Menu Button */}
      <div className="md:hidden bg-white text-gray-900 p-4 flex justify-between items-center shadow-sm sticky top-0 z-10 print:hidden">
        <Link href="/" className="text-xl font-bold flex items-center">
          <Mic className="mr-2 text-teal-600" />
          <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            VoiceMD
          </span>
        </Link>
        <div className="flex items-center">
          <Link
            href="/dashboard"
            className="mr-3 flex items-center text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
          >
            <Home className="h-5 w-5 mr-1" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Sidebar - Fixed position on mobile when open */}
      <div
        className={`bg-white text-gray-900 shadow-sm border-r border-gray-100 print:hidden 
        ${
          sidebarOpen
            ? "fixed inset-0 z-50 pt-16 overflow-y-auto transition-all duration-300 ease-in-out"
            : "hidden"
        } 
        md:static md:block md:w-80 md:z-auto md:pt-6`}
      >
        {/* Mobile Close Button - Only visible when sidebar is open on mobile */}
        <button
          onClick={toggleSidebar}
          className="md:hidden absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5 text-gray-700" />
        </button>

        <div className="p-6">
          <Link
            href="/"
            className="block text-2xl font-bold mb-2 flex items-center"
          >
            <Mic className="mr-2 text-teal-600" />
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              VoiceMD
            </span>
          </Link>
          <p className="text-gray-500 mb-4">Patient Medical Records</p>

          <Link
            href="/dashboard"
            className="flex items-center text-gray-700 hover:text-teal-600 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>

          <div className="mb-6">
            <h3 className="text-sm uppercase tracking-wider text-gray-500 font-medium mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Visit History
            </h3>
            <div className="space-y-2">
              {visits.map((visit, index) => (
                <button
                  key={visit.id}
                  onClick={() => handleVisitChange(visit.id, index)}
                  className={`w-full px-4 py-3 text-left rounded-lg transition-all duration-200 flex items-center ${
                    activeVisitIndex === index
                      ? "bg-teal-50 border-l-4 border-teal-500 text-teal-700"
                      : "bg-white hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center mr-3 
                    ${
                      activeVisitIndex === index
                        ? "bg-teal-500 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Visit {index + 1}</div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {visit?.date}
                    </div>
                  </div>
                  {activeVisitIndex === index && (
                    <ChevronRight className="h-5 w-5 text-teal-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="w-full cursor-pointer px-5 py-3 bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700 transition-all duration-200 flex items-center justify-center"
          >
            <Printer className="mr-2 h-5 w-5" />
            Print Report
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-auto print:p-0 print:overflow-visible print:m-0">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm mb-8 overflow-hidden print:mb-4 print:border print:border-gray-200">
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="h-20 w-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                <User className="h-10 w-10" />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold">
                  {patient?.name}
                </h1>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-3">
                  <div>
                    <span className="text-xs text-white/70 block">Age</span>
                    <span className="text-lg font-semibold">
                      {patient?.age} years
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-white/70 block">Gender</span>
                    <span className="text-lg font-semibold">
                      {patient?.gender}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-white/70 block">Phone</span>
                    <span className="text-base">{patient?.phone}</span>
                  </div>

                  <div>
                    <span className="text-xs text-white/70 block">Email</span>
                    <span className="text-base">{patient?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
              <Heart className="h-5 w-5 text-teal-600 mr-2 flex-shrink-0" />
              Medical History
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-sm text-gray-500 mb-2 flex items-center">
                  <Activity className="h-4 w-4 mr-1 text-teal-600" />
                  Chronic Conditions
                </div>
                <div className="flex flex-wrap gap-2">
                  {patient?.medicalHistory?.disease.length ? (
                    patient?.medicalHistory?.disease.map((disease, i) => (
                      <span
                        key={i}
                        className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm"
                      >
                        {disease}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">None reported</span>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-sm text-gray-500 mb-2 flex items-center">
                  <Pill className="h-4 w-4 mr-1 text-teal-600" />
                  Active Medications
                </div>
                <div className="flex flex-wrap gap-2">
                  {patient?.medicalHistory?.active_med.length ? (
                    patient?.medicalHistory?.active_med.map((med, i) => (
                      <span
                        key={i}
                        className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm"
                      >
                        {med}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">None reported</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Visit Badge for Mobile */}
        {selectedVisit && activeVisitIndex !== null && (
          <div className="md:hidden bg-white text-gray-900 px-4 py-3 rounded-lg mb-4 flex items-center shadow-sm border border-gray-100 print:hidden">
            <div className="h-6 w-6 rounded-full bg-teal-500 text-white flex items-center justify-center mr-2 text-sm">
              {activeVisitIndex + 1}
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium">
                Visit {activeVisitIndex + 1}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                {visits[activeVisitIndex].date}
              </span>
            </div>
          </div>
        )}

        {selectedVisit ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:gap-4">
            {/* Left Column */}
            <div className="space-y-6 print:space-y-4">
              {/* Diagnosis Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md print:p-4 print:hover:shadow-none print:shadow-none">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <FileText className="mr-2 text-teal-600 flex-shrink-0" />
                  Diagnosis
                </h2>
                <div className="space-y-3">
                  {selectedVisit?.diagnosis?.length ? (
                    selectedVisit?.diagnosis?.map((item, index) => (
                      <div
                        key={index}
                        className="bg-teal-50/70 p-4 rounded-xl border-l-4 border-teal-500 text-gray-700"
                      >
                        {item}
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-xl text-gray-500 text-center">
                      No diagnosis recorded for this visit
                    </div>
                  )}
                </div>
              </div>

              {/* Vital Stats Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md print:p-4 print:hover:shadow-none print:shadow-none">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <BarChart2 className="mr-2 text-teal-600 flex-shrink-0" />
                  Vital Statistics
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-xl border border-teal-100 shadow-sm">
                    <p className="text-sm text-teal-700 mb-1 flex items-center">
                      <Activity className="h-4 w-4 mr-1" />
                      Blood Pressure
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-teal-800">
                      {patient?.medicalHistory?.BP}{" "}
                      <span className="text-sm font-normal">mmHg</span>
                    </p>
                  </div>

                  {patient?.medicalHistory?.deficiencies &&
                    patient.medicalHistory.deficiencies.length > 0 && (
                      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-xl border border-teal-100 shadow-sm">
                        <p className="text-sm text-teal-700 mb-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Deficiencies
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {patient.medicalHistory.deficiencies.map(
                            (deficiency, i) => (
                              <span
                                key={i}
                                className="text-teal-700 px-3 py-1 rounded-md text-sm border-b-2 border-teal-300"
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

            {/* Right Column */}
            <div className="space-y-6 print:space-y-4">
              {/* Prescribed Medications Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md print:p-4 print:hover:shadow-none print:shadow-none">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Pill className="mr-2 text-teal-600 flex-shrink-0 h-6 w-6" />
                  Prescribed Medications
                </h2>
                <div className="overflow-x-auto">
                  {selectedVisit?.prescriptions?.prescribe_meds?.length ? (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-teal-50/80 border-b border-teal-100">
                          <th className="text-left py-3 px-4 font-semibold text-teal-800 rounded-tl-lg">
                            Medication
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-teal-800">
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-teal-600" />{" "}
                              Dosage
                            </span>
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-teal-800">
                            Frequency
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-teal-800 rounded-tr-lg">
                            Food Requirement
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedVisit?.prescriptions?.prescribe_meds.map(
                          (med, index) => (
                            <tr
                              key={index}
                              className={`${
                                index % 2 === 0 ? "bg-white" : "bg-teal-50/30"
                              }`}
                            >
                              <td className="py-3 px-4 font-medium text-gray-700 text-sm md:text-base">
                                {med?.nameofmedicine}
                              </td>
                              <td className="py-3 px-4 text-gray-600 text-sm md:text-base">
                                {med?.dosage}
                              </td>
                              <td className="py-3 px-4 text-gray-600 text-sm md:text-base">
                                {med?.frequency}
                              </td>
                              <td className="py-3 px-4 text-gray-600 text-sm md:text-base">
                                {med?.emptyStomach}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-xl text-gray-500 text-center">
                      No medications prescribed for this visit
                    </div>
                  )}
                </div>
              </div>

              {/* Precautions Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md print:p-4 print:hover:shadow-none print:shadow-none">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <AlertCircle className="mr-2 text-amber-500 flex-shrink-0" />
                  Precautions & Recommendations
                </h2>
                {selectedVisit?.prescriptions?.precautions?.length ? (
                  <div className="space-y-3">
                    {selectedVisit?.prescriptions?.precautions.map(
                      (item, index) => (
                        <div
                          key={index}
                          className="bg-amber-50 p-4 rounded-xl border-l-4 border-amber-400 text-gray-700"
                        >
                          {item}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-xl text-gray-500 text-center">
                    No precautions recorded for this visit
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="text-gray-500 text-lg">
              {visits.length > 0 ? (
                <div className="flex flex-col items-center">
                  <Calendar className="h-12 w-12 text-teal-500 mb-4" />
                  <p>Please select a visit from the sidebar to view details</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                  <p>No visit records found for this patient</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Report;
