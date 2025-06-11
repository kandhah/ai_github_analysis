import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { autodeskService } from '../services/AutodeskService.js';
import dotenv from 'dotenv';
import { spawn } from 'child_process';

dotenv.config();

// Initialize MCP GitHub client
let mcpClient = null;

async function initializeMCPClient() {
  if (mcpClient) {
    return mcpClient;
  }

  try {
    // Create transport that connects to the MCP GitHub server
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['@modelcontextprotocol/server-github'],
      env: {
        ...process.env,
        GITHUB_TOKEN: process.env.GITHUB_TOKEN
      }
    });

    mcpClient = new Client({
      name: "github-analysis-client",
      version: "1.0.0"
    }, {
      capabilities: {
        tools: {}
      }
    });

    await mcpClient.connect(transport);
    console.log('MCP GitHub client connected successfully');
    return mcpClient;
  } catch (error) {
    console.error('Failed to initialize MCP client:', error);
    throw error;
  }
}

// Simplified MCP server implementation
class GitHubMCPServer {
  constructor() {
    this.tools = new Map();
    this.resources = new Map();
    this.prompts = new Map();
    
    this.registerTools();
    this.registerResources();
    this.registerPrompts();
  }

  registerTools() {
    // Repository analysis tool
    this.tools.set('analyze_repository', {
      description: 'Analyze a GitHub repository with natural language queries',
      parameters: {
        owner: { type: 'string', description: 'Repository owner' },
        repo: { type: 'string', description: 'Repository name' },
        query: { type: 'string', description: 'Analysis query' }
      },
      handler: this.analyzeRepository.bind(this)
    });

    // Get file contents
    this.tools.set('get_file_contents', {
      description: 'Get contents of a file from a repository',
      parameters: {
        owner: { type: 'string', description: 'Repository owner' },
        repo: { type: 'string', description: 'Repository name' },
        path: { type: 'string', description: 'File path' },
        branch: { type: 'string', description: 'Branch name', optional: true }
      },
      handler: this.getFileContents.bind(this)
    });

    // Search repositories
    this.tools.set('search_repositories', {
      description: 'Search for repositories on GitHub',
      parameters: {
        query: { type: 'string', description: 'Search query' },
        page: { type: 'number', description: 'Page number', optional: true },
        perPage: { type: 'number', description: 'Results per page', optional: true }
      },
      handler: this.searchRepositories.bind(this)
    });

    // List issues
    this.tools.set('list_issues', {
      description: 'List issues for a repository',
      parameters: {
        owner: { type: 'string', description: 'Repository owner' },
        repo: { type: 'string', description: 'Repository name' },
        state: { type: 'string', description: 'Issue state (open, closed, all)', optional: true }
      },
      handler: this.listIssues.bind(this)
    });

    // List pull requests
    this.tools.set('list_pull_requests', {
      description: 'List pull requests for a repository',
      parameters: {
        owner: { type: 'string', description: 'Repository owner' },
        repo: { type: 'string', description: 'Repository name' },
        state: { type: 'string', description: 'PR state (open, closed, all)', optional: true }
      },
      handler: this.listPullRequests.bind(this)
    });

    // Get repository statistics
    this.tools.set('get_repo_stats', {
      description: 'Get comprehensive statistics for a repository',
      parameters: {
        owner: { type: 'string', description: 'Repository owner' },
        repo: { type: 'string', description: 'Repository name' }
      },
      handler: this.getRepoStats.bind(this)
    });

    // List organization repositories
    this.tools.set('list_org_repositories', {
      description: 'List all repositories for a GitHub organization',
      parameters: {
        org: { type: 'string', description: 'Organization name' },
        type: { type: 'string', description: 'Repository type (all, public, private, forks, sources, member)', optional: true },
        sort: { type: 'string', description: 'Sort order (created, updated, pushed, full_name)', optional: true },
        perPage: { type: 'number', description: 'Results per page', optional: true }
      },
      handler: this.listOrgRepositories.bind(this)
    });

    // Get organization information
    this.tools.set('get_organization', {
      description: 'Get information about a GitHub organization',
      parameters: {
        org: { type: 'string', description: 'Organization name' }
      },
      handler: this.getOrganization.bind(this)
    });
  }

