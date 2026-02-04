/**
 * GitHub API 测试脚本
 * 运行方式: bun check.js
 * 
 * 测试内容:
 * 1. REST API - 用户信息
 * 2. REST API - 仓库列表
 * 3. REST API - 组织成员
 * 4. GraphQL API - 需要 token
 * 
 * 环境变量配置:
 *   TEST_GITHUB_USER - 测试用户账户 (默认: deepwn)
 *   TEST_GITHUB_ORG  - 测试组织账户 (默认: vercel)
 *   VITE_GITHUB_TOKEN - GitHub Token (可选，用于测试 GraphQL)
 */

// 测试配置 - 直接使用 process.env，Bun 原生支持
const TEST_ACCOUNTS = {
  user: process.env.TEST_GITHUB_USER || "evil7",
  org: process.env.TEST_GITHUB_ORG || "deepwn",
};

const GITHUB_TOKEN = process.env.VITE_GITHUB_TOKEN || process.env.GITHUB_TOKEN;

// 颜色输出
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}➜ ${message}${colors.reset}`);
}

function logSection(title) {
  console.log("\n" + "=".repeat(60));
  log(title, "cyan");
  console.log("=".repeat(60));
}

function logResult(name, success, details = "") {
  const status = success ? "✓ PASS" : "✗ FAIL";
  const color = success ? "green" : "red";
  log(`${status} ${name}`, color);
  if (details) {
    console.log(`    ${details}`);
  }
}

// HTTP 请求工具
async function fetchAPI(url, options = {}) {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(GITHUB_TOKEN && { Authorization: `Bearer ${GITHUB_TOKEN}` }),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  return {
    ok: response.ok,
    status: response.status,
    data,
    headers: response.headers,
  };
}

// 测试 REST API
async function testRESTUserProfile(username) {
  logSection(`REST API - 用户资料 (@${username})`);

  const result = await fetchAPI(`https://api.github.com/users/${username}`);

  if (result.ok) {
    logResult("获取用户资料", true);
    console.log(`    名称: ${result.data.name || "N/A"}`);
    console.log(`    公开仓库: ${result.data.public_repos}`);
    console.log(`    Followers: ${result.data.followers}`);
    console.log(`    Following: ${result.data.following}`);
    console.log(`    类型: ${result.data.type}`);
    return result.data;
  } else {
    logResult("获取用户资料", false, `${result.status}: ${result.data.message || "Unknown error"}`);
    return null;
  }
}

async function testRESTRepos(username, type = "users") {
  logSection(`REST API - 仓库列表 (@${username})`);

  const endpoint = type === "org"
    ? `https://api.github.com/orgs/${username}/repos?sort=updated&per_page=10`
    : `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`;

  const result = await fetchAPI(endpoint);

  if (result.ok) {
    logResult("获取仓库列表", true);
    console.log(`    仓库数量: ${result.data.length}`);
    console.log(`    Top 3 Stars:`);
    result.data
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 3)
      .forEach((repo, i) => {
        console.log(`      ${i + 1}. ${repo.name} ⭐ ${repo.stargazers_count}`);
      });
    return result.data;
  } else {
    logResult("获取仓库列表", false, `${result.status}: ${result.data.message || "Unknown error"}`);
    return [];
  }
}

async function testRESTMembers(orgName) {
  logSection(`REST API - 组织成员 (@${orgName})`);

  const result = await fetchAPI(`https://api.github.com/orgs/${orgName}/members?per_page=10`);

  if (result.ok) {
    logResult("获取组织成员", true);
    console.log(`    成员数量 (显示前10): ${result.data.length}`);
    result.data.forEach((member, i) => {
      console.log(`      ${i + 1}. ${member.login}`);
    });
    return result.data;
  } else if (result.status === 404) {
    logResult("获取组织成员", false, "404 - 这可能不是组织账户");
    return [];
  } else {
    logResult("获取组织成员", false, `${result.status}: ${result.data.message || "Unknown error"}`);
    return [];
  }
}

