export interface TypographyConfig {
  enabled: boolean;
  fontSize: string;
  fontSizeMd?: string;
  fontSizeLg?: string;
  color: string;
  fontWeight?: string;
  /** Vertical spacing between name and bio (default: 4) */
  spacing?: number;
  gradient?: {
    enabled: boolean;
    from: string;
    via: string;
    to: string;
  };
  glow?: {
    enabled: boolean;
    intensity: 'low' | 'medium' | 'high';
  };
  animation?: {
    enabled: boolean;
    type: 'pulse' | 'text-glow' | 'float';
  };
}

export interface BioTypographyConfig {
  enabled: boolean;
  fontSize: string;
  fontSizeMd?: string;
  color: string;
  fontWeight: string;
  /** Optional gradient for bio text */
  gradient?: {
    enabled: boolean;
    from: string;
    via?: string;
    to: string;
  };
  glow?: {
    enabled: boolean;
    intensity: 'low' | 'medium' | 'high';
  };
  animation?: {
    enabled: boolean;
    type: 'pulse' | 'text-glow' | 'float';
  };
}

export interface LogoConfig {
  enabled: boolean;
  shape: 'circle' | 'square' | 'none';
  border: boolean;
  borderColor: string;
  borderWidth: string;
  /** Custom image URL to replace GitHub avatar - if set, this image is used instead of GitHub avatar */
  src?: string;
  /** Logo link URL - if set, logo becomes clickable link */
  href?: string;
  /** Logo size scale (default: 1) - multiplier for base size, e.g., 1.5 for 1.5x size */
  scale?: number;
  onlineIndicator: {
    enabled: boolean;
    color: string;
  };
}

export interface TeamTypographyConfig {
  enabled: boolean;
  label: string;
  fontSize: string;
  fontSizeMd?: string;
  fontWeight: string;
  textColor: string;
  background: string;
  borderColor: string;
  indicator?: {
    enabled: boolean;
    color: string;
    animate: boolean;
  };
}

export interface TypographySettings {
  name: TypographyConfig;
  bio: BioTypographyConfig;
  logo: LogoConfig;
  team: TeamTypographyConfig;
}

export interface RepoFilterConfig {
  /** Array of repository names to hide (blacklist) - takes priority over whitelist */
  hidden_repos?: string[];
  /** Array of repository names to show (whitelist) - ignored if hidden_repos is set */
  listing_repos?: string[];
}

export interface CustomLink {
  /** Button label text */
  label: string;
  /** Target URL to navigate to */
  url: string;
  /** Lucide icon name (optional, without 'Icon' suffix) */
  icon?: string;
  /** Button style variant */
  variant?: 'default' | 'outline' | 'ghost';
  /** Custom color class */
  color?: string;
}

export interface CustomLinksConfig {
  /** Whether to show custom links section */
  enabled: boolean;
  /** Array of custom link buttons */
  links: CustomLink[];
}

export interface AppConfig {
  baseAccount: string;
  type?: 'user' | 'org';
  /** Repository filtering configuration */
  repoFilter?: RepoFilterConfig;
  /** Custom links configuration */
  customLinks?: CustomLinksConfig;
  typography?: Partial<TypographySettings>;
}

export interface GithubProfile {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  location: string;
  blog: string;
  company: string;
  created_at: string;
  type: 'User' | 'Organization';
  twitter_username?: string;
  email?: string;
}

export interface GithubRepo {
  id: number;
  name: string;
  html_url: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics: string[];
  homepage: string;
}

export const fetchConfig = async (): Promise<AppConfig> => {
  const response = await fetch('/config.json');
  if (!response.ok) {
    throw new Error('Failed to load config');
  }
  return response.json();
};

