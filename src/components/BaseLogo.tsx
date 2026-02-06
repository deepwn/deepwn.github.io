import type { GithubProfile } from '@/services/github';

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
        {/* Avatar */}
        <div
          className="rounded-full overflow-hidden"
          style={{
            width: `${scaledSize}px`,
            height: `${scaledSize}px`,
          }}
        >
          {avatarSrc ? (
            <img src={avatarSrc} alt={avatarAlt} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center text-2xl font-bold">
              {avatarFallback}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
