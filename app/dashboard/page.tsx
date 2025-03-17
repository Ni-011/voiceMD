"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Mic, Bell } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const doctorId = user?.id;

  const addPatient = (patient: Patient) => {
    setPatients([
      ...patients,
      { ...patient, id: (patients.length + 1).toString() },
    ]);
  };

  const filteredPatients = async () => {
    setIsLoading(true);
    if (searchQuery === "") {
      getPatients();
    } else {
      const api = `/api/search?doctorId=${doctorId}`;
      const results = await debouncedSearch(searchQuery);
      console.log(results);

      setPatients(results);
      setIsLoading(false);
    }
  };
  const getPatients = async () => {
    setIsLoading(true);
    try {
      // Fetch data from API
      const response = await fetch(`/api/patients?page=1&doctorId=${doctorId}`);
      const data = await response.json();
      console.log(data);

      setPatients(data?.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect(() => {
  //   getPatients();
  // }, []);
  useEffect(() => {
    filteredPatients();
  }, [searchQuery]);

  // Add a useEffect for initial data loading
  useEffect(() => {
    getPatients();
  }, []);

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
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 sm:h-10 sm:w-10 bg-white text-black hover:bg-gray-100 cursor-pointer"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-red-500 text-[8px] sm:text-[10px] text-white">
                3
              </span>
            </Button>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: { userButtonAvatarBox: "h-10 w-10 sm:h-12 sm:w-12" },
              }}
            />
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
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Appointments Today
                  </p>
                  <h3 className="mt-1 text-2xl sm:text-3xl font-bold">8</h3>
                </div>
                <div className="rounded-full bg-green-500 p-2 sm:p-3 text-white">
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
                    <rect
                      width="18"
                      height="18"
                      x="3"
                      y="4"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="16" x2="16" y1="2" y2="6"></line>
                    <line x1="8" x2="8" y1="2" y2="6"></line>
                    <line x1="3" x2="21" y1="10" y2="10"></line>
                    <path d="M8 14h.01"></path>
                    <path d="M12 14h.01"></path>
                    <path d="M16 14h.01"></path>
                    <path d="M8 18h.01"></path>
                    <path d="M12 18h.01"></path>
                    <path d="M16 18h.01"></path>
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
                    Voice Notes
                  </p>
                  <h3 className="mt-1 text-2xl sm:text-3xl font-bold">24</h3>
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
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" x2="12" y1="19" y2="22"></line>
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
