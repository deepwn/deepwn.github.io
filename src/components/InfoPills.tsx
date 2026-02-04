import {
  FaGithub,
  FaGlobe,
  FaEnvelope,
  FaExternalLinkAlt,
  FaComments,
  FaMapMarkerAlt,
  FaBuilding,
} from "react-icons/fa";
import { SiX } from "react-icons/si";
import type { GithubProfile } from "@/services/github";
import type { CustomLinksConfig } from "@/services/config";

// Icon mapping for custom links
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FaGithub,
  SiX,
  FaGlobe,
  FaEnvelope,
  FaComments,
  Website: FaGlobe,
};

interface InfoPillsProps {
  profile: GithubProfile | null;
  customLinks?: CustomLinksConfig;
}

export function InfoPills({ profile, customLinks }: InfoPillsProps) {
  // Check if a specific URL is covered by custom links
  const isUrlCoveredByCustom = (url: string | undefined) => {
    if (!url || !customLinks?.enabled || !customLinks?.links?.length) {
      return false;
    }
    return customLinks.links.some(link => link.url === url);
  };

  // Generate custom link pills - unified styling
  const renderCustomLinkPills = () => {
    if (!customLinks?.enabled || !customLinks?.links?.length) {
      return null;
    }

    return customLinks.links.map((link, index) => {
      const IconComponent = link.icon ? iconMap[link.icon] : FaExternalLinkAlt;

      return (
        <a
          key={`custom-${index}`}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-md hover:bg-black/60 hover:border-green-500/40 transition-all duration-300 hover:scale-105 group"
        >
          <IconComponent className="text-green-400 group-hover:text-green-300 transition-colors" />
          <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{link.label}</span>
        </a>
      );
    });
  };

  // If custom links are enabled, only show them
  if (customLinks?.enabled && customLinks?.links?.length > 0) {
    return (
      <div className="flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
        {renderCustomLinkPills()}
      </div>
    );
  }

  // Default links display
  return (
    <div className="flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
      {profile?.location && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-md hover:bg-black/60 hover:border-green-500/40 transition-all duration-300 hover:scale-105">
          <FaMapMarkerAlt className="text-green-400" />
          <span className="text-sm font-medium text-gray-200">{profile.location}</span>
        </div>
      )}
      {profile?.company && !isUrlCoveredByCustom(profile.company) && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-md hover:bg-black/60 hover:border-blue-500/40 transition-all duration-300 hover:scale-105">
          <FaBuilding size={16} className="text-blue-400" />
          <span className="text-sm font-medium text-gray-200">{profile.company}</span>
        </div>
      )}
      {profile?.blog && !isUrlCoveredByCustom(profile.blog.startsWith("http") ? profile.blog : `https://${profile.blog}`) && (
        <a
          href={profile.blog.startsWith("http") ? profile.blog : `https://${profile.blog}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-md hover:bg-black/60 hover:border-cyan-500/40 transition-all duration-300 hover:scale-105 group"
        >
          <FaGlobe className="text-cyan-400 group-hover:text-cyan-300" />
          <span className="text-sm font-medium text-gray-200 group-hover:text-white">Website</span>
          <FaExternalLinkAlt className="text-gray-500 group-hover:text-cyan-400" />
        </a>
      )}
      {!isUrlCoveredByCustom(profile?.html_url) && (
        <a
          href={profile?.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-md hover:bg-black/60 hover:border-white/30 transition-all duration-300 hover:scale-105 group"
        >
          <FaGithub className="text-white group-hover:text-green-400 transition-colors" />
          <span className="text-sm font-medium text-gray-200 group-hover:text-white">GitHub</span>
          <FaExternalLinkAlt className="text-gray-500 group-hover:text-green-400" />
        </a>
      )}
      {profile?.twitter_username && (
        <a
          href={`https://twitter.com/${profile.twitter_username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-md hover:bg-black/60 hover:border-blue-500/40 transition-all duration-300 hover:scale-105 group"
        >
          <SiX className="text-blue-400 group-hover:text-blue-300" />
          <span className="text-sm font-medium text-gray-200 group-hover:text-white">Twitter</span>
          <FaExternalLinkAlt className="text-gray-500 group-hover:text-blue-400" />
        </a>
      )}
      {profile?.email && !isUrlCoveredByCustom(`mailto:${profile.email}`) && (
        <a
          href={`mailto:${profile.email}`}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-md hover:bg-black/60 hover:border-purple-500/40 transition-all duration-300 hover:scale-105 group"
        >
          <FaEnvelope className="text-purple-400 group-hover:text-purple-300" />
          <span className="text-sm font-medium text-gray-200 group-hover:text-white">Email</span>
          <FaExternalLinkAlt className="text-gray-500 group-hover:text-purple-400" />
        </a>
      )}
    </div>
  );
}