// GraphQL API helper - returns null if no token or error
const fetchGraphQL = async <T>(query: string, variables: Record<string, unknown> = {}): Promise<T | null> => {
  const token = import.meta.env?.VITE_GITHUB_TOKEN;

  if (!token) {
    console.warn('[GraphQL] No token available, skipping GraphQL request');
    return null;
  }

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      console.warn('[GraphQL] Request failed with status:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.errors) {
      console.warn('[GraphQL] Response contains errors:', data.errors);
      return null;
    }

    return data.data as T;
  } catch (error) {
    console.warn('[GraphQL] Request failed:', error);
    return null;
  }
};

// Unified fallback fetcher: GraphQL → REST
async function fetchWithFallback<T>(
  graphqlFn: () => Promise<T | null>,
  restFn: () => Promise<T>,
  dataName: string
): Promise<T> {
  // Step 1: Try GraphQL
  try {
    const graphqlResult = await graphqlFn();
    if (graphqlResult) {
      console.log(`[API] ✓ ${dataName} fetched via GraphQL`);
      return graphqlResult;
    }
  } catch (error) {
    console.warn(`[API] ✗ ${dataName} GraphQL failed:`, error instanceof Error ? error.message : error);
  }

  // Step 2: Try REST API
  try {
    const restResult = await restFn();
    console.log(`[API] ✓ ${dataName} fetched via REST API`);
    return restResult;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : error;
    console.warn(`[API] ✗ ${dataName} REST API failed:`, errorMessage);
    throw new Error(`Failed to fetch ${dataName}: GraphQL failed, then REST API failed: ${errorMessage}`);
  }
}

// GraphQL queries
const PROFILE_QUERY = `
  query ($login: String!) {
    user(login: $login) {
      login
      name
      avatarUrl
      bio
      url
      publicRepos
      followers {
        totalCount
      }
      following {
        totalCount
      }
      location
      websiteUrl
      company
      createdAt
      ... on Organization {
        members {
          totalCount
        }
      }
    }
  }
`;

const REPOS_QUERY = `
  query ($login: String!, $first: Int!) {
    user(login: $login) {
      repositories(first: $first, orderBy: { field: STARGAZERS_COUNT, direction: DESC }, ownerAffiliations: OWNER, isFork: false) {
        nodes {
          id
          name
          url
          description
          primaryLanguage {
            name
          }
          stargazerCount
          forkCount
          updatedAt
          topics(first: 5) {
            nodes {
              name
            }
          }
          homepageUrl
        }
      }
    }
  }
`;

const ORG_REPOS_QUERY = `
  query ($login: String!, $first: Int!) {
    organization(login: $login) {
      repositories(first: $first, orderBy: { field: STARGAZERS_COUNT, direction: DESC }, isFork: false) {
        nodes {
          id
          name
          url
          description
          primaryLanguage {
            name
          }
          stargazerCount
          forkCount
          updatedAt
          topics(first: 5) {
            nodes {
              name
            }
          }
          homepageUrl
        }
      }
    }
  }
`;

const MEMBERS_QUERY = `
  query ($login: String!, $first: Int!) {
    organization(login: $login) {
      members(first: $first) {
        nodes {
          login
          id
          avatarUrl
          url
        }
      }
    }
  }
`;

// GraphQL fetchers
const fetchProfileGraphQL = async (username: string): Promise<GithubProfile | null> => {
  const data = await fetchGraphQL<{
    user: {
      login: string;
      name: string;
      avatarUrl: string;
      bio: string;
      url: string;
      publicRepos: number;
      followers: { totalCount: number };
      following: { totalCount: number };
      location: string;
      websiteUrl: string;
      company: string;
      createdAt: string;
    };
  }>(PROFILE_QUERY, { login: username });

  if (!data?.user) return null;

  const user = data.user;
  return {
    login: user.login,
    name: user.name || user.login,
    avatar_url: user.avatarUrl,
    bio: user.bio || '',
    html_url: user.url,
    public_repos: user.publicRepos,
    followers: user.followers.totalCount,
    following: user.following.totalCount,
    location: user.location || '',
    blog: user.websiteUrl || '',
    company: user.company || '',
    created_at: user.createdAt,
    type: 'User',
  };
};

