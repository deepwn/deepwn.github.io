import { useState, useEffect, useRef } from 'react';
import GlitchScreen from '@/components/GlitchScreen';
import {
  fetchConfig,
  fetchProfile,
  fetchRepos,
  fetchMembers,
  fetchUserByUsername,
} from '@/services/github';
import type { GithubProfile, GithubRepo, GithubMember } from '@/services/github';
import type { AppConfig } from '@/services/config';
import { BaseSection } from '@/components/BaseSection';
import { ProjectsSection } from '@/components/ProjectsSection';
import { MembersSection } from '@/components/MembersSection';
import { Footer } from '@/components/Footer';
import { LoadingScreen, LoadingError } from '@/components/LoadingScreen';

function App2() {
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState<string>('initializing...');
  const [error, setError] = useState<{ message: string; details?: string } | null>(null);
  const [profile, setProfile] = useState<GithubProfile | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [members, setMembers] = useState<GithubMember[]>([]);
  const [owner, setOwner] = useState<string | undefined>(undefined);
  const [hiddenUsers, setHiddenUsers] = useState<number>(0);
  const projectsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        setLoadingStage('get config...');
        const cfg = await fetchConfig();
        setConfig(cfg);

        // Handle new config structure (site object)
        const siteConfig = cfg.site || cfg;
        
        // Determine account type from config first, fallback to 'user'
        const accountType: 'user' | 'org' = siteConfig.type === 'org' ? 'org' : 'user';

        // Fetch profile with account type for optimized API calls
        setLoadingStage('get profile...');
        const userProfile = await fetchProfile(siteConfig.baseAccount, accountType);
        setProfile(userProfile);

        // Re-determine account type from API response for subsequent calls (more reliable)
        const resolvedAccountType = userProfile?.type === 'Organization' ? 'org' : 'user';

        // Fetch repos with resolved account type for correct API endpoint
        const hiddenRepos = cfg.sections?.projects?.hiddenRepos || [];
        setLoadingStage('get repos...');
        const userRepos = await fetchRepos(siteConfig.baseAccount, resolvedAccountType, { hidden_repos: hiddenRepos });
        setRepos(userRepos);

        // Fetch members only for organizations
        if (accountType === 'org') {
          try {
            setLoadingStage('get list of members...');
            let orgMembers = await fetchMembers(siteConfig.baseAccount);

            // Get members configuration
            const membersConfig = cfg.sections?.members;
            
            const append_users = membersConfig?.appendUsers || [];
            const hidden_users = membersConfig?.hiddenUsers;
            const ownerUsername = membersConfig?.owner;

            // Set hidden users count for display
            if (hidden_users !== undefined) {
              setHiddenUsers(hidden_users);
            }

            // Set owner for display in MembersSection
            if (ownerUsername) {
              setOwner(ownerUsername);
            }

            // Fetch and append additional users
            if (append_users.length > 0) {
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

            setMembers(orgMembers);
          } catch (err) {
            console.debug('Failed to fetch organization members:', err);
            // Members might not be available for all orgs
          }
        }
      } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load GitHub data';
        setError({ message: errorMessage });
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  const scrollToProjects = () => {
    projectsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Show loading screen while fetching data
  if (loading) {
    return <LoadingScreen message="Loading" stage={loadingStage} />;
  }

  // Show error screen if loading failed
  if (error) {
    return (
      <LoadingError
        message={error.message}
        errorDetails={error.details}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Get section configs
  const sectionsConfig = config?.sections;

  const showBase = sectionsConfig?.base?.enabled ?? true;
  const showProjects = sectionsConfig?.projects?.enabled ?? true;
  const showMembers = sectionsConfig?.members?.enabled ?? true;
  const showFooter = sectionsConfig?.footer?.enabled ?? true;

  // Get theme overrides
  const themeConfig = config?.theme;
  const customColors = themeConfig?.colors;
  const customBackground = themeConfig?.background;

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden font-sans text-white selection:bg-green-500/30" style={customBackground?.main ? { background: customBackground.main } : undefined}>
      {/* Background Animation - Fixed at bottom layer */}
      <div className="fixed inset-0 z-0">
        <GlitchScreen
          glitchColors={customColors?.accent ? ['#2b4539', customColors.accent, '#61b3dc'] : ['#2b4539', '#61dca3', '#61b3dc']}
          glitchSpeed={60}
          smooth={true}
          outerVignette={true}
          centerVignette={false}
          shiftSpeed={1.5}
        />
      </div>

      {/* Custom background gradient override */}
      {customBackground?.gradient && (
        <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: customBackground.gradient }} />
      )}

      {/* Main Content - Above background */}
      <div className="relative z-10">
        {showBase && (
          <BaseSection
            profile={profile}
            onScrollToProjects={scrollToProjects}
            scrollTipLabel={sectionsConfig?.base?.scrollTipLabel}
            config={sectionsConfig?.base}
          />
        )}

        {showProjects && (
          <ProjectsSection
            ref={projectsRef}
            repos={repos}
            profile={profile}
            config={sectionsConfig?.projects}
          />
        )}

        {showMembers && (
          <MembersSection
            members={members}
            owner={owner}
            hiddenUsers={hiddenUsers}
            config={sectionsConfig?.members}
          />
        )}

        {showFooter && (
          <Footer
            profile={profile}
            customText={sectionsConfig?.footer?.customText}
            hideBuiltWith={sectionsConfig?.footer?.hideBuiltWith}
          />
        )}
      </div>
    </div>
  );
}

export default App2;
