"use client";
import SlidingMenu from "../components/SlidingMenu";
import PlayerPanel from "../components/PlayerPanel";
import BotPanel from "../components/BotPanel";
import { deleteCookie } from "cookies-next";
import { useState, useEffect, useRef } from "react";
import ScoreDisplay from "../components/UserScore";
import { updateUserScore, fetchUserScore } from "../actions/score";

export default function Game() {
  const [playerWon, setPlayerWon] = useState(false);
  const [botWon, setBotWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isUpdatingScore, setIsUpdatingScore] = useState(false); // Track score update state
  const scoreUpdated = useRef(false);
  const [waitingForBotResponse, setWaitingForBotResponse] = useState(false); // Track if bot is waiting for response

  // Handle player winning
  const handlePlayerWin = () => {
    setPlayerWon(true);
    setGameOver(true);
  };

  // Handle bot winning
  const handleBotWin = () => {
    setBotWon(true);
    setGameOver(true);
  };

  // Track when the bot is waiting for player input
  const handleBotWaitingChange = (isWaiting) => {
    setWaitingForBotResponse(isWaiting);
  };

  // Update score when game ends
  useEffect(() => {
    const updateScore = async () => {
      if (gameOver && (playerWon || botWon) && !scoreUpdated.current) {
        setIsUpdatingScore(true); // Set loading state true while updating
        scoreUpdated.current = true;

        try {
          const currentScore = await fetchUserScore();
          const newScore = playerWon
            ? (currentScore || 0) + 1
            : (currentScore || 0) - 1;

          await updateUserScore(newScore);
        } catch (error) {
          console.error("Failed to update score:", error);
        } finally {
          setIsUpdatingScore(false); // Set loading state back to false
        }
      }
    };

    updateScore();
  }, [gameOver, playerWon, botWon]);

  const handleNewGame = () => {
    deleteCookie("playerNumber");
    deleteCookie("computerNumber");
    deleteCookie("gameStarted");

    localStorage.removeItem("guessHistory");
    localStorage.removeItem("latestGuess");
    localStorage.removeItem("botResponses");

    window.location.reload();
  };

  return (
    <div className="min-h-screen">
      <SlidingMenu />
      <div className="flex flex-col ml-[4rem] p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl">Bulls and Cows Game</h1>
          <button
            onClick={handleNewGame}
            className={`px-6 py-2 ${
              isUpdatingScore
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
            } rounded text-white`}
            disabled={isUpdatingScore}
          >
            {isUpdatingScore ? "Updating Score..." : "New Game"}
          </button>
          <ScoreDisplay />
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg shadow">
          <div className="flex flex-row text-xl mb-4 justify-between">
            <PlayerPanel
              onPlayerWin={handlePlayerWin}
              gameOver={gameOver}
              botIsWaiting={waitingForBotResponse}
            />
            <BotPanel
              onBotWin={handleBotWin}
              gameOver={gameOver}
              onWaitingChange={handleBotWaitingChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
