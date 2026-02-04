import type { TypographySettings } from "@/services/config";

interface TeamSectionProps {
  typography: TypographySettings | null;
}

export function TeamSection({ typography }: TeamSectionProps) {
  // Helper to get team typography classes
  const getTeamTypographyClasses = () => {
    const teamConfig = typography?.team;
    if (!teamConfig) {
      return "text-base md:text-lg font-medium";
    }

    const sizeClasses = `${teamConfig.fontSize} ${teamConfig.fontSizeMd ? `md:${teamConfig.fontSizeMd}` : ""}`;

    return `${sizeClasses} ${teamConfig.fontWeight || "font-medium"}`;
  };

  if (typography?.team?.enabled === false) {
    return null;
  }

  return (
    <div className="pt-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
      <div
        className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl ${
          typography?.team?.background || "bg-black/50"
        } border ${typography?.team?.borderColor || "border-white/10"} backdrop-blur-xl`}
      >
        <div className="flex items-center gap-2">
          {typography?.team?.indicator?.enabled !== false && (
            <span
              className={`w-2 h-2 rounded-full ${
                typography?.team?.indicator?.color === "green" ? "bg-green-500" : "bg-blue-500"
              } ${typography?.team?.indicator?.animate !== false ? "animate-pulse" : ""}`}
            />
          )}
          <span
            className={`${getTeamTypographyClasses()} ${
              typography?.team?.textColor || "text-white"
            } drop-shadow-md`}
          >
            {typography?.team?.label || "Open to Collaborations"}
          </span>
        </div>
      </div>
    </div>
  );
}
