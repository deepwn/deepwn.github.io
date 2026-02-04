// Import App configuration types from config.ts
import type { AppConfig, RepoFilterConfig } from './config';

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
  twitter_username?: string | null;
  email?: string | null;
  /** Organization-only fields */
  members_count?: number;
}

export interface GithubRepo {
  id: number;
  name: string;
  html_url: string;
  description: string;
  language: string | null;
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
const fetchGraphQL = async <T>(
  query: string,
  variables: Record<string, unknown> = {},
  operationName?: string
): Promise<T | null> => {
  const token = import.meta.env?.VITE_GITHUB_TOKEN;

  if (!token) {
    console.debug('[GraphQL] No token available, skipping GraphQL request');
    return null;
  }

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables, operationName }),
    });

    if (!response.ok) {
      console.warn(`[GraphQL] Request failed with status: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.errors && data.errors.length > 0) {
      console.warn('[GraphQL] Response contains errors:', data.errors);
      return null;
    }

    return data.data as T;
  } catch (error) {
    console.warn('[GraphQL] Request failed:', error);
    return null;
  }
};

// Primary fetcher: REST API (always works for public data)
// Enhanced fetcher: GraphQL API (only works with token, provides more data)
async function fetchWithEnhanced<T>(
  restFn: () => Promise<T>,
  graphqlFn: () => Promise<T | null>,
  dataName: string
): Promise<T> {
  // Step 1: Try REST API (always works for public data)
  try {
    const restResult = await restFn();
    console.log(`[API] ✓ ${dataName} fetched via REST API`);

    // Step 2: If token available, try GraphQL for potentially more data
    const token = import.meta.env?.VITE_GITHUB_TOKEN;
    if (token) {
      try {
        const graphqlResult = await graphqlFn();
        if (graphqlResult) {
          console.log(`[API] ✓ ${dataName} enhanced via GraphQL (logged in user)`);
          return graphqlResult; // GraphQL provides richer data
        }
      } catch (error) {
        console.debug(`[API] ℹ ${dataName} GraphQL enhancement skipped:`, error instanceof Error ? error.message : error);
      }
    }

    return restResult;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[API] ✗ ${dataName} failed:`, errorMessage);
    throw new Error(`Failed to fetch ${dataName}: ${errorMessage}`);
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
      twitterUsername
      email
    }
  }
