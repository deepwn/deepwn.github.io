"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()-+=[]{}|;:,.<>?";

interface DecryptingTextProps {
  targetText: string;
  /** Total animation duration in frames (default: 30 frames) */
  speed?: number;
  className?: string;
}

export const DecryptingText: React.FC<DecryptingTextProps> = ({
  targetText,
  speed = 30,
  className = "",
}) => {
  const [currentText, setCurrentText] = useState<string>("");
  const revealIterationsRef = useRef<number[]>([]);

  // Generate random reveal iterations on mount
  useEffect(() => {
    const chars = targetText.length;
    const iterations = speed;
    revealIterationsRef.current = Array.from({ length: chars }, (_, index) => {
      // Distribute random starting points across the total time
      // Each character gets a random iteration when it should be revealed
      // 80% random distribution + 20% based on position for natural flow
      const baseRandom = Math.random() * (iterations * 0.8);
      const indexOffset = (index / chars) * (iterations * 0.2);
      return Math.floor(baseRandom + indexOffset);
    });
  }, [targetText.length, speed]);

  useEffect(() => {
    let animationFrameId: number;
    let iteration = 0;
    let isMounted = true;

    const totalIterations = speed;
    const revealIterations = revealIterationsRef.current;

    const scramble = () => {
      if (!isMounted) return;

      const newText = targetText
        .split("")
        .map((char, index) => {
          // Reveal this character when iteration reaches its random start
          if (iteration >= revealIterations[index]) {
            return targetText[index];
          }
          if (char === " ") return " ";
          return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
        })
        .join("");

      setCurrentText(newText);

      if (iteration < totalIterations) {
        iteration += 1;
        animationFrameId = requestAnimationFrame(scramble);
      } else {
        // Final frame: ensure all characters are revealed
        setCurrentText(targetText);
      }
    };

    scramble();

    return () => {
      isMounted = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [targetText, speed]);

  return (
    <motion.p
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {currentText}
    </motion.p>
  );
};
