import { getApiUrl, validateUrl } from '../config/constants';
import { logger } from './logger';

export const verifyApiConnection = async () => {
  try {
    console.log('[verifyApiConnection] Starting API verification...');
    
    const testUrl = await getApiUrl('/test_api.php');
    console.log('[verifyApiConnection] Testing API with URL:', testUrl);
    
    if (!validateUrl(testUrl)) {
      throw new Error('Invalid API URL constructed');
    }
    
    const response = await fetch(testUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[verifyApiConnection] API test response:', data);
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('[verifyApiConnection] API verification failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const makeApiRequest = async (endpoint, options = {}) => {
  const component = 'makeApiRequest';
  try {
    logger.debug(component, `Starting request to endpoint: ${endpoint}`);
    logger.debug(component, 'Request options:', options);

    const url = await getApiUrl(endpoint);
    logger.debug(component, `Constructed URL: ${url}`);

    if (!validateUrl(url)) {
      throw new Error(`Invalid URL constructed: ${url}`);
    }

    logger.debug(component, 'Initiating fetch request...');
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    logger.debug(component, `Response status: ${response.status}`);
    logger.debug(component, 'Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    logger.debug(component, 'Response data:', data);

    return {
      success: true,
      data
    };
  } catch (error) {
    logger.error(component, 'Request failed:', error);
    return {
      success: false,
      error: error.message,
      details: {
        endpoint,
        options,
        timestamp: new Date().toISOString()
      }
    };
  }
}; 