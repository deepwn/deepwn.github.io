import { useState } from "react";
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
    <section className="relative z-10 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Team Members</h2>
          <p className="text-gray-400">
            {members.length} {members.length === 1 ? "member" : "members"}
          </p>
        </div>

        {/* Members Grid */}
        <div className="flex flex-wrap justify-center gap-6">
          {members.map((member) => (
            <a
              key={member.id}
              href={member.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
            >
              {/* Avatar Container with Glow */}
              <div className="relative">
                {/* Loading placeholder */}
                {!loadedAvatars.has(member.id) && (
                  <div className="w-16 h-16 rounded-full bg-gray-800 animate-pulse" />
                )}

                {/* Avatar Image */}
                <img
                  src={member.avatar_url}
                  alt={member.login}
                  onLoad={() => handleAvatarLoad(member.id)}
                  className={`w-16 h-16 rounded-full object-cover transition-all duration-300 group-hover:scale-110 ${
                    loadedAvatars.has(member.id) ? "opacity-100" : "opacity-0"
                  }`}
                />

                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500/30 via-emerald-500/20 to-blue-500/30 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              </div>

              {/* Member Name */}
              <div className="mt-2 text-center">
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  {member.login}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
