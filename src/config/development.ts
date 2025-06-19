// Configuração para ambiente de desenvolvimento
export const developmentConfig = {
  api: {
    baseUrl: 'http://localhost:8000',
    timeout: 10000,
    retries: 3,
  },
  logging: {
    level: 'debug',
    enableConsole: true,
  },
  features: {
    enableMockData: false,
    enableErrorBoundary: true,
    enablePerformanceMonitoring: false,
  },
  security: {
    enableHttps: false,
    enableCertificateValidation: false,
  }
}; 