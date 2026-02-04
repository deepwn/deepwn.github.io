import { useState, useEffect } from "react";

// Glitch character set - tech/matrix style (auto generated unicode symbols)
const GLITCH_CHARS: string[] = [
  "█",
  "▓",
  "▒",
  "░",
  "▄",
  "▀",
  "■",
  "□",
  "▲",
  "△",
  "◆",
  "◇",
  "◈",
  "◉",
  "★",
  "☆",
  "☼",
  "☾",
  "♠",
  "♣",
  "♥",
  "♦",
  "†",
  "‡",
  "§",
  "¶",
  "©",
  "®",
  "∑",
  "∏",
  "√",
  "∞",
  "∫",
  "≈",
  "≠",
  "≤",
  "≥",
  "α",
  "β",
  "γ",
  "δ",
  "ε",
  "ζ",
  "η",
  "θ",
  "λ",
  "μ",
  "⌘",
  "⌥",
  "⎔",
  "⌨",
  "◊",
  "©",
  "™",
  "◦",
  "•",
  "○",
  "▶",
  "◀",
  "◈",
  "▣",
  "▤",
  "▥",
  "▦",
  "▧",
  "▨"
];

interface GlitchTextProps {
  text: string;
  color?: string;
  fontFamily?: string;
  letterSpacing?: string;
  fontSize?: string;
}

export function GlitchText({ text, color = "text-green-400", fontFamily = "font-mono", letterSpacing = "tracking-wider", fontSize = "text-lg" }: GlitchTextProps) {
  const [displayedText, setDisplayedText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    let glitchTimeout: ReturnType<typeof setTimeout>;
    let nextGlitchTimeout: ReturnType<typeof setTimeout>;

    const triggerGlitch = () => {
      // Random time between glitches: 100ms to 800ms
      const randomDelay = Math.floor(Math.random() * 700) + 100;

      nextGlitchTimeout = setTimeout(() => {
        setIsGlitching(true);

        // Generate glitched text: replace 1-2 random characters
        const chars = text.split("");
        const glitchCount = Math.random() > 0.5 ? 1 : 2; // 50% chance of 1 or 2 chars
        const positions: number[] = [];

        for (let i = 0; i < glitchCount; i++) {
          const pos = Math.floor(Math.random() * chars.length);
          if (!positions.includes(pos)) {
            positions.push(pos);
          }
        }

        const glitchedChars = chars.map((char, index) => {
          if (positions.includes(index)) {
            return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          }
          return char;
        });

        setDisplayedText(glitchedChars.join(""));

        // Glitch duration: 50ms to 150ms
        const glitchDuration = Math.floor(Math.random() * 100) + 50;

        glitchTimeout = setTimeout(() => {
          setDisplayedText(text);
          setIsGlitching(false);
          // Schedule next glitch
          triggerGlitch();
        }, glitchDuration);
      }, randomDelay);
    };

    // Start the glitch cycle
    triggerGlitch();

    return () => {
      clearTimeout(glitchTimeout);
      clearTimeout(nextGlitchTimeout);
    };
  }, [text]);

  return (
    <span className={`${color} ${fontFamily} ${letterSpacing} ${fontSize} ${isGlitching ? "opacity-80" : "opacity-100"} transition-opacity duration-75`}>{displayedText}</span>
  );
}
