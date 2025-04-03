/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { getCookie } from "cookies-next";

// Update the props interface to include onPlayerWin
interface BotPanelProps {
  onBotWin: () => void;
  onPlayerWin: () => void; // Add this prop
  gameOver: boolean;
  onWaitingChange: (isWaiting: boolean) => void;
  latestPlayerGuess?: {
    number: string;
    bulls: number;
    cows: number;
    timestamp: string;
  };
}

const BotPanel = forwardRef<any, BotPanelProps>(
  (
    { onBotWin, onPlayerWin, gameOver, onWaitingChange, latestPlayerGuess },
    ref
  ) => {
    // Add a specific state to track if player has won
    const [playerWon, setPlayerWon] = useState(false);

    const [botGuesses, setBotGuesses] = useState([]);
    const [playerResponses, setPlayerResponses] = useState([]);
    const [guessResponses, setGuessResponses] = useState([]);
    const [botGuess, setBotGuess] = useState("");
    const [waitingForResponse, setWaitingForResponse] = useState(false);
    const [bulls, setBulls] = useState(0);
    const [invalidResponse, setInvalidResponse] = useState(false);
    const [botWon, setBotWon] = useState(false);
    const [bullsInput, setBullsInput] = useState("0");
    const [cowsInput, setCowsInput] = useState("0");
    const [possibleNumbers, setPossibleNumbers] = useState([]);

    // Make the makeBotGuess function available to the parent component
    useImperativeHandle(ref, () => ({
      // This can be called by the parent as botPanelRef.current.makeGuess()
      makeGuess: () => {
        if (
          !waitingForResponse &&
          !gameOver &&
          !playerWon &&
          possibleNumbers.length > 0
        ) {
          makeBotGuess();
        }
      },
    }));

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
      // Parse input values
      const bullsValue = parseInt(bullsInput);
      const cowsValue = parseInt(cowsInput);

      // Validate the values
      if (
        isNaN(bullsValue) ||
        isNaN(cowsValue) ||
        bullsValue < 0 ||
        bullsValue > 4 ||
        cowsValue < 0 ||
        cowsValue + bullsValue > 4
      ) {
        setInvalidResponse(true);
        return;
      }

      // Update the bulls state value
      setBulls(bullsValue);
      // We don't need to set cows state separately as we use the value directly

      const response = { guess: botGuess, bulls: bullsValue, cows: cowsValue };

      // Validate response against player's number
      const isValid = validatePlayerResponse(botGuess, bullsValue, cowsValue);
      if (!isValid) {
        setInvalidResponse(true);
        return;
      }

      setPlayerResponses((prev) => [...prev, response]);

      // Store responses in localStorage for persistence
      localStorage.setItem(
        "botResponses",
        JSON.stringify([...playerResponses, response])
      );

      // Check for win condition - 4 bulls means the bot guessed correctly
      if (bullsValue === 4) {
        if (onBotWin) {
          console.log("Bot has won! Calling onBotWin");
          onBotWin();
        }

        setBotWon(true);
        setInvalidResponse(false);
        setWaitingForResponse(false);
        setBullsInput("0");
        setCowsInput("0");
        return;
      }

      // Update our list of possible numbers based on this feedback
      updatePossibilities(botGuess, bullsValue, cowsValue);

      setInvalidResponse(false);
      setWaitingForResponse(false);

      // Reset for next guess
      setBullsInput("0");
      setCowsInput("0");
    }, [
      bullsInput,
      cowsInput,
      botGuess,
      validatePlayerResponse,
      updatePossibilities,
      onBotWin,
      playerResponses,
    ]);

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

    // Initialize bot's guess strategy on component mount
    useEffect(() => {
      const gameStarted = getCookie("gameStarted");
      const playerNumber = getCookie("playerNumber");

      if (
        gameStarted === "true" &&
        playerNumber &&
        !botGuesses.length &&
        !waitingForResponse &&
        possibleNumbers.length > 0 &&
        !gameOver
      ) {
        makeBotGuess();
      }
    }, [
      possibleNumbers,
      botGuesses,
      waitingForResponse,
      makeBotGuess,
      gameOver,
    ]);

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

    // Reset input fields when waitingForResponse changes to true
    useEffect(() => {
      if (waitingForResponse) {
        setBullsInput("0");
        setCowsInput("0");
      }
    }, [waitingForResponse]);

    // Watch for changes to latestPlayerGuess prop
    // Function to generate response based on bulls and cows
    const generateResponse = useCallback((bulls: number, cows: number) => {
      return `${bulls} Bull${bulls === 1 ? "" : "s"}, ${cows} Cow${
        cows === 1 ? "" : "s"
      }`;
    }, []);

    useEffect(() => {
      if (latestPlayerGuess) {
        // Check if we already have this guess in our responses
        const alreadyExists = guessResponses.some(
          (response) => response.timestamp === latestPlayerGuess.timestamp
        );

        if (!alreadyExists) {
          const response = {
            ...latestPlayerGuess,
            message: generateResponse(
              latestPlayerGuess.bulls,
              latestPlayerGuess.cows
            ),
          };

          setGuessResponses((prev) => [...prev, response]);

          // Check for player win condition
          if (latestPlayerGuess.bulls === 4) {
            console.log("Player has won! Calling onPlayerWin from BotPanel");
            setPlayerWon(true); // Set the playerWon state

            if (onPlayerWin && !gameOver) {
              onPlayerWin();
            }
          }
        }
      }
    }, [
      latestPlayerGuess,
      guessResponses,
      generateResponse,
      onPlayerWin,
      gameOver,
    ]);

    // Rest of your component remains unchanged
    return (
      <div
        className="flex flex-col w-1/2 h-1/4 max-h-screen border-l text-center items-center"
        style={{ borderColor: "#38A3A5" }}
      >
        <div
          className="text-xl font-semibold py-2"
          style={{ color: "#57CC99" }}
        >
          bot
        </div>

        <div className=" w-full px-4 flex flex-col items-center">
          {/* Victory message when player wins - Add this section */}
          {playerWon && (
            <div
              className="mb-4 p-2 rounded-lg w-full max-w-md text-center"
              style={{ backgroundColor: "#80ED99", color: "#22577A" }}
            >
              <p className="text-xl font-bold">You WON!</p>
            </div>
          )}

          {/* Victory message when bot wins */}
          {botWon && (
            <div
              className="mb-4 p-2 rounded-lg w-full max-w-md text-center"
              style={{ backgroundColor: "#57CC99", color: "#22577A" }}
            >
              <p className="text-md font-bold mb-2">
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
          {waitingForResponse && !botWon && !playerWon && !gameOver && (
            <div
              className="mb-2 p-2 rounded-lg w-full max-w-md"
              style={{ backgroundColor: "#22577A" }}
            >
              <p className="mb-2" style={{ color: "#C7F9CC" }}>
                My guess is:{" "}
                <span className="underline font-bold">{botGuess}</span>
              </p>

              <div className="flex space-x-4 justify-center mb-2">
                <div>
                  <label
                    className="block text-sm mb-1"
                    style={{ color: "#C7F9CC" }}
                  >
                    Bulls
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={bullsInput}
                    onChange={(e) => setBullsInput(e.target.value)}
                    className="w-12 border rounded text-center bg-black text-white"
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
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={cowsInput}
                    onChange={(e) => setCowsInput(e.target.value)}
                    className="w-12 border rounded text-center bg-black text-white"
                    style={{ borderColor: "#38A3A5" }}
                  />
                </div>
              </div>

              {invalidResponse && (
                <div className="text-sm font-bold text-red-600 bg-black/50 mb-2 rounded-sm px-1">
                  fairsystem: Your response is incorrect
                </div>
              )}

              <button
                onClick={handlePlayerResponse}
                className="px-4 py-2 font-bold text-sm rounded text-white"
                style={{ backgroundColor: "#38A3A5" }}
              >
                Submit
              </button>
            </div>
          )}

          {/* Previous guesses history - only bot guesses */}
          <div
            className="border rounded-md p-2 max-h-96 overflow-y-auto w-full"
            style={{ borderColor: "#38A3A5", backgroundColor: "#22577A10" }}
          >
            {!waitingForResponse && botGuesses.length === 0 && !playerWon ? (
              <p style={{ color: "#57CC99" }}>Waiting for user...</p>
            ) : (
              <div>
                <h3
                  className="text-sm font-semibold mb-2"
                  style={{ color: "#57CC99" }}
                >
                  {playerWon
                    ? "Game over "
                    : botWon
                    ? "Game over "
                    : "Computer's guesses:"}
                </h3>
                {playerResponses.map((response, index) => (
                  <div
                    key={`bot-${index}`}
                    className="mb-2 pb-2 border-b text-sm border-opacity-20"
                    style={{ borderColor: "#38A3A5" }}
                  >
                    <p className="font-bold mb-1" style={{ color: "#80ED99" }}>
                      {response.guess}
                    </p>
                    <p style={{ color: "#C7F9CC" }}>
                      {response.bulls} {"B"} / {response.cows} {"C"}
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
            style={{
              backgroundColor: "#22577A10",
              borderColor: "#38A3A5",
            }}
          >
            <div className="flex items-center justify-center">
              <div
                className="px-2 text-sm rounded-lg"
                style={{ backgroundColor: "#22577A30" }}
              >
                <span style={{ color: "#57CC99" }}>
                  Possible combinations:{" "}
                </span>
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
);

BotPanel.displayName = "BotPanel";

export default BotPanel;
