"use client";
import SlidingMenu from "../components/SlidingMenu";
import PlayerPanel from "../components/PlayerPanel";
import BotPanel from "../components/BotPanel";
import { deleteCookie } from "cookies-next";

export default function Game() {
  const handleNewGame = () => {
    // Clear cookies
    deleteCookie("playerNumber");
    deleteCookie("computerNumber");
    deleteCookie("gameStarted");

    // Clear localStorage
    localStorage.removeItem("guessHistory");
    localStorage.removeItem("latestGuess");

    // Simply reload the page to start fresh
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
            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
          >
            New Game
          </button>
        </div>
        <div className="bg-neutral-800 p-4 rounded-lg shadow">
          <div className="flex flex-row text-xl mb-4 justify-between">
            <PlayerPanel />
            <BotPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
