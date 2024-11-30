import React, { createContext, useState, useEffect } from "react";

export const StateContext = createContext();

const StateProvider = ({ children }) => {
  
  const [time, setTime] = useState(() => {
    const savedTime = localStorage.getItem("timerState");
    return savedTime ? JSON.parse(savedTime) : { hours: 0, minutes: 0, seconds: 0 };
  });

  const [isRunning, setIsRunning] = useState(false);

  
  useEffect(() => {
    localStorage.setItem("timerState", JSON.stringify(time));
  }, [time]);

  return (
    <StateContext.Provider value={{ time, setTime, isRunning, setIsRunning }}>
      {children}
    </StateContext.Provider>
  );
};

export default StateProvider;
