import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { GithubMember } from "@/services/github";
import { HiddenUserCard } from "@/components/HiddenUserCard";
import { FaChessKing, FaUser } from "react-icons/fa";

interface MembersSectionProps {
  members: GithubMember[];
  /** Username of the organization owner for special highlighting */
  owner?: string;
  /** Number of hidden/secret user placeholders to display */
  hiddenUsers?: number;
}

export function MembersSection({ members, owner, hiddenUsers = 0 }: MembersSectionProps) {
  const [loadedAvatars, setLoadedAvatars] = useState<Set<number>>(new Set());

  const handleAvatarLoad = (memberId: number) => {
    setLoadedAvatars((prev) => new Set(prev).add(memberId));
  };

  if (!members || members.length === 0) {
    return null;
  }

  return (
    <section className="relative z-10 py-32 px-4 backdrop-blur-sm">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter">Group Members</h2>
            <p className="text-gray-500 mt-2 text-sm md:text-base">A young, active and innovative team</p>
          </div>
          <span className="text-xs md:text-sm text-gray-300 font-mono bg-white/5 px-3 py-1 rounded-full">
            {members.length + hiddenUsers} {members.length + hiddenUsers === 1 ? "member" : "members"}
          </span>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-green-500/30 to-transparent" />
      </div>

      {/* Members Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Render regular members */}
          {members.map((member, index) => (
            <a
              key={member.id}
              href={member.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-white/5 hover:bg-white/10 rounded-2xl p-6 transition-all duration-300 border border-white/5 hover:border-green-500/30"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative mb-4">
                  {!loadedAvatars.has(member.id) && <div className="w-20 h-20 rounded-full bg-gray-800 animate-pulse" />}
                  <Avatar
                    className={`w-20 h-20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] ${
                      loadedAvatars.has(member.id) ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <AvatarImage
                      src={member.avatar_url}
                      alt={member.login}
                      onLoad={() => handleAvatarLoad(member.id)}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gray-800 text-gray-300 text-sm">{member.login.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {/* Member indicator - different styles for owner vs regular member */}
                  {owner && member.login === owner ? (
                    // Owner: Star badge with blue color
                    <div className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                      <FaChessKing className="text-white text-xs" />
                    </div>
                  ) : (
                    // Regular member: User badge with green color
                    <div className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-green-600">
                      <FaUser className="text-white text-xs" />
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors duration-200 truncate w-full">{member.login}</h3>

                {/* Role - Owner or Member */}
                <p className="text-xs text-gray-600 group-hover:text-gray-500 transition-colors duration-200">{owner && member.login === owner ? "Owner" : "User"}</p>
              </div>
            </a>
          ))}

          {/* Hidden user placeholders */}
          {Array.from({ length: hiddenUsers }).map((_, index) => (
            <HiddenUserCard
              key={`hidden-${index}`}
              size={80}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
