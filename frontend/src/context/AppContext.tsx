"use client"
import { createContext, ReactNode } from "react";

interface AppContextType {
  theme: string;
  logOutUser: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  
  const logOutUser = (): void => {
    console.log("User logged out");
  };

  const value: AppContextType = {
    theme: "dark",
    logOutUser,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;