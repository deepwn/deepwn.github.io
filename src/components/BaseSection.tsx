import type { GithubProfile } from '@/services/github';
import type { BaseSectionConfig } from '@/services/config';
import { BaseLogo } from './BaseLogo';
import { BaseInfoText } from './BaseInfoText';
import { BaseScrollTip } from './BaseScrollTip';
import { FaGithub, FaTwitter, FaMapMarker, FaEnvelope } from 'react-icons/fa';

interface BaseSectionProps {
  profile: GithubProfile | null;
  onScrollToProjects: () => void;
  /** Custom scroll tip label (default: 'More Info') */
  scrollTipLabel?: string;
  /** Base section configuration */
  config?: BaseSectionConfig;
}

export function BaseSection({
  profile,
  onScrollToProjects,
  scrollTipLabel,
  config,
}: BaseSectionProps) {
  const {
    logoSrc,
    logoScale = 1,
    disableLogo = false,
    nameFontFamily,
    nameSize,
    nameText,
    disableName = false,
    descriptionFontFamily,
    descriptionSize,
    descriptionText,
    disableDescription = false,
  } = config || {};

  // Check if all elements are disabled
  const showLogo = !disableLogo;
  const showName = !disableName;
  const showDescription = !disableDescription;
  const hasAnyContent = showLogo || showName || showDescription;

  if (!hasAnyContent) {
    return null;
  }

  return (
    <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
      {/* Animated Background Overlay - Enhanced for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70 pointer-events-none" />

      <div className="relative z-20 w-full max-w-6xl mx-auto text-center space-y-6 animate-fade-in-up">
        {/* Avatar with Glow Effect */}
        {showLogo && <BaseLogo profile={profile} customLogoSrc={logoSrc} logoScale={logoScale} />}

        {/* Name & Bio */}
        <BaseInfoText
          profile={profile}
          loading={false}
          nameFontFamily={nameFontFamily}
          nameSize={nameSize}
          nameText={nameText}
          disableName={!showName}
          descriptionFontFamily={descriptionFontFamily}
          descriptionSize={descriptionSize}
          descriptionText={descriptionText}
          disableDescription={!showDescription}
        />

        {/* Profile Links */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {profile?.location && (
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 backdrop-blur-sm">
              <FaMapMarker className="w-4 h-4 mr-2" />
              {profile.location}
            </span>
          )}
          {profile?.email && (
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-sm text-gray-300 hover:text-white backdrop-blur-sm"
            >
              <FaEnvelope className="w-4 h-4 mr-2" />
              {profile.email}
            </a>
          )}
          {profile?.html_url && (
            <a
              href={profile.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-sm text-gray-300 hover:text-white backdrop-blur-sm"
            >
              <FaGithub className="w-4 h-4 mr-2" />
              GitHub
            </a>
          )}
          {profile?.twitter_username && (
            <a
              href={`https://x.com/${profile.twitter_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-sm text-gray-300 hover:text-white backdrop-blur-sm"
            >
              <FaTwitter className="w-4 h-4 mr-2" />
              Twitter
            </a>
          )}
        </div>
      </div>

      {/* Scroll Indicator - Fused with label */}
      <BaseScrollTip label={scrollTipLabel ?? 'More Info'} onClick={onScrollToProjects} />
    </section>
  );
}
