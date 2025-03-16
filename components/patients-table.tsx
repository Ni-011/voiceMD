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

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  status: string;
  lastVisit: string;
}

interface PatientsTableProps {
  patients: Patient[];
  isLoading?: boolean;
}

export function PatientsTable({
  patients,
  isLoading = false,
}: PatientsTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };
  const router = useRouter();

  const getStatusBadge = (condition: string) => {
    const conditions = {
      Active: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Inactive: "bg-orange-100 text-orange-800 border-orange-200",
      Discharged: "bg-blue-100 text-blue-800 border-blue-200",
    };

    for (const [key, value] of Object.entries(conditions)) {
      if (condition === key) {
        return (
          <Badge
            className={`${value} text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 font-medium`}
          >
            {condition}
          </Badge>
        );
      }
    }

    // return (
    //   <Badge
    //     variant="outline"
    //     className={`${
    //       conditions[condition] as string
    //     } text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 font-medium`}
    //   >
    //     Stable
    //   </Badge>
    // );
  };

  // Loading skeleton component
  const TableSkeleton = () => (
    <TableBody>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index} className="border-b animate-pulse">
          <TableCell className="py-4 sm:py-5">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </TableCell>
          <TableCell className="py-4 sm:py-5 hidden sm:table-cell">
            <div className="h-6 bg-gray-200 rounded w-10"></div>
          </TableCell>
          <TableCell className="py-4 sm:py-5 hidden md:table-cell">
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </TableCell>
          <TableCell className="py-4 sm:py-5">
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </TableCell>
          <TableCell className="py-4 sm:py-5">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </TableCell>
          <TableCell className="py-4 sm:py-5 hidden md:table-cell">
            <div className="h-6 bg-gray-200 rounded w-28"></div>
          </TableCell>
          <TableCell className="text-right py-4 sm:py-5">
            <div className="h-8 w-8 bg-gray-200 rounded-full ml-auto"></div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );

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

        {isLoading ? (
          <TableSkeleton />
        ) : (
          <TableBody>
            {patients?.length === 0 ? (
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
                    router.push(`/profile?id=${patient.id}`);
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
                    title={patient.condition}
                  >
                    {patient.condition}
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
                          onClick={() =>
                            router.push(`/profile?id=${patient.id}`)
                          }
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
        )}
      </Table>
    </div>
  );
}
