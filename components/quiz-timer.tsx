import React, { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";

interface QuizTimerProps {
  duration: number;
  onTimeUp: () => void;
}

export function QuizTimer({ duration, onTimeUp }: QuizTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [duration, onTimeUp]);

  const progressPercentage = (timeRemaining / duration) * 100;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2 mb-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Time Remaining: {formatTime(timeRemaining)}</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
}

