import type { GithubProfile } from "@/services/github";

interface FooterProps {
  profile: GithubProfile | null;
}

export function Footer({ profile }: FooterProps) {
  return (
    <footer className="relative z-10 py-12 px-4 border-t border-white/5 bg-black/80 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} {profile?.name || profile?.login}. All rights reserved.
        </p>
        <p className="text-gray-500 text-xs">
          Built with React, TypeScript & Tailwind CSS
        </p>
      </div>
    </footer>
  );
}
