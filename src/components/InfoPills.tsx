import { MapPin, Building, Globe, Github, ExternalLink, Mail } from "lucide-react";
import type { GithubProfile, CustomLinksConfig } from "@/services/github";

// Icon mapping for custom links
const iconMap: Record<string, React.ComponentType<{ className?: string; width?: number; height?: number }>> = {
  Github: ({ className }: { className?: string }) => (
    <Github className={className} />
  ),
  Twitter: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  Linkedin: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
      <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
    </svg>
  ),
  Mail: ({ className }: { className?: string }) => (
    <Mail className={className} />
  ),
  Website: ({ className }: { className?: string }) => (
    <Globe className={className} />
  ),
  ExternalLink: ({ className }: { className?: string }) => (
    <ExternalLink className={className} />
  ),
};

// Helper to render icon with consistent sizing
function renderIcon(
  IconComponent: React.ComponentType<{ className?: string; width?: number; height?: number }> | undefined,
  size: number,
  className: string
) {
  if (!IconComponent) {
    return <ExternalLink size={size} className={className} />;
  }

  // Check if it's a Lucide icon (has 'size' prop) or custom SVG
  if (size !== 16) {
    // For Lucide icons, use size prop
    return <IconComponent size={size} className={className} />;
  }

  // For custom SVGs or default size, render as-is
  return <IconComponent className={className} />;
}

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
      const IconComponent = link.icon ? iconMap[link.icon] : ExternalLink;

      return (
        <a
          key={`custom-${index}`}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-md hover:bg-black/60 hover:border-green-500/40 transition-all duration-300 hover:scale-105 group"
        >
          {renderIcon(IconComponent, 16, "text-green-400 group-hover:text-green-300 transition-colors")}
          <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{link.label}</span>
          <ExternalLink size={12} className="text-gray-500 group-hover:text-green-400 transition-colors" />
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
          <MapPin size={16} className="text-green-400" />
          <span className="text-sm font-medium text-gray-200">{profile.location}</span>
        </div>
      )}
      {profile?.company && !isUrlCoveredByCustom(profile.company) && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-md hover:bg-black/60 hover:border-blue-500/40 transition-all duration-300 hover:scale-105">
          <Building size={16} className="text-blue-400" />
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
          <Globe size={16} className="text-cyan-400 group-hover:text-cyan-300" />
          <span className="text-sm font-medium text-gray-200 group-hover:text-white">Website</span>
          <ExternalLink size={12} className="text-gray-500 group-hover:text-cyan-400" />
        </a>
      )}
      {!isUrlCoveredByCustom(profile?.html_url) && (
        <a
          href={profile?.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-md hover:bg-black/60 hover:border-white/30 transition-all duration-300 hover:scale-105 group"
        >
          <Github size={16} className="text-white group-hover:text-green-400 transition-colors" />
          <span className="text-sm font-medium text-gray-200 group-hover:text-white">GitHub</span>
          <ExternalLink size={12} className="text-gray-500 group-hover:text-green-400" />
        </a>
      )}
      {profile?.twitter_username && (
        <a
          href={`https://twitter.com/${profile.twitter_username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-md hover:bg-black/60 hover:border-blue-500/40 transition-all duration-300 hover:scale-105 group"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" className="text-blue-400 group-hover:text-blue-300">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span className="text-sm font-medium text-gray-200 group-hover:text-white">Twitter</span>
          <ExternalLink size={12} className="text-gray-500 group-hover:text-blue-400" />
        </a>
      )}
      {profile?.email && !isUrlCoveredByCustom(`mailto:${profile.email}`) && (
        <a
          href={`mailto:${profile.email}`}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-md hover:bg-black/60 hover:border-purple-500/40 transition-all duration-300 hover:scale-105 group"
        >
          <Mail size={16} className="text-purple-400 group-hover:text-purple-300" />
          <span className="text-sm font-medium text-gray-200 group-hover:text-white">Email</span>
          <ExternalLink size={12} className="text-gray-500 group-hover:text-purple-400" />
        </a>
      )}
    </div>
  );
}
