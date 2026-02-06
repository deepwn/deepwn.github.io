import { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import type { GithubMember, GithubProfile } from '@/services/github';
import type { SectionTitleConfig } from '@/services/config';
import { Button } from './ui/button';
import { MemberNormalCard } from '@/components/MemberNormalCard';
import { MemberHiddenCard } from '@/components/MemberHiddenCard';

// Component-level config interface (matches config.ts structure)
export interface MembersSectionConfig {
  /** Section title and description */
  title?: SectionTitleConfig;
  /** Custom member count label suffix */
  countLabel?: string;
  /** Total number of members to display (if set and > actual members, shows hidden cards to fill gap) */
  memberCount?: number;
  /** Organization owner username (for special badge) */
  owner?: string;
  /** Extra GitHub usernames to add to member list */
  appendUsers?: string[];
  /** Custom separator color class */
  separatorColor?: string;
}

interface MembersSectionProps {
  members: GithubMember[];
  /** GitHub profile for linking to org members page */
  profile?: GithubProfile | null;
  /** Username of the organization owner for special highlighting */
  owner?: string;
  /** Section customization config */
  config?: MembersSectionConfig;
}

export function MembersSection({ members, profile, owner, config }: MembersSectionProps) {
  // State to control showing all members or limited (must be before early return)
  const [showAll, setShowAll] = useState(false);

  if (!members || members.length === 0) {
    return null;
  }

    const title = config?.title?.title ?? 'Group Members';
  const description = config?.title?.description;
  const accentColor = config?.title?.accentColor ?? 'from-green-400 via-emerald-400 to-blue-400';
  const separatorColor = config?.separatorColor ?? 'from-green-500/30';
  const countLabel = config?.countLabel ?? 'members';

  // memberCount setting logic:
  // - Card display: max 10 cards (or memberCount if smaller)
  // - Badge count: if memberCount > actual members, show memberCount
  const memberCount = config?.memberCount;
  const displayLimit = Math.min(10, memberCount || members.length);
  const displayedMembers = showAll ? members : members.slice(0, displayLimit);
  const hasMoreMembers = !showAll && members.length > displayLimit;
  
  // Hidden cards to show: fill gap up to displayLimit (max 10)
  const additionalHiddenUsers = (memberCount && memberCount > members.length && !showAll)
    ? Math.min(10, memberCount) - members.length
    : 0;

  // Badge count: show memberCount if it's larger than actual members
  const badgeCount = (memberCount && memberCount > members.length) ? memberCount : members.length;

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
            {badgeCount}
            {badgeCount === 1 ? ' member' : ` ${countLabel}`}
          </span>
        </div>
        <div className={`h-px w-full bg-gradient-to-r ${separatorColor} to-transparent`} />
      </div>

      {/* Members Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Render regular members */}
          {displayedMembers.map((member, index) => (
            <MemberNormalCard key={member.id} member={member} owner={owner} index={index} />
          ))}

          {/* Hidden user placeholders - supplemented to reach 10 total */}
          {Array.from({ length: additionalHiddenUsers }).map((_, index) => (
            <MemberHiddenCard key={`hidden-${index}`} size={80} />
          ))}
        </div>
      </div>

      {/* View All Members Button */}
      {members.length > 0 && (
        <div className="text-center mt-12">
          {hasMoreMembers ? (
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-green-500/50 transition-all duration-300 group"
            >
              <span>{showAll ? 'Show Less Members' : 'View All Members'}</span>
              {showAll ? (
                <ChevronUp size={16} className="group-hover:-translate-y-0.5 transition-transform" />
              ) : (
                <ChevronDown size={16} className="group-hover:translate-y-0.5 transition-transform" />
              )}
            </Button>
          ) : profile ? (
            <a
              href={`${profile?.html_url}?tab=members`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-green-500/50 transition-all duration-300 group"
            >
              <span>View All Members</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          ) : null}
        </div>
      )}
    </section>
  );
}
