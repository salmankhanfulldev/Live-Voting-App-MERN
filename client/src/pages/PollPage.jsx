import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../socket";
import "../styles/PollPage.css";

function PollPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voteState, setVoteState] = useState({
    hasVoted: false,
    votedIndex: null,
  });
  const [voting, setVoting] = useState(false);

  const { hasVoted, votedIndex } = voteState;

  // Check localStorage for prior vote
  useEffect(() => {
    const storedVoteValue = localStorage.getItem(`livepoll_voted_${id}`);

    if (storedVoteValue === null) {
      setVoteState({ hasVoted: false, votedIndex: null });
      return;
    }

    const parsedVote = Number.parseInt(storedVoteValue, 10);
    const hasValidStoredVote =
      Number.isInteger(parsedVote) && parsedVote >= 0;

    if (hasValidStoredVote) {
      setVoteState({ hasVoted: true, votedIndex: parsedVote });
    } else {
      setVoteState({ hasVoted: false, votedIndex: null });
    }
  }, [id]);

  // Fetch poll data
  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const res = await fetch(`/api/polls/${id}`);
        if (!res.ok) throw new Error("Poll not found");
        const data = await res.json();
        setPoll(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPoll();
  }, [id]);

  // Socket.io: join room and listen for updates
  useEffect(() => {
    socket.emit("joinPoll", id);

    socket.on("pollUpdated", (updatedPoll) => {
      setPoll(updatedPoll);
    });

    return () => {
      socket.off("pollUpdated");
    };
  }, [id]);

  const handleVote = async (optionIndex) => {
    if (hasVoted || voting) return;

    setVoting(true);
    try {
      socket.emit("submitVote", { pollId: id, optionIndex });
      localStorage.setItem(`livepoll_voted_${id}`, String(optionIndex));
      setVoteState({ hasVoted: true, votedIndex: optionIndex });
    } catch (err) {
      console.error("Vote failed:", err);
    } finally {
      setVoting(false);
    }
  };

  const getPercentage = (votes) => {
    if (!poll || poll.totalVotes === 0) return 0;
    return Math.round((votes / poll.totalVotes) * 100);
  };

  const winningVoteCount = poll?.options?.length
    ? Math.max(...poll.options.map((option) => option.votes))
    : 0;

  if (loading) {
    return (
      <div className="poll-page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading poll...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="poll-page-container">
        <div className="error-state">
          <span>⚠️</span>
          <p>{error}</p>
          <button className="back-btn" onClick={() => navigate("/")}>
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="poll-page-container">
      <div className="poll-wrapper">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back
        </button>

        <div className="poll-header">
          <div className="poll-live-badge">
            <span className="live-dot"></span>
            LIVE
          </div>
          <h1 className="poll-question">{poll.question}</h1>
          <p className="poll-total-votes">
            {poll.totalVotes} {poll.totalVotes === 1 ? "vote" : "votes"} cast
          </p>
        </div>

        <div className="poll-options">
          {poll.options.map((option, index) => {
            const pct = getPercentage(option.votes);
            const isVotedOption = hasVoted && votedIndex === index;
            const isWinning =
              poll.totalVotes > 0 && option.votes === winningVoteCount;

            return (
              <div
                key={index}
                className={`option-card ${hasVoted ? "voted" : "clickable"} ${isVotedOption ? "my-vote" : ""} ${isWinning ? "winning" : ""}`}
                onClick={() => handleVote(index)}
                role={!hasVoted ? "button" : undefined}
                tabIndex={!hasVoted ? 0 : undefined}
                onKeyDown={(e) =>
                  !hasVoted && e.key === "Enter" && handleVote(index)
                }
                aria-label={`Vote for ${option.text}`}
              >
                <div className="option-content">
                  <div className="option-top-row">
                    <span className="option-text">
                      {isVotedOption && "✓ "}
                      {option.text}
                    </span>
                    {hasVoted && <span className="option-pct">{pct}%</span>}
                  </div>

                  {hasVoted && (
                    <div className="progress-bar-track">
                      <div
                        className={`progress-bar-fill ${isWinning ? "winning-bar" : ""}`}
                        style={{ width: `${pct}%` }}
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                    </div>
                  )}

                  {hasVoted && (
                    <span className="option-votes">
                      {option.votes} {option.votes === 1 ? "vote" : "votes"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!hasVoted && (
          <p className="vote-prompt">👆 Click an option to cast your vote</p>
        )}
        {hasVoted && (
          <p className="voted-notice">
            ✅ Your vote has been recorded. Results update live!
          </p>
        )}
      </div>
    </div>
  );
}

export default PollPage;
