import { createContext, useState } from "react";
import { Montserrat } from "next/font/google";
export const DashContext = createContext();

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const DashProvider = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [matchHistory, setMatchHistory] = useState([
    {
      avatar: "/images/avatar1.svg",
      name: "Alijfdfhfffftdkt",
      score: "5-4",
      result: "Win",
      map: "Blue",
    },
    {
      avatar: "/images/avatar2.svg",
      name: "Ali",
      score: "5-4",
      result: "Win",
      map: "Blue",
    },
    {
      avatar: "/images/avatar3.svg",
      name: "Alghjgfjgi",
      score: "5-4",
      result: "Win",
      map: "Blue",
    },

    {
      avatar: "/images/avatar3.svg",
      name: "Ali",
      score: "5-4",
      result: "Win",
      map: "Blue",
    },
    {
      avatar: "/images/avatar1.svg",
      name: "Ali",
      score: "5-4",
      result: "Win",
      map: "Blue",
    },
    {
      avatar: "/images/avatar1.svg",
      name: "Ali",
      score: "5-4",
      result: "Win",
      map: "Blue",
    },
    {
      avatar: "/images/avatar1.svg",
      name: "Ali",
      score: "5-4",
      result: "Win",
      map: "Blue",
    },
  ]);
  return (
    <DashContext.Provider
      value={{
        isMobile,
        setIsMobile,
        isScrolled,
        setIsScrolled,
        matchHistory,
        setMatchHistory,
        montserrat,
      }}
    >
      {children}
    </DashContext.Provider>
  );
};

export default DashProvider;
