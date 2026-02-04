import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code2, Star, GitFork, ExternalLink } from "lucide-react";
import type { GithubRepo } from "@/services/github";

interface ProjectCardProps {
  repo: GithubRepo;
  index: number;
}

export function ProjectCard({ repo, index }: ProjectCardProps) {
  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card
      key={repo.id}
      className="group relative h-[320px] flex flex-col bg-black/60 border border-white/10 backdrop-blur-xl overflow-hidden hover:bg-black/70 hover:border-green-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/10 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "backwards" }}
    >
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Top Right Link */}
      <a
        href={repo.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/5 border border-white/10 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-green-500/20"
      >
        <ExternalLink size={16} className="text-green-400" />
      </a>

      <CardHeader className="relative z-10 flex-none">
        {/* Project Name Prominently Displayed */}
        <CardTitle className="text-xl font-bold text-white group-hover:text-green-400 transition-colors duration-300 flex items-center gap-2">
          <Code2 size={20} className="text-green-500 flex-shrink-0" />
          <span className="truncate">{repo.name}</span>
        </CardTitle>
        <CardDescription className="text-gray-400 text-sm flex items-center gap-2">
          <span className="text-gray-500">Updated {formatDate(repo.updated_at)}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="relative z-10 flex-grow">
        <p className="text-gray-200 text-sm leading-relaxed line-clamp-4 group-hover:text-white transition-colors">
          {repo.description || "No description provided for this project."}
        </p>
      </CardContent>

      <CardFooter className="relative z-10 flex-none flex justify-between items-center pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          {repo.language && (
            <Badge
              variant="outline"
              className="border-green-500/30 bg-green-500/10 text-green-400 text-xs font-medium px-3 py-1"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />
              {repo.language}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span
            className="flex items-center gap-1.5 hover:text-yellow-400 transition-colors cursor-default"
            title="Stars"
          >
            <Star size={14} className="group-hover:scale-110 transition-transform" />
            {repo.stargazers_count}
          </span>
          <span
            className="flex items-center gap-1.5 hover:text-blue-400 transition-colors cursor-default"
            title="Forks"
          >
            <GitFork size={14} className="group-hover:scale-110 transition-transform" />
            {repo.forks_count}
          </span>
        </div>
      </CardFooter>

      {/* Corner Accent */}
      <div className="absolute bottom-0 left-0 w-16 h-16 overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-tr from-green-500/20 to-transparent transform -rotate-45 translate-x-[-50%] translate-y-[50%]" />
      </div>
    </Card>
  );
}
