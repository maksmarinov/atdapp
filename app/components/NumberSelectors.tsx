"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

// Create a handle type to expose methods
export interface NumberSelectorHandle {
  getBullsValue: () => number;
  getCowsValue: () => number;
  reset: () => void;
}

// Make the component forwardable with a ref
const NumberSelector = forwardRef<NumberSelectorHandle>((props, ref) => {
  const [bullsValue, setBullsValue] = useState(0);
  const [cowsValue, setCowsValue] = useState(0);

  // Expose methods to the parent component through ref
  useImperativeHandle(ref, () => ({
    getBullsValue: () => bullsValue,
    getCowsValue: () => cowsValue,
    reset: () => {
      setBullsValue(0);
      setCowsValue(0);
    },
  }));

  const incrementBulls = () => {
    if (bullsValue < 4) {
      setBullsValue(bullsValue + 1);
    }
  };

  const decrementBulls = () => {
    if (bullsValue > 0) {
      setBullsValue(bullsValue - 1);
    }
  };

  const incrementCows = () => {
    if (cowsValue < 4) {
      setCowsValue(cowsValue + 1);
    }
  };

  const decrementCows = () => {
    if (cowsValue > 0) {
      setCowsValue(cowsValue - 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="text-sm mb-1" style={{ color: "#C7F9CC" }}>
          Bulls
        </div>
        <div className="w-18">
          <div
            className="flex items-center  border rounded-md overflow-hidden"
            style={{ borderColor: "#38A3A5" }}
          >
            <div
              className="flex-1 text-center py-3 text-md font-medium"
              style={{ color: "#C7F9CC" }}
            >
              {bullsValue}
            </div>
            <div
              className="flex flex-col border-l"
              style={{ borderColor: "#38A3A5" }}
            >
              <button
                onClick={incrementBulls}
                className="p-2 hover:bg-neutral-700 transition-colors"
                aria-label="Increment bulls"
                disabled={bullsValue >= 4}
                style={{ opacity: bullsValue >= 4 ? 0.5 : 1 }}
              >
                <ChevronUp className="h-4 w-4" style={{ color: "#C7F9CC" }} />
              </button>
              <div className="h-px" style={{ backgroundColor: "#38A3A5" }} />
              <button
                onClick={decrementBulls}
                className="p-2 hover:bg-neutral-700 transition-colors"
                aria-label="Decrement bulls"
                disabled={bullsValue <= 0}
                style={{ opacity: bullsValue <= 0 ? 0.5 : 1 }}
              >
                <ChevronDown className="h-4 w-4" style={{ color: "#C7F9CC" }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center border-t-2 mt-2 border-emerald-300">
        <div className="text-sm mb-1" style={{ color: "#C7F9CC" }}>
          Cows
        </div>
        <div className="w-18">
          <div
            className="flex items-center justify-between border rounded-md overflow-hidden"
            style={{ borderColor: "#38A3A5" }}
          >
            <div
              className="flex-1 text-center py-3 text-md font-medium"
              style={{ color: "#C7F9CC" }}
            >
              {cowsValue}
            </div>
            <div
              className="flex flex-col border-l"
              style={{ borderColor: "#38A3A5" }}
            >
              <button
                onClick={incrementCows}
                className="p-2 hover:bg-neutral-700 transition-colors"
                aria-label="Increment cows"
                disabled={cowsValue >= 4}
                style={{ opacity: cowsValue >= 4 ? 0.5 : 1 }}
              >
                <ChevronUp className="h-4 w-4" style={{ color: "#C7F9CC" }} />
              </button>
              <div className="h-px" style={{ backgroundColor: "#38A3A5" }} />
              <button
                onClick={decrementCows}
                className="p-2 hover:bg-neutral-700 transition-colors"
                aria-label="Decrement cows"
                disabled={cowsValue <= 0}
                style={{ opacity: cowsValue <= 0 ? 0.5 : 1 }}
              >
                <ChevronDown className="h-4 w-4" style={{ color: "#C7F9CC" }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

NumberSelector.displayName = "NumberSelector";
export default NumberSelector;
