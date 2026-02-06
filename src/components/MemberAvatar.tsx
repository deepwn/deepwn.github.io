import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FaChessKing, FaUser } from 'react-icons/fa';

interface MemberAvatarProps {
  /** The member's avatar URL */
  avatarUrl: string;
  /** The member's username */
  username: string;
  /** The member's ID for tracking loaded state */
  memberId: number;
  /** Whether this member is the owner */
  isOwner: boolean;
}

/**
 * MemberAvatar component - handles avatar display with loading state and role indicator
 */
export function MemberAvatar({ avatarUrl, username, memberId, isOwner }: MemberAvatarProps) {
  const [loadedAvatars, setLoadedAvatars] = useState<Set<number>>(new Set());

  const handleAvatarLoad = () => {
    setLoadedAvatars(prev => new Set(prev).add(memberId));
  };

  const isLoaded = loadedAvatars.has(memberId);

  return (
    <div className="relative mb-4">
      {!isLoaded && <div className="w-20 h-20 rounded-full bg-gray-800 animate-pulse" />}
      <Avatar
        className={`w-20 h-20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <AvatarImage
          src={avatarUrl}
          alt={username}
          onLoad={handleAvatarLoad}
          className="object-cover"
        />
        <AvatarFallback className="bg-gray-800 text-gray-300 text-sm">
          {username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {/* Member indicator - different styles for owner vs regular member */}
      {isOwner ? (
        // Owner: Star badge with blue color
        <div className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
          <FaChessKing className="text-white text-xs" />
        </div>
      ) : (
        // Regular member: User badge with green color
        <div className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-green-600">
          <FaUser className="text-white text-xs" />
        </div>
      )}
    </div>
  );
}
