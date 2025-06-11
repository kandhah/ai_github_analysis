# GitHub MCP Agent

A powerful Node.js application that enables natural language exploration and analysis of GitHub repositories through the Model Context Protocol (MCP).

## Features

- 🗣️ **Natural Language Interface**: Ask questions about repositories in plain English
- 📊 **Comprehensive Analysis**: Explore issues, pull requests, repository activity, and code statistics
- 🎯 **Interactive UI**: User-friendly interface with example queries and custom input
- 🔄 **MCP Integration**: Leverages the Model Context Protocol to interact with GitHub's API
- ⚡ **Real-time Results**: Get immediate insights on repository activity and health
- 🔍 **Repository Search**: Search for repositories across GitHub
- 📈 **Statistics Dashboard**: View detailed repository statistics and metrics
- 🛠️ **Available Tools**: Explore all available MCP tools and their capabilities

## Prerequisites

Before you begin, ensure you have the following:

- [Node.js](https://nodejs.org/) (v18 or higher) and npm installed
- GitHub Personal Access Token with the following permissions:
  - `repo` (for private repositories)
  - `public_repo` (for public repositories)
  - `read:org` (for organization information)
  - `read:user` (for user information)
- OpenAI API Key for natural language processing

### Required Node.js Version

**⚠️ Important**: This project requires Node.js v18 or higher due to the MCP SDK dependencies. If you're running Node.js v12 (as detected in the current system), please upgrade:

```bash
# Using nvm (recommended)
nvm install 18
nvm use 18

# Or download from https://nodejs.org/
```

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ai_github_analysis
   ```

2. **Install backend dependencies**:
   ```bash
   npm install
   ```

3. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Create environment variables**:
   Create a `.env` file in the root directory:
   ```env
   GITHUB_TOKEN=your_github_personal_access_token_here
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3001
   ```

## Usage

### Option 1: Run Both Services Together

Start both the backend and frontend simultaneously:

```bash
npm start
```

This will start:
- Backend API server on `http://localhost:3001`
- Frontend React app on `http://localhost:3000`

### Option 2: Run Services Separately

**Start the backend server**:
```bash
npm run server
```

**Start the frontend (in a new terminal)**:
```bash
cd frontend
npm start
```

### Option 3: Use MCP Server Directly

**Run the MCP server as a CLI tool**:
```bash
npm run mcp-server
```

**Example CLI usage**:
```bash
# Analyze a repository
node server/mcpServer.js analyze_repository '{"owner":"facebook","repo":"react","query":"What are the recent trends in this repository?"}'

# Search repositories
node server/mcpServer.js search_repositories '{"query":"react ui components"}'

# Get repository stats
node server/mcpServer.js get_repo_stats '{"owner":"facebook","repo":"react"}'
```

## API Endpoints

The backend provides several REST API endpoints:

### Health & Information
- `GET /api/health` - Health check
- `GET /api/tools` - List available MCP tools

### Repository Analysis
- `POST /api/query` - Analyze repository with natural language query
- `POST /api/execute` - Execute specific MCP tool

### Repository Data
- `GET /api/repository/:owner/:repo/stats` - Get comprehensive repository statistics
- `GET /api/repository/:owner/:repo/issues` - List repository issues
- `GET /api/repository/:owner/:repo/pulls` - List pull requests
- `GET /api/repository/:owner/:repo/contents/*` - Get file contents

### Search
- `GET /api/search/repositories` - Search repositories

## MCP Tools Available

The application includes several MCP tools for GitHub analysis:

1. **analyze_repository** - Comprehensive repository analysis with AI insights
2. **get_file_contents** - Retrieve file or directory contents
3. **search_repositories** - Search GitHub repositories
4. **list_issues** - List repository issues with filtering
5. **list_pull_requests** - List repository pull requests
6. **get_repo_stats** - Get detailed repository statistics

## Configuration

### GitHub Token Setup

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `public_repo` (Access public repositories)
   - `read:org` (Read org and team membership)
   - `read:user` (Read user profile data)
4. Copy the token and add it to your `.env` file

### OpenAI API Key Setup

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key and add it to your `.env` file

## Integration with Claude Desktop

To use this MCP server with Claude Desktop, add the following to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "github-analysis": {
      "command": "node",
      "args": ["path/to/ai_github_analysis/server/mcpServer.js"],
      "env": {
        "GITHUB_TOKEN": "your_github_token_here",
        "OPENAI_API_KEY": "your_openai_api_key_here"
      }
    }
  }
}
```

## Example Queries

Try these example queries in the web interface:

- "What programming languages are used in this repository?"
- "How active is this repository? Show me recent activity."
- "What are the most common issues in this repository?"
- "Analyze the code quality and suggest improvements."
- "Show me the top contributors and their contributions."
- "What are the recent pull requests and their status?"
- "How well maintained is this project?"
- "What dependencies does this project use?"

## Development

### Project Structure

```
ai_github_analysis/
├── server/
│   ├── index.js          # Main Express server
│   └── mcpServer.js      # MCP GitHub server implementation
├── frontend/
│   ├── src/
│   │   └── App.tsx       # Main React application
│   └── package.json      # Frontend dependencies
├── package.json          # Backend dependencies
├── README.md            # This file
└── .env                 # Environment variables (create this)
```

### Available Scripts

- `npm start` - Start both backend and frontend
- `npm run server` - Start backend only
- `npm run mcp-server` - Run MCP server in CLI mode
- `npm run dev` - Start backend with nodemon (development)
- `npm test` - Run tests
- `npm run lint` - Run linter

## Troubleshooting

### Common Issues

1. **Node.js Version Error**: Ensure you're using Node.js v18 or higher
2. **GitHub API Rate Limits**: Make sure you have a valid GitHub token
3. **OpenAI API Errors**: Verify your OpenAI API key and account has credits
4. **Port Conflicts**: Change the PORT in your `.env` file if 3001 is already in use

### Debug Mode

Set environment variable `DEBUG=true` for verbose logging:

```bash
DEBUG=true npm run server
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC

## Support

For issues and questions, please open a GitHub issue or contact the development team. 