"use client";
import { useState, useEffect } from "react";
import { setCookie, getCookie } from "cookies-next"; // You'll need to install cookies-next package

export default function PlayerPanel() {
  const [number, setNumber] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [computerNumber, setComputerNumber] = useState("");
  const [guess, setGuess] = useState("");
  const [isGuessValid, setIsGuessValid] = useState(false);
  const [guessHistory, setGuessHistory] = useState([]);

  // Check for existing game on component mount
  useEffect(() => {
    const savedNumber = getCookie("playerNumber");
    const savedComputerNumber = getCookie("computerNumber");
    const savedGameStarted = getCookie("gameStarted");

    if (savedNumber && savedComputerNumber && savedGameStarted === "true") {
      // Handle potential promises from getCookie
      if (typeof savedNumber === "string") {
        setNumber(savedNumber);
      }
      if (typeof savedComputerNumber === "string") {
        setComputerNumber(savedComputerNumber);
      }
      if (savedGameStarted === "true") {
        setGameStarted(true);
        setIsValid(true);
      }

      // Restore guess history from localStorage
      try {
        const savedHistory = localStorage.getItem("guessHistory");
        if (savedHistory) {
          setGuessHistory(JSON.parse(savedHistory));
        }
      } catch (error) {
        console.error("Failed to load guess history:", error);
      }
    }
  }, []);

  const validateNumber = (input) => {
    // Check if it's a 4-digit number, doesn't start with 0, and has no repeating digits
    const regex = /^[1-9]\d{3}$/;
    if (!regex.test(input)) return false;

    // Check for repeating digits
    const digits = input.split("");
    const uniqueDigits = new Set(digits);
    return uniqueDigits.size === 4;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setNumber(value);

    // Only validate if we have 4 digits entered
    if (value.length === 4) {
      setIsValid(validateNumber(value));
    } else {
      setIsValid(false);
    }
  };

  const generateRandomNumber = () => {
    // Creating an array of available digits
    const availableDigits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    // For the remaining positions we can use 0 as well
    const remainingDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    let result = "";

    // First digit (1-9)
    const firstIndex = Math.floor(Math.random() * availableDigits.length);
    result += availableDigits[firstIndex];

    // Remove the used digit
    remainingDigits.splice(remainingDigits.indexOf(parseInt(result[0])), 1);

    // Generate the remaining 3 digits
    for (let i = 1; i < 4; i++) {
      const index = Math.floor(Math.random() * remainingDigits.length);
      result += remainingDigits[index];
      remainingDigits.splice(index, 1);
    }

    return result;
  };

  const handlePlay = () => {
    if (isValid) {
      const randomNumber = generateRandomNumber();
      setComputerNumber(randomNumber);
      setGameStarted(true);

      // Save game state to cookies (client-side) or you could call an API to save server-side
      setCookie("playerNumber", number, { maxAge: 60 * 60 * 24 }); // 1 day
      setCookie("computerNumber", randomNumber, { maxAge: 60 * 60 * 24 });
      setCookie("gameStarted", "true", { maxAge: 60 * 60 * 24 });
    }
  };

  const handleGuessChange = (e) => {
    const value = e.target.value;
    setGuess(value);

    // Only validate if we have 4 digits entered
    if (value.length === 4) {
      setIsGuessValid(validateNumber(value));
    } else {
      setIsGuessValid(false);
    }
  };

  // Calculate bulls and cows for a guess
  const calculateBullsAndCows = (guess, target) => {
    let bulls = 0;
    let cows = 0;

    // Convert strings to arrays of digits
    const guessDigits = guess.split("");
    const targetDigits = target.split("");

    // Count bulls (right digit, right position)
    for (let i = 0; i < 4; i++) {
      if (guessDigits[i] === targetDigits[i]) {
        bulls++;
        // Mark these positions as counted (replace with placeholders)
        guessDigits[i] = "X";
        targetDigits[i] = "Y";
      }
    }

    // Count cows (right digit, wrong position)
    for (let i = 0; i < 4; i++) {
      if (guessDigits[i] !== "X") {
        const targetIndex = targetDigits.indexOf(guessDigits[i]);
        if (targetIndex !== -1) {
          cows++;
          targetDigits[targetIndex] = "Y"; // Mark as counted
        }
      }
    }

    return { bulls, cows };
  };

  const handleGuessSubmit = () => {
    if (isGuessValid) {
      // Calculate bulls and cows
      const { bulls, cows } = calculateBullsAndCows(guess, computerNumber);

      // Add to history with the result
      const guessResult = {
        number: guess,
        bulls,
        cows,
        timestamp: new Date().toISOString(),
      };

      const updatedHistory = [...guessHistory, guessResult];
      setGuessHistory(updatedHistory);

      // Save the latest result to make it available for BotPanel
      localStorage.setItem("latestGuess", JSON.stringify(guessResult));

      // Save the entire history to localStorage for persistence
      localStorage.setItem("guessHistory", JSON.stringify(updatedHistory));

      setGuess(""); // Clear the input
    }
  };

  return (
    <div
      className="flex flex-col w-1/2 h-screen border text-center items-center"
      style={{ borderColor: "#38A3A5" }}
    >
      <div className="text-xl font-semibold py-2" style={{ color: "#57CC99" }}>
        Your Panel
      </div>

      <div className="mt-5 relative">
        <input
          type="text"
          maxLength={4}
          value={number}
          onChange={handleChange}
          disabled={gameStarted}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`p-2 border rounded bg-black w-32 text-center text-xl ${
            number.length === 4
              ? isValid
                ? "border-green-500"
                : "border-red-500"
              : ""
          }`}
          placeholder="Enter 4 digits"
        />

        {/* Validation indicator */}
        {number.length === 4 && !gameStarted && (
          <span className="ml-2">{isValid ? "✅" : "❌"}</span>
        )}

        {/* Rules tooltip */}
        {showTooltip && !gameStarted && (
          <div className="absolute mt-2 p-3 bg-gray-800 border border-gray-600 rounded shadow-lg z-10 text-sm max-w-xs">
            <p className="font-bold mb-1">Rules for valid number:</p>
            <ul className="list-disc pl-5 text-left">
              <li>Must be exactly 4 digits</li>
              <li>First digit cannot be 0</li>
              <li>All digits must be different (no repeats)</li>
            </ul>
          </div>
        )}

        {/* Play button */}
        {!gameStarted && (
          <button
            onClick={handlePlay}
            disabled={!isValid}
            className={`mt-4 px-6 py-2 rounded ${
              isValid
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-600 cursor-not-allowed"
            }`}
            style={{
              backgroundColor: isValid ? "#57CC99" : undefined,
              color: "white",
            }}
          >
            Play
          </button>
        )}

        {/* Game has started section */}
        {gameStarted && (
          <div className="mt-4">
            <p className="text-lg" style={{ color: "#80ED99" }}>
              Your number: <span className="font-bold">{number}</span>
            </p>

            {/* Guess input */}
            <div className="mt-6 flex items-center">
              <input
                type="text"
                maxLength={4}
                value={guess}
                onChange={handleGuessChange}
                className={`p-2 border rounded bg-black w-32 text-center text-xl ${
                  guess.length === 4
                    ? isGuessValid
                      ? "border-green-500"
                      : "border-red-500"
                    : ""
                }`}
                placeholder="Guess"
              />

              {/* Validation indicator */}
              {guess.length === 4 && (
                <span className="ml-2">{isGuessValid ? "✅" : "❌"}</span>
              )}

              <button
                onClick={handleGuessSubmit}
                disabled={!isGuessValid}
                className="ml-4 px-4 py-2 rounded text-white"
                style={{
                  backgroundColor: isGuessValid ? "#38A3A5" : "#4b5563",
                }}
              >
                Submit
              </button>
            </div>

            {/* Guess history */}
            {guessHistory.length > 0 && (
              <div className="mt-6 text-left" style={{ color: "#C7F9CC" }}>
                <h3 className="text-lg font-semibold mb-2">Your guesses:</h3>
                <div className="max-h-72 overflow-y-auto pr-2">
                  {guessHistory.map((g, index) => (
                    <div
                      key={index}
                      className="mb-2 pb-2 border-b border-opacity-30"
                      style={{ borderColor: "#38A3A5" }}
                    >
                      <span className="font-bold">{g.number}:</span> {g.bulls}{" "}
                      {g.bulls === 1 ? "Bull" : "Bulls"}, {g.cows}{" "}
                      {g.cows === 1 ? "Cow" : "Cows"}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