// 测试 GraphQL API
async function testGraphQL(query, variables, operationName) {
  logSection(`GraphQL API${GITHUB_TOKEN ? " (已配置 Token)" : " (无 Token)"}`);

  if (!GITHUB_TOKEN) {
    logResult("GraphQL 请求", false, "未配置 GitHub Token，GraphQL 需要认证");
    return null;
  }

  const result = await fetchAPI("https://api.github.com/graphql", {
    method: "POST",
    body: JSON.stringify({ query, variables, operationName }),
  });

  if (result.ok && !result.data.errors) {
    logResult("GraphQL 请求", true);
    return result.data.data;
  } else {
    logResult("GraphQL 请求", false, result.data.errors?.[0]?.message || `Status: ${result.status}`);
    return null;
  }
}

// GraphQL 查询 - 用户 (包含 followers/following)
const USER_PROFILE_QUERY = `
  query ($login: String!) {
    user(login: $login) {
      login
      name
      avatarUrl
      bio
      url
      publicRepos
      followers { totalCount }
      following { totalCount }
      location
      websiteUrl
      company
      createdAt
    }
  }
`;

// GraphQL 查询 - 组织 (无 followers/following，有 members)
const ORG_PROFILE_QUERY = `
  query ($login: String!) {
    organization(login: $login) {
      login
      name
      avatarUrl
      description
      url
      publicRepos
      members { totalCount }
      location
      websiteUrl
      company
      createdAt
    }
  }
`;

