import type { GithubProfile } from '@/services/github';
import { DecryptingAvatar } from './DecryptingAvatar';

interface BaseLogoProps {
  profile: GithubProfile | null;
  /** Custom logo image URL (from config) */
  customLogoSrc?: string;
  /** Logo scale factor (from config) */
  logoScale?: number;
}

export function BaseLogo({ profile, customLogoSrc, logoScale = 1 }: BaseLogoProps) {
  // Use custom logo src if provided, otherwise use GitHub avatar
  const avatarSrc = customLogoSrc || profile?.avatar_url;
  const avatarAlt = profile?.login || 'Profile';
  const avatarFallback = profile?.login?.slice(0, 2).toUpperCase() || 'PR';

  // Calculate scaled dimensions
  const baseSize = 160; // w-40 = 160px
  const scaledSize = baseSize * logoScale;

  return (
    <div className="relative inline-block">
      <div className="relative">
        {/* Avatar with DecryptingAvatar effect */}
        <DecryptingAvatar
          alt={avatarAlt}
          size={scaledSize}
          gridSize={8}
          speed={45}
          src={avatarSrc}
          mask={true}
        >
          {/* Fallback content when animation completes */}
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={avatarAlt}
              className="object-cover w-full h-full rounded-full"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center text-2xl font-bold rounded-full">
              {avatarFallback}
            </div>
          )}
        </DecryptingAvatar>
      </div>
    </div>
  );
}
