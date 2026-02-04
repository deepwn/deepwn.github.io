import { useState, useEffect, useRef } from "react";
import GlitchPage from "@/components/GlitchPage";
import { fetchConfig, fetchProfile, fetchRepos, fetchMembers, fetchUserByUsername } from "@/services/github";
import type { GithubProfile, GithubRepo, GithubMember } from "@/services/github";
import type { TypographySettings, LogoConfig, CustomLinksConfig } from "@/services/config";
import { HeroSection } from "@/components/HeroSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { MembersSection } from "@/components/MembersSection";
import { Footer } from "@/components/Footer";
import { LoadingScreen, LoadingError } from "@/components/LoadingScreen";

function App2() {
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState<string>("initializing...");
  const [error, setError] = useState<{ message: string; details?: string } | null>(null);
  const [profile, setProfile] = useState<GithubProfile | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [typography, setTypography] = useState<TypographySettings | null>(null);
  const [logoConfig, setLogoConfig] = useState<LogoConfig | null>(null);
  const [customLinks, setCustomLinks] = useState<CustomLinksConfig | undefined>(undefined);
  const [members, setMembers] = useState<GithubMember[]>([]);
  const [owner, setOwner] = useState<string | undefined>(undefined);
  const [hiddenUsers, setHiddenUsers] = useState<number>(0);
  const projectsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        setLoadingStage("get config...");
        const cfg = await fetchConfig();

        if (cfg.typography) {
          // Cast to handle Partial<TypographySettings> to TypographySettings conversion
          setTypography(cfg.typography as TypographySettings);
          
          if (cfg.typography.logo) {
            setLogoConfig(cfg.typography.logo);
          }
        }

        // Set custom links configuration
        if (cfg.customLinks) {
          setCustomLinks(cfg.customLinks);
        }

        // Determine account type from config first, fallback to 'user'
        // Note: The API response type is more authoritative, but we use config for initial call optimization
        const accountType: 'user' | 'org' = cfg.type === 'org' ? 'org' : 'user';
        
        // Fetch profile with account type for optimized API calls
        setLoadingStage("get profile...");
        const userProfile = await fetchProfile(cfg.baseAccount, accountType);
        setProfile(userProfile);

        // Re-determine account type from API response for subsequent calls (more reliable)
        const resolvedAccountType = userProfile?.type === "Organization" ? "org" : "user";
        
        // Fetch repos with resolved account type for correct API endpoint
        setLoadingStage("get repos...");
        const userRepos = await fetchRepos(cfg.baseAccount, resolvedAccountType, cfg.repoFilter);
        setRepos(userRepos);

        // Fetch members only for organizations
        if (accountType === 'org') {
          try {
            setLoadingStage("get list of members...");
            let orgMembers = await fetchMembers(cfg.baseAccount);

            // Handle memberFilter configuration
            if (cfg.memberFilter) {
              const { append_users, hidden_users, owner: ownerUsername } = cfg.memberFilter;

              // Set hidden users count for display
              if (hidden_users !== undefined) {
                setHiddenUsers(hidden_users);
              }

              // Set owner for display in MembersSection
              if (ownerUsername) {
                setOwner(ownerUsername);
              }

              // Fetch and append additional users
              if (append_users && append_users.length > 0) {
                const appendMembers: GithubMember[] = [];
                for (const username of append_users) {
                  try {
                    const user = await fetchUserByUsername(username);
                    if (user) {
                      appendMembers.push({
                        ...user,
                        isOwner: username === ownerUsername,
                      });
                    }
                  } catch (err) {
                    console.debug(`Failed to fetch user ${username}:`, err);
                  }
                }

                // Merge and deduplicate members
                if (appendMembers.length > 0) {
                  const existingIds = new Set(orgMembers.map(m => m.id));
                  const newMembers = appendMembers.filter(m => !existingIds.has(m.id));
                  orgMembers = [...orgMembers, ...newMembers];
                }
              } else if (ownerUsername) {
                // Mark owner in existing members if not in append_users
                orgMembers = orgMembers.map(m => ({
                  ...m,
                  isOwner: m.login === ownerUsername,
                }));
              }
            }

            setMembers(orgMembers);
          } catch (err) {
            console.debug("Failed to fetch organization members:", err);
            // Members might not be available for all orgs
          }
        }
      } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load GitHub data";
        setError({ message: errorMessage });
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  const scrollToProjects = () => {
    projectsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Show loading screen while fetching data
  if (loading) {
    return <LoadingScreen message="Loading" stage={loadingStage} />;
  }

  // Show error screen if loading failed
  if (error) {
    return <LoadingError message={error.message} errorDetails={error.details} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="relative w-full min-h-screen bg-black overflow-x-hidden font-sans text-white selection:bg-green-500/30">
      {/* Background Animation - Fixed at bottom layer */}
      <div className="fixed inset-0 z-0">
        <GlitchPage
          glitchColors={["#2b4539", "#61dca3", "#61b3dc"]}
          glitchSpeed={60}
          smooth={true}
          outerVignette={true}
          centerVignette={false}
          shiftSpeed={1.5}
        />
      </div>

      {/* Main Content - Above background */}
      <div className="relative z-10">
        <HeroSection
          profile={profile}
          typography={typography}
          logoConfig={logoConfig}
          customLinks={customLinks}
          onScrollToProjects={scrollToProjects}
        />

        <ProjectsSection
          ref={projectsRef}
          repos={repos}
          profile={profile}
        />

        <MembersSection members={members} owner={owner} hiddenUsers={hiddenUsers} />

        <Footer profile={profile} />
      </div>
    </div>
  );
}

export default App2;
