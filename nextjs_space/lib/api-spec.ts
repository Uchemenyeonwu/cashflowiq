// OpenAPI 3.0 Specification for CashFlowIQ Public API
export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'CashFlowIQ Public API',
    description: 'REST API for accessing CashFlowIQ financial data, forecasts, and analytics',
    version: '1.0.0',
    contact: {
      name: 'CashFlowIQ Support',
      url: 'https://cashflowiq.com/support',
    },
  },
  servers: [
    {
      url: 'https://api.cashflowiq.com',
      description: 'Production API',
    },
    {
      url: 'http://localhost:3000',
      description: 'Development API',
    },
  ],
  security: [
    {
      ApiKeyAuth: [],
    },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key for authentication',
      },
    },
    schemas: {
      Transaction: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Transaction ID' },
          type: { type: 'string', enum: ['income', 'expense'], description: 'Transaction type' },
          amount: { type: 'number', format: 'decimal', description: 'Transaction amount in USD' },
          category: { type: 'string', description: 'Transaction category' },
          date: { type: 'string', format: 'date-time', description: 'Transaction date' },
          description: { type: 'string', description: 'Transaction description' },
        },
      },
      Forecast: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Forecast ID' },
          date: { type: 'string', format: 'date', description: 'Forecast date' },
          projectedCashFlow: {
            type: 'number',
            format: 'decimal',
            description: 'Projected cash flow amount',
          },
          confidence: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
            description: 'Confidence percentage of forecast',
          },
          isAnomaly: {
            type: 'boolean',
            description: 'Whether this forecast is an anomaly',
          },
        },
      },
      Summary: {
        type: 'object',
        properties: {
          totalTransactions: { type: 'integer' },
          totalIncome: { type: 'number', format: 'decimal' },
          totalExpenses: { type: 'number', format: 'decimal' },
          netCashFlow: { type: 'number', format: 'decimal' },
          period: { type: 'string' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          status: { type: 'integer' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/api/public/data': {
      get: {
        summary: 'Fetch financial data',
        description: 'Get transactions, forecasts, or summary data for a user',
        parameters: [
          {
            name: 'type',
            in: 'query',
            description: 'Data type to retrieve',
            schema: {
              type: 'string',
              enum: ['transactions', 'forecasts', 'summary'],
              default: 'transactions',
            },
          },
          {
            name: 'days',
            in: 'query',
            description: 'Number of days of historical data to retrieve',
            schema: {
              type: 'integer',
              default: 30,
              minimum: 1,
              maximum: 365,
            },
          },
        ],
        responses: {
          '200': {
            description: 'Data retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    {
                      type: 'object',
                      properties: {
                        transactions: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Transaction' },
                        },
                      },
                    },
                    {
                      type: 'object',
                      properties: {
                        forecasts: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Forecast' },
                        },
                      },
                    },
                    {
                      type: 'object',
                      properties: {
                        summary: { $ref: '#/components/schemas/Summary' },
                      },
                    },
                  ],
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized - Invalid or missing API key',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '429': {
            description: 'Too Many Requests - Rate limit exceeded',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Internal Server Error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/public/teams/data': {
      get: {
        summary: 'Fetch team financial data',
        description: 'Get consolidated transactions and forecasts for a team',
        parameters: [
          {
            name: 'teamId',
            in: 'query',
            required: true,
            description: 'Team ID',
            schema: { type: 'string' },
          },
          {
            name: 'type',
            in: 'query',
            description: 'Data type to retrieve',
            schema: {
              type: 'string',
              enum: ['transactions', 'forecasts', 'summary', 'by-member'],
              default: 'summary',
            },
          },
          {
            name: 'days',
            in: 'query',
            description: 'Number of days of historical data',
            schema: {
              type: 'integer',
              default: 30,
              minimum: 1,
              maximum: 365,
            },
          },
        ],
        responses: {
          '200': {
            description: 'Team data retrieved successfully',
          },
          '401': {
            description: 'Unauthorized - Invalid API key',
          },
          '403': {
            description: 'Forbidden - No access to team',
          },
          '429': {
            description: 'Too Many Requests - Rate limit exceeded',
          },
        },
      },
    },
    '/api/public/forecasts/advanced': {
      get: {
        summary: 'Get advanced forecast metrics',
        description: 'Get forecast accuracy, seasonality analysis, and trend metrics',
        parameters: [
          {
            name: 'days',
            in: 'query',
            schema: { type: 'integer', default: 90, minimum: 30, maximum: 365 },
          },
        ],
        responses: {
          '200': {
            description: 'Advanced metrics retrieved successfully',
          },
        },
      },
    },
  },
};
