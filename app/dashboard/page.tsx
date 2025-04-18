"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Mic } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddPatientModal } from "@/components/add-patient-modal";
import { Patient, PatientsTable } from "@/components/patients-table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import debounce from "lodash/debounce";

const debouncedSearch = debounce(
  async (
    query,
    endpoint = "/api/search?doctorId=2ye8w7ty8f7",
    minLength = 2
  ) => {
    if (query.length < minLength) {
      return [];
    }

    try {
      const response = await fetch(`${endpoint}&name=${query}`);
      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  },
  300
);

export default function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, isLoaded } = useUser();
  const doctorId = user?.id;

  const addPatient = (patient: Patient) => {
    setPatients([
      ...patients,
      {
        ...patient,
        id: patient.id || (patients.length + 1).toString(),
      },
    ]);
  };

  const filteredPatients = async () => {
    if (!doctorId) return;

    setIsLoading(true);
    if (searchQuery === "") {
      getPatients();
    } else {
      const results = await debouncedSearch(searchQuery);

      setPatients(results || []);
      setIsLoading(false);
    }
  };
  const getPatients = async () => {
    if (!doctorId) return;

    setIsLoading(true);

    try {
      // Fetch data from API
      const response = await fetch(`/api/patients?page=1&doctorId=${doctorId}`);

      const data = await response.json();
      setPatients(data?.data || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (doctorId) {
      filteredPatients();
    }
  }, [searchQuery, doctorId]);

  // Just render the main UI even if user isn't fully loaded yet
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-14 sm:h-16 items-center justify-between py-2 sm:py-4">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <div className="flex items-center gap-2">
              <Mic className="h-7 w-7 text-black" />
              <span className="text-xl font-bold text-black">VoiceMD</span>
            </div>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            {isLoaded && (
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-10 w-10 sm:h-12 sm:w-12",
                  },
                }}
              />
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Dashboard Header */}
        <div className="mb-6 sm:mb-8 flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
              Patient Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your patients and medical records with voice assistance
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 shrink-0 bg-black hover:bg-gray-800 text-white px-4 sm:px-6 py-5 sm:py-6 text-sm sm:text-base cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Add Patient
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 sm:mb-8 grid gap-3 sm:gap-4 md:grid-cols-3">
          <Card className="overflow-hidden border-none bg-gradient-to-br from-blue-100 to-blue-50 shadow-md">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Total Patients
                  </p>
                  <h3 className="mt-1 text-2xl sm:text-3xl font-bold">
                    {patients?.length ?? 0}
                  </h3>
                </div>
                <div className="rounded-full bg-blue-500 p-2 sm:p-3 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-none bg-gradient-to-br from-green-100 to-green-50 shadow-md">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="w-full">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Gender Distribution
                  </p>
                  <div className="mt-3 flex flex-col gap-2 w-full">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-medium">Male</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold">
                          {patients?.filter(
                            (patient) =>
                              patient.gender?.toLowerCase() === "male"
                          )?.length ?? 0}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          (
                          {Math.round(
                            ((patients?.filter(
                              (patient) =>
                                patient.gender?.toLowerCase() === "male"
                            )?.length ?? 0) /
                              (patients?.length || 1)) *
                              100
                          )}
                          %)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${
                            patients?.length
                              ? (patients.filter(
                                  (patient) =>
                                    patient.gender?.toLowerCase() === "male"
                                ).length /
                                  patients.length) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                        <span className="text-sm font-medium">Female</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold">
                          {patients?.filter(
                            (patient) =>
                              patient.gender?.toLowerCase() === "female"
                          )?.length ?? 0}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          (
                          {Math.round(
                            ((patients?.filter(
                              (patient) =>
                                patient.gender?.toLowerCase() === "female"
                            )?.length ?? 0) /
                              (patients?.length || 1)) *
                              100
                          )}
                          %)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-pink-100 rounded-full h-2">
                      <div
                        className="bg-pink-500 h-2 rounded-full"
                        style={{
                          width: `${
                            patients?.length
                              ? (patients.filter(
                                  (patient) =>
                                    patient.gender?.toLowerCase() === "female"
                                ).length /
                                  patients.length) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="rounded-full bg-green-500 p-2 sm:p-3 text-white ml-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                  >
                    <path d="M10 15a7 7 0 1 0 0-10 7 7 0 0 0 0 10Z" />
                    <path d="M16 15a7 7 0 1 0 4 10" />
                    <line x1="8.5" x2="8.5" y1="14" y2="20" />
                    <line x1="5.5" x2="11.5" y1="17" y2="17" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-none bg-gradient-to-br from-purple-100 to-purple-50 shadow-md">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Patient Status
                  </p>
                  <div className="mt-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">Active:</span>
                      <span className="text-lg font-bold">
                        {patients?.filter(
                          (patient) => patient.status === "Active"
                        ).length ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                      <span className="text-sm font-medium">Inactive:</span>
                      <span className="text-lg font-bold">
                        {patients?.filter(
                          (patient) => patient.status === "Inactive"
                        ).length ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium">Discharged:</span>
                      <span className="text-lg font-bold">
                        {patients?.filter(
                          (patient) => patient.status === "Discharged"
                        ).length ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="rounded-full bg-purple-500 p-2 sm:p-3 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                  >
                    <path d="M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5" />
                    <path d="M17 17H8a6 6 0 0 1-5.3-8.8" />
                    <circle cx="19" cy="19" r="3" />
                    <path d="m15 21 1.5-1.5" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Table */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search patients..."
              className="pl-10 py-6 text-base w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Badge
              variant="outline"
              className="bg-background font-medium text-blue-500 border-blue-200 px-3 sm:px-4 py-2 text-sm cursor-pointer whitespace-nowrap"
            >
              All Patients
            </Badge>
            <Badge
              variant="outline"
              className="bg-background font-medium text-gray-500 border-gray-200 px-3 sm:px-4 py-2 text-sm cursor-pointer whitespace-nowrap"
            >
              Recent
            </Badge>
            <Badge
              variant="outline"
              className="bg-background font-medium text-gray-500 border-gray-200 px-3 sm:px-4 py-2 text-sm cursor-pointer whitespace-nowrap"
            >
              Critical
            </Badge>
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-sm max-w-[1200px] mx-auto overflow-x-auto">
          <PatientsTable patients={patients} isLoading={isLoading} />
        </div>
      </main>

      <AddPatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddPatient={addPatient}
      />
    </div>
  );
}
