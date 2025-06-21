"use client";

import Decimal from "decimal.js";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface Data {
  newProject: boolean | null,
  projectName: string | null,
  fileDimension: string | null,
  width: Decimal | null,
  height: Decimal | null,
  visualWidth: string | null,
  visualHeight: string | null,
}

interface DataContextType {
  pageFormatData: Data | null;
  setPageFormatData: React.Dispatch<React.SetStateAction<Data | null>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [pageFormatData, setPageFormatData] = useState<Data | null>(null);

  return (
    <DataContext.Provider value={{ pageFormatData, setPageFormatData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
