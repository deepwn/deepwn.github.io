import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

interface ScrollIndicatorProps {
  label?: string;
  onClick?: () => void;
  scrollThreshold?: number;
}

export function ScrollIndicator({
  label = "View Projects",
  onClick,
  scrollThreshold = 100,
}: ScrollIndicatorProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide after scrolling past threshold
      if (currentScrollY > scrollThreshold) {
        setIsVisible(false);
        setHasScrolled(true);
      } 
      // Show again if user scrolls back up
      else if (currentScrollY < 50 && hasScrolled) {
        setIsVisible(true);
        setTimeout(() => setHasScrolled(false), 1000);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollThreshold, hasScrolled]);

  // Auto-hide after initial load delay
  useEffect(() => {
    const hideTimer = setTimeout(() => {
      if (window.scrollY > 50) {
        setIsVisible(false);
      }
    }, 5000);

    return () => clearTimeout(hideTimer);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-8 left-1/2 -translate-x-1/2 z-50
        flex flex-col items-center gap-1
        text-white/60 font-mono text-sm
        cursor-pointer
        transition-all duration-500 ease-out
        hover:text-white
        ${hasScrolled ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"}
      `}
      aria-label={label}
    >
      {/* Label */}
      <span className="tracking-widest uppercase">{label}</span>
      
      {/* Arrow */}
      <ChevronDown 
        size={20} 
        className="animate-bounce-slow" 
      />
    </button>
  );
}
