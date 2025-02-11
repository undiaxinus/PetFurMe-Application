const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost';

// Define log levels
const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

// Helper function to format data
const formatData = (data) => {
  if (data instanceof Error) {
    return {
      message: data.message,
      stack: data.stack,
      ...data
    };
  }
  return data;
};

export const logger = {
  async _sendToServer(level, component, message, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/PetFurMe-Application/api/utils/log.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({
          level,
          component,
          message,
          data: formatData(data),
          timestamp: new Date().toISOString(),
          source: 'client'
        })
      });

      if (!response.ok) {
        throw new Error(`Server logging failed: ${response.status}`);
      }
    } catch (error) {
      // Fallback to console logging
      console.warn('Failed to send log to server:', error);
      console[level.toLowerCase()](`[${component}] ${message}`, data);
    }
  },
  
  debug: (component, message, data = null) => {
    logger._sendToServer(LOG_LEVELS.DEBUG, component, message, data);
    console.debug(`[${component}] ${message}`, data);
  },
  
  info: (component, message, data = null) => {
    logger._sendToServer(LOG_LEVELS.INFO, component, message, data);
    console.info(`[${component}] ${message}`, data);
  },
  
  warn: (component, message, data = null) => {
    logger._sendToServer(LOG_LEVELS.WARN, component, message, data);
    console.warn(`[${component}] ${message}`, data);
  },
  
  error: (component, message, error = null) => {
    logger._sendToServer(LOG_LEVELS.ERROR, component, message, error);
    console.error(`[${component}] ${message}`, error);
  }
};

// Add a global error handler for uncaught errors
if (typeof window !== 'undefined') {
  window.onerror = (message, source, lineno, colno, error) => {
    logger.error('Global', 'Uncaught error', {
      message,
      source,
      lineno,
      colno,
      error
    });
  };
}

export default logger; 