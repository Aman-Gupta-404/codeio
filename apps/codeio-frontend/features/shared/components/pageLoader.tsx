"use client";

import { AnimatePresence, motion } from "motion/react";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface PageLoaderProps {
  isLoading: boolean;
  className?: string;
}

const loadingMessages = [
  "Setting up your workspace...",
  "Creating your project environment...",
  "Preparing your project structure...",
  "Installing the required dependencies...",
  "Configuring your development environment...",
  "Setting up the project configuration...",
  "Preparing your files and folders...",
  "Applying the necessary settings...",
  "Running a few final setup checks...",
  "Almost there, putting everything together...",
];

export function PageLoader({ isLoading, className }: PageLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setMessageIndex((current) => {
        if (current >= loadingMessages.length - 1) {
          return 0;
        }

        return current + 1;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed inset-0 z-[99999]",
            "flex items-center justify-center",
            "bg-background/85 backdrop-blur-md",
            className,
          )}
        >
          {/* Subtle background glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.04] blur-3xl" />

            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-3xl"
            />
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 20,
            }}
            className="relative flex w-full max-w-md flex-col items-center gap-6 px-8 py-10"
          >
            {/* Animated Loader */}
            <div className="relative">
              {/* Outer glow */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.2, 0.35, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-[-12px] rounded-full bg-primary/20 blur-2xl"
              />

              {/* Secondary ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-[-5px] rounded-full border border-primary/20 border-dashed"
              />

              {/* Main loader */}
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-border bg-card shadow-xl">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            </div>

            {/* Main Message */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-lg font-semibold">
                  Preparing your workspace
                </h3>

                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                </motion.div>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                This may take a few minutes. Please don't close this page.
              </p>
            </div>

            {/* Changing Status Message */}
            <div className="flex h-6 items-center gap-2 text-center">
              <motion.span
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="h-1.5 w-1.5 rounded-full bg-primary"
              />

              <AnimatePresence mode="wait">
                <motion.p
                  key={messageIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-muted-foreground"
                >
                  {loadingMessages[messageIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