`;

const ORG_PROFILE_QUERY = `
  query ($login: String!) {
    organization(login: $login) {
      login
      name
      avatarUrl
      description
      url
      publicRepos
      members {
        totalCount
      }
      location
      websiteUrl
      company
      createdAt
      twitterUsername
      email
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
const fetchProfileGraphQL = async (username: string, type: 'user' | 'org'): Promise<GithubProfile | null> => {
  const query = type === 'org' ? ORG_PROFILE_QUERY : PROFILE_QUERY;
  
  const data = await fetchGraphQL<{
    user?: {
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
      twitterUsername?: string | null;
      email?: string | null;
    };
    organization?: {
      login: string;
      name: string;
      avatarUrl: string;
      description: string;
      url: string;
      publicRepos: number;
      members: { totalCount: number };
      followers: { totalCount: number };
      location: string;
      websiteUrl: string;
      company: string;
      createdAt: string;
      twitterUsername?: string | null;
      email?: string | null;
    };
  }>(query, { login: username });

  if (!data) return null;

  // Handle both user and organization responses
  const userData = data.user || (data.organization as typeof data.user);
  
  if (!userData) return null;

  return {
    login: userData.login,
    name: userData.name || userData.login,
    avatar_url: userData.avatarUrl,
    bio: userData.bio || (data.organization?.description || ''),
    html_url: userData.url,
    public_repos: userData.publicRepos,
    // Organizations don't have followers/following fields
    followers: type === 'user' ? (userData.followers?.totalCount || 0) : 0,
    following: type === 'user' ? (userData.following?.totalCount || 0) : 0,
    location: userData.location || '',
    blog: userData.websiteUrl || '',
    company: userData.company || '',
    created_at: userData.createdAt,
    type: type === 'org' ? 'Organization' : 'User',
    twitter_username: userData.twitterUsername || null,
    email: userData.email || null,
    members_count: data.organization?.members?.totalCount || undefined,
  };
};

const fetchReposGraphQL = async (username: string, type: 'user' | 'org'): Promise<GithubRepo[]> => {
  const query = type === 'org' ? ORG_REPOS_QUERY : REPOS_QUERY;
  
  // Define the actual GraphQL response type
  interface GraphQLRepoNode {
    id: number;
    name: string;
    url: string;
    description: string | null;
    primaryLanguage: { name: string } | null;
    stargazerCount: number;
    forkCount: number;
    updatedAt: string;
    topics: { nodes: Array<{ name: string }> };
    homepageUrl: string | null;
  }

  const data = await fetchGraphQL<{
    user?: { repositories: { nodes: GraphQLRepoNode[] } };
    organization?: { repositories: { nodes: GraphQLRepoNode[] } };
  }>(query, { login: username, first: 100 });

  if (!data) return [];

  const reposData = type === 'org'
    ? data.organization?.repositories?.nodes
    : data.user?.repositories?.nodes;

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

export const fetchProfile = async (username: string, type: 'user' | 'org' = 'user'): Promise<GithubProfile> => {
  return fetchWithEnhanced<GithubProfile>(
    async (): Promise<GithubProfile> => {
      const endpoint = type === 'org'
        ? `https://api.github.com/orgs/${username}`
        : `https://api.github.com/users/${username}`;

      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          ...(import.meta.env?.VITE_GITHUB_TOKEN && { 'Authorization': `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}` })
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} profile: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Normalize REST API response to match our interface
      return {
        login: data.login || data.login,
        name: data.name || data.login,
        avatar_url: data.avatar_url,
        bio: data.bio || data.description || '',
        html_url: data.html_url || data.url,
        public_repos: data.public_repos || data.public_repos,
        followers: data.followers || 0,
        following: data.following || 0,
        location: data.location || '',
        blog: data.blog || data.website_url || '',
        company: data.company || '',
        created_at: data.created_at,
        type: data.type || (type === 'org' ? 'Organization' : 'User'),
        twitter_username: data.twitter_username || null,
        email: data.email || null,
        members_count: data.members_count || data.members || undefined,
      };
    },
    () => fetchProfileGraphQL(username, type),
    `profile (${type})`
  );
};

export const fetchRepos = async (
  username: string,
  type: 'user' | 'org',
  repoFilter?: RepoFilterConfig
): Promise<GithubRepo[]> => {
  const repos = await fetchWithEnhanced<GithubRepo[]>(
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

      if (!response.ok) {
        throw new Error(`Failed to fetch repositories: ${response.status} ${response.statusText}`);
      }

      const reposData = await response.json();

      // Normalize repository data to match our interface
      return reposData.map((repo: Record<string, unknown>) => ({
        id: repo.id,
        name: repo.name,
        html_url: repo.html_url,
        description: repo.description || '',
        language: repo.language || null,
        stargazers_count: repo.stargazers_count || 0,
        forks_count: repo.forks_count || 0,
        updated_at: repo.updated_at,
        topics: repo.topics || [],
        homepage: repo.homepage || '',
      }));
    },
    () => fetchReposGraphQL(username, type),
    'repos'
  );

  // Sort by stars descending
  const sortedRepos = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count);

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
  /** Whether this member is the organization owner */
  isOwner?: boolean;
}

export const fetchMembers = async (orgName: string): Promise<GithubMember[]> => {
  return fetchWithEnhanced<GithubMember[]>(
    async () => {
      const response = await fetch(`https://api.github.com/orgs/${orgName}/members?per_page=100`, {
        headers: {
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          ...(import.meta.env?.VITE_GITHUB_TOKEN && { 'Authorization': `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}` })
        }
      });

      if (!response.ok) {
        // Members API might fail for user accounts, return empty array gracefully
        if (response.status === 404) {
          console.debug(`[API] Members not available for ${orgName} (likely a user account)`);
          return [];
        }
        throw new Error(`Failed to fetch members: ${response.status} ${response.statusText}`);
      }

      const membersData = await response.json();

      // Normalize member data
      return membersData.map((member: Record<string, unknown>) => ({
        login: member.login,
        id: member.id,
        avatar_url: member.avatar_url,
        html_url: member.html_url,
      }));
    },
    () => fetchMembersGraphQL(orgName),
    'members'
  );
};

/**
 * Fetch a single GitHub user by username and convert to GithubMember format
 */
export const fetchUserByUsername = async (username: string): Promise<GithubMember | null> => {
  const endpoint = `https://api.github.com/users/${username}`;

  const response = await fetch(endpoint, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(import.meta.env?.VITE_GITHUB_TOKEN && { 'Authorization': `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}` })
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      console.debug(`[API] User not found: ${username}`);
      return null;
    }
    throw new Error(`Failed to fetch user ${username}: ${response.status} ${response.statusText}`);
  }

  const userData = await response.json();

  return {
    login: userData.login,
    id: userData.id,
    avatar_url: userData.avatar_url,
    html_url: userData.html_url,
  };
};
