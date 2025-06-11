import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  LinearProgress,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  AppBar,
  Toolbar,
  Badge,
  Avatar
} from '@mui/material';
import { 
  GitHub, 
  Send, 
  Search, 
  Analytics, 
  Code, 
  BugReport, 
  ExpandMore,
  Star,
  CallSplit,
  Visibility,
  Download,
  FilterList,
  Refresh,
  TrendingUp,
  Security,
  Speed,
  Architecture,
  Assessment,
  CloudDownload,
  Settings,
  NotificationsNone,
  AccountCircle
} from '@mui/icons-material';

// Professional Autodesk-inspired theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0696D7', // Autodesk blue
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FF6B35', // Autodesk orange accent
    },
    background: {
      default: '#1a1a1a',
      paper: '#2d2d2d',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 600,
      fontSize: '2.5rem',
    },
    h4: {
      fontWeight: 500,
      fontSize: '2rem',
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        },
      },
    },
  },
});

interface Tool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

interface QueryResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface AnalysisMetrics {
  codeQuality: number;
  security: number;
  maintainability: number;
  activity: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const professionalQueries = [
  "Analyze the code architecture and design patterns used in this repository",
  "Evaluate security vulnerabilities and compliance with best practices",
  "Assess code quality, technical debt, and maintainability metrics",
  "Review CI/CD pipeline configuration and deployment strategies",
  "Analyze dependency management and potential security risks",
  "Evaluate testing coverage and quality assurance practices",
  "Assess performance optimization opportunities and bottlenecks",
  "Review documentation quality and developer experience",
  "Analyze community engagement and project sustainability",
  "Evaluate scalability and enterprise readiness"
];

function App() {
  const [repository, setRepository] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [tools, setTools] = useState<Tool[]>([]);
  const [repoStats, setRepoStats] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [analysisMetrics, setAnalysisMetrics] = useState<AnalysisMetrics | null>(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [orgName, setOrgName] = useState('');
  const [orgResults, setOrgResults] = useState<any>(null);
  const [orgAnalysis, setOrgAnalysis] = useState<any>(null);

  // Load available tools on component mount
  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/tools');
      const data = await response.json();
      if (data.success) {
        setTools(data.tools);
      }
    } catch (error) {
      console.error('Error fetching tools:', error);
    }
  };

