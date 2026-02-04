import { forwardRef } from "react";
import { ArrowRight } from "lucide-react";
import type { GithubProfile, GithubRepo } from "@/services/github";
import { ProjectCard } from "./ProjectCard";

interface ProjectsSectionProps {
  repos: GithubRepo[];
  profile: GithubProfile | null;
}

export const ProjectsSection = forwardRef<HTMLDivElement, ProjectsSectionProps>(
  ({ repos, profile }, ref) => {
    return (
      <section
        ref={ref}
        className="relative z-10 min-h-screen py-20 px-4 bg-black"
      >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4 animate-fade-in-up">
          <h2 className="text-4xl md:text-6xl font-bold text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-blue-400">
              Featured Projects
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            A collection of open source work and experiments
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repos.length > 0 ? (
            repos.map((repo, index) => <ProjectCard key={repo.id} repo={repo} index={index} />)
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              No projects found
            </div>
          )}
        </div>

        {/* View All Link */}
        {profile && repos.length > 0 && (
          <div className="text-center mt-12">
            <a
              href={`${profile.html_url}?tab=repositories`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-green-500/50 transition-all duration-300 group"
            >
              <span>View All Repositories</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
});
