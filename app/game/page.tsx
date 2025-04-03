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
  const [isUpdatingScore, setIsUpdatingScore] = useState(false);
  const scoreUpdated = useRef(false);
  const [waitingForBotResponse, setWaitingForBotResponse] = useState(false);
  const botPanelRef = useRef(null);
  const [latestPlayerGuess, setLatestPlayerGuess] = useState(null);

  const handlePlayerWin = () => {
    setPlayerWon(true);
    setGameOver(true);
  };

  const handleBotWin = () => {
    setBotWon(true);
    setGameOver(true);
  };

  const handleBotWaitingChange = (isWaiting) => {
    setWaitingForBotResponse(isWaiting);
  };

  const handlePlayerGuess = (guessData) => {
    setLatestPlayerGuess(guessData);

    localStorage.setItem("latestGuess", JSON.stringify(guessData));

    if (!gameOver && botPanelRef.current && !waitingForBotResponse) {
      botPanelRef.current.makeGuess();
    }
  };

  useEffect(() => {
    const updateScore = async () => {
      if (gameOver && (playerWon || botWon) && !scoreUpdated.current) {
        setIsUpdatingScore(true);
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
          setIsUpdatingScore(false);
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
    localStorage.removeItem("playerPossibilities");

    window.location.reload();
  };

  return (
    <div className=" min-w-120">
      <SlidingMenu />
      <div className="flex flex-col ml-[4rem] p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleNewGame}
            className={`px-2 py-1 font-bold text-md ${
              isUpdatingScore
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
            } rounded text-white`}
            disabled={isUpdatingScore}
          >
            {isUpdatingScore ? "Updating Score..." : "New Game"}
          </button>
          <div className="text-white font-extrabold">Bulls&Cows</div>
          <ScoreDisplay />
        </div>

        <div className="bg-neutral-800 p-4 h-1/4 max-h-screen rounded-lg shadow">
          <div className="flex flex-row text-xl mb-4 justify-between">
            <PlayerPanel
              onPlayerWin={handlePlayerWin}
              gameOver={gameOver}
              botIsWaiting={waitingForBotResponse}
              onPlayerGuess={handlePlayerGuess}
            />
            <BotPanel
              ref={botPanelRef}
              onBotWin={handleBotWin}
              onPlayerWin={handlePlayerWin}
              gameOver={gameOver}
              onWaitingChange={handleBotWaitingChange}
              latestPlayerGuess={latestPlayerGuess}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
