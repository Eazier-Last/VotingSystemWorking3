

import React, { useState, useEffect } from "react";
import { supabase } from "./client";
import AvatarComponent from "./Avatar/AvatarComponent";
import { useNavigate } from "react-router-dom";
import "../App.css";
import "../Responsive.css";
import "./css/VotePage.css";
import Button from "@mui/material/Button";
import ConfirmVote from "./Modals/ConfirmVote"; 
import CandidateVoteInfo from "./Modals/CandidateVoteInfo"; 
import InfoIcon from "@mui/icons-material/Info";

function VotePage() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState({});
  const [userCourse, setUserCourse] = useState(null);
  const [openModal, setOpenModal] = useState(false); 
  const [infoModalOpen, setInfoModalOpen] = useState(false); 
  const [selectedCandidateInfo, setSelectedCandidateInfo] = useState(null); 
  const navigate = useNavigate();

  
  useEffect(() => {
    const checkVoteStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("voteStatus, course")
          .eq("studentNumber", user.email.split("@")[0]) 
          .single();

        if (error) {
          console.error("Error checking vote status:", error);
          return;
        }

        if (data?.voteStatus === "voted") {
          navigate("/thank-you");
        } else {
          setUserCourse(data.course); 
        }
      }
    };
    checkVoteStatus();
  }, [navigate]);

  
  useEffect(() => {
    const fetchCandidates = async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select(
          "candidateID, avatarUrl, name, skills, description, campaignObjective, position"
        );
      if (error) {
        console.error("Error fetching candidates:", error);
        return;
      }
      setCandidates(data);
    };
    fetchCandidates();
  }, []);

  
  const handleCandidateSelect = (position, candidateID) => {
    setSelectedCandidates((prev) => ({
      ...prev,
      [position]: prev[position] === candidateID ? null : candidateID,
    }));
  };

  
  const handleOpenModal = () => {
    setOpenModal(true);
  };

  
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  
  const handleInfoModalOpen = (candidate) => {
    setSelectedCandidateInfo(candidate); 
    setInfoModalOpen(true);
  };

  
  const handleInfoModalClose = () => {
    setInfoModalOpen(false);
    setSelectedCandidateInfo(null);
  };

  
  const handleSubmitVote = async () => {
    handleCloseModal(); 
    const allPositionsSelected = Object.keys(groupedCandidates).every(
      (position) => selectedCandidates[position]
    );

    if (!allPositionsSelected) {
      alert("Please select a candidate for each position.");
      return;
    }

    if (!userCourse) {
      alert("Unable to retrieve course information. Please try again.");
      return;
    }

    try {
      for (const position in selectedCandidates) {
        const candidateID = selectedCandidates[position];

        
        let { data: candidateData, error: fetchError } = await supabase
          .from("voteCountManage")
          .select(userCourse)
          .eq("candidateVoteName", candidateID)
          .single();

        if (fetchError && fetchError.code === "PGRST116") {
          
          const { error: insertError } = await supabase
            .from("voteCountManage")
            .insert({
              candidateVoteName: candidateID,
              [userCourse]: 1,
            });

          if (insertError) {
            console.error("Error inserting new vote count:", insertError);
            alert("Failed to submit vote. Please try again.");
            return;
          }
        } else if (candidateData) {
          
          const currentCount = candidateData[userCourse] || 0;
          const updatedCount = currentCount + 1;

          const { error: updateError } = await supabase
            .from("voteCountManage")
            .update({ [userCourse]: updatedCount })
            .eq("candidateVoteName", candidateID);

          if (updateError) {
            console.error("Error updating vote count:", updateError);
            alert("Failed to submit vote. Please try again.");
            return;
          }
        }
      }

      
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from("users")
          .update({ voteStatus: "voted" })
          .eq("studentNumber", user.email.split("@")[0]);

        if (error) {
          console.error("Error updating vote status:", error.message);
          alert("Failed to submit vote. Please try again.");
          return;
        }

        alert("Vote submitted successfully!");
        navigate("/thank-you");
      }
    } catch (err) {
      console.error("Unexpected error during vote submission:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  
  const groupedCandidates = candidates.reduce((acc, candidate) => {
    acc[candidate.position] = acc[candidate.position] || [];
    acc[candidate.position].push(candidate);
    return acc;
  }, {});

  
  const selectedCandidatesList = Object.keys(selectedCandidates)
    .map((position) => {
      const candidateID = selectedCandidates[position];
      const candidate = candidates.find((c) => c.candidateID === candidateID);
      return candidate ? { position, name: candidate.name } : null;
    })
    .filter(Boolean);

  return (
    <div className="votePage">
      <div className="listContainer">
        <div>
          <h2 className="topLabel votePageLabel">CANDIDATES</h2>
          <p className="votePageLabel">Select an image to vote</p>
        </div>
        {Object.keys(groupedCandidates).map((position) => (
          <div key={position}>
            <h3 className="position votePageLabel">
              {position
                .replace(/([A-Z])/g, " $1")
                .trim()
                .toUpperCase()}
            </h3>
            <div className="profileContainer votePageProfileContainer">
              {groupedCandidates[position].map((candidate) => {
                const isSelected =
                  selectedCandidates[position] === candidate.candidateID;
                return (
                  <div>
                    <div
                      key={candidate.candidateID}
                      className={`candidate ${isSelected ? "selected" : ""}`}
                      onClick={() =>
                        handleCandidateSelect(position, candidate.candidateID)
                      }
                    >
                      <div className="profileRow">
                        <AvatarComponent
                          imgStyle={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "10px",
                            position: "relative",
                          }}
                          imgSrc={candidate.avatarUrl}
                        />
                        {isSelected && (
                          <div
                            style={{
                              backgroundColor: "rgb(26, 179, 148, .8)",
                              height: "50px",
                              borderTopRightRadius: "100%",
                              borderTopLeftRadius: "100%",
                            }}
                            className="overlay"
                          >
                            <span
                              style={{ fontSize: "2rem" }}
                              className="overlayText"
                            >
                              ✔
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="candidateName votePageLabel">
                      <div class="votePageProfile">
                        <div>
                          <Button
                            className="candidateVoteInfo"
                            variant="contained"
                            // color="primary"
                            sx={{
                              backgroundColor: "#1ab394",
                              borderRadius: 0,
                              borderBottomRightRadius: 100,
                              borderBottomLeftRadius: 100,
                              // marginRight: 1,
                            }}
                            onClick={() => handleInfoModalOpen(candidate)}
                          >
                            <InfoIcon />
                          </Button>
                        </div>
                        <div>
                          <p
                            className="votePageProfileName"
                            style={{ color: "black" }}
                          >
                            <span> </span>
                            {candidate.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div className="submit">
          <Button
            className="submitBtn"
            type="button"
            variant="contained"
            sx={{
              backgroundColor: "#1ab394",
              marginTop: "10px",
            }}
            onClick={handleOpenModal}
          >
            Submit
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmVote
        open={openModal}
        onClose={handleCloseModal}
        selectedCandidatesList={selectedCandidatesList}
        onSubmit={handleSubmitVote}
      />

      {/* Candidate Info Modal */}
      <CandidateVoteInfo
        open={infoModalOpen}
        onClose={handleInfoModalClose}
        candidateInfo={selectedCandidateInfo}
      />
    </div>
  );
}

export default VotePage;