  const handleQuery = async () => {
    if (!repository.trim() || !query.trim()) {
      setError('Please enter both repository and query');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repository: repository.trim(),
          query: query.trim(),
        }),
      });

      const data: QueryResponse = await response.json();
      
      if (data.success) {
        setResult(data);
        setSuccess('Analysis completed successfully');
        // Generate mock metrics for demonstration
        generateAnalysisMetrics();
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (error) {
      setError('Failed to connect to analysis service');
    } finally {
      setLoading(false);
    }
  };

  const generateAnalysisMetrics = () => {
    // Mock metrics generation - in real implementation, this would come from the AI analysis
    setAnalysisMetrics({
      codeQuality: Math.floor(Math.random() * 30) + 70,
      security: Math.floor(Math.random() * 25) + 75,
      maintainability: Math.floor(Math.random() * 35) + 65,
      activity: Math.floor(Math.random() * 40) + 60,
    });
  };

  const fetchRepoStats = async () => {
    if (!repository.trim()) {
      setError('Please enter a repository');
      return;
    }

    const [owner, repo] = repository.trim().split('/');
    if (!owner || !repo) {
      setError('Repository must be in format "owner/repo"');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3001/api/repository/${owner}/${repo}/stats`);
      const data = await response.json();
      
      if (data.success) {
        setRepoStats(data.data);
        setSuccess('Repository data loaded successfully');
      } else {
        setError(data.error || 'Failed to fetch repository stats');
      }
    } catch (error) {
      setError('Failed to connect to analysis service');
    } finally {
      setLoading(false);
    }
  };

  const searchRepositories = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3001/api/search/repositories?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data);
        setSuccess(`Found ${data.data?.totalCount || 0} repositories`);
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (error) {
      setError('Failed to connect to search service');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleQuery = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return 'N/A';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const exportAnalysis = () => {
    if (!result) return;
    
    const exportData = {
      repository,
      query,
      analysis: result.data?.analysis,
      context: result.data?.context,
      metrics: analysisMetrics,
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `github-analysis-${repository.replace('/', '-')}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSuccess('Analysis exported successfully');
  };

  const getMetricColor = (value: number) => {
    if (value >= 80) return 'success';
    if (value >= 60) return 'warning';
    return 'error';
  };

  const searchOrganizationRepos = async () => {
    if (!orgName.trim()) {
      setError('Please enter an organization name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [orgInfo, orgRepos] = await Promise.all([
        fetch(`http://localhost:3001/api/organization/${encodeURIComponent(orgName)}`),
        fetch(`http://localhost:3001/api/organization/${encodeURIComponent(orgName)}/repositories?per_page=50`)
      ]);

      const [orgInfoData, orgReposData] = await Promise.all([
        orgInfo.json(),
        orgRepos.json()
      ]);

      if (orgInfoData.success && orgReposData.success) {
        setOrgResults({
          info: orgInfoData.data,
          repositories: orgReposData.data
        });
        setSuccess(`Found ${orgReposData.data.totalCount} repositories for ${orgName}`);
      } else {
        setError(orgInfoData.error || orgReposData.error || 'Failed to fetch organization data');
      }
    } catch (error) {
      setError('Failed to connect to organization service');
    } finally {
      setLoading(false);
    }
  };

  const analyzeOrganization = async () => {
    if (!orgName.trim()) {
      setError('Please enter an organization name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3001/api/organization/${encodeURIComponent(orgName)}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'Evaluate security vulnerabilities and compliance with best practices across organization repositories',
          limit: 5
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setOrgAnalysis(data.data);
        setSuccess(`Organization analysis completed for ${data.data.analyzedRepositories} repositories`);
      } else {
        setError(data.error || 'Organization analysis failed');
      }
    } catch (error) {
      setError('Failed to connect to analysis service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* Professional Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        <Toolbar>
          <Box display="flex" alignItems="center" flex={1}>
            <GitHub sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Autodesk Code Intelligence
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton color="inherit">
              <Badge badgeContent={2} color="secondary">
                <NotificationsNone />
              </Badge>
            </IconButton>
            <IconButton color="inherit">
              <Settings />
            </IconButton>
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
              <AccountCircle />
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Hero Section */}
        <Box textAlign="center" mb={4}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ 
            background: 'linear-gradient(45deg, #0696D7 30%, #FF6B35 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Enterprise Code Analysis Platform
          </Typography>
          <Typography variant="h6" color="textSecondary" gutterBottom sx={{ maxWidth: 600, mx: 'auto' }}>
            Leverage AI-powered insights to analyze GitHub repositories with enterprise-grade security, 
            quality assessment, and architectural recommendations.
          </Typography>
        </Box>

        {/* Analytics Overview */}
        {analysisMetrics && (
          <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, rgba(6,150,215,0.1) 0%, rgba(255,107,53,0.1) 100%)' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assessment color="primary" />
              Repository Health Score
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={3}>
              <Box flex={1} minWidth={200} textAlign="center">
                <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
                  {analysisMetrics.codeQuality}%
                </Typography>
                <Typography variant="body2" color="textSecondary">Code Quality</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={analysisMetrics.codeQuality} 
                  color={getMetricColor(analysisMetrics.codeQuality)}
                  sx={{ mt: 1, borderRadius: 2, height: 6 }}
                />
              </Box>
              <Box flex={1} minWidth={200} textAlign="center">
                <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
                  {analysisMetrics.security}%
                </Typography>
                <Typography variant="body2" color="textSecondary">Security Score</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={analysisMetrics.security} 
                  color={getMetricColor(analysisMetrics.security)}
                  sx={{ mt: 1, borderRadius: 2, height: 6 }}
                />
              </Box>
              <Box flex={1} minWidth={200} textAlign="center">
                <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
                  {analysisMetrics.maintainability}%
                </Typography>
                <Typography variant="body2" color="textSecondary">Maintainability</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={analysisMetrics.maintainability} 
                  color={getMetricColor(analysisMetrics.maintainability)}
                  sx={{ mt: 1, borderRadius: 2, height: 6 }}
                />
              </Box>
              <Box flex={1} minWidth={200} textAlign="center">
                <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
                  {analysisMetrics.activity}%
                </Typography>
                <Typography variant="body2" color="textSecondary">Activity Level</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={analysisMetrics.activity} 
                  color={getMetricColor(analysisMetrics.activity)}
                  sx={{ mt: 1, borderRadius: 2, height: 6 }}
                />
              </Box>
            </Box>
          </Paper>
        )}

        <Paper elevation={3} sx={{ p: 0, mb: 3, overflow: 'hidden' }}>
          <Tabs 
            value={tabValue} 
            onChange={(_, newValue) => setTabValue(newValue)} 
            centered
            sx={{ 
              borderBottom: '1px solid rgba(255,255,255,0.12)',
              '& .MuiTab-root': { minHeight: 72, fontWeight: 500 }
            }}
          >
            <Tab icon={<Analytics />} label="AI Analysis" iconPosition="top" />
            <Tab icon={<Search />} label="Repository Discovery" iconPosition="top" />
            <Tab icon={<TrendingUp />} label="Metrics & Insights" iconPosition="top" />
            <Tab icon={<Architecture />} label="System Architecture" iconPosition="top" />
            <Tab icon={<Assessment />} label="Organization Analysis" iconPosition="top" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box display="flex" flexWrap="wrap" gap={4}>
              <Box flex={1} minWidth={400}>
                <TextField
                  fullWidth
                  label="Repository (owner/repo)"
                  placeholder="autodesk/forge-api-nodejs-client"
                  value={repository}
                  onChange={(e) => setRepository(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: <GitHub sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Analysis Query"
                  placeholder="Select from professional templates or ask your own question..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  variant="outlined"
                  multiline
                  rows={4}
                  sx={{ mb: 3 }}
                />

                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                    onClick={handleQuery}
                    disabled={loading}
                    size="large"
                    sx={{ flex: 1 }}
                  >
                    {loading ? 'Analyzing...' : 'Run AI Analysis'}
                  </Button>
                  {result && (
                    <Tooltip title="Export Analysis">
                      <IconButton 
                        onClick={exportAnalysis}
                        sx={{ 
                          bgcolor: 'primary.main', 
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.dark' }
                        }}
                      >
                        <CloudDownload />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>

              <Box flex={1} minWidth={400}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Speed color="primary" />
                  Professional Analysis Templates
                </Typography>
                <Box sx={{ maxHeight: 400, overflow: 'auto', pr: 1 }}>
                  {professionalQueries.map((example, index) => (
                    <Card 
                      key={index}
                      sx={{ 
                        mb: 2, 
                        cursor: 'pointer', 
                        transition: 'all 0.2s',
                        '&:hover': { 
                          transform: 'translateY(-2px)', 
                          boxShadow: '0 8px 25px rgba(6,150,215,0.3)' 
                        }
                      }}
                      onClick={() => handleExampleQuery(example)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {example}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            </Box>

            {result && (
              <Box mt={4}>
                {/* Pull Request Highlights Section */}
                {result.data?.pullRequestHighlights && (
                  <Paper elevation={2} sx={{ mb: 3, overflow: 'hidden' }}>
                    <Box sx={{ 
                      bgcolor: 'rgba(6,150,215,0.1)', 
                      p: 2, 
                      borderBottom: '1px solid rgba(255,255,255,0.12)' 
                    }}>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                        <CallSplit color="primary" />
                        Latest Pull Request Status
                      </Typography>
                    </Box>
                    <Box p={3}>
                      <Box display="flex" flexWrap="wrap" gap={3}>
                        {/* PR Summary Stats */}
                        <Card sx={{ flex: 1, minWidth: 250 }}>
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                              PR Overview
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={2}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Chip 
                                  label={`${result.data.pullRequestHighlights.summary.totalOpen} Open`} 
                                  color="primary" 
                                  size="small"
                                  icon={<CallSplit />}
                                />
                              </Box>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Chip 
                                  label={`${result.data.pullRequestHighlights.summary.prStatus.needsReview} Need Review`} 
                                  color="warning" 
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Chip 
                                  label={`${result.data.pullRequestHighlights.summary.prStatus.drafts} Drafts`} 
                                  color="info" 
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Chip 
                                  label={`${result.data.pullRequestHighlights.summary.prStatus.readyToMerge} Ready to Merge`} 
                                  color="success" 
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>

                        {/* Latest PR Details */}
                        {result.data.pullRequestHighlights.latestPR && (
                          <Card sx={{ flex: 2, minWidth: 400 }}>
                            <CardContent>
                              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                Latest Pull Request
                              </Typography>
                              <Box>
                                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                                  {result.data.pullRequestHighlights.latestPR.title}
                                </Typography>
                                <Box display="flex" gap={2} alignItems="center" mb={2}>
                                  <Chip 
                                    label={result.data.pullRequestHighlights.latestPR.state || 'open'} 
                                    color={result.data.pullRequestHighlights.latestPR.state === 'open' ? 'success' : 'default'}
                                    size="small"
                                  />
                                  <Typography variant="caption" color="textSecondary">
                                    #{result.data.pullRequestHighlights.latestPR.number} • 
                                    by {result.data.pullRequestHighlights.latestPR.user?.login || 'Unknown'}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                  {result.data.pullRequestHighlights.latestPR.body?.substring(0, 150) || 'No description available'}
                                  {result.data.pullRequestHighlights.latestPR.body?.length > 150 && '...'}
                                </Typography>
                                <Box display="flex" gap={1} alignItems="center">
                                  <Typography variant="caption" color="textSecondary">
                                    Created: {result.data.pullRequestHighlights.latestPR.created_at ? 
                                      new Date(result.data.pullRequestHighlights.latestPR.created_at).toLocaleDateString() : 
                                      'Unknown date'}
                                  </Typography>
                                  {result.data.pullRequestHighlights.latestPR.draft && (
                                    <Chip label="Draft" size="small" variant="outlined" />
                                  )}
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                )}

                <Accordion defaultExpanded sx={{ bgcolor: 'background.paper' }}>
                  <AccordionSummary 
                    expandIcon={<ExpandMore />}
                    sx={{ 
                      bgcolor: 'rgba(6,150,215,0.1)',
                      '&:hover': { bgcolor: 'rgba(6,150,215,0.2)' }
                    }}
                  >
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Assessment color="primary" />
                      AI Analysis Results
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        whiteSpace: 'pre-wrap', 
                        mb: 2, 
                        lineHeight: 1.7,
                        fontSize: '1.1rem'
                      }}
                    >
                      {result.data?.analysis}
                    </Typography>
                    
                    {result.data?.context && (
                      <Accordion sx={{ mt: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Code />
                            Technical Context & Data
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <pre style={{ 
                            fontSize: '0.9rem', 
                            overflow: 'auto', 
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}>
                            {JSON.stringify(result.data.context, null, 2)}
                          </pre>
                        </AccordionDetails>
                      </Accordion>
                    )}
                  </AccordionDetails>
                </Accordion>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box mb={3}>
              <Box display="flex" gap={2} mb={2}>
                <TextField
                  fullWidth
                  label="Search Repositories"
                  placeholder="Search for open source projects, frameworks, or technologies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Search />}
                  onClick={searchRepositories}
                  disabled={loading}
                  size="large"
                  sx={{ minWidth: 150 }}
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </Box>
              
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip label="Popular" variant="outlined" size="small" />
                <Chip label="Trending" variant="outlined" size="small" />
                <Chip label="Recently Updated" variant="outlined" size="small" />
                <Chip label="High Quality" variant="outlined" size="small" />
              </Box>
            </Box>

            {searchResults && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Analytics color="primary" />
                    Found {formatNumber(searchResults.totalCount)} repositories
                  </Typography>
                  <Box display="flex" gap={1}>
                    <IconButton size="small">
                      <FilterList />
                    </IconButton>
                    <IconButton size="small">
                      <Refresh />
                    </IconButton>
                  </Box>
                </Box>
                
                <Box display="flex" flexWrap="wrap" gap={3}>
                  {searchResults.repositories && Array.isArray(searchResults.repositories) && searchResults.repositories.map((repo: any, index: number) => (
                    <Card key={index} sx={{ 
                      width: 350, 
                      transition: 'all 0.3s',
                      '&:hover': { 
                        transform: 'translateY(-4px)', 
                        boxShadow: '0 12px 40px rgba(6,150,215,0.2)' 
                      }
                    }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            {repo.name}
                          </Typography>
                          <IconButton size="small" color="primary">
                            <GitHub />
                          </IconButton>
                        </Box>
                        
                        <Typography variant="body2" color="textSecondary" gutterBottom sx={{ height: 40, overflow: 'hidden' }}>
                          {repo.description || 'No description available'}
                        </Typography>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                          <Box display="flex" gap={2}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Star fontSize="small" color="primary" />
                              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                {formatNumber(repo.stars)}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <CallSplit fontSize="small" />
                              <Typography variant="caption">
                                {formatNumber(repo.forks)}
                              </Typography>
                            </Box>
                          </Box>
                          {repo.language && (
                            <Chip label={repo.language} size="small" color="primary" variant="outlined" />
                          )}
                        </Box>
                        
                        {repo.topics && Array.isArray(repo.topics) && repo.topics.length > 0 && (
                          <Box mt={2}>
                            {repo.topics.slice(0, 3).map((topic: string) => (
                              <Chip key={topic} label={topic} size="small" sx={{ mr: 0.5, mb: 0.5 }} variant="outlined" />
                            ))}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box mb={3}>
              <Box display="flex" gap={2} mb={3}>
                <TextField
                  fullWidth
                  label="Repository (owner/repo)"
                  placeholder="autodesk/forge-api-nodejs-client"
                  value={repository}
                  onChange={(e) => setRepository(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    startAdornment: <TrendingUp sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Analytics />}
                  onClick={fetchRepoStats}
                  disabled={loading}
                  size="large"
                  sx={{ minWidth: 180 }}
                >
                  {loading ? 'Loading...' : 'Analyze Metrics'}
                </Button>
              </Box>
            </Box>

            {repoStats && (
              <Box display="flex" gap={3} flexWrap="wrap">
                <Card sx={{ flex: 1, minWidth: 300 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Assessment color="primary" />
                      Repository Intelligence
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Recent Commits"
                          secondary={`${repoStats.commits?.length || 0} commits analyzed`}
                        />
                        <Chip label="Active" color="success" size="small" />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Open Issues"
                          secondary={`${repoStats.issues?.length || 0} issues tracked`}
                        />
                        <Chip label="Monitored" color="info" size="small" />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Pull Requests"
                          secondary={`${repoStats.pullRequests?.length || 0} PRs in pipeline`}
                        />
                        <Chip label="In Progress" color="warning" size="small" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>

                {repoStats.commits && Array.isArray(repoStats.commits) && repoStats.commits.length > 0 && (
                  <Card sx={{ width: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Code color="primary" />
                        Development Activity Timeline
                      </Typography>
                      <Box>
                        {repoStats.commits.slice(0, 5).map((commit: any, index: number) => (
                          <Box key={index} sx={{ 
                            mb: 2, 
                            p: 2, 
                            bgcolor: 'rgba(6,150,215,0.1)', 
                            borderRadius: 2,
                            borderLeft: '4px solid',
                            borderLeftColor: 'primary.main'
                          }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                              {commit.commit?.message || 'No message'}
                            </Typography>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="caption" color="textSecondary">
                                by {commit.commit?.author?.name || 'Unknown'}
                              </Typography>
                              <Typography variant="caption" color="primary.main" sx={{ fontWeight: 500 }}>
                                {commit.commit?.author?.date ? new Date(commit.commit.author.date).toLocaleDateString() : 'Unknown date'}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {repoStats.issues && Array.isArray(repoStats.issues) && repoStats.issues.length > 0 && (
                  <Card sx={{ width: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BugReport color="primary" />
                        Issue Management Dashboard
                      </Typography>
                      <Box>
                        {repoStats.issues.slice(0, 5).map((issue: any, index: number) => (
                          <Box key={index} sx={{ 
                            mb: 2, 
                            p: 2, 
                            bgcolor: 'rgba(255,107,53,0.1)', 
                            borderRadius: 2,
                            borderLeft: '4px solid',
                            borderLeftColor: issue.state === 'open' ? 'warning.main' : 'success.main'
                          }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                              {issue.title || 'No title'}
                            </Typography>
                            <Box display="flex" gap={2} alignItems="center">
                              <Chip 
                                label={issue.state || 'unknown'} 
                                size="small" 
                                color={issue.state === 'open' ? 'warning' : 'success'}
                                variant="filled"
                              />
                              <Typography variant="caption" color="textSecondary">
                                #{issue.number} • {issue.created_at ? new Date(issue.created_at).toLocaleDateString() : 'Unknown date'}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Architecture color="primary" />
              Available MCP Tools & Capabilities ({tools ? tools.length : 0})
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Comprehensive suite of enterprise-grade analysis tools powered by Model Context Protocol
            </Typography>
            
            <Box display="flex" flexWrap="wrap" gap={3}>
              {tools && Array.isArray(tools) && tools.map((tool, index) => (
                <Card key={index} sx={{ 
                  width: 350,
                  transition: 'all 0.3s',
                  '&:hover': { 
                    transform: 'translateY(-2px)', 
                    boxShadow: '0 8px 25px rgba(6,150,215,0.2)' 
                  }
                }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {tool.name}
                      </Typography>
                      <Chip label="Active" color="success" size="small" variant="outlined" />
                    </Box>
                    
                    <Typography variant="body2" color="textSecondary" gutterBottom sx={{ minHeight: 40 }}>
                      {tool.description}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      Parameters:
                    </Typography>
                    <Box>
                      {tool.parameters && Object.entries(tool.parameters).map(([param, config]: [string, any]) => (
                        <Chip
                          key={param}
                          label={`${param}${config.optional ? ' (optional)' : ''}`}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Box mb={3}>
              <Box display="flex" gap={2} mb={2}>
                <TextField
                  fullWidth
                  label="Organization Name"
                  placeholder="Enter organization name (e.g., autodesk, microsoft, google)"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    startAdornment: <Assessment sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Search />}
                  onClick={searchOrganizationRepos}
                  disabled={loading}
                  size="large"
                  sx={{ minWidth: 150 }}
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </Box>
              
              {orgResults && (
                <Box display="flex" gap={2} mb={2}>
                  <Button
                    variant="outlined"
                    startIcon={loading ? <CircularProgress size={20} /> : <Security />}
                    onClick={analyzeOrganization}
                    disabled={loading}
                    size="large"
                    color="secondary"
                  >
                    {loading ? 'Analyzing...' : 'Analyze Organization Security'}
                  </Button>
                  <Typography variant="body2" color="textSecondary" sx={{ alignSelf: 'center' }}>
                    Perform bulk security analysis across top repositories
                  </Typography>
                </Box>
              )}
            </Box>

            {orgResults && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Analytics color="primary" />
                    Found {formatNumber(orgResults.repositories.totalCount)} repositories for {orgResults.repositories.organization}
                  </Typography>
                  <Box display="flex" gap={1}>
                    <IconButton size="small">
                      <FilterList />
                    </IconButton>
                    <IconButton size="small">
                      <Refresh />
                    </IconButton>
                  </Box>
                </Box>
                
                <Box display="flex" flexWrap="wrap" gap={3}>
                  {orgResults.repositories.repositories && Array.isArray(orgResults.repositories.repositories) && orgResults.repositories.repositories.map((repo: any, index: number) => (
                    <Card key={index} sx={{ 
                      width: 350, 
                      transition: 'all 0.3s',
                      '&:hover': { 
                        transform: 'translateY(-4px)', 
                        boxShadow: '0 12px 40px rgba(6,150,215,0.2)' 
                      }
                    }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            {repo.name}
                          </Typography>
                          <IconButton size="small" color="primary" onClick={() => window.open(repo.htmlUrl, '_blank')}>
                            <GitHub />
                          </IconButton>
                        </Box>
                        
                        <Typography variant="body2" color="textSecondary" gutterBottom sx={{ height: 40, overflow: 'hidden' }}>
                          {repo.description || 'No description available'}
                        </Typography>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                          <Box display="flex" gap={2}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Star fontSize="small" color="primary" />
                              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                {formatNumber(repo.stars)}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <CallSplit fontSize="small" />
                              <Typography variant="caption">
                                {formatNumber(repo.forks)}
                              </Typography>
                            </Box>
                          </Box>
                          {repo.language && (
                            <Chip label={repo.language} size="small" color="primary" variant="outlined" />
                          )}
                        </Box>
                        
                        {repo.topics && Array.isArray(repo.topics) && repo.topics.length > 0 && (
                          <Box mt={2}>
                            {repo.topics.slice(0, 3).map((topic: string) => (
                              <Chip key={topic} label={topic} size="small" sx={{ mr: 0.5, mb: 0.5 }} variant="outlined" />
                            ))}
                          </Box>
                        )}
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                          <Typography variant="caption" color="textSecondary">
                            Updated: {new Date(repo.updatedAt).toLocaleDateString()}
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setRepository(repo.fullName);
                              setTabValue(0); // Switch to AI Analysis tab
                            }}
                          >
                            Analyze
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}

            {orgAnalysis && (
              <Box mt={4}>
                <Paper elevation={2} sx={{ mb: 3, overflow: 'hidden' }}>
                  <Box sx={{ 
                    bgcolor: 'rgba(255,107,53,0.1)', 
                    p: 2, 
                    borderBottom: '1px solid rgba(255,255,255,0.12)' 
                  }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                      <Security color="secondary" />
                      Organization Security Analysis - {orgAnalysis.organization}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Analyzed {orgAnalysis.analyzedRepositories} repositories out of {formatNumber(orgAnalysis.totalRepositories)} total
                    </Typography>
                  </Box>
                  
                  <Box p={3}>
                    {orgAnalysis.analyses.map((analysis: any, index: number) => (
                      <Accordion key={index} sx={{ mb: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Box display="flex" alignItems="center" gap={2} width="100%">
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                              {analysis.repository.name}
                            </Typography>
                            <Box display="flex" gap={1}>
                              <Chip label={analysis.repository.language || 'Unknown'} size="small" variant="outlined" />
                              <Chip label={`${formatNumber(analysis.repository.stars)} ⭐`} size="small" />
                            </Box>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          {analysis.analysis.error ? (
                            <Alert severity="error">
                              Error analyzing {analysis.repository.fullName}: {analysis.analysis.error}
                            </Alert>
                          ) : (
                            <Box>
                              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                                {analysis.analysis.analysis}
                              </Typography>
                              <Box display="flex" gap={2} mt={2}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => window.open(analysis.repository.htmlUrl, '_blank')}
                                >
                                  View Repository
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => {
                                    setRepository(analysis.repository.fullName);
                                    setTabValue(0);
                                  }}
                                >
                                  Detailed Analysis
                                </Button>
                              </Box>
                            </Box>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Box>
                </Paper>
              </Box>
            )}
          </TabPanel>
        </Paper>

        {/* Enhanced Notification System */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={4000}
          onClose={() => setSuccess(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default App;
