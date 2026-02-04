import { Skeleton } from "@/components/ui/skeleton";
import type { GithubProfile } from "@/services/github";
import type { TypographySettings } from "@/services/config";

interface NameSectionProps {
  loading: boolean;
  profile: GithubProfile | null;
  typography: TypographySettings | null;
}

// Helper function to convert glow intensity to drop-shadow class
const getGlowClass = (enabled: boolean, intensity: "low" | "medium" | "high" | undefined): string => {
  if (!enabled) return "";
  switch (intensity) {
    case "low":
      return "drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]";
    case "medium":
      return "drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]";
    case "high":
      return "drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]";
    default:
      return "drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]";
  }
};

// Helper function to get text outline shadow for better readability
const getTextOutlineClass = (): string => {
  // Creates a subtle dark outline around text for better visibility on any background
  return "drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]";
};

// Helper function to convert animation type to class
const getAnimationClass = (enabled: boolean, type: string | undefined): string => {
  if (!enabled || !type) return "";
  switch (type) {
    case "text-glow":
      return "animate-text-glow";
    case "pulse":
      return "animate-pulse";
    case "float":
      return "animate-float";
    default:
      return "";
  }
};

export function NameSection({ loading, profile, typography }: NameSectionProps) {
  // Default name configuration
  const nameConfig = typography?.name || {
    enabled: true,
    fontSize: "text-5xl",
    fontSizeMd: "md:text-7xl",
    fontSizeLg: "lg:text-8xl",
    color: "text-white",
    fontWeight: "font-bold",
    gradient: {
      enabled: true,
      from: "from-green-400",
      via: "via-blue-500",
      to: "to-purple-500",
    },
    glow: { enabled: false, intensity: "medium" as const },
    animation: { enabled: false, type: "text-glow" as const },
  };

  // Default bio configuration
  const bioConfig = typography?.bio || {
    enabled: true,
    fontSize: "text-lg",
    fontSizeMd: "md:text-xl",
    color: "text-gray-300",
    fontWeight: "font-medium",
    gradient: {
      enabled: false,
      from: "from-green-400",
      to: "to-blue-500",
    },
    glow: { enabled: false, intensity: "medium" as const },
    animation: { enabled: false, type: "text-glow" as const },
  };

  // Spacing configuration (user customizable)
  const spacing = typography?.name?.spacing || 4; // Default space-y-4
  const spacingClass = `space-y-${spacing}`;

  if (loading) {
    return (
      <div className={`${spacingClass} max-w-4xl mx-auto`}>
        <Skeleton className="h-14 md:h-20 w-72 md:w-96 mx-auto bg-green-900/20 rounded-lg" />
        <Skeleton className="h-6 w-full max-w-xl mx-auto bg-green-900/20 rounded" />
      </div>
    );
  }

  return (
    <div className={`${spacingClass} max-w-4xl mx-auto`}>
      {/* Name with gradient or solid color - only show if enabled */}
      {nameConfig.enabled !== false &&
        (nameConfig.gradient?.enabled ? (
          <h1
            className={`${nameConfig.fontSize} ${nameConfig.fontSizeMd || ""} ${nameConfig.fontSizeLg || ""} ${nameConfig.fontWeight || "font-bold"} tracking-tight bg-gradient-to-r ${nameConfig.gradient.from} ${nameConfig.gradient.via} ${nameConfig.gradient.to} bg-clip-text text-transparent ${getTextOutlineClass()} ${getGlowClass(nameConfig.glow?.enabled || false, nameConfig.glow?.intensity)} ${getAnimationClass(nameConfig.animation?.enabled || false, nameConfig.animation?.type)}`}
          >
            {profile?.name || profile?.login}
          </h1>
        ) : (
          <h1
            className={`${nameConfig.fontSize} ${nameConfig.fontSizeMd || ""} ${nameConfig.fontSizeLg || ""} ${nameConfig.fontWeight || "font-bold"} tracking-tight ${nameConfig.color} ${getTextOutlineClass()} ${getGlowClass(nameConfig.glow?.enabled || false, nameConfig.glow?.intensity)} ${getAnimationClass(nameConfig.animation?.enabled || false, nameConfig.animation?.type)}`}
          >
            {profile?.name || profile?.login}
          </h1>
        ))}

      {/* Bio description - with gradient or solid color */}
      {bioConfig.enabled !== false &&
        (bioConfig.gradient?.enabled ? (
          <p
            className={`${bioConfig.fontSize} ${bioConfig.fontSizeMd || ""} ${bioConfig.fontWeight || "font-semibold"} max-w-2xl mx-auto leading-relaxed bg-gradient-to-r ${bioConfig.gradient.from} ${bioConfig.gradient.via || ""} ${bioConfig.gradient.to} bg-clip-text text-transparent ${getTextOutlineClass()} ${getGlowClass(bioConfig.glow?.enabled || false, bioConfig.glow?.intensity)} ${getAnimationClass(bioConfig.animation?.enabled || false, bioConfig.animation?.type)}`}
          >
            {profile?.bio || "Developer & Creator"}
          </p>
        ) : (
          <p
            className={`${bioConfig.fontSize} ${bioConfig.fontSizeMd || ""} ${bioConfig.color} ${bioConfig.fontWeight || "font-semibold"} max-w-2xl mx-auto leading-relaxed ${getTextOutlineClass()} ${getGlowClass(bioConfig.glow?.enabled || false, bioConfig.glow?.intensity)} ${getAnimationClass(bioConfig.animation?.enabled || false, bioConfig.animation?.type)}`}
          >
            {profile?.bio || "Developer & Creator"}
          </p>
        ))}
    </div>
  );
}