const fetchReposGraphQL = async (username: string, type: 'user' | 'org'): Promise<GithubRepo[]> => {
  const query = type === 'org' ? ORG_REPOS_QUERY : REPOS_QUERY;
  const data = await fetchGraphQL<{
    user?: { repositories: { nodes: GithubRepo[] } };
    organization?: { repositories: { nodes: GithubRepo[] } };
  }>(query, { login: username, first: 100 });

  if (!data) return [];

  const reposData = type === 'org'
    ? (data as { organization?: { repositories: { nodes: GithubRepo[] } } })?.organization?.repositories?.nodes
    : (data as { user?: { repositories: { nodes: GithubRepo[] } } })?.user?.repositories?.nodes;

  if (!reposData) return [];

  return reposData.map(repo => ({
    id: repo.id,
    name: repo.name,
    html_url: repo.url,
    description: repo.description || '',
    language: repo.primaryLanguage?.name || null,
    stargazers_count: repo.stargazerCount,
    forks_count: repo.forkCount,
    updated_at: repo.updatedAt,
    topics: repo.topics?.nodes?.map((t: { name: string }) => t.name) || [],
    homepage: repo.homepageUrl || '',
  }));
};

const fetchMembersGraphQL = async (orgName: string): Promise<GithubMember[]> => {
  const data = await fetchGraphQL<{
    organization?: {
      members: {
        nodes: Array<{
          login: string;
          id: number;
          avatarUrl: string;
          url: string;
        }>;
      };
    };
  }>(MEMBERS_QUERY, { login: orgName, first: 100 });

  if (!data?.organization) return [];

  return data.organization.members.nodes.map(member => ({
    login: member.login,
    id: member.id,
    avatar_url: member.avatarUrl,
    html_url: member.url,
  }));
};

export const fetchProfile = async (username: string): Promise<GithubProfile> => {
  return fetchWithFallback(
    () => fetchProfileGraphQL(username),
    async () => {
      const response = await fetch(`https://api.github.com/users/${username}`, {
        headers: {
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          ...(import.meta.env?.VITE_GITHUB_TOKEN && { 'Authorization': `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}` })
        }
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
    'profile'
  );
};

export const fetchRepos = async (
  username: string,
  type: 'user' | 'org',
  repoFilter?: RepoFilterConfig
): Promise<GithubRepo[]> => {
  const repos = await fetchWithFallback<GithubRepo[]>(
    () => fetchReposGraphQL(username, type),
    async () => {
      const endpoint = type === 'org'
        ? `https://api.github.com/orgs/${username}/repos?sort=updated&per_page=100`
        : `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`;

      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          ...(import.meta.env?.VITE_GITHUB_TOKEN && { 'Authorization': `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}` })
        }
      });
      if (!response.ok) throw new Error('Failed to fetch repositories');
      return response.json();
    },
    'repos'
  );

  // Sort by stars descending
  const sortedRepos = repos.sort((a, b) => b.stargazers_count - a.stargazers_count);

  // Apply repository filtering based on config
  if (repoFilter) {
    const { hidden_repos, listing_repos } = repoFilter;

    // Blacklist takes priority if both are set
    if (hidden_repos && hidden_repos.length > 0) {
      return sortedRepos.filter((repo) => !hidden_repos.includes(repo.name));
    } else if (listing_repos && listing_repos.length > 0) {
      return sortedRepos.filter((repo) => listing_repos.includes(repo.name));
    }
  }

  return sortedRepos;
};

export interface GithubMember {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
}

export const fetchMembers = async (orgName: string): Promise<GithubMember[]> => {
  return fetchWithFallback<GithubMember[]>(
    () => fetchMembersGraphQL(orgName),
    async () => {
      const response = await fetch(`https://api.github.com/orgs/${orgName}/members?per_page=100`, {
        headers: {
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          ...(import.meta.env?.VITE_GITHUB_TOKEN && { 'Authorization': `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}` })
        }
      });
      if (!response.ok) throw new Error('Failed to fetch members');
      return response.json();
    },
    'members'
  );
};
