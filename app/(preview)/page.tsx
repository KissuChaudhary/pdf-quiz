"use client";

import { useState } from "react";
import { experimental_useObject } from "ai/react";
import { questionsSchema } from "@/lib/schemas";
import { z } from "zod";
import { toast } from "sonner";
import { FileUp, Plus, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Quiz from "@/components/quiz";
import { Link } from "@/components/ui/link";
import NextLink from "next/link";
import { generateQuizTitle } from "./actions";
import { AnimatePresence, motion } from "framer-motion";
import { VercelIcon, GitIcon } from "@/components/icons";

export default function ChatWithFiles() {
  const [files, setFiles] = useState<File[]>([]);
  const [questions, setQuestions] = useState<z.infer<typeof questionsSchema>>(
    [],
  );
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState<string>();
  const [quizMode, setQuizMode] = useState<'timed' | 'practice' | 'flashcard'>('practice');

  const {
    submit,
    object: partialQuestions,
    isLoading,
  } = experimental_useObject({
    api: "/api/generate-quiz",
    schema: questionsSchema,
    initialValue: undefined,
    onError: (error) => {
      toast.error("Failed to generate quiz. Please try again.");
      setFiles([]);
    },
    onFinish: ({ object }) => {
      setQuestions(object ?? []);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari && isDragging) {
      toast.error(
        "Safari does not support drag & drop. Please use the file picker.",
      );
      return;
    }

    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(
      (file) => file.type === "application/pdf" && file.size <= 5 * 1024 * 1024,
    );
    console.log(validFiles);

    if (validFiles.length !== selectedFiles.length) {
      toast.error("Only PDF files under 5MB are allowed.");
    }

    setFiles(validFiles);
  };

  const encodeFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmitWithFiles = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const encodedFiles = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        type: file.type,
        data: await encodeFileAsBase64(file),
      })),
    );
    submit({ files: encodedFiles });
    const generatedTitle = await generateQuizTitle(encodedFiles[0].name);
    setTitle(generatedTitle);
  };

  const clearPDF = () => {
    setFiles([]);
    setQuestions([]);
  };

  const progress = partialQuestions ? (partialQuestions.length / 4) * 100 : 0;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">PDF Quiz Generator</h1>
      {questions.length === 0 ? (
        <>
          <div
            className={`relative flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 transition-colors hover:border-muted-foreground/50`}
          >
            <input
              type="file"
              onChange={handleFileChange}
              accept="application/pdf"
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <FileUp className="h-8 w-8 mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              {files.length > 0 ? (
                <span className="font-medium text-foreground">
                  {files[0].name}
                </span>
              ) : (
                <span>Drop your PDF here or click to browse.</span>
              )}
            </p>
          </div>
          <div className="mt-4 space-x-4">
            <Button
              onClick={() => setQuizMode('practice')}
              variant={quizMode === 'practice' ? 'default' : 'outline'}
            >
              Practice Mode
            </Button>
            <Button
              onClick={() => setQuizMode('timed')}
              variant={quizMode === 'timed' ? 'default' : 'outline'}
            >
              Timed Mode
            </Button>
            <Button
              onClick={() => setQuizMode('flashcard')}
              variant={quizMode === 'flashcard' ? 'default' : 'outline'}
            >
              Flashcard Mode
            </Button>
          </div>
        </>
      ) : (
        <Quiz title={title ?? "Quiz"} questions={questions} clearPDF={clearPDF} mode={quizMode} />
      )}
    </main>
  );
}

