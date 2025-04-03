"use client";

import { useState, useEffect } from "react";
import { fetchUserScore } from "@/app/actions/score";

export default function ScoreDisplay() {
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScore = async () => {
      try {
        const userScore = await fetchUserScore();
        setScore(userScore || 0);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load score:", error);
        setLoading(false);
      }
    };

    loadScore();
  }, []);

  if (loading) {
    return (
      <div className="border rounded-md px-2 border-emerald-600 mx-1 text-center">
        Loading score...
      </div>
    );
  }

  return (
    <div className="border rounded-md px-2 border-emerald-600 mx-1 text-center">
      <h2> Score: {score}</h2>
    </div>
  );
}
