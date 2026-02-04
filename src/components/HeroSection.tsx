import type { GithubProfile, GithubRepo, GithubMember } from "@/services/github";
import type { LogoConfig, TypographySettings, CustomLinksConfig } from "@/services/config";
import { AvatarWithGlow } from "./AvatarWithGlow";
import { NameSection } from "./NameSection";
import { StatsCards } from "./StatsCards";
import { InfoPills } from "./InfoPills";
import { ScrollIndicator } from "./ScrollIndicator";

interface HeroSectionProps {
  profile: GithubProfile | null;
  repos?: GithubRepo[];
  typography: TypographySettings | null;
  logoConfig: LogoConfig | null;
  customLinks?: CustomLinksConfig;
  members?: GithubMember[];
  onScrollToProjects: () => void;
}

export function HeroSection({ profile, repos, typography, logoConfig, customLinks, members, onScrollToProjects }: HeroSectionProps) {
  return (
    <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
      {/* Animated Background Overlay - Enhanced for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70 pointer-events-none" />

      <div className="relative z-20 w-full max-w-6xl mx-auto text-center space-y-8 animate-fade-in-up">
        {/* Avatar with Glow Effect */}
        <AvatarWithGlow
          profile={profile}
          logoConfig={logoConfig}
        />

        {/* Name & Bio */}
        <NameSection
          profile={profile}
          typography={typography}
          loading={false}
        />

        {/* Stats Cards */}
        <StatsCards
          profile={profile}
          reposCount={repos?.length || 0}
          membersCount={members?.length || 0}
          loading={false}
        />

        {/* Info Pills (includes custom links) */}
        <InfoPills
          profile={profile}
          customLinks={customLinks}
        />
      </div>

      {/* Scroll Indicator - Fused with label */}
      <ScrollIndicator
        label="More Info"
        onClick={onScrollToProjects}
      />
    </section>
  );
}
