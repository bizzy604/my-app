import { createSwaggerSpec } from 'next-swagger-doc';

const apiConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Innobid API Documentation',
    version: '1.0.0',
    description: `
API documentation for the Innobid procurement system.

## Authentication
All API endpoints (except for /api/auth/token and /api/auth/register) require authentication using a Bearer token.

To authenticate:
1. Use the /api/auth/token endpoint with your Innobid credentials to obtain a token
2. Include the token in the Authorization header of all subsequent requests:
   \`Authorization: Bearer YOUR_TOKEN\`

Tokens are valid for 24 hours. After expiration, you'll need to request a new token.

## Rate Limiting
API endpoints are subject to rate limiting to prevent abuse. Standard rate limits are 100 requests per minute per user.
    `,
    contact: {
      name: 'Innobid Support',
      email: 'support@innobid.com',
    },
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      description: 'Innobid API Server',
    },
  ],
  tags: [
    { name: 'auth', description: 'Authentication endpoints' },
    { name: 'tenders', description: 'Tender management endpoints' },
    { name: 'bids', description: 'Bid management endpoints' },
    { name: 'user', description: 'User management endpoints' },
    { name: 'subscription', description: 'Subscription management endpoints' },
    { name: 'crewai', description: 'AI-based analysis endpoints' },
    { name: 'upload', description: 'File upload endpoints' },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your API token here (obtain from /api/auth/token endpoint)',
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['ADMIN', 'PROCUREMENT', 'SUPPLIER'] },
        },
      },
      Tender: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string' },
          description: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          deadline: { type: 'string', format: 'date-time' },
          status: { type: 'string' },
        },
      },
      Bid: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          tenderId: { type: 'integer' },
          supplierId: { type: 'integer' },
          amount: { type: 'number' },
          description: { type: 'string' },
          status: { type: 'string' },
        },
      },
      Subscription: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'integer' },
          status: { type: 'string' },
          tier: { type: 'string' },
          currentPeriodEnd: { type: 'string', format: 'date-time' },
        },
      },
      ApiToken: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: { 
            type: 'object',
            properties: {
              id: { type: 'integer' },
              email: { type: 'string' },
              name: { type: 'string' },
              role: { type: 'string' }
            } 
          },
          expiresIn: { type: 'string' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    },
  },
  security: [
    { ApiKeyAuth: [] }
  ],
  paths: {
    '/api/auth/token': {
      post: {
        tags: ['auth'],
        summary: 'Get API token with credentials',
        description: 'Authenticate with username and password to get an API token for further API calls',
        security: [],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'API token successfully generated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiToken' }
              }
            }
          },
          401: {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          400: {
            description: 'Missing required fields',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['auth'],
        summary: 'Register a new user',
        security: [],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'role'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  name: { type: 'string' },
                  role: { type: 'string', enum: ['PROCUREMENT', 'SUPPLIER'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'User registered successfully' },
          400: { description: 'Invalid input' },
          409: { description: 'Email already exists' },
        },
      },
    },
    '/api/tenders': {
      get: {
        tags: ['tenders'],
        summary: 'Get all tenders',
        security: [{ ApiKeyAuth: [] }],
        responses: {
          200: {
            description: 'List of tenders',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Tender' },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/tenders/{id}': {
      get: {
        tags: ['tenders'],
        summary: 'Get tender by ID',
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Tender details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Tender' },
              },
            },
          },
          401: { description: 'Unauthorized' },
          404: { description: 'Tender not found' },
        },
      },
    },
    '/api/tenders/{id}/bids': {
      get: {
        tags: ['bids'],
        summary: 'Get bids for a tender',
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'List of bids',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Bid' },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          404: { description: 'Tender not found' },
        },
      },
    },
    '/api/bids/{id}': {
      get: {
        tags: ['bids'],
        summary: 'Get bid by ID',
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Bid details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Bid' },
              },
            },
          },
          401: { description: 'Unauthorized' },
          404: { description: 'Bid not found' },
        },
      },
    },
    '/api/crewai/ai-analysis': {
      post: {
        tags: ['crewai'],
        summary: 'Perform AI analysis on bids',
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['tenderId'],
                properties: {
                  tenderId: { type: 'integer' },
                  bidData: { type: 'object' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Analysis results' },
          401: { description: 'Unauthorized' },
          403: { description: 'AI analysis requires premium subscription' },
        },
      },
    },
    '/api/subscription/activate': {
      post: {
        tags: ['subscription'],
        summary: 'Activate a subscription',
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['tier'],
                properties: {
                  tier: { type: 'string', enum: ['standard', 'ai'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Subscription activated' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/subscription/cancel': {
      post: {
        tags: ['subscription'],
        summary: 'Cancel a subscription',
        security: [{ ApiKeyAuth: [] }],
        responses: {
          200: { description: 'Subscription cancelled' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/upload': {
      post: {
        tags: ['upload'],
        summary: 'Upload a file',
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'File uploaded successfully' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/user': {
      get: {
        tags: ['user'],
        summary: 'Get current user information',
        security: [{ ApiKeyAuth: [] }],
        responses: {
          200: {
            description: 'User details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/user/subscription': {
      get: {
        tags: ['user', 'subscription'],
        summary: 'Get current user subscription information',
        security: [{ ApiKeyAuth: [] }],
        responses: {
          200: {
            description: 'Subscription details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Subscription' },
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
  },
};

export function getApiDocs() {
  return createSwaggerSpec({
    definition: apiConfig,
    apiFolder: 'app/api',
  });
}
