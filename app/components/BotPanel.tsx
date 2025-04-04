/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { getCookie } from "cookies-next";
import NumberSelector, { NumberSelectorHandle } from "./NumberSelectors";

interface BotPanelProps {
  onBotWin: () => void;
  onPlayerWin: () => void;
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
    const [playerWon, setPlayerWon] = useState(false);

    const [botGuesses, setBotGuesses] = useState([]);
    const [playerResponses, setPlayerResponses] = useState([]);
    const [guessResponses, setGuessResponses] = useState([]);
    const [botGuess, setBotGuess] = useState("");
    const [waitingForResponse, setWaitingForResponse] = useState(false);
    const [bulls, setBulls] = useState(0);
    const [invalidResponse, setInvalidResponse] = useState(false);
    const [botWon, setBotWon] = useState(false);
    const [possibleNumbers, setPossibleNumbers] = useState([]);
    const numberSelectorRef = useRef<NumberSelectorHandle>(null);

    useImperativeHandle(ref, () => ({
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

    const calculateFeedback = useCallback((guess, secret) => {
      let bulls = 0;
      let cows = 0;

      for (let i = 0; i < 4; i++) {
        if (guess[i] === secret[i]) {
          bulls++;
        }
      }

      const guessDigits = guess.split("");
      const secretDigits = secret.split("");

      const guessCount = {};
      const secretCount = {};

      for (let i = 0; i < 4; i++) {
        guessCount[guessDigits[i]] = (guessCount[guessDigits[i]] || 0) + 1;
        secretCount[secretDigits[i]] = (secretCount[secretDigits[i]] || 0) + 1;
      }

      let totalMatches = 0;
      for (const digit in guessCount) {
        if (digit in secretCount) {
          totalMatches += Math.min(guessCount[digit], secretCount[digit]);
        }
      }

      cows = totalMatches - bulls;

      return { bulls, cows };
    }, []);

    const calculateBulls = useCallback((guess, target) => {
      let count = 0;
      for (let i = 0; i < 4; i++) {
        if (guess[i] === target[i]) count++;
      }
      return count;
    }, []);

    const calculateCows = useCallback((guess, target, bullsCount) => {
      const guessDigits = guess.split("");
      const targetDigits = target.split("");
      let matchCount = 0;

      for (let i = 0; i < 10; i++) {
        const digit = i.toString();
        matchCount += Math.min(
          guessDigits.filter((d) => d === digit).length,
          targetDigits.filter((d) => d === digit).length
        );
      }

      return matchCount - bullsCount;
    }, []);

    const validatePlayerResponse = useCallback(
      (guess, bulls, cows) => {
        const playerNumber = getCookie("playerNumber");
        if (!playerNumber) return true;

        const actualBulls = calculateBulls(guess, playerNumber);
        const actualCows = calculateCows(guess, playerNumber, actualBulls);

        return actualBulls === bulls && actualCows === cows;
      },
      [calculateBulls, calculateCows]
    );

    const updatePossibilities = useCallback(
      (guess, bulls, cows) => {
        setPossibleNumbers((prevPossibilities) => {
          return prevPossibilities.filter((candidate) => {
            if (candidate === guess) return false;

            const feedback = calculateFeedback(guess, candidate);

            return feedback.bulls === bulls && feedback.cows === cows;
          });
        });
      },
      [calculateFeedback]
    );

    const makeBotGuess = useCallback(() => {
      if (possibleNumbers.length === 0) {
        let digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        digits = digits.sort(() => Math.random() - 0.5).slice(0, 4);
        if (digits[0] === 0) [digits[0], digits[3]] = [digits[3], digits[0]];

        const guess = digits.join("");
        setBotGuess(guess);
        setBotGuesses((prevGuesses) => [...prevGuesses, guess]);
        setWaitingForResponse(true);
        return;
      }

      const randomIndex = Math.floor(Math.random() * possibleNumbers.length);
      const guess = possibleNumbers[randomIndex];

      setBotGuess(guess);
      setBotGuesses((prevGuesses) => [...prevGuesses, guess]);
      setWaitingForResponse(true);
    }, [possibleNumbers]);

    const handlePlayerResponse = useCallback(() => {
      if (!numberSelectorRef.current) return;

      const bullsValue = numberSelectorRef.current.getBullsValue();
      const cowsValue = numberSelectorRef.current.getCowsValue();

      if (
        bullsValue < 0 ||
        bullsValue > 4 ||
        cowsValue < 0 ||
        cowsValue + bullsValue > 4
      ) {
        setInvalidResponse(true);
        return;
      }

      setBulls(bullsValue);

      const response = { guess: botGuess, bulls: bullsValue, cows: cowsValue };

      const isValid = validatePlayerResponse(botGuess, bullsValue, cowsValue);
      if (!isValid) {
        setInvalidResponse(true);
        return;
      }

      setPlayerResponses((prev) => [...prev, response]);

      localStorage.setItem(
        "botResponses",
        JSON.stringify([...playerResponses, response])
      );

      if (bullsValue === 4) {
        if (onBotWin) {
          console.log("Bot has won! Calling onBotWin");
          onBotWin();
        }

        setBotWon(true);
        setInvalidResponse(false);
        setWaitingForResponse(false);

        if (numberSelectorRef.current) {
          numberSelectorRef.current.reset();
        }
        return;
      }

      updatePossibilities(botGuess, bullsValue, cowsValue);

      setInvalidResponse(false);
      setWaitingForResponse(false);

      if (numberSelectorRef.current) {
        numberSelectorRef.current.reset();
      }
    }, [
      botGuess,
      validatePlayerResponse,
      updatePossibilities,
      onBotWin,
      playerResponses,
    ]);

    useEffect(() => {
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

      setPossibleNumbers(generateAllValidNumbers());
    }, []);

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

    useEffect(() => {
      if (onWaitingChange) {
        onWaitingChange(waitingForResponse);
      }
    }, [waitingForResponse, onWaitingChange]);

    useEffect(() => {
      if (botWon && onBotWin) {
        onBotWin();
      }
    }, [botWon, onBotWin]);

    useEffect(() => {
      if (waitingForResponse) {
        if (numberSelectorRef.current) {
          numberSelectorRef.current.reset();
        }
      }
    }, [waitingForResponse]);

    const generateResponse = useCallback((bulls: number, cows: number) => {
      return `${bulls} Bull${bulls === 1 ? "" : "s"}, ${cows} Cow${
        cows === 1 ? "" : "s"
      }`;
    }, []);

    useEffect(() => {
      if (latestPlayerGuess) {
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

          if (latestPlayerGuess.bulls === 4) {
            console.log("Player has won! Calling onPlayerWin from BotPanel");
            setPlayerWon(true);

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

    return (
      <div
        className="flex flex-col w-1/2 h-1/4 max-h-screen border-l text-center items-center"
        style={{ borderColor: "#38A3A5" }}
      >
        <div
          className="text-md font-semibold py-2"
          style={{ color: "#57CC99" }}
        >
          bot
        </div>

        <div className=" w-full px-4 flex flex-col items-center">
          {playerWon && (
            <div
              className="mb-4 p-2 rounded-lg w-full max-w-md text-center"
              style={{ backgroundColor: "#80ED99", color: "#22577A" }}
            >
              <p className="text-md font-bold">You WON!</p>
            </div>
          )}

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

          {waitingForResponse && !botWon && !playerWon && !gameOver && (
            <div
              className="mb-2 p-2 rounded-lg w-full max-w-md"
              style={{ backgroundColor: "#22577A" }}
            >
              <p className="mb-2" style={{ color: "#C7F9CC" }}>
                My guess is:{" "}
                <span className="underline font-bold">{botGuess}</span>
              </p>

              <NumberSelector ref={numberSelectorRef} />

              {invalidResponse && (
                <div className="text-sm font-bold text-red-600 bg-black/50 mb-2 rounded-sm px-1">
                  fairsystem: Your response is incorrect
                </div>
              )}

              <button
                onClick={handlePlayerResponse}
                className="px-4 py-2 mt-4 font-bold text-sm rounded text-white"
                style={{ backgroundColor: "#38A3A5" }}
              >
                Submit
              </button>
            </div>
          )}

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
