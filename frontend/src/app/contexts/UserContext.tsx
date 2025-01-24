"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import customAxios from "../customAxios";
import Loading from "../components/Loading";

interface UserData {
  username: string;
  email: string;
  image_field: string;
  is_2fa: boolean;
  id: number;
  _2fa_code: string;
  status: "online" | "offline";
}

interface UserContextType {
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await customAxios.get(
          "https://10.13.7.8/api/api/user/"
        );
        if (response.status === 200)
        {
            setIsLoading(false);
        setUserData(response.data.user);
      }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } 
    };
    fetchUserData();
  }, []);
  return (
    <UserContext.Provider value={{ userData, setUserData, isLoading }}>
      {isLoading ?
        <div className="h-[100vh] w-full flex items-center justify-center">
          <Loading />
        </div>
      : children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