const REPOS_QUERY = `
  query ($login: String!, $first: Int!) {
    user(login: $login) {
      repositories(first: $first, orderBy: { field: STARGAZERS_COUNT, direction: DESC }, isFork: false) {
        nodes {
          id
          name
          url
          description
          primaryLanguage { name }
          stargazerCount
          forkCount
          updatedAt
          topics(first: 5) { nodes { name } }
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

// 根据账户类型获取正确的查询
function getProfileQuery(type) {
  return type === 'org' ? ORG_PROFILE_QUERY : USER_PROFILE_QUERY;
}

async function testGraphQLProfile(username, type = 'user') {
  const query = getProfileQuery(type);
  const data = await testGraphQL(query, { login: username }, "Profile");

  if (type === 'user' && data?.user) {
    const user = data.user;
    console.log(`    名称: ${user.name || "N/A"}`);
    console.log(`    公开仓库: ${user.publicRepos}`);
    console.log(`    Followers: ${user.followers.totalCount}`);
    console.log(`    Following: ${user.following.totalCount}`);
  } else if (type === 'org' && data?.organization) {
    const org = data.organization;
    console.log(`    名称: ${org.name || "N/A"}`);
    console.log(`    公开仓库: ${org.publicRepos}`);
    console.log(`    成员数: ${org.members.totalCount}`);
    console.log(`    注意: Organization 没有 followers/following 字段`);
  }

  return data;
}

async function testGraphQLRepos(username, limit = 10) {
  const data = await testGraphQL(REPOS_QUERY, { login: username, first: limit }, "UserRepos");

  if (data?.user?.repositories?.nodes) {
    const repos = data.user.repositories.nodes;
    console.log(`    仓库数量: ${repos.length}`);
    console.log(`    Top 3 Stars:`);
    repos.slice(0, 3).forEach((repo, i) => {
      console.log(`      ${i + 1}. ${repo.name} ⭐ ${repo.stargazerCount}`);
    });
  }

  return data;
}

async function testGraphQLMembers(orgName, limit = 10) {
  const data = await testGraphQL(MEMBERS_QUERY, { login: orgName, first: limit }, "OrgMembers");

  if (data?.organization?.members?.nodes) {
    const members = data.organization.members.nodes;
    console.log(`    成员数量: ${members.length}`);
    members.forEach((member, i) => {
      console.log(`      ${i + 1}. ${member.login}`);
    });
  } else if (data?.errors) {
    console.log(`    错误: ${data.errors[0]?.message || "Unknown"}`);
  }

  return data;
}

// 速率限制测试
async function testRateLimit() {
  logSection("API 速率限制");

  const result = await fetchAPI("https://api.github.com/rate_limit");

  if (result.ok) {
    const limit = result.data.resources.core;
    logResult("速率限制检查", true);
    console.log(`    限制: ${limit.limit} 次/小时`);
    console.log(`    剩余: ${limit.remaining} 次`);
    console.log(`    重置时间: ${new Date(limit.reset * 1000).toLocaleString()}`);

    if (GITHUB_TOKEN) {
      const graphqlLimit = result.data.resources.graphql;
      console.log(`\n    GraphQL 限制: ${graphqlLimit.limit} 次/小时`);
      console.log(`    GraphQL 剩余: ${graphqlLimit.remaining} 次`);
    }
  } else {
    logResult("速率限制检查", false, `${result.status}: ${result.data.message || "Unknown error"}`);
  }
}

// 测试 GitHub GraphQL API (无 Token - 查看哪些数据无法获取)
async function testGitHubGraphQLWithoutToken() {
  logSection("⚠️ GitHub GraphQL API 测试 (无 Token)");

  const results = {
    userProfile: { success: false, data: null, error: null },
    userRepos: { success: false, data: null, error: null },
    orgProfile: { success: false, data: null, error: null },
    orgMembers: { success: false, data: null, error: null },
  };

  // 测试 1: 用户资料
  console.log("\n  测试 1: 用户资料 (@" + TEST_ACCOUNTS.user + ")");
  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: USER_PROFILE_QUERY,
        variables: { login: TEST_ACCOUNTS.user }
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.errors) {
        results.userProfile.error = data.errors[0]?.message || "Unknown error";
        console.log(`    ❌ 错误: ${results.userProfile.error}`);
      } else {
        results.userProfile.success = true;
        results.userProfile.data = data.data;
        console.log(`    ✅ 成功获取用户数据`);
      }
    } else {
      const errorText = await response.text();
      results.userProfile.error = `HTTP ${response.status}`;
      console.log(`    ❌ HTTP ${response.status}`);
      try {
        const errorData = JSON.parse(errorText);
        console.log(`    错误信息: ${errorData.message || errorText}`);
      } catch {
        console.log(`    响应: ${errorText.substring(0, 200)}`);
      }
    }
  } catch (err) {
    results.userProfile.error = err.message;
    console.log(`    ❌ ${err.message}`);
  }

  // 测试 2: 组织资料
  console.log("\n  测试 2: 组织资料 (@" + TEST_ACCOUNTS.org + ")");
  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: ORG_PROFILE_QUERY,
        variables: { login: TEST_ACCOUNTS.org }
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.errors) {
        results.orgProfile.error = data.errors[0]?.message || "Unknown error";
        console.log(`    ❌ 错误: ${results.orgProfile.error}`);
      } else {
        results.orgProfile.success = true;
        results.orgProfile.data = data.data;
        console.log(`    ✅ 成功获取组织数据`);
      }
    } else {
      const errorText = await response.text();
      results.orgProfile.error = `HTTP ${response.status}`;
      console.log(`    ❌ HTTP ${response.status}`);
      try {
        const errorData = JSON.parse(errorText);
        console.log(`    错误信息: ${errorData.message || errorText}`);
      } catch {
        console.log(`    响应: ${errorText.substring(0, 200)}`);
      }
    }
  } catch (err) {
    results.orgProfile.error = err.message;
    console.log(`    ❌ ${err.message}`);
  }

  // 测试 3: 用户仓库
  console.log("\n  测试 3: 用户仓库 (@" + TEST_ACCOUNTS.user + ")");
  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: REPOS_QUERY,
        variables: { login: TEST_ACCOUNTS.user, first: 10 }
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.errors) {
        results.userRepos.error = data.errors[0]?.message || "Unknown error";
        console.log(`    ❌ 错误: ${results.userRepos.error}`);
      } else {
        results.userRepos.success = true;
        results.userRepos.data = data.data;
        console.log(`    ✅ 成功获取仓库数据`);
      }
    } else {
      const errorText = await response.text();
      results.userRepos.error = `HTTP ${response.status}`;
      console.log(`    ❌ HTTP ${response.status}`);
      try {
        const errorData = JSON.parse(errorText);
        console.log(`    错误信息: ${errorData.message || errorText}`);
      } catch {
        console.log(`    响应: ${errorText.substring(0, 200)}`);
      }
    }
  } catch (err) {
    results.userRepos.error = err.message;
    console.log(`    ❌ ${err.message}`);
  }

  // 测试 4: 组织成员
  console.log("\n  测试 4: 组织成员 (@" + TEST_ACCOUNTS.org + ")");
  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: MEMBERS_QUERY,
        variables: { login: TEST_ACCOUNTS.org, first: 10 }
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.errors) {
        results.orgMembers.error = data.errors[0]?.message || "Unknown error";
        console.log(`    ❌ 错误: ${results.orgMembers.error}`);
      } else {
        results.orgMembers.success = true;
        results.orgMembers.data = data.data;
        console.log(`    ✅ 成功获取成员数据`);
      }
    } else {
      const errorText = await response.text();
      results.orgMembers.error = `HTTP ${response.status}`;
      console.log(`    ❌ HTTP ${response.status}`);
      try {
        const errorData = JSON.parse(errorText);
        console.log(`    错误信息: ${errorData.message || errorText}`);
      } catch {
        console.log(`    响应: ${errorText.substring(0, 200)}`);
      }
    }
  } catch (err) {
    results.orgMembers.error = err.message;
    console.log(`    ❌ ${err.message}`);
  }

  // 总结无法获取的数据
  logSection("❌ 无法获取的数据 (无 Token)");

  const failedItems = [];
  if (!results.userProfile.success) {
    failedItems.push({ name: "用户资料 (User Profile)", error: results.userProfile.error });
  }
  if (!results.orgProfile.success) {
    failedItems.push({ name: "组织资料 (Org Profile)", error: results.orgProfile.error });
  }
  if (!results.userRepos.success) {
    failedItems.push({ name: "用户仓库 (User Repos)", error: results.userRepos.error });
  }
  if (!results.orgMembers.success) {
    failedItems.push({ name: "组织成员 (Org Members)", error: results.orgMembers.error });
  }

  if (failedItems.length > 0) {
    console.log("  以下 GraphQL 请求在无 Token 情况下失败:\n");
    failedItems.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.name}`);
      console.log(`     错误: ${item.error || "Unknown"}`);
    });
    console.log("\n  💡 解决方案: 配置 GitHub Token 后可使用 GraphQL API");
    console.log("  📝 提示: REST API 无需 Token 仍可正常工作");
  } else {
    console.log("  ✅ 所有 GraphQL 请求成功 (罕见情况)");
  }

  return results;
}

