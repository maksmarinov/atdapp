/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { setCookie, getCookie } from "cookies-next";

interface PlayerPanelProps {
  onPlayerWin: () => void;
  gameOver: boolean;
  botIsWaiting: boolean;
  onPlayerGuess: (guessData: any) => void;
}

export default function PlayerPanel({
  onPlayerWin,
  gameOver,
  botIsWaiting,
  onPlayerGuess,
}: PlayerPanelProps) {
  const [number, setNumber] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [computerNumber, setComputerNumber] = useState("");
  const [guess, setGuess] = useState("");
  const [isGuessValid, setIsGuessValid] = useState(false);
  const [guessHistory, setGuessHistory] = useState([]);
  const [possibleCombinations, setPossibleCombinations] = useState([]);

  const handleNumberKeyDown = (e) => {
    if (e.key === "Enter") {
      if (isValid && !gameStarted) {
        handlePlay();
      }
    }
  };

  const handleGuessKeyDown = (e) => {
    if (e.key === "Enter") {
      if (isGuessValid && !gameOver && !botIsWaiting) {
        handleGuessSubmit();
      }
    }
  };

  useEffect(() => {
    const savedNumber = getCookie("playerNumber");
    const savedComputerNumber = getCookie("computerNumber");
    const savedGameStarted = getCookie("gameStarted");

    if (savedNumber && savedComputerNumber && savedGameStarted === "true") {
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

      try {
        const savedHistory = localStorage.getItem("guessHistory");
        if (savedHistory) {
          setGuessHistory(JSON.parse(savedHistory));
        }

        const savedCombinations = localStorage.getItem("playerPossibilities");
        if (savedCombinations) {
          setPossibleCombinations(JSON.parse(savedCombinations));
        } else {
          setPossibleCombinations(generateAllValidNumbers());
        }
      } catch (error) {
        console.error("Failed to load game data:", error);
      }
    }
  }, []);

  const generateAllValidNumbers = () => {
    const validNumbers = [];
    for (let i = 1023; i <= 9876; i++) {
      const numStr = i.toString();

      if (new Set(numStr).size !== 4) continue;

      if (numStr[0] === "0") continue;

      validNumbers.push(numStr);
    }
    return validNumbers;
  };

  useEffect(() => {
    if (gameStarted && possibleCombinations.length === 0) {
      setPossibleCombinations(generateAllValidNumbers());
    }
  }, [gameStarted, possibleCombinations.length]);

  const validateNumber = (input) => {
    const regex = /^[1-9]\d{3}$/;
    if (!regex.test(input)) return false;

    const digits = input.split("");
    const uniqueDigits = new Set(digits);
    return uniqueDigits.size === 4;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setNumber(value);

    if (value.length === 4) {
      setIsValid(validateNumber(value));
    } else {
      setIsValid(false);
    }
  };

  const generateRandomNumber = () => {
    const availableDigits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const remainingDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    let result = "";

    const firstIndex = Math.floor(Math.random() * availableDigits.length);
    result += availableDigits[firstIndex];

    remainingDigits.splice(remainingDigits.indexOf(parseInt(result[0])), 1);

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

      const allPossible = generateAllValidNumbers();
      setPossibleCombinations(allPossible);
      localStorage.setItem("playerPossibilities", JSON.stringify(allPossible));

      setCookie("playerNumber", number, { maxAge: 60 * 60 * 24 });
      setCookie("computerNumber", randomNumber, { maxAge: 60 * 60 * 24 });
      setCookie("gameStarted", "true", { maxAge: 60 * 60 * 24 });
    }
  };

  const handleGuessChange = (e) => {
    const value = e.target.value;
    setGuess(value);

    if (value.length === 4) {
      setIsGuessValid(validateNumber(value));
    } else {
      setIsGuessValid(false);
    }
  };

  const calculateBullsAndCows = (guess, target) => {
    let bulls = 0;
    let cows = 0;

    const guessDigits = guess.split("");
    const targetDigits = target.split("");

    for (let i = 0; i < 4; i++) {
      if (guessDigits[i] === targetDigits[i]) {
        bulls++;
        guessDigits[i] = "X";
        targetDigits[i] = "Y";
      }
    }

    for (let i = 0; i < 4; i++) {
      if (guessDigits[i] !== "X") {
        const targetIndex = targetDigits.indexOf(guessDigits[i]);
        if (targetIndex !== -1) {
          cows++;
          targetDigits[targetIndex] = "Y";
        }
      }
    }

    return { bulls, cows };
  };

  const updatePossibleCombinations = (currentGuess, bulls, cows) => {
    setPossibleCombinations((prevPossible) => {
      const filtered = prevPossible.filter((num) => num !== currentGuess);

      return filtered.filter((candidate) => {
        const feedback = calculateBullsAndCows(currentGuess, candidate);
        return feedback.bulls === bulls && feedback.cows === cows;
      });
    });
  };

  const handleGuessSubmit = () => {
    if (isGuessValid && !gameOver && !botIsWaiting) {
      const { bulls, cows } = calculateBullsAndCows(guess, computerNumber);

      const guessResult = {
        number: guess,
        bulls,
        cows,
        timestamp: new Date().toISOString(),
      };

      const updatedHistory = [...guessHistory, guessResult];
      setGuessHistory(updatedHistory);

      updatePossibleCombinations(guess, bulls, cows);

      localStorage.setItem(
        "playerPossibilities",
        JSON.stringify(
          possibleCombinations
            .filter((num) => num !== guess)
            .filter((candidate) => {
              const feedback = calculateBullsAndCows(guess, candidate);
              return feedback.bulls === bulls && feedback.cows === cows;
            })
        )
      );

      localStorage.setItem("guessHistory", JSON.stringify(updatedHistory));

      if (onPlayerGuess) {
        onPlayerGuess(guessResult);
      }

      setGuess("");

      if (bulls === 4 && onPlayerWin) {
        onPlayerWin();
      }
    }
  };

  return (
    <div className="flex flex-col h-1/4 max-h-screen w-1/2  text-center items-center">
      <div className="text-xl font-semibold py-2">You</div>

      <div className=" relative flex flex-col items-center w-full px-2">
        <div className="w-full max-w-md border-b-2 pb-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={number}
            onChange={handleChange}
            onKeyDown={handleNumberKeyDown}
            disabled={gameStarted}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="p-2 border rounded-sm w-32 text-center text-xl"
            placeholder="Enter 4 digits"
          />

          {showTooltip && !gameStarted && number.length != 4 && (
            <div
              className="absolute mt-2 p-2 w-40 rounded-sm shadow-lg z-10 text-sm bg-black/80"
              style={{
                opacity: "80%",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <p className="font-bold mb-2 ">Rules for valid number:</p>
              <ul className="list-disc pl-4 text-left  font-bold">
                <li className="mb-2">Must be exactly 4 digits</li>
                <li className="mb-2">First digit cannot be 0</li>
                <li className="mb-2">
                  All digits must be different (no repeats)
                </li>
              </ul>
            </div>
          )}

          {!gameStarted && (
            <div className="mt-4">
              <button
                onClick={handlePlay}
                disabled={!isValid}
                className="px-4 py-2 rounded-sm"
                style={{
                  backgroundColor: isValid ? "white" : "black",
                  color: isValid ? "black" : "white",
                  opacity: isValid ? 1 : 0.4,
                  cursor: isValid ? "pointer" : "not-allowed",
                }}
              >
                Play
              </button>
            </div>
          )}
        </div>

        {gameStarted && (
          <div className="mt-4 w-full max-w-md">
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center justify-center w-full">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={guess}
                  onChange={handleGuessChange}
                  onKeyDown={handleGuessKeyDown}
                  disabled={gameOver || botIsWaiting}
                  className={`p-2 border rounded-sm w-32 text-center text-xl ${
                    guess.length === 4
                      ? isGuessValid
                        ? "bg-lime-400/80  text-black"
                        : "bg-red-500/40"
                      : "white"
                  }
                  placeholder="Guess"`}
                />

                <button
                  onClick={handleGuessSubmit}
                  disabled={!isGuessValid || gameOver || botIsWaiting}
                  className="mt-2 px-2 py-2 text-sm rounded-sm font-bold w-auto"
                  style={{
                    backgroundColor: "lime",
                    color: "black",
                    opacity:
                      isGuessValid && !gameOver && !botIsWaiting ? 0.9 : 0.6,
                    cursor:
                      isGuessValid && !gameOver && !botIsWaiting
                        ? "pointer"
                        : "not-allowed",
                  }}
                >
                  Submit
                </button>
              </div>

              {botIsWaiting && !gameOver && (
                <div
                  className="mt-2 text-sm w-full text-left bg-violet-500/50 rounded p-1"
                  style={{ color: "black" }}
                >
                  Please respond to the computer&apos;s guess first
                </div>
              )}
            </div>

            <div className="mt-6 w-full">
              {guessHistory.length > 0 && (
                <div
                  className="mt-2 text-sm text-left"
                  style={{ color: "white" }}
                >
                  <h3 className="text-sm font-semibold mb-2">Your guesses:</h3>
                  <div
                    className="max-h-72 overflow-y-auto pr-2  rounded-lg"
                    style={{ borderColor: "lime10" }}
                  >
                    {guessHistory.map((g, index) => (
                      <div
                        key={index}
                        className="mb-2 pb-2 border-b border-opacity-30"
                        style={{ borderColor: "lime" }}
                      >
                        <span className="font-bold">{g.number}:</span> {g.bulls}{" "}
                        B, {g.cows} C
                        {g.bulls === 4 && (
                          <span className="ml-2 text-yellow-400">🎯</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4 p-2 rounded-lg w-full">
                <div className="flex items-center justify-center">
                  <div className="px-2 text-sm rounded-lg">
                    <span>Possible combinations: </span>
                    <span className="font-bold" style={{ color: "lime" }}>
                      {possibleCombinations.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
