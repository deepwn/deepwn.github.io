import type { GithubMember } from '@/services/github';
import type { SectionTitleConfig } from '@/services/config';
import { MemberNormalCard } from '@/components/MemberNormalCard';
import { MemberHiddenCard } from '@/components/MemberHiddenCard';

// Component-level config interface (matches config.ts structure)
export interface MembersSectionConfig {
  /** Section title and description */
  title?: SectionTitleConfig;
  /** Custom member count label suffix */
  countLabel?: string;
  /** Number of hidden/secret user placeholders */
  hiddenUsers?: number;
  /** Organization owner username (for special badge) */
  owner?: string;
  /** Extra GitHub usernames to add to member list */
  appendUsers?: string[];
  /** Custom separator color class */
  separatorColor?: string;
}

interface MembersSectionProps {
  members: GithubMember[];
  /** Username of the organization owner for special highlighting */
  owner?: string;
  /** Number of hidden/secret user placeholders to display */
  hiddenUsers?: number;
  /** Section customization config */
  config?: MembersSectionConfig;
}

export function MembersSection({ members, owner, hiddenUsers = 0, config }: MembersSectionProps) {
  if (!members || members.length === 0) {
    return null;
  }

  const title = config?.title?.title ?? 'Group Members';
  const description = config?.title?.description;
  const accentColor = config?.title?.accentColor ?? 'from-green-400 via-emerald-400 to-blue-400';
  const separatorColor = config?.separatorColor ?? 'from-green-500/30';
  const countLabel = config?.countLabel ?? 'members';
  const totalCount = members.length + hiddenUsers;

  return (
    <section className="relative z-10 py-32 px-4 backdrop-blur-sm">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-4xl md:text-6xl font-bold text-white">
              <span className={`bg-clip-text text-transparent bg-gradient-to-r ${accentColor}`}>
                {title}
              </span>
            </h2>
            {description && <p className="mt-2 text-xl text-gray-300">{description}</p>}
          </div>
          <span className="text-xs md:text-sm text-gray-300 font-mono bg-white/5 px-3 py-1 rounded-full">
            {totalCount}
            {totalCount === 1 ? ' member' : ` ${countLabel}`}
          </span>
        </div>
        <div className={`h-px w-full bg-gradient-to-r ${separatorColor} to-transparent`} />
      </div>

      {/* Members Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Render regular members */}
          {members.map((member, index) => (
            <MemberNormalCard key={member.id} member={member} owner={owner} index={index} />
          ))}

          {/* Hidden user placeholders */}
          {Array.from({ length: hiddenUsers }).map((_, index) => (
            <MemberHiddenCard key={`hidden-${index}`} size={80} />
          ))}
        </div>
      </div>
    </section>
  );
}
