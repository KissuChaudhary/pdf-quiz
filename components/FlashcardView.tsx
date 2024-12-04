import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Question } from "@/lib/schemas";

interface FlashcardViewProps {
  question: Question;
  onNext: () => void;
  onPrevious: () => void;
}

export function FlashcardView({ question, onNext, onPrevious }: FlashcardViewProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="space-y-4">
      <motion.div
        className="w-full aspect-[3/2] cursor-pointer"
        onClick={handleFlip}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="w-full h-full flex items-center justify-center p-6">
          <CardContent>
            {isFlipped ? (
              <div className="transform rotate-180">
                <h3 className="text-xl font-bold mb-4">Answer:</h3>
                <p>{question.options[question.answer.charCodeAt(0) - 65]}</p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold mb-4">Question:</h3>
                <p>{question.question}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      <div className="flex justify-between">
        <Button onClick={onPrevious} variant="ghost">
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button onClick={onNext} variant="ghost">
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

