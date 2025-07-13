interface EnvironmentConfig {
  // Contentful
  CONTENTFUL_SPACE_ID: string;
  CONTENTFUL_ACCESS_TOKEN: string;
  
  // Netlify
NETLIFY_SITE_ID: string;
NETLIFY_DEPLOY_ID: string;
  DYNO: string;
  
  // Netlify
  NETLIFY_FUNCTIONS_URL: string;
  
  // Environment
  NODE_ENV: 'development' | 'production' | 'test';
  IS_DEVELOPMENT: boolean;
  IS_PRODUCTION: boolean;
  IS_TEST: boolean;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const spaceId = process.env.REACT_APP_CONTENTFUL_SPACE_ID;
  const accessToken = process.env.REACT_APP_CONTENTFUL_ACCESS_TOKEN;
  
  if (!spaceId || !accessToken) {
    throw new Error('Required Contentful environment variables are not set');
  }

  return {
    // Contentful
    CONTENTFUL_SPACE_ID: spaceId,
    CONTENTFUL_ACCESS_TOKEN: accessToken,
    
      // Netlify
  NETLIFY_SITE_ID: process.env.REACT_APP_NETLIFY_SITE_ID || 'lightin-up-utah',
  NETLIFY_DEPLOY_ID: process.env.NETLIFY_DEPLOY_ID || 'unknown',
    DYNO: process.env.DYNO || 'web.1',
    
    // Netlify
    NETLIFY_FUNCTIONS_URL: process.env.REACT_APP_NETLIFY_FUNCTIONS_URL || '',
    
    // Environment
    NODE_ENV: (process.env.NODE_ENV as EnvironmentConfig['NODE_ENV']) || 'development',
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
    IS_PRODUCTION: process.env.NODE_ENV === 'production',
    IS_TEST: process.env.NODE_ENV === 'test',
  };
};

export const env = getEnvironmentConfig(); 