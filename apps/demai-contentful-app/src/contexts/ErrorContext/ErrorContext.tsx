import React, { createContext, useContext, useState, ReactNode } from "react";

export type AppError = {
  message?: string; // Human-readable message
  service: string; // Optional: service or module where it happened
  details?: unknown; // Optional: context info or original error
  showDialog?: boolean;
};

type ErrorContextType = {
  errors: AppError[];
  addError: (err: AppError) => void;
  clearErrors: () => void;
};

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const [errors, setErrors] = useState<AppError[]>([]);

  const addError = (err: AppError) => {
    setErrors((prev) => [...prev, err]);
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return (
    <ErrorContext.Provider value={{ errors, addError, clearErrors }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context)
    throw new Error("useError must be used within an ErrorProvider");
  return context;
};
