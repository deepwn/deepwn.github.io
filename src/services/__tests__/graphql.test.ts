import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchGraphQL,
  fetchProfileGraphQL,
  fetchReposGraphQL,
  fetchMembersGraphQL,
  GithubProfile,
  GithubRepo,
  GithubMember,
} from '../github';

// Mock environment
const mockFetch = vi.fn();
const originalFetch = globalThis.fetch;

describe('GraphQL API Tests', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    // Mock global fetch
    globalThis.fetch = mockFetch;
    // Mock environment variable
    vi.stubEnv('VITE_GITHUB_TOKEN', 'test-token-123');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  describe('fetchGraphQL', () => {
    it('should return data when token is available and request succeeds', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: {
            user: {
              login: 'testuser',
              name: 'Test User',
            },
          },
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const query = `
        query ($login: String!) {
          user(login: $login) {
            login
            name
          }
        }
      `;

      const result = await fetchGraphQL<{ user: { login: string; name: string } }>(query, { login: 'testuser' });

      expect(result).toBeDefined();
      expect(result?.user.login).toBe('testuser');
      expect(result?.user.name).toBe('Test User');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/graphql',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token-123',
          }),
        })
      );
    });

    it('should return null when no token is available', async () => {
      vi.unstubAllEnvs();
      vi.stubEnv('VITE_GITHUB_TOKEN', '');

      const query = `query { user { login } }`;
      const result = await fetchGraphQL(query);

      expect(result).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return null when response contains errors', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          errors: [{ message: 'Rate limit exceeded' }],
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const query = `query { user { login } }`;
      const result = await fetchGraphQL(query);

      expect(result).toBeNull();
    });

    it('should return null when response status is not ok', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      };
      mockFetch.mockResolvedValue(mockResponse);

      const query = `query { user { login } }`;
      const result = await fetchGraphQL(query);

      expect(result).toBeNull();
    });

    it('should return null when fetch throws an error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const query = `query { user { login } }`;
      const result = await fetchGraphQL(query);

      expect(result).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Failed to fetch'));

      const query = `query { user { login } }`;
      const result = await fetchGraphQL(query);

      expect(result).toBeNull();
    });
  });

  describe('fetchProfileGraphQL', () => {
    it('should return GithubProfile when GraphQL request succeeds', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: {
            user: {
              login: 'testuser',
              name: 'Test User',
              avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
              bio: 'Test bio',
              url: 'https://github.com/testuser',
              publicRepos: 10,
              followers: { totalCount: 100 },
              following: { totalCount: 50 },
              location: 'Test Location',
              websiteUrl: 'https://test.com',
              company: 'Test Company',
              createdAt: '2020-01-01T00:00:00Z',
            },
          },
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await fetchProfileGraphQL('testuser');

      expect(result).toBeDefined();
      expect(result).toMatchObject({
        login: 'testuser',
        name: 'Test User',
        avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
        bio: 'Test bio',
        html_url: 'https://github.com/testuser',
        public_repos: 10,
        followers: 100,
        following: 50,
        location: 'Test Location',
        blog: 'https://test.com',
        company: 'Test Company',
        created_at: '2020-01-01T00:00:00Z',
        type: 'User',
      });
    });

    it('should return null when user data is not found', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: { user: null },
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await fetchProfileGraphQL('nonexistent');

      expect(result).toBeNull();
    });

    it('should use login as name when name is not provided', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: {
            user: {
              login: 'testuser',
              name: null,
              avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
              bio: '',
              url: 'https://github.com/testuser',
              publicRepos: 0,
              followers: { totalCount: 0 },
              following: { totalCount: 0 },
              location: null,
              websiteUrl: null,
              company: null,
              createdAt: '2020-01-01T00:00:00Z',
            },
          },
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await fetchProfileGraphQL('testuser');

      expect(result).toBeDefined();
      expect(result?.name).toBe('testuser');
    });
  });

  describe('fetchReposGraphQL', () => {
    it('should return repos for user type', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: {
            user: {
              repositories: {
                nodes: [
                  {
                    id: 1,
                    name: 'repo1',
                    url: 'https://github.com/testuser/repo1',
                    description: 'Test repo',
                    primaryLanguage: { name: 'TypeScript' },
                    stargazerCount: 100,
                    forkCount: 10,
                    updatedAt: '2024-01-01T00:00:00Z',
                    topics: { nodes: [{ name: 'react' }, { name: 'typescript' }] },
                    homepageUrl: 'https://test.com',
                  },
                ],
              },
            },
          },
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await fetchReposGraphQL('testuser', 'user');

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 1,
        name: 'repo1',
        html_url: 'https://github.com/testuser/repo1',
        description: 'Test repo',
        language: 'TypeScript',
        stargazers_count: 100,
        forks_count: 10,
        topics: ['react', 'typescript'],
        homepage: 'https://test.com',
      });
    });

    it('should return repos for organization type', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: {
            organization: {
              repositories: {
                nodes: [
                  {
                    id: 2,
                    name: 'org-repo',
                    url: 'https://github.com/testorg/org-repo',
                    description: 'Org repo',
                    primaryLanguage: { name: 'Python' },
                    stargazerCount: 50,
                    forkCount: 5,
                    updatedAt: '2024-01-02T00:00:00Z',
                    topics: { nodes: [] },
                    homepageUrl: '',
                  },
                ],
              },
            },
          },
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await fetchReposGraphQL('testorg', 'org');

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 2,
        name: 'org-repo',
        language: 'Python',
        stargazers_count: 50,
      });
    });

    it('should return empty array when no data', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: null,
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await fetchReposGraphQL('testuser', 'user');

      expect(result).toEqual([]);
    });

    it('should handle missing language gracefully', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: {
            user: {
              repositories: {
                nodes: [
                  {
                    id: 1,
                    name: 'repo1',
                    url: 'https://github.com/testuser/repo1',
                    description: null,
                    primaryLanguage: null,
                    stargazerCount: 0,
                    forkCount: 0,
                    updatedAt: '2024-01-01T00:00:00Z',
                    topics: { nodes: [] },
                    homepageUrl: null,
                  },
                ],
              },
            },
          },
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await fetchReposGraphQL('testuser', 'user');

      expect(result).toHaveLength(1);
      expect(result[0].language).toBeNull();
      expect(result[0].description).toBe('');
      expect(result[0].homepage).toBe('');
    });
  });

  describe('fetchMembersGraphQL', () => {
    it('should return organization members', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: {
            organization: {
              members: {
                nodes: [
                  {
                    login: 'member1',
                    id: 101,
                    avatarUrl: 'https://avatars.githubusercontent.com/u/101?v=4',
                    url: 'https://github.com/member1',
                  },
                  {
                    login: 'member2',
                    id: 102,
                    avatarUrl: 'https://avatars.githubusercontent.com/u/102?v=4',
                    url: 'https://github.com/member2',
                  },
                ],
              },
            },
          },
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await fetchMembersGraphQL('testorg');

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        login: 'member1',
        id: 101,
        avatar_url: 'https://avatars.githubusercontent.com/u/101?v=4',
        html_url: 'https://github.com/member1',
      });
    });

    it('should return empty array when organization not found', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: { organization: null },
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await fetchMembersGraphQL('nonexistent');

      expect(result).toEqual([]);
    });
  });
});
