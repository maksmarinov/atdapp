"use client";
import { useState, useEffect, useCallback } from "react";
import { getCookie } from "cookies-next";

// Define proper interface for props
interface BotPanelProps {
  onBotWin: () => void;
  gameOver: boolean;
  onWaitingChange: (isWaiting: boolean) => void;
}

export default function BotPanel({ onBotWin, onWaitingChange }: BotPanelProps) {
  const [botGuesses, setBotGuesses] = useState([]);
  const [playerResponses, setPlayerResponses] = useState([]);
  const [guessResponses, setGuessResponses] = useState([]);
  const [botGuess, setBotGuess] = useState("");
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [bulls, setBulls] = useState(0);
  const [cows, setCows] = useState(0);
  const [invalidResponse, setInvalidResponse] = useState(false);
  const [botWon, setBotWon] = useState(false);

  // Main state variable - possible numbers that could be the answer
  const [possibleNumbers, setPossibleNumbers] = useState([]);

  // Calculate bulls and cows between two numbers
  const calculateFeedback = useCallback((guess, secret) => {
    let bulls = 0;
    let cows = 0;

    // Calculate Bulls (right digit, right position)
    for (let i = 0; i < 4; i++) {
      if (guess[i] === secret[i]) {
        bulls++;
      }
    }

    // Calculate total matching digits
    const guessDigits = guess.split("");
    const secretDigits = secret.split("");

    // Count common digits using frequency counters
    const guessCount = {};
    const secretCount = {};

    for (let i = 0; i < 4; i++) {
      guessCount[guessDigits[i]] = (guessCount[guessDigits[i]] || 0) + 1;
      secretCount[secretDigits[i]] = (secretCount[secretDigits[i]] || 0) + 1;
    }

    // Count total matches
    let totalMatches = 0;
    for (const digit in guessCount) {
      if (digit in secretCount) {
        totalMatches += Math.min(guessCount[digit], secretCount[digit]);
      }
    }

    // Cows = total matches - bulls
    cows = totalMatches - bulls;

    return { bulls, cows };
  }, []);

  // Calculate bulls (matching position and digit)
  const calculateBulls = useCallback((guess, target) => {
    let count = 0;
    for (let i = 0; i < 4; i++) {
      if (guess[i] === target[i]) count++;
    }
    return count;
  }, []);

  // Calculate cows (matching digit but wrong position)
  const calculateCows = useCallback((guess, target, bullsCount) => {
    const guessDigits = guess.split("");
    const targetDigits = target.split("");
    let matchCount = 0;

    // Count matching digits
    for (let i = 0; i < 10; i++) {
      const digit = i.toString();
      matchCount += Math.min(
        guessDigits.filter((d) => d === digit).length,
        targetDigits.filter((d) => d === digit).length
      );
    }

    // Subtract bulls to get cows
    return matchCount - bullsCount;
  }, []);

  // Generate a more human-like response to player's guesses
  const generateResponse = useCallback((bulls, cows) => {
    if (bulls === 4) {
      return "Congratulations! You've guessed my number!";
    }

    if (bulls === 0 && cows === 0) {
      return "No match at all. Try a completely different number.";
    }

    return `Your guess has ${bulls} bull${
      bulls !== 1 ? "s" : ""
    } and ${cows} cow${cows !== 1 ? "s" : ""}.`;
  }, []);

  // Validate player's response for consistency
  const validatePlayerResponse = useCallback(
    (guess, bulls, cows) => {
      const playerNumber = getCookie("playerNumber");
      if (!playerNumber) return true; // Can't validate without player number

      // For development, we can check against actual player number
      const actualBulls = calculateBulls(guess, playerNumber);
      const actualCows = calculateCows(guess, playerNumber, actualBulls);

      return actualBulls === bulls && actualCows === cows;
    },
    [calculateBulls, calculateCows]
  );

  // Update the list of possible numbers based on feedback
  const updatePossibilities = useCallback(
    (guess, bulls, cows) => {
      setPossibleNumbers((prevPossibilities) => {
        // Filter the list to only include numbers that would give the same feedback
        return prevPossibilities.filter((candidate) => {
          // Don't compare against the guess itself
          if (candidate === guess) return false;

          // Calculate what feedback would be if this was the secret
          const feedback = calculateFeedback(guess, candidate);

          // Keep only numbers that match the given feedback
          return feedback.bulls === bulls && feedback.cows === cows;
        });
      });
    },
    [calculateFeedback]
  );

  // Make a bot guess based on current strategy
  const makeBotGuess = useCallback(() => {
    // If there are no more possibilities, just pick a random 4-digit number
    // This is a fallback and should rarely happen in normal gameplay
    if (possibleNumbers.length === 0) {
      // Generate a valid guess instead of showing an error
      let digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      digits = digits.sort(() => Math.random() - 0.5).slice(0, 4);
      if (digits[0] === 0) [digits[0], digits[3]] = [digits[3], digits[0]];

      const guess = digits.join("");
      setBotGuess(guess);
      setBotGuesses((prevGuesses) => [...prevGuesses, guess]);
      setWaitingForResponse(true);
      return;
    }

    // Choose a random guess from remaining possibilities
    const randomIndex = Math.floor(Math.random() * possibleNumbers.length);
    const guess = possibleNumbers[randomIndex];

    setBotGuess(guess);
    setBotGuesses((prevGuesses) => [...prevGuesses, guess]);
    setWaitingForResponse(true);
  }, [possibleNumbers]);

  // Handle player's response to bot's guess
  const handlePlayerResponse = useCallback(() => {
    if (bulls < 0 || bulls > 4 || cows < 0 || cows + bulls > 4) {
      setInvalidResponse(true);
      return;
    }

    const response = { guess: botGuess, bulls, cows };

    // Validate response against player's number
    const isValid = validatePlayerResponse(botGuess, bulls, cows);
    if (!isValid) {
      setInvalidResponse(true);
      return;
    }

    setPlayerResponses((prev) => [...prev, response]);

    // Check for win condition - 4 bulls means the bot guessed correctly
    if (bulls === 4) {
      setBotWon(true);
      setInvalidResponse(false);
      setWaitingForResponse(false);
      setBulls(0);
      setCows(0);
      return;
    }

    // Update our list of possible numbers based on this feedback
    updatePossibilities(botGuess, bulls, cows);

    setInvalidResponse(false);
    setWaitingForResponse(false);

    // Reset for next guess
    setBulls(0);
    setCows(0);
  }, [bulls, cows, botGuess, validatePlayerResponse, updatePossibilities]);

  // Generate all valid numbers (4-digit numbers with unique digits, non-zero first digit)
  useEffect(() => {
    const generateAllValidNumbers = () => {
      const validNumbers = [];
      // Start from 1023 (smallest possible) to 9876 (largest possible)
      for (let i = 1023; i <= 9876; i++) {
        const numStr = i.toString();

        // Skip numbers with repeated digits
        if (new Set(numStr).size !== 4) continue;

        // Skip numbers with leading zero (should already be caught by our range)
        if (numStr[0] === "0") continue;

        validNumbers.push(numStr);
      }
      return validNumbers;
    };

    setPossibleNumbers(generateAllValidNumbers());
  }, []);

  // Listen for new guesses from PlayerPanel
  useEffect(() => {
    const checkForNewGuess = () => {
      const latestGuessJSON = localStorage.getItem("latestGuess");

      if (latestGuessJSON) {
        try {
          const latestGuess = JSON.parse(latestGuessJSON);

          // Check if we already have this guess in our responses
          const alreadyExists = guessResponses.some(
            (response) => response.timestamp === latestGuess.timestamp
          );

          if (!alreadyExists) {
            const response = {
              ...latestGuess,
              message: generateResponse(latestGuess.bulls, latestGuess.cows),
            };

            setGuessResponses((prev) => [...prev, response]);

            // After player makes a guess, it's the bot's turn (if not already waiting)
            if (!waitingForResponse) {
              makeBotGuess();
            }
          }
        } catch (error) {
          console.error("Failed to parse latest guess:", error);
        }
      }
    };

    // Check immediately
    checkForNewGuess();

    // Set up interval to check periodically
    const interval = setInterval(checkForNewGuess, 1000);

    return () => clearInterval(interval);
  }, [guessResponses, waitingForResponse, makeBotGuess, generateResponse]);

  // Initialize bot's guess strategy on component mount
  useEffect(() => {
    const gameStarted = getCookie("gameStarted");
    const playerNumber = getCookie("playerNumber");

    if (
      gameStarted === "true" &&
      playerNumber &&
      !botGuesses.length &&
      !waitingForResponse &&
      possibleNumbers.length > 0
    ) {
      makeBotGuess();
    }
  }, [possibleNumbers, botGuesses, waitingForResponse, makeBotGuess]);

  // Notify the parent component when waiting state changes
  useEffect(() => {
    if (onWaitingChange) {
      onWaitingChange(waitingForResponse);
    }
  }, [waitingForResponse, onWaitingChange]);

  // Make sure to call onBotWin when appropriate
  useEffect(() => {
    if (botWon && onBotWin) {
      onBotWin();
    }
  }, [botWon, onBotWin]);

  // Rest of your component remains unchanged
  return (
    <div
      className="flex flex-col w-1/2 h-screen border text-center items-center"
      style={{ borderColor: "#38A3A5" }}
    >
      <div className="text-xl font-semibold py-2" style={{ color: "#57CC99" }}>
        Computer&apos;s Panel
      </div>

      <div className="mt-5 w-full px-4 flex flex-col items-center">
        {/* Victory message when bot wins */}
        {botWon && (
          <div
            className="mb-6 p-4 rounded-lg w-full max-w-md text-center"
            style={{ backgroundColor: "#57CC99", color: "#22577A" }}
          >
            <p className="text-xl font-bold mb-2">
              I&apos;ve guessed your number!
            </p>
            <p className="text-md">
              Your number is:{" "}
              <span className="font-bold">
                {botGuesses[botGuesses.length - 1]}
              </span>
            </p>
          </div>
        )}

        {/* Bot's guess section - only show if bot hasn't won yet */}
        {waitingForResponse && !botWon && (
          <div
            className="mb-6 p-4 rounded-lg w-full max-w-md"
            style={{ backgroundColor: "#22577A" }}
          >
            <p className="mb-2" style={{ color: "#C7F9CC" }}>
              My guess is:{" "}
              <span className="text-2xl font-bold">{botGuess}</span>
            </p>
            <p className="mb-4" style={{ color: "#80ED99" }}>
              How many Bulls and Cows?
            </p>

            <div className="flex space-x-4 justify-center mb-4">
              <div>
                <label
                  className="block text-sm mb-1"
                  style={{ color: "#C7F9CC" }}
                >
                  Bulls
                </label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={bulls}
                  onChange={(e) => setBulls(parseInt(e.target.value))}
                  className="w-16 p-2 border rounded text-center bg-black text-white"
                  style={{ borderColor: "#38A3A5" }}
                />
              </div>
              <div>
                <label
                  className="block text-sm mb-1"
                  style={{ color: "#C7F9CC" }}
                >
                  Cows
                </label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={cows}
                  onChange={(e) => setCows(parseInt(e.target.value))}
                  className="w-16 p-2 border rounded text-center bg-black text-white"
                  style={{ borderColor: "#38A3A5" }}
                />
              </div>
            </div>

            {invalidResponse && (
              <p className="text-red-500 mb-3">
                That response doesn&apos;t seem right. Please check again.
              </p>
            )}

            <button
              onClick={handlePlayerResponse}
              className="px-4 py-2 rounded text-white"
              style={{ backgroundColor: "#38A3A5" }}
            >
              Submit
            </button>
          </div>
        )}

        {/* Previous guesses history - only bot guesses */}
        <div
          className="border rounded-lg p-4 max-h-96 overflow-y-auto w-full"
          style={{ borderColor: "#38A3A5", backgroundColor: "#22577A10" }}
        >
          {!waitingForResponse && botGuesses.length === 0 ? (
            <p style={{ color: "#57CC99" }}>
              I&apos;ll start guessing after you make your first guess.
            </p>
          ) : (
            <div>
              <h3
                className="text-lg font-semibold mb-3"
                style={{ color: "#57CC99" }}
              >
                Computer&apos;s guesses:
              </h3>
              {playerResponses.map((response, index) => (
                <div
                  key={`bot-${index}`}
                  className="mb-3 pb-2 border-b border-opacity-20"
                  style={{ borderColor: "#38A3A5" }}
                >
                  <p className="font-bold mb-1" style={{ color: "#80ED99" }}>
                    {response.guess}
                  </p>
                  <p style={{ color: "#C7F9CC" }}>
                    {response.bulls} {response.bulls === 1 ? "Bull" : "Bulls"},{" "}
                    {response.cows} {response.cows === 1 ? "Cow" : "Cows"}
                  </p>
                  {/* Add winning icon next to the last guess that won */}
                  {botWon &&
                    index === playerResponses.length - 1 &&
                    bulls === 4 && (
                      <span
                        className="inline-block ml-1 text-yellow-400"
                        role="img"
                        aria-label="Trophy"
                      >
                        🏆
                      </span>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Only show count of possibilities if game still ongoing */}
        <div
          className="mt-4 p-3 rounded-lg w-full"
          style={{ backgroundColor: "#22577A10", borderColor: "#38A3A5" }}
        >
          <div className="flex items-center justify-center">
            <div
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: "#22577A30" }}
            >
              <span style={{ color: "#57CC99" }}>Possible combinations: </span>
              <span className="font-bold" style={{ color: "#38A3A5" }}>
                {possibleNumbers.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
