import type { GithubProfile } from "@/services/github";
import type { LogoConfig } from "@/services/config";

interface AvatarWithGlowProps {
  profile: GithubProfile | null;
  logoConfig: LogoConfig | null;
}

export function AvatarWithGlow({ profile, logoConfig }: AvatarWithGlowProps) {
  // Helper to get logo size classes with optional scale
  const getLogoSizeClasses = () => {
    const config = logoConfig;
    // Base sizes
    let baseClasses = "w-40 h-40 md:w-48 md:h-48";

    // Apply scale multiplier if configured
    if (config?.scale && config.scale !== 1) {
      // For common scale values, map to appropriate Tailwind sizes
      switch (config.scale) {
        case 0.5:
          baseClasses = "w-20 h-20 md:w-24 md:h-24";
          break;
        case 0.75:
          baseClasses = "w-28 h-28 md:w-32 md:h-32";
          break;
        case 1.25:
          baseClasses = "w-48 h-48 md:w-56 md:h-56";
          break;
        case 1.5:
          baseClasses = "w-56 h-56 md:w-64 md:h-64";
          break;
        case 2:
          baseClasses = "w-72 h-72 md:w-80 md:h-80";
          break;
        default:
          // Use arbitrary value for custom scale
          baseClasses = `[w:calc(10rem*${config.scale})] [h:calc(10rem*${config.scale})]`;
      }
    }

    return baseClasses;
  };

  // Helper to get border class (outer border, not ring)
  const getBorderClass = () => {
    const config = logoConfig;
    if (!config || !config.border) return "";
    return `border-${config.borderWidth} ${config.borderColor}`;
  };

  // Helper to get ring class (inner shadow ring)
  const getRingClass = () => {
    const config = logoConfig;
    // No ring when shape is 'none' or border is explicitly false
    if (config?.shape === "none" || config?.border === false) {
      return "";
    }
    return "ring-4 ring-black/50";
  };

  // Helper to get shape class to override Avatar's default rounded-full
  const getShapeClass = () => {
    const config = logoConfig;
    if (!config || config.shape === "circle" || !config.shape) {
      return "rounded-full";
    }
    if (config.shape === "square") {
      return "rounded-lg";
    }
    // shape === "none" - no border radius
    return "rounded-none";
  };

  // Helper to get glow blur class based on shape
  const getGlowShapeClass = () => {
    const config = logoConfig;
    if (!config || config.shape === "circle" || !config.shape) return "rounded-full";
    if (config.shape === "square") return "rounded-lg";
    return "";
  };

  // Avatar content with optional link wrapper
  // Use custom logo src if configured, otherwise fall back to GitHub avatar
  const avatarSrc = logoConfig?.src || profile?.avatar_url;
  const avatarAlt = logoConfig?.src ? "Logo" : profile?.login;
  const avatarFallback = logoConfig?.src ? "LOGO" : profile?.login?.slice(0, 2).toUpperCase();

  const avatarContent = (
    <div
      className={`${getLogoSizeClasses()} ${getBorderClass()} ${getRingClass()} ${getShapeClass()} shadow-2xl group-hover:scale-105 transition-transform duration-500 ease-out overflow-hidden relative`}
    >
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={avatarAlt}
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center text-2xl font-bold">
          {avatarFallback}
        </div>
      )}
    </div>
  );

  return (
    <div className="relative inline-block group">
      <div
        className={`absolute -inset-4 bg-gradient-to-r from-green-500/30 via-emerald-500/20 to-blue-500/30 blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out animate-pulse-slow ${getGlowShapeClass()}`}
      />
      <div className="relative">
        {/* If href is set, wrap avatar in anchor tag */}
        {logoConfig?.href ? (
          <a
            href={logoConfig.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            {avatarContent}
          </a>
        ) : (
          avatarContent
        )}
        {/* Online Indicator */}
        {profile && logoConfig?.onlineIndicator?.enabled !== false && (
          <div
            className={`absolute bottom-2 right-2 w-5 h-5 ${
              logoConfig?.onlineIndicator?.color === "green"
                ? "bg-green-500"
                : "bg-blue-500"
            } rounded-full border-4 border-black ${
              logoConfig?.onlineIndicator?.color === "green" ? "animate-pulse" : ""
            }`}
          />
        )}
      </div>
    </div>
  );
}