// 主测试函数
async function runTests() {
  console.clear();
  console.log("\n");
  log("🔍 GitHub API 测试脚本", "cyan");
  log("=".repeat(60), "cyan");

  // 显示配置
  console.log(`\n📋 测试配置:`);
  console.log(`   用户账户: @${TEST_ACCOUNTS.user}`);
  console.log(`   组织账户: @${TEST_ACCOUNTS.org}`);
  console.log(`   Token: ${GITHUB_TOKEN ? "✓ 已配置" : "✗ 未配置"}`);

  // 1. REST API 测试 (无需 Token)
  await testRESTUserProfile(TEST_ACCOUNTS.user);
  await testRESTRepos(TEST_ACCOUNTS.user);
  await testRESTMembers(TEST_ACCOUNTS.org);

  // 2. GraphQL API 测试 (尝试无 Token)
  if (GITHUB_TOKEN) {
    // 有 Token 时正常测试
    await testGraphQLProfile(TEST_ACCOUNTS.user, 'user');
    await testGraphQLRepos(TEST_ACCOUNTS.user);
    await testGraphQLMembers(TEST_ACCOUNTS.org);
  } else {
    // 无 Token 时测试并报告失败情况
    await testGitHubGraphQLWithoutToken();
  }

  // 3. 速率限制
  await testRateLimit();

  // 总结
  logSection("📊 测试总结");
  console.log(`   测试账户: @${TEST_ACCOUNTS.user} (用户) / @${TEST_ACCOUNTS.org} (组织)`);
  console.log(`   Token: ${GITHUB_TOKEN ? "已配置" : "未配置"}`);
  console.log(`   时间: ${new Date().toLocaleString()}`);
  console.log("\n💡 提示:");
  console.log("   - REST API: 无需 Token，可公开访问");
  console.log("   - GraphQL API: 需要 Token 认证");
  console.log("   设置 Token: export VITE_GITHUB_TOKEN=\"your-token\"");
  console.log("");
}

// 运行测试
runTests().catch(console.error);
