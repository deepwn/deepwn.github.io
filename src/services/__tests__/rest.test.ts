import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Store original fetch
const originalFetch = globalThis.fetch;

// Mock fetch that will be used by the github module
const restMockFetch = vi.fn();

// Mock the github module to use our mock fetch
vi.mock('../github', async () => {
  // Import the actual module for types
  const actual = await vi.importActual<typeof import('../github')>('../github');
  
  return {
    ...actual,
    fetchProfile: vi.fn(actual.fetchProfile),
    fetchRepos: vi.fn(actual.fetchRepos),
    fetchMembers: vi.fn(actual.fetchMembers),
  };
});

describe('REST API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = restMockFetch;
    // Ensure no token for REST API testing
    import.meta.env = { ...import.meta.env, VITE_GITHUB_TOKEN: '' };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
    // Restore environment
    delete (import.meta.env as { VITE_GITHUB_TOKEN?: string }).VITE_GITHUB_TOKEN;
  });

  describe('fetchProfile (REST API fallback)', () => {
    it('should fetch user profile via REST API with correct headers', async () => {
      const { fetchProfile } = await import('../github');
      
      const mockProfile = {
        login: 'testuser',
        name: 'Test User',
        avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
        bio: 'Test bio from REST',
        html_url: 'https://github.com/testuser',
        public_repos: 15,
        followers: 200,
        following: 100,
        location: 'REST Location',
        blog: 'https://rest-test.com',
        company: 'REST Company',
        created_at: '2019-06-15T10:00:00Z',
        type: 'User' as const,
      };

      restMockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockProfile),
      });

      const result = await fetchProfile('testuser');

      expect(result).toBeDefined();
      expect(result).toMatchObject({
        login: 'testuser',
        name: 'Test User',
        avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
        bio: 'Test bio from REST',
        public_repos: 15,
        followers: 200,
      });
      expect(restMockFetch).toHaveBeenCalledTimes(1);
      expect(restMockFetch).toHaveBeenCalledWith(
        'https://api.github.com/users/testuser',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          }),
        })
      );
    });

    it('should throw error when REST API fails', async () => {
      const { fetchProfile } = await import('../github');
      
      restMockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(fetchProfile('nonexistentuser')).rejects.toThrow('Failed to fetch profile');
      expect(restMockFetch).toHaveBeenCalledWith(
        'https://api.github.com/users/nonexistentuser',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          }),
        })
      );
    });

    it('should handle network errors gracefully', async () => {
      const { fetchProfile } = await import('../github');
      
      restMockFetch.mockRejectedValue(new Error('Network Error'));

      await expect(fetchProfile('testuser')).rejects.toThrow();
    });

    it('should fetch organization profile correctly', async () => {
      const { fetchProfile } = await import('../github');
      
      const mockOrgProfile = {
        login: 'testorg',
        name: 'Test Organization',
        avatar_url: 'https://avatars.githubusercontent.com/u/123?v=4',
        bio: 'Organization bio',
        html_url: 'https://github.com/testorg',
        public_repos: 50,
        followers: 1000,
        following: 0,
        location: 'Org Location',
        blog: 'https://org.example.com',
        company: null,
        created_at: '2018-01-01T00:00:00Z',
        type: 'Organization' as const,
      };

      restMockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockOrgProfile),
      });

      const result = await fetchProfile('testorg');

      expect(result).toBeDefined();
      expect(result?.type).toBe('Organization');
      expect(result?.login).toBe('testorg');
    });
  });

  describe('fetchRepos (REST API fallback)', () => {
    it('should fetch user repositories via REST API with correct headers', async () => {
      const { fetchRepos } = await import('../github');
      
      const mockRepos = [
        {
          id: 1,
          name: 'user-repo-1',
          html_url: 'https://github.com/testuser/user-repo-1',
          description: 'First user repo',
          language: 'TypeScript',
          stargazers_count: 150,
          forks_count: 20,
          updated_at: '2024-03-15T12:00:00Z',
          topics: ['react', 'typescript'],
          homepage: 'https://user-repo-1.example.com',
        },
        {
          id: 2,
          name: 'user-repo-2',
          html_url: 'https://github.com/testuser/user-repo-2',
          description: 'Second user repo',
          language: 'JavaScript',
          stargazers_count: 75,
          forks_count: 10,
          updated_at: '2024-03-10T08:00:00Z',
          topics: ['vue', 'javascript'],
          homepage: '',
        },
      ];

      restMockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockRepos),
      });

      const result = await fetchRepos('testuser', 'user');

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('user-repo-1');
      expect(result[0].stargazers_count).toBe(150);
      expect(restMockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.github.com/users/testuser/repos'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          }),
        })
      );
    });

    it('should fetch organization repositories via REST API with correct headers', async () => {
      const { fetchRepos } = await import('../github');
      
      const mockRepos = [
        {
          id: 3,
          name: 'org-main-repo',
          html_url: 'https://github.com/testorg/org-main-repo',
          description: 'Main org repository',
          language: 'Python',
          stargazers_count: 500,
          forks_count: 100,
          updated_at: '2024-03-20T15:00:00Z',
          topics: ['python', 'machine-learning'],
          homepage: 'https://org-main-repo.example.com',
        },
      ];

      restMockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockRepos),
      });

      const result = await fetchRepos('testorg', 'org');

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('org-main-repo');
      expect(result[0].language).toBe('Python');
      expect(restMockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.github.com/orgs/testorg/repos'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          }),
        })
      );
    });

    it('should sort repositories by stars descending', async () => {
      const { fetchRepos } = await import('../github');
      
      const mockRepos = [
        {
          id: 1,
          name: 'low-star-repo',
          html_url: 'https://github.com/testuser/low-star-repo',
          description: 'Repo with few stars',
          language: 'TypeScript',
          stargazers_count: 10,
          forks_count: 2,
          updated_at: '2024-01-01T00:00:00Z',
          topics: [],
          homepage: '',
        },
        {
          id: 2,
          name: 'high-star-repo',
          html_url: 'https://github.com/testuser/high-star-repo',
          description: 'Repo with many stars',
          language: 'TypeScript',
          stargazers_count: 500,
          forks_count: 50,
          updated_at: '2024-02-01T00:00:00Z',
          topics: [],
          homepage: '',
        },
        {
          id: 3,
          name: 'mid-star-repo',
          html_url: 'https://github.com/testuser/mid-star-repo',
          description: 'Repo with medium stars',
          language: 'TypeScript',
          stargazers_count: 100,
          forks_count: 20,
          updated_at: '2024-01-15T00:00:00Z',
          topics: [],
          homepage: '',
        },
      ];

      restMockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockRepos),
      });

      const result = await fetchRepos('testuser', 'user');

      expect(result).toBeDefined();
      expect(result).toHaveLength(3);
      expect(result[0].stargazers_count).toBe(500); // Should be first (highest stars)
      expect(result[1].stargazers_count).toBe(100); // Second
      expect(result[2].stargazers_count).toBe(10); // Last
    });

    it('should throw error when REST API fails', async () => {
      const { fetchRepos } = await import('../github');
      
      restMockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      await expect(fetchRepos('testuser', 'user')).rejects.toThrow('Failed to fetch repositories');
    });

    it('should filter out hidden repositories', async () => {
      const { fetchRepos } = await import('../github');
      
      const mockRepos = [
        {
          id: 1,
          name: 'public-repo',
          html_url: 'https://github.com/testuser/public-repo',
          description: 'Public repo',
          language: 'TypeScript',
          stargazers_count: 100,
          forks_count: 10,
          updated_at: '2024-01-01T00:00:00Z',
          topics: [],
          homepage: '',
        },
        {
          id: 2,
          name: 'private-like-repo',
          html_url: 'https://github.com/testuser/private-like-repo',
          description: 'Repo to hide',
          language: 'JavaScript',
          stargazers_count: 50,
          forks_count: 5,
          updated_at: '2024-01-02T00:00:00Z',
          topics: [],
          homepage: '',
        },
        {
          id: 3,
          name: 'another-public',
          html_url: 'https://github.com/testuser/another-public',
          description: 'Another public repo',
          language: 'Python',
          stargazers_count: 75,
          forks_count: 8,
          updated_at: '2024-01-03T00:00:00Z',
          topics: [],
          homepage: '',
        },
      ];

      restMockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockRepos),
      });

      const result = await fetchRepos('testuser', 'user', {
        hidden_repos: ['private-like-repo'],
      });

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result.some((repo) => repo.name === 'private-like-repo')).toBe(false);
    });

    it('should filter to only listed repositories', async () => {
      const { fetchRepos } = await import('../github');
      
      const mockRepos = [
        {
          id: 1,
          name: 'featured-repo',
          html_url: 'https://github.com/testuser/featured-repo',
          description: 'Featured repo',
          language: 'TypeScript',
          stargazers_count: 200,
          forks_count: 30,
          updated_at: '2024-01-01T00:00:00Z',
          topics: [],
          homepage: '',
        },
        {
          id: 2,
          name: 'other-repo',
          html_url: 'https://github.com/testuser/other-repo',
          description: 'Other repo',
          language: 'JavaScript',
          stargazers_count: 10,
          forks_count: 2,
          updated_at: '2024-01-02T00:00:00Z',
          topics: [],
          homepage: '',
        },
        {
          id: 3,
          name: 'another-featured',
          html_url: 'https://github.com/testuser/another-featured',
          description: 'Another featured',
          language: 'Python',
          stargazers_count: 150,
          forks_count: 20,
          updated_at: '2024-01-03T00:00:00Z',
          topics: [],
          homepage: '',
        },
      ];

      restMockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockRepos),
      });

      const result = await fetchRepos('testuser', 'user', {
        listing_repos: ['featured-repo', 'another-featured'],
      });

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('featured-repo');
      expect(result[1].name).toBe('another-featured');
    });
  });

  describe('fetchMembers (REST API fallback)', () => {
    it('should fetch organization members via REST API with correct headers', async () => {
      const { fetchMembers } = await import('../github');
      
      const mockMembers = [
        {
          login: 'org-member-1',
          id: 1001,
          avatar_url: 'https://avatars.githubusercontent.com/u/1001?v=4',
          html_url: 'https://github.com/org-member-1',
        },
        {
          login: 'org-member-2',
          id: 1002,
          avatar_url: 'https://avatars.githubusercontent.com/u/1002?v=4',
          html_url: 'https://github.com/org-member-2',
        },
      ];

      restMockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockMembers),
      });

      const result = await fetchMembers('testorg');

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        login: 'org-member-1',
        id: 1001,
        avatar_url: 'https://avatars.githubusercontent.com/u/1001?v=4',
      });
      expect(restMockFetch).toHaveBeenCalledWith(
        'https://api.github.com/orgs/testorg/members?per_page=100',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          }),
        })
      );
    });

    it('should return empty array when organization has no members', async () => {
      const { fetchMembers } = await import('../github');
      
      restMockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue([]),
      });

      const result = await fetchMembers('emptyorg');

      expect(result).toEqual([]);
    });

    it('should throw error when REST API fails', async () => {
      const { fetchMembers } = await import('../github');
      
      restMockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(fetchMembers('nonexistentorg')).rejects.toThrow('Failed to fetch members');
    });

    it('should handle network errors gracefully', async () => {
      const { fetchMembers } = await import('../github');
      
      restMockFetch.mockRejectedValue(new Error('Connection timeout'));

      await expect(fetchMembers('testorg')).rejects.toThrow();
    });
  });
});

