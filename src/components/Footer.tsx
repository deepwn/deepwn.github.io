import type { GithubProfile } from '@/services/github';

interface FooterProps {
  profile: GithubProfile | null;
  /** Custom footer text (leave empty for default) */
  customText?: string;
  /** Hide the "Built with" text */
  hideBuiltWith?: boolean;
}

export function Footer({ profile, customText, hideBuiltWith }: FooterProps) {
  return (
    <footer className="relative z-10 py-12 px-4 border-t border-white/5 bg-black/80 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <p className="text-gray-400 text-sm">
          {customText ||
            `© ${new Date().getFullYear()} ${profile?.name || profile?.login}. All rights reserved.`}
        </p>
        {!hideBuiltWith && (
          <p className="text-gray-500 text-xs">Built with React, TypeScript & Tailwind CSS</p>
        )}
      </div>
    </footer>
  );
}
