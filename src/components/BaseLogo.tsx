import type { GithubProfile } from '@/services/github';
import { DecryptingAvatar } from './DecryptingAvatar';

interface BaseLogoProps {
  profile: GithubProfile | null;
  /** Custom logo image URL (from config) */
  customLogoSrc?: string;
  /** Logo scale factor (from config) */
  logoScale?: number;
  /** Logo shape: 'circle' (rounded-full), 'square' (rounded-none), 'none' (original shape) */
  logoShape?: 'circle' | 'square' | 'none';
}

export function BaseLogo({ profile, customLogoSrc, logoScale = 1, logoShape }: BaseLogoProps) {
  // Use custom logo src if provided, otherwise use GitHub avatar
  const avatarSrc = customLogoSrc || profile?.avatar_url;
  const avatarAlt = profile?.login || 'Profile';
  const avatarFallback = profile?.login?.slice(0, 2).toUpperCase() || 'PR';

  // Calculate scaled dimensions
  const baseSize = 160; // w-40 = 160px
  const scaledSize = baseSize * logoScale;

  // Determine border-radius class based on logoShape (default to circle if undefined)
  const shapeClass = {
    circle: 'rounded-full',
    square: 'rounded-none',
    none: '',
  }[logoShape || 'circle'] || 'rounded-full';

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
          shape={logoShape}
        >
          {/* Fallback content when animation completes */}
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={avatarAlt}
              className={`object-cover w-full h-full ${shapeClass}`}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center text-2xl font-bold ${shapeClass}`}>
              {avatarFallback}
            </div>
          )}
        </DecryptingAvatar>
      </div>
    </div>
  );
}
