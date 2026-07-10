"use client";

import { AnimatePresence, motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
  isLoading: boolean;
  message?: string;
  className?: string;
}

export function PageLoader({
  isLoading = true,
  message = "Loading your content...",
  className,
}: PageLoaderProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed inset-0",
            "z-[99999]",
            "flex items-center justify-center",
            "bg-background/80 backdrop-blur-md",
            className,
          )}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 20,
            }}
            className="flex flex-col items-center gap-6 rounded-2xl px-8 py-10"
          >
            {/* Animated Loader */}
            <div className="relative">
              {/* Glowing background */}
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse" />

              {/* Outer Ring */}
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-border bg-card shadow-xl">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            </div>

            {/* Text */}
            <div className="text-center">
              <h3 className="text-lg font-semibold">{message}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Please wait...
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
