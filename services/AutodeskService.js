import { environment } from '../config/environment.js';
import dotenv from 'dotenv';

dotenv.config();

class AutodeskService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  static getInstance() {
    if (!AutodeskService.instance) {
      AutodeskService.instance = new AutodeskService();
    }
    return AutodeskService.instance;
  }

  getBasicAuth() {
    const clientId = environment.AUTODESK_CLIENT_ID;
    const clientSecret = environment.AUTODESK_CLIENT_SECRET;
    console.log('clientId:', clientId);
    console.log('clientSecret:', clientSecret);
    if (!clientId || !clientSecret) {
      throw new Error('Missing Autodesk credentials. Please check your environment variables.');
    }
    
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    return `Basic ${auth}`;
  }

  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch(environment.AUTODESK_AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'Authorization': this.getBasicAuth(),
        },
        body: new URLSearchParams({
          'grant_type': 'client_credentials',
          'scope': 'data:read data:write',
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Auth response error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);
      return this.accessToken;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  async generateResponse(query, systemPrompt = null) {
    try {
      const token = await this.getAccessToken();

      const defaultSystemPrompt = `You are a GitHub repository analysis assistant. Your role is to analyze GitHub repositories and provide detailed insights about code quality, structure, dependencies, and potential improvements. Help users with:
1. Code analysis and quality assessment
2. Repository structure and organization evaluation
3. Dependency analysis and security insights
4. Documentation quality review
5. Best practices recommendations
6. Performance optimization suggestions
7. Security vulnerability identification
8. Code maintainability assessment

Keep responses detailed, technical, and focused on actionable insights for repository improvement.`;

      const response = await fetch(environment.AUTODESK_AI_SERVICE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              targetModel: 'CLAUDE_SONET_3_7_v1',
              parameters: {
                messages: [
                  {
                    role: 'system',
                    content: systemPrompt || defaultSystemPrompt,
                  },
                  {
                    role: 'user',
                    content: query,
                  },
                ],
              },
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('AI Service error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Failed to generate response: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.content,
        modelId: data.modelId,
        outputTokens: data.outputTokens,
        promptTokens: data.promptTokens,
        responseId: data.responseId,
        totalTokens: data.totalTokens,
      };
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }

  async analyzeRepository(repoData, query) {
    const systemPrompt = `You are a GitHub repository analysis assistant. Analyze the provided repository data and respond to the user's query with detailed insights about:
- Code quality and structure
- Dependencies and security
- Documentation quality
- Best practices compliance
- Performance considerations
- Maintainability assessment

Repository data: ${JSON.stringify(repoData, null, 2)}`;

    return this.generateResponse(query, systemPrompt);
  }
}

export const autodeskService = AutodeskService.getInstance(); 