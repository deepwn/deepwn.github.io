import type { GithubMember } from '@/services/github';
import { MemberAvatar } from '@/components/MemberAvatar';

interface MemberNormalCardProps {
  /** The member data */
  member: GithubMember;
  /** Username of the organization owner for special highlighting */
  owner?: string;
  /** Index for animation delay */
  index: number;
}

/**
 * MemberNormalCard component - displays a regular member card with avatar, name, and role
 */
export function MemberNormalCard({ member, owner, index }: MemberNormalCardProps) {
  const isOwner = owner !== undefined && member.login === owner;

  return (
    <a
      href={member.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative bg-white/5 hover:bg-white/10 rounded-2xl p-6 transition-all duration-300 border border-white/5 hover:border-green-500/30"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex flex-col items-center text-center">
        {/* Avatar with loading state and role indicator */}
        <MemberAvatar
          avatarUrl={member.avatar_url}
          username={member.login}
          memberId={member.id}
          isOwner={isOwner}
        />

        {/* Name */}
        <h3 className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors duration-200 truncate w-full">
          {member.login}
        </h3>

        {/* Role - Owner or Member */}
        <p className="text-xs text-gray-600 group-hover:text-gray-500 transition-colors duration-200">
          {isOwner ? 'Owner' : 'User'}
        </p>
      </div>
    </a>
  );
}
