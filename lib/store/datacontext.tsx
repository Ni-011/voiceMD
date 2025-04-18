"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ApiData {
  diagnosis: Array<string>;
  symptoms?: string;
  prescriptions: {
    prescribe_meds: Array<{
      nameofmedicine: string;
      dosage: string;
      frequency: "daily" | "weekly" | "monthly";
      emptyStomach: "yes" | "no";
      duration: string;
      durationType: "weeks" | "months" | "days";
    }>;
    precautions: Array<string>;
    extraPrescriptions?: string;
  };
  patientId: string;
}

const DataContext = createContext<{
  data: ApiData | null;
  setData: (data: ApiData) => void;
}>({
  data: null,
  setData: () => {},
});

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ApiData | null>(null);

  return (
    <DataContext.Provider value={{ data, setData }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
