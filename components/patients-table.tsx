"use client";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Skeleton } from "../components/ui/skeleton";

export interface Patient {
  id?: string;
  name: string;
  age: string | number;
  gender: string;
  condition?: string;
  status?: string;
  lastVisit?: string;
}

interface PatientsTableProps {
  patients: Patient[];
  isLoading?: boolean;
}

export function PatientsTable({
  patients: initialPatients,
  isLoading = false,
}: PatientsTableProps) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients || []);

  useEffect(() => {
    setPatients(initialPatients || []);
  }, [initialPatients]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };
  const router = useRouter();

  // Update patient status
  const updatePatientStatus = async (patientId: string, status: string) => {
    if (!patientId) return;

    try {
      const response = await fetch("/api/patients/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ patientId, status }),
      });

      if (response.ok) {
        // Update the local state
        setPatients((currentPatients) =>
          currentPatients.map((patient) =>
            patient.id === patientId ? { ...patient, status } : patient
          )
        );
      } else {
        console.error("Failed to update patient status");
      }
    } catch (error) {
      console.error("Error updating patient status:", error);
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    const statuses: Record<string, string> = {
      Active: "bg-green-100 text-green-800 border-green-200",
      Inactive: "bg-orange-100 text-orange-800 border-orange-200",
      Discharged: "bg-blue-100 text-blue-800 border-blue-200",
    };

    const statusClass =
      (status && statuses[status]) ||
      "bg-gray-100 text-gray-800 border-gray-200";

    return (
      <Badge
        className={`${statusClass} text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 font-medium`}
      >
        {status || "Unknown"}
      </Badge>
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <Table className="w-full min-w-[650px]">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="py-4 text-base">Name</TableHead>
            <TableHead className="py-4 text-base hidden sm:table-cell">
              Age
            </TableHead>
            <TableHead className="py-4 text-base hidden md:table-cell">
              Gender
            </TableHead>
            <TableHead className="py-4 text-base">Condition</TableHead>
            <TableHead className="py-4 text-base">Status</TableHead>
            <TableHead className="py-4 text-base hidden md:table-cell">
              Last Visit
            </TableHead>
            <TableHead className="text-right py-4 text-base">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            // Skeleton loading rows
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index} className="hover:bg-muted/50 border-b">
                <TableCell className="py-4 sm:py-5">
                  <Skeleton className="h-6 w-32" />
                </TableCell>
                <TableCell className="py-4 sm:py-5 hidden sm:table-cell">
                  <Skeleton className="h-6 w-8" />
                </TableCell>
                <TableCell className="py-4 sm:py-5 hidden md:table-cell">
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell className="py-4 sm:py-5">
                  <Skeleton className="h-6 w-24" />
                </TableCell>
                <TableCell className="py-4 sm:py-5">
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell className="py-4 sm:py-5 hidden md:table-cell">
                  <Skeleton className="h-6 w-24" />
                </TableCell>
                <TableCell className="py-4 sm:py-5 text-right">
                  <Skeleton className="h-9 w-9 ml-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : patients?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No patients found.
              </TableCell>
            </TableRow>
          ) : (
            patients?.map((patient) => (
              <TableRow
                key={patient.id}
                className="hover:bg-muted/50 border-b cursor-pointer"
                onClick={(e) => {
                  // Prevent navigation when clicking on the dropdown menu
                  if (
                    e.target instanceof Element &&
                    (e.target.closest("button") ||
                      e.target.closest('[role="menu"]'))
                  ) {
                    return;
                  }
                  patient.id && router.push(`/profile?id=${patient.id}`);
                }}
              >
                <TableCell className="font-medium text-base py-4 sm:py-5">
                  {patient.name}
                </TableCell>
                <TableCell className="text-base py-4 sm:py-5 hidden sm:table-cell">
                  {patient.age}
                </TableCell>
                <TableCell className="py-4 sm:py-5 hidden md:table-cell">
                  <Badge
                    variant="outline"
                    className="bg-background font-normal text-gray-700 border-gray-200 text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1"
                  >
                    {patient.gender}
                  </Badge>
                </TableCell>
                <TableCell
                  className="max-w-[100px] sm:max-w-[200px] truncate text-base py-4 sm:py-5"
                  title={patient.condition || ""}
                >
                  {patient.condition || ""}
                </TableCell>
                <TableCell className="py-4 sm:py-5">
                  {getStatusBadge(patient.status)}
                </TableCell>
                <TableCell className="text-base py-4 sm:py-5 hidden md:table-cell">
                  {formatDate(patient.lastVisit)}
                </TableCell>
                <TableCell className="text-right py-4 sm:py-5">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 sm:h-10 sm:w-10 bg-transparent text-black hover:bg-gray-100 cursor-pointer"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => {
                          if (patient.id) {
                            router.push(`/profile?id=${patient.id}`);
                          }
                        }}
                      >
                        View patient
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        Edit details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        Schedule appointment
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (patient.id) {
                            updatePatientStatus(patient.id, "Active");
                          }
                        }}
                      >
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                          Set as Active
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (patient.id) {
                            updatePatientStatus(patient.id, "Inactive");
                          }
                        }}
                      >
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-orange-500 mr-2"></div>
                          Set as Inactive
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (patient.id) {
                            updatePatientStatus(patient.id, "Discharged");
                          }
                        }}
                      >
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                          Set as Discharged
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive cursor-pointer">
                        Archive patient
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
