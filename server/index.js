import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { mcpServer } from './mcpServer.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'GitHub MCP Analysis Server is running' });
});

// List available MCP tools
app.get('/api/tools', (req, res) => {
  try {
    const tools = mcpServer.listTools();
    res.json({ success: true, tools });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Execute MCP tool via API
app.post('/api/execute', async (req, res) => {
  try {
    const { tool, parameters } = req.body;
    
    if (!tool) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tool name is required' 
      });
    }

    const result = await mcpServer.executeTool(tool, parameters || {});
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Legacy query endpoint for backward compatibility
app.post('/api/query', async (req, res) => {
  try {
    const { query, repository } = req.body;
    
    if (!query || !repository) {
      return res.status(400).json({
        success: false,
        error: 'Query and repository are required'
      });
    }

    // Parse repository (owner/repo format)
    const [owner, repo] = repository.split('/');
    if (!owner || !repo) {
      return res.status(400).json({
        success: false,
        error: 'Repository must be in format "owner/repo"'
      });
    }

    // Use the MCP server to analyze the repository
    const result = await mcpServer.executeTool('analyze_repository', {
      owner,
      repo,
      query
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get repository statistics
app.get('/api/repository/:owner/:repo/stats', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await mcpServer.executeTool('get_repo_stats', { owner, repo });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search repositories
app.get('/api/search/repositories', async (req, res) => {
  try {
    const { q: query, page = 1, per_page: perPage = 30 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    const result = await mcpServer.executeTool('search_repositories', {
      query,
      page: parseInt(page),
      perPage: parseInt(perPage)
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get file contents
app.get('/api/repository/:owner/:repo/contents/*', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const path = req.params[0]; // Everything after 'contents/'
    const { branch } = req.query;
    
    const result = await mcpServer.executeTool('get_file_contents', {
      owner,
      repo,
      path,
      branch
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// List issues
app.get('/api/repository/:owner/:repo/issues', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { state = 'open' } = req.query;
    
    const result = await mcpServer.executeTool('list_issues', {
      owner,
      repo,
      state
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// List pull requests
app.get('/api/repository/:owner/:repo/pulls', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { state = 'open' } = req.query;
    
    const result = await mcpServer.executeTool('list_pull_requests', {
      owner,
      repo,
      state
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Organization-level endpoints
// Get organization information
app.get('/api/organization/:org', async (req, res) => {
  try {
    const { org } = req.params;
    
    const result = await mcpServer.executeTool('get_organization', {
      org
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// List organization repositories
app.get('/api/organization/:org/repositories', async (req, res) => {
  try {
    const { org } = req.params;
    const { type = 'all', sort = 'updated', per_page: perPage = 30 } = req.query;
    
    const result = await mcpServer.executeTool('list_org_repositories', {
      org,
      type,
      sort,
      perPage: parseInt(perPage)
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Analyze organization (bulk repository analysis)
app.post('/api/organization/:org/analyze', async (req, res) => {
  try {
    const { org } = req.params;
    const { query, limit = 5 } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Analysis query is required'
      });
    }

    // Get organization repositories
    const orgResult = await mcpServer.executeTool('list_org_repositories', {
      org,
      perPage: limit
    });

    if (!orgResult.success) {
      return res.json(orgResult);
    }

    // Analyze top repositories
    const analyses = await Promise.all(
      orgResult.data.repositories.slice(0, limit).map(async (repo) => {
        const [owner, repoName] = repo.fullName.split('/');
        const analysis = await mcpServer.executeTool('analyze_repository', {
          owner,
          repo: repoName,
          query: `${query} (Focus on this repository: ${repo.fullName})`
        });
        
        return {
          repository: repo,
          analysis: analysis.success ? analysis.data : { error: analysis.error }
        };
      })
    );

    res.json({
      success: true,
      data: {
        organization: org,
        totalRepositories: orgResult.data.totalCount,
        analyzedRepositories: analyses.length,
        query,
        analyses
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(port, () => {
  console.log(`GitHub MCP Analysis Server running on port ${port}`);
  console.log(`Available endpoints:`);
  console.log(`  GET  /api/health - Health check`);
  console.log(`  GET  /api/tools - List available MCP tools`);
  console.log(`  POST /api/execute - Execute MCP tool`);
  console.log(`  POST /api/query - Analyze repository (legacy)`);
  console.log(`  GET  /api/repository/:owner/:repo/stats - Repository statistics`);
  console.log(`  GET  /api/search/repositories - Search repositories`);
  console.log(`  GET  /api/repository/:owner/:repo/contents/* - Get file contents`);
  console.log(`  GET  /api/repository/:owner/:repo/issues - List issues`);
  console.log(`  GET  /api/repository/:owner/:repo/pulls - List pull requests`);
  console.log(`\nMCP Tools available: ${mcpServer.listTools().length}`);
});

export default app; 