  registerResources() {
    // Remove the problematic resource registration since getRepositoryInfo method doesn't exist
    // this.resources.set('repository-info', {
    //   description: 'Repository information resource',
    //   handler: this.getRepositoryInfo.bind(this)
    // });
  }

  registerPrompts() {
    // Remove the problematic prompt registration since analyzeRepoHealth method doesn't exist
    // this.prompts.set('analyze-repo-health', {
    //   description: 'Analyze repository health and provide recommendations',
    //   parameters: {
    //     owner: { type: 'string', description: 'Repository owner' },
    //     repo: { type: 'string', description: 'Repository name' }
    //   },
    //   handler: this.analyzeRepoHealth.bind(this)
    // });
  }

  async analyzeRepository({ owner, repo, query }) {
    try {
      const client = await initializeMCPClient();
      
      // Helper function to parse MCP response (consistent across all methods)
      const parseMCPResponse = (response) => {
        if (response.content && Array.isArray(response.content)) {
          const textContent = response.content.find(item => item.type === 'text');
          if (textContent && textContent.text) {
            try {
              return JSON.parse(textContent.text);
            } catch (e) {
              return textContent.text;
            }
          }
        }
        return response.content;
      };
      
      // Get recent commits using correct MCP tool names
      const commits = await client.callTool({
        name: 'list_commits',
        arguments: { owner, repo, per_page: 10 }
      });
      
      // Get issues using correct MCP tool names
      const issues = await client.callTool({
        name: 'list_issues',
        arguments: { owner, repo, state: 'open', per_page: 10 }
      });

      // Get both open and recently closed pull requests for comprehensive analysis
      const [openPulls, closedPulls] = await Promise.all([
        client.callTool({
          name: 'list_pull_requests',
          arguments: { owner, repo, state: 'open', per_page: 10 }
        }),
        client.callTool({
          name: 'list_pull_requests',
          arguments: { owner, repo, state: 'closed', per_page: 5 }
        })
      ]);

      // Parse all MCP responses
      const parsedCommits = parseMCPResponse(commits);
      const parsedIssues = parseMCPResponse(issues);
      const parsedOpenPulls = parseMCPResponse(openPulls);
      const parsedClosedPulls = parseMCPResponse(closedPulls);

      // Extract arrays from parsed data
      const commitsArray = Array.isArray(parsedCommits) ? parsedCommits : parsedCommits?.items || [];
      const issuesArray = Array.isArray(parsedIssues) ? parsedIssues : parsedIssues?.items || [];
      const openPullsArray = Array.isArray(parsedOpenPulls) ? parsedOpenPulls : parsedOpenPulls?.items || [];
      const closedPullsArray = Array.isArray(parsedClosedPulls) ? parsedClosedPulls : parsedClosedPulls?.items || [];
      
      // Prepare enhanced context for AI analysis with detailed PR information
      const context = {
        recentCommits: commitsArray,
        openIssues: issuesArray,
        openPullRequests: openPullsArray,
        recentlyClosedPullRequests: closedPullsArray,
        pullRequestSummary: {
          totalOpen: openPullsArray.length,
          totalRecentlyClosed: closedPullsArray.length,
          latestPR: openPullsArray[0] || closedPullsArray[0],
          prStatus: {
            needsReview: openPullsArray.filter(pr => !pr.draft && pr.requested_reviewers?.length > 0).length,
            drafts: openPullsArray.filter(pr => pr.draft).length,
            readyToMerge: openPullsArray.filter(pr => !pr.draft && pr.mergeable_state === 'clean').length
          }
        }
      };
      
      // Enhanced query prompt to specifically include PR analysis
      const enhancedQuery = `${query}

Please include in your analysis:
1. Current pull request status and workflow health
2. Latest pull request details and their security implications
3. PR review process effectiveness
4. Merge patterns and code integration practices
5. Any security concerns in recent PRs

Focus particularly on the latest PRs and their impact on the repository's security posture.`;
      
      // Use Autodesk service to analyze the repository based on the enhanced query
      const response = await autodeskService.analyzeRepository(context, enhancedQuery);
      
      return {
        success: true,
        data: {
          analysis: response.content,
          context: context,
          pullRequestHighlights: {
            latestPR: context.pullRequestSummary.latestPR,
            summary: context.pullRequestSummary
          },
          modelInfo: {
            modelId: response.modelId,
            totalTokens: response.totalTokens,
            promptTokens: response.promptTokens,
            outputTokens: response.outputTokens
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Error analyzing repository: ${error.message}`
      };
    }
  }

  async getFileContents({ owner, repo, path, branch = 'main' }) {
    try {
      const client = await initializeMCPClient();
      
      const response = await client.callTool({
        name: 'get_file_contents',
        arguments: { owner, repo, path, branch }
      });
      
      return {
        success: true,
        data: response.content
      };
    } catch (error) {
      return {
        success: false,
        error: `Error retrieving file: ${error.message}`
      };
    }
  }

  async searchRepositories({ query, page = 1, perPage = 30 }) {
    try {
      const client = await initializeMCPClient();
      
      const response = await client.callTool({
        name: 'search_repositories',
        arguments: { query, page, per_page: perPage }
      });
      
      // Parse the MCP response format
      let parsedData;
      if (response.content && Array.isArray(response.content)) {
        // MCP returns data in format: [{ type: "text", text: "JSON string" }]
        const textContent = response.content.find(item => item.type === 'text');
        if (textContent && textContent.text) {
          parsedData = JSON.parse(textContent.text);
        }
      } else {
        parsedData = response.content;
      }
      
      // Format the data for frontend consumption
      const formattedData = {
        totalCount: parsedData?.total_count || 0,
        repositories: parsedData?.items?.map(repo => ({
          id: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language,
          topics: repo.topics || [],
          htmlUrl: repo.html_url,
          createdAt: repo.created_at,
          updatedAt: repo.updated_at,
          owner: {
            login: repo.owner?.login,
            avatarUrl: repo.owner?.avatar_url,
            type: repo.owner?.type
          }
        })) || []
      };
      
      return {
        success: true,
        data: formattedData
      };
    } catch (error) {
      return {
        success: false,
        error: `Error searching repositories: ${error.message}`
      };
    }
  }

  async listIssues({ owner, repo, state = 'open' }) {
    try {
      const client = await initializeMCPClient();
      
      const response = await client.callTool({
        name: 'list_issues',
        arguments: { owner, repo, state, per_page: 50 }
      });
      
      return {
        success: true,
        data: response.content
      };
    } catch (error) {
      return {
        success: false,
        error: `Error listing issues: ${error.message}`
      };
    }
  }

  async listPullRequests({ owner, repo, state = 'open' }) {
    try {
      const client = await initializeMCPClient();
      
      const response = await client.callTool({
        name: 'list_pull_requests',
        arguments: { owner, repo, state, per_page: 50 }
      });
      
      return {
        success: true,
        data: response.content
      };
    } catch (error) {
      return {
        success: false,
        error: `Error listing pull requests: ${error.message}`
      };
    }
  }

  async getRepoStats({ owner, repo }) {
    try {
      const client = await initializeMCPClient();
      
      const [commits, issues, pulls] = await Promise.all([
        client.callTool({ name: 'list_commits', arguments: { owner, repo, per_page: 10 } }),
        client.callTool({ name: 'list_issues', arguments: { owner, repo, state: 'all', per_page: 10 } }),
        client.callTool({ name: 'list_pull_requests', arguments: { owner, repo, state: 'all', per_page: 10 } })
      ]);

      // Helper function to parse MCP response
      const parseMCPResponse = (response) => {
        if (response.content && Array.isArray(response.content)) {
          const textContent = response.content.find(item => item.type === 'text');
          if (textContent && textContent.text) {
            try {
              return JSON.parse(textContent.text);
            } catch (e) {
              return textContent.text;
            }
          }
        }
        return response.content;
      };

      const parsedCommits = parseMCPResponse(commits);
      const parsedIssues = parseMCPResponse(issues);
      const parsedPulls = parseMCPResponse(pulls);

      return {
        success: true,
        data: {
          commits: Array.isArray(parsedCommits) ? parsedCommits : parsedCommits?.items || [],
          issues: Array.isArray(parsedIssues) ? parsedIssues : parsedIssues?.items || [],
          pullRequests: Array.isArray(parsedPulls) ? parsedPulls : parsedPulls?.items || []
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Error getting repository stats: ${error.message}`
      };
    }
  }

  async listOrgRepositories({ org, type = 'all', sort = 'updated', perPage = 30 }) {
    try {
      const client = await initializeMCPClient();
      
      const response = await client.callTool({
        name: 'search_repositories',
        arguments: { 
          query: `org:${org}`,
          per_page: perPage,
          sort: sort
        }
      });
      
      // Parse the MCP response format
      let parsedData;
      if (response.content && Array.isArray(response.content)) {
        const textContent = response.content.find(item => item.type === 'text');
        if (textContent && textContent.text) {
          parsedData = JSON.parse(textContent.text);
        }
      } else {
        parsedData = response.content;
      }
      
      // Format the data for frontend consumption
      const formattedData = {
        totalCount: parsedData?.total_count || 0,
        organization: org,
        repositories: parsedData?.items?.map(repo => ({
          id: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language,
          topics: repo.topics || [],
          htmlUrl: repo.html_url,
          createdAt: repo.created_at,
          updatedAt: repo.updated_at,
          pushedAt: repo.pushed_at,
          isPrivate: repo.private,
          defaultBranch: repo.default_branch,
          owner: {
            login: repo.owner?.login,
            avatarUrl: repo.owner?.avatar_url,
            type: repo.owner?.type
          }
        })) || []
      };
      
      return {
        success: true,
        data: formattedData
      };
    } catch (error) {
      return {
        success: false,
        error: `Error listing organization repositories: ${error.message}`
      };
    }
  }

  async getOrganization({ org }) {
    try {
      // Since we don't have a direct organization endpoint in MCP GitHub server,
      // we'll use search to get organization info and derive metrics
      const [repoSearch, memberSearch] = await Promise.all([
        this.listOrgRepositories({ org, perPage: 100 }),
        this.searchRepositories({ query: `org:${org}`, perPage: 100 })
      ]);

      if (!repoSearch.success) {
        throw new Error(repoSearch.error);
      }

      const repos = repoSearch.data.repositories;
      
      // Calculate organization metrics
      const metrics = {
        totalRepositories: repos.length,
        totalStars: repos.reduce((sum, repo) => sum + (repo.stars || 0), 0),
        totalForks: repos.reduce((sum, repo) => sum + (repo.forks || 0), 0),
        languages: [...new Set(repos.map(repo => repo.language).filter(Boolean))],
        mostStarredRepo: repos.reduce((max, repo) => 
          (repo.stars || 0) > (max.stars || 0) ? repo : max, repos[0] || {}),
        recentActivity: repos.filter(repo => {
          const lastPush = new Date(repo.pushedAt);
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          return lastPush > thirtyDaysAgo;
        }).length,
        topLanguages: repos.reduce((acc, repo) => {
          if (repo.language) {
            acc[repo.language] = (acc[repo.language] || 0) + 1;
          }
          return acc;
        }, {})
      };

      return {
        success: true,
        data: {
          organization: org,
          metrics,
          repositories: repos.slice(0, 10), // Top 10 repos for preview
          totalRepositories: repos.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Error getting organization info: ${error.message}`
      };
    }
  }

  async executeTool(toolName, parameters) {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return {
        success: false,
        error: `Tool '${toolName}' not found`
      };
    }

    try {
      return await tool.handler(parameters);
    } catch (error) {
      return {
        success: false,
        error: `Error executing tool '${toolName}': ${error.message}`
      };
    }
  }

  listTools() {
    return Array.from(this.tools.entries()).map(([name, tool]) => ({
      name,
      description: tool.description,
      parameters: tool.parameters
    }));
  }
}

// Create and export server instance
const mcpServer = new GitHubMCPServer();

// CLI interface for testing
async function main() {
  if (process.argv.length < 4) {
    console.log('Usage: node mcpServer.js <tool> <parameters>');
    console.log('Available tools:');
    mcpServer.listTools().forEach(tool => {
      console.log(`  ${tool.name}: ${tool.description}`);
    });
    return;
  }

  const toolName = process.argv[2];
  const parameters = JSON.parse(process.argv[3] || '{}');

  const result = await mcpServer.executeTool(toolName, parameters);
  console.log(JSON.stringify(result, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { mcpServer, GitHubMCPServer }; 