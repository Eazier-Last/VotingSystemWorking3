import React from "react";
import { supabase } from "./client";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";

function ElectionHold({ setAuthType }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error during logout:", error.message);
    } else {
      setAuthType(null); // Reset authType to null to clear user authentication
      // Redirect to login
      navigate("/"); // Navigate to the login page which will trigger a component refresh
    }
  };

  const goToResults = () => {
    navigate("/results"); // Navigate to the results page
  };

  return (
    <div className="thankYouBody">
      <div className="thankYou">
        <h1>Election is currently on hold!</h1>
        <p>Come back later.</p>
        <Button
          onClick={handleLogout}
          type="submit"
          variant="contained"
          sx={{
            backgroundColor: "#1ab394",
            marginTop: "10px",
          }}
        >
          Logout
        </Button>
        <p
          style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}
          onClick={goToResults} // This will now navigate to /results
        >
          View Results
        </p>
      </div>
    </div>
  );
}

export default ElectionHold;
