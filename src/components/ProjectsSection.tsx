import { forwardRef } from 'react';
import { ArrowRight } from 'lucide-react';
import type { GithubProfile, GithubRepo } from '@/services/github';
import type { SectionTitleConfig } from '@/services/config';
import { ProjectCard } from './ProjectCard';

// Component-level config interface (matches config.ts structure)
export interface ProjectsSectionConfig {
  /** Section title and description */
  title?: SectionTitleConfig;
  /** Text shown when no projects found */
  emptyText?: string;
  /** Hide the "View All Repositories" link */
  hideViewAll?: boolean;
  /** Repository names to hide */
  hiddenRepos?: string[];
  /** Custom view all link text */
  viewAllText?: string;
}

interface ProjectsSectionProps {
  repos: GithubRepo[];
  profile: GithubProfile | null;
  /** Section customization config */
  config?: ProjectsSectionConfig;
}

export const ProjectsSection = forwardRef<HTMLDivElement, ProjectsSectionProps>(
  ({ repos, profile, config }, ref) => {
    const title = config?.title?.title ?? 'Featured Projects';
    const description = config?.title?.description;
    const accentColor = config?.title?.accentColor ?? 'from-green-400 via-emerald-400 to-blue-400';
    const emptyText = config?.emptyText ?? 'No projects found';
    const hideViewAll = config?.hideViewAll ?? false;
    const viewAllText = config?.viewAllText ?? 'View All Repositories';

    return (
      <section ref={ref} className="relative z-10 min-h-screen py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 space-y-4 animate-fade-in-up">
            <h2 className="text-4xl md:text-6xl font-bold text-white">
              <span className={`bg-clip-text text-transparent bg-gradient-to-r ${accentColor}`}>
                {title}
              </span>
            </h2>
            {description && (
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">{description}</p>
            )}
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repos.length > 0 ? (
              repos.map((repo, index) => <ProjectCard key={repo.id} repo={repo} index={index} />)
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">{emptyText}</div>
            )}
          </div>

          {/* View All Link */}
          {!hideViewAll && profile && repos.length > 0 && (
            <div className="text-center mt-12">
              <a
                href={`${profile.html_url}?tab=repositories`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-green-500/50 transition-all duration-300 group"
              >
                <span>{viewAllText}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          )}
        </div>
      </section>
    );
  }
);