describe('REST API Request Headers Validation', () => {
  it('should include required Accept header in profile request', async () => {
    const { fetchProfile } = await import('../github');
    
    const mockProfile = {
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
      bio: 'Test bio',
      html_url: 'https://github.com/testuser',
      public_repos: 15,
      followers: 200,
      following: 100,
      location: 'Test Location',
      blog: 'https://test.com',
      company: 'Test Company',
      created_at: '2019-06-15T10:00:00Z',
      type: 'User' as const,
    };

    restMockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockProfile),
    });

    await fetchProfile('testuser');

    expect(restMockFetch).toHaveBeenCalledWith(
      'https://api.github.com/users/testuser',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        }),
      })
    );
  });

  it('should include required headers in repos request', async () => {
    const { fetchRepos } = await import('../github');
    
    restMockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    });

    await fetchRepos('testuser', 'user');

    expect(restMockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.github.com/users/testuser/repos'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        }),
      })
    );
  });

  it('should include required headers in org repos request', async () => {
    const { fetchRepos } = await import('../github');
    
    restMockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    });

    await fetchRepos('testorg', 'org');

    expect(restMockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.github.com/orgs/testorg/repos'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        }),
      })
    );
  });

  it('should include required headers in members request', async () => {
    const { fetchMembers } = await import('../github');
    
    restMockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    });

    await fetchMembers('testorg');

    expect(restMockFetch).toHaveBeenCalledWith(
      'https://api.github.com/orgs/testorg/members?per_page=100',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        }),
      })
    );
  });

  it('should include Authorization header when token is available', async () => {
    const { fetchProfile } = await import('../github');
    
    // Set up token in environment
    import.meta.env = { ...import.meta.env, VITE_GITHUB_TOKEN: 'test-auth-token' };

    const mockProfile = {
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
      bio: 'Test bio',
      html_url: 'https://github.com/testuser',
      public_repos: 15,
      followers: 200,
      following: 100,
      location: 'Test Location',
      blog: 'https://test.com',
      company: 'Test Company',
      created_at: '2019-06-15T10:00:00Z',
      type: 'User' as const,
    };

    restMockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockProfile),
    });

    await fetchProfile('testuser');

    expect(restMockFetch).toHaveBeenCalledWith(
      'https://api.github.com/users/testuser',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Authorization': 'Bearer test-auth-token',
        }),
      })
    );
  });
});
