import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { GlitchText } from '@/components/GlitchText';
import { FaUserSecret, FaLock } from 'react-icons/fa';

// Glitch character set for the question mark effect
const GLITCH_CHARS: string[] = [
  '?',
  '¿',
  '⁇',
  '⁈',
  '⁉',
  '◊',
  '◇',
  '◆',
  '○',
  '●',
  '□',
  '■',
  '▲',
  '△',
  '▼',
  '▽',
  '★',
  '☆',
  '◉',
  '◈',
  '▣',
  '▤',
  '▥',
  '▦',
  '▧',
  '▨',
  '▓',
  '▒',
  '░',
  '█',
  '▄',
  '▀',
];

interface GlitchAvatarProps {
  /** Initial username for the glitch effect */
  username?: string;
  /** Size of the avatar */
  size?: number;
  /** Show anonymous icon instead of question mark */
  anonymous?: boolean;
}

export function GlitchAvatar({ username = '?', size = 80, anonymous = false }: GlitchAvatarProps) {
  const [fallbackChar, setFallbackChar] = useState('?');

  // Update display name with glitch effect
  useEffect(() => {
    const interval = setInterval(
      () => {
        if (anonymous) {
          // For anonymous mode, randomize the icon
          setFallbackChar(GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]);
        } else if (username === '?') {
          // For question mark avatar, randomize the char
          setFallbackChar(GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]);
        }
      },
      100 + Math.random() * 200
    ); // Random interval 100-300ms

    return () => clearInterval(interval);
  }, [username, anonymous]);

  return (
    <Avatar className="relative" style={{ width: size, height: size }}>
      {/* Anonymous user icon or question mark */}
      <AvatarFallback
        className="bg-gray-800 text-gray-400 font-mono"
        style={{ width: size, height: size, fontSize: anonymous ? size * 0.4 : size * 0.5 }}
      >
        {anonymous ? (
          // Anonymous user icon from react-icons
          <FaUserSecret className="w-full h-full p-1" />
        ) : (
          fallbackChar
        )}
      </AvatarFallback>
    </Avatar>
  );
}

// Hidden user placeholder card component
interface MemberHiddenCardProps {
  size?: number;
}

export function MemberHiddenCard({ size = 80 }: MemberHiddenCardProps) {
  const [glitchName] = useState(() => {
    const length = 5 + Math.floor(Math.random() * 6); // 5-10 characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  });

  return (
    <div className="group relative bg-white/5 hover:bg-white/10 rounded-2xl p-6 transition-all duration-300 border border-white/5 hover:border-green-500/30 cursor-default">
      <div className="flex flex-col items-center text-center animate-pulse">
        {/* Anonymous Avatar */}
        <div className="relative mb-4">
          <GlitchAvatar username="?" size={size} anonymous={true} />
          {/* Lock icon indicator */}
          <div className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-gray-600">
            <FaLock className="text-white text-xs" />
          </div>
          {/* Glitch overlay effect */}
          <div className="absolute inset-0 rounded-full bg-green-500/10 pointer-events-none" />
        </div>

        {/* Glitchy Username using GlitchText component */}
        <h3 className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors duration-200 truncate w-full font-mono">
          <GlitchText
            text={glitchName}
            color="text-gray-400 group-hover:text-white"
            fontSize="text-sm"
          />
        </h3>

        {/* Role Label */}
        <p className="text-xs text-gray-600 group-hover:text-gray-500 transition-colors duration-200">
          Private
        </p>
      </div>
    </div>
  );
}
