import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { GithubMember } from "@/services/github";

interface MembersSectionProps {
  members: GithubMember[];
}

export function MembersSection({ members }: MembersSectionProps) {
  const [loadedAvatars, setLoadedAvatars] = useState<Set<number>>(new Set());

  const handleAvatarLoad = (memberId: number) => {
    setLoadedAvatars((prev) => new Set(prev).add(memberId));
  };

  if (!members || members.length === 0) {
    return null;
  }

  return (
    <section className="relative z-10 py-20 px-4">
      <div className="max-w-7xl mx-auto bg-gradient-to-b from-white/5 to-transparent backdrop-blur-2xl rounded-3xl border border-white/5 p-8 md:p-12 shadow-[0_0_40px_-10px_rgba(0,0,0,0.8)]">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-blue-400">
              Team Members
            </span>
          </h2>
          <p className="text-lg text-gray-300">
            {members.length} {members.length === 1 ? "member" : "members"} building the future
          </p>
        </div>

        {/* Members Grid */}
        <div className="flex flex-wrap justify-center gap-10">
          {members.map((member, index) => (
            <a
              key={member.id}
              href={member.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Avatar Container */}
              <div className="relative">
                {/* Loading placeholder */}
                {!loadedAvatars.has(member.id) && (
                  <div className="w-16 h-16 rounded-full bg-gray-800 animate-pulse" />
                )}

                {/* Avatar with shadcn UI */}
                <Avatar
                  className={`w-16 h-16 transition-all duration-300 group-hover:scale-110 group-hover:ring-2 group-hover:ring-green-500/50 ${
                    loadedAvatars.has(member.id) ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <AvatarImage
                    src={member.avatar_url}
                    alt={member.login}
                    onLoad={() => handleAvatarLoad(member.id)}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-green-600 to-blue-600 text-white">
                    {member.login.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Glow Effect - positioned behind avatar */}
                <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-green-500/30 via-emerald-500/20 to-blue-500/30 blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />
              </div>

              {/* Member Name */}
              <div className="mt-4">
                <span className="text-base font-medium text-gray-300 group-hover:text-white transition-all duration-300 relative inline-block">
                  {member.login}
                  {/* Underline animation */}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 group-hover:w-full transition-all duration-300" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
