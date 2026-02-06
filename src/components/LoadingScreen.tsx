import { useState, useEffect } from 'react';
import { GlitchText } from '@/components/GlitchText';

interface LoadingScreenProps {
  message?: string;
  stage?: string;
}

export function LoadingScreen({ message = 'Loading...', stage }: LoadingScreenProps) {
  const [dots, setDots] = useState('');

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Matrix-style background overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-black to-black" />
      </div>

      {/* Loading content */}
      <div className="relative z-10 flex flex-col items-center space-y-6">
        {/* Animated logo placeholder */}
        <div className="relative">
          {/* Outer glow */}
          <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse" />

          {/* Logo container */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Spinning ring */}
            <div className="absolute inset-0 border-2 border-green-500/30 rounded-full">
              <div className="absolute inset-0 border-2 border-transparent border-t-green-500 rounded-full animate-spin" />
            </div>

            {/* Inner ring */}
            <div className="absolute inset-4 border border-green-500/20 rounded-full">
              <div
                className="absolute inset-0 border border-transparent border-b-blue-500/50 rounded-full animate-spin"
                style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
              />
            </div>

            {/* Center icon */}
            <div className="relative">
              <svg
                className="w-8 h-8 text-green-500 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="flex flex-col items-center space-y-3">
          <div className="flex items-center space-x-2">
            <GlitchText text={message} />
            <span className="text-green-500 font-mono text-lg w-12 text-left">{dots}</span>
          </div>
          {/* Stage indicator */}
          {stage && <div className="text-xs text-gray-500 font-mono animate-pulse">{stage}</div>}
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1 bg-green-900/30 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-500 via-emerald-400 to-blue-500 rounded-full animate-loading-bar" />
        </div>
      </div>

      {/* CSS for custom animation */}
      <style>{`
        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
            width: 20%;
          }
          50% {
            width: 40%;
          }
          100% {
            transform: translateX(400%);
            width: 20%;
          }
        }
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Error display component
interface LoadingErrorProps {
  message: string;
  errorDetails?: string;
  onRetry?: () => void;
}

export function LoadingError({ message, errorDetails, onRetry }: LoadingErrorProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black" />
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-4 text-center max-w-lg px-4">
        {/* Error icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse" />
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 border border-red-500/30 rounded-full" />
            <div className="absolute inset-4 border border-red-500/20 rounded-full" />
            <svg
              className="relative w-10 h-10 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
        </div>

        {/* Error text */}
        <div className="space-y-1">
          <GlitchText text="ERROR" color="text-red-400" />
          <p className="text-gray-300 font-mono text-sm">{message}</p>
        </div>

        {/* Collapsible error details */}
        {errorDetails && (
          <div className="w-full">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-center w-full gap-2 px-4 py-2 text-xs font-mono text-gray-500 hover:text-gray-300 transition-colors"
            >
              <span>{showDetails ? '↓ Hide details' : '→ Show details'}</span>
            </button>

            {showDetails && (
              <div className="mt-2 p-4 bg-red-950/20 border border-red-500/20 rounded-lg text-left overflow-auto max-h-48">
                <pre className="text-xs font-mono text-red-300 whitespace-pre-wrap break-all">
                  {errorDetails}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Retry button */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-green-900/30 hover:bg-green-800/40 border border-green-500/30 rounded-lg text-green-400 font-mono text-sm transition-all duration-300 hover:scale-105"
          >
            RETRY
          </button>
        )}
      </div>
    </div>
  );
}
