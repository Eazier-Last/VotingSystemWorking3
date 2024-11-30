import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./components/client";
import Login from "./components/Login";
import Main from "./Main";
import VotePage from "./components/VotePage";
import ThankYouForm from "./components/ThankYouForm";
import ElectionHold from "./components/ElectionHold";
import Results from "./components/Results";  // Add this import

function App() {
  const [authType, setAuthType] = useState(null);
  const [isRunning, setIsRunning] = useState(null);

  // Fetch the election timer state
  useEffect(() => {
    const fetchTimerState = async () => {
      try {
        const { data, error } = await supabase
          .from("timerState")
          .select("isRunning")
          .single();

        if (error) throw error;
        setIsRunning(data.isRunning);
      } catch (err) {
        console.error("Error fetching timer state:", err.message);
      }
    };

    fetchTimerState();
  }, []);

  const handleLogout = () => {
    console.log("Logging out...");
    setAuthType(null); // Reset authType when logging out
  };

  // Show loading until isRunning is fetched
  if (isRunning === null) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Main route - handles redirection based on authentication status */}
          <Route
            path="/"
            element={
              authType ? (
                <Navigate
                  to={
                    authType === "admin"
                      ? "/main"
                      : isRunning
                      ? "/vote"
                      : "/election-hold"
                  }
                  replace
                />
              ) : (
                <Login setAuthType={setAuthType} />
              )
            }
          />

          {/* Admin Route - /main */}
          <Route
            path="/main"
            element={
              authType === "admin" ? (
                <Main onLogout={handleLogout} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* User Route - /vote */}
          <Route
            path="/vote"
            element={
              authType === "user" && isRunning ? (
                <VotePage setAuthType={setAuthType} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Election Hold Route - /election-hold */}
          <Route
            path="/election-hold"
            element={
              authType === "user" && !isRunning ? (
                <ElectionHold setAuthType={setAuthType} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Thank You Route - /thank-you */}
          <Route path="/thank-you" element={<ThankYouForm setAuthType={setAuthType} />} />

          {/* Results Route - /results */}
          <Route path="/results" element={<Results />} />  {/* Add this route */}

          {/* Fallback Route (catch-all) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
