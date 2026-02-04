import { Skeleton } from "@/components/ui/skeleton";
import type { GithubProfile } from "@/services/github";

interface StatsCardsProps {
  loading: boolean;
  profile: GithubProfile | null;
  reposCount: number;
  membersCount: number;
}

export function StatsCards({ loading, profile, reposCount, membersCount }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="flex justify-center gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-32 bg-green-900/20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="flex flex-wrap justify-center gap-4 py-8">
      <div className="group relative overflow-hidden rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl px-6 py-4 hover:bg-black/70 hover:border-green-500/30 transition-all duration-500 w-32">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative text-center">
          <div className="text-3xl font-bold text-white">{profile.followers || 0}</div>
          <div className="text-sm text-gray-300 font-medium">Followers</div>
        </div>
      </div>
      <div className="group relative overflow-hidden rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl px-6 py-4 hover:bg-black/70 hover:border-blue-500/30 transition-all duration-500 w-32">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative text-center">
          <div className="text-3xl font-bold text-white">{profile.following || 0}</div>
          <div className="text-sm text-gray-300 font-medium">Following</div>
        </div>
      </div>
      <div className="group relative overflow-hidden rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl px-6 py-4 hover:bg-black/70 hover:border-purple-500/30 transition-all duration-500 w-32">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative text-center">
          <div className="text-3xl font-bold text-white">{reposCount}</div>
          <div className="text-sm text-gray-300 font-medium">Repos</div>
        </div>
      </div>
      <div className="group relative overflow-hidden rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl px-6 py-4 hover:bg-black/70 hover:border-orange-500/30 transition-all duration-500 w-32">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative text-center">
          <div className="text-3xl font-bold text-white">{membersCount}</div>
          <div className="text-sm text-gray-300 font-medium">Members</div>
        </div>
      </div>
    </div>
  );
}
