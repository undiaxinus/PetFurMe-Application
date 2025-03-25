import { API_BASE_URL } from '../config/constants';
import axios from 'axios';

/**
 * Makes a fetch request with error handling for HTML responses
 */
export const safeFetch = async (url, options = {}) => {
  console.log(`Fetching: ${url}`);
  
  try {
    const response = await fetch(url, options);
    
    // Check if response is OK
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // Check if response is HTML instead of JSON
    const contentType = response.headers.get('content-type');
    const responseText = await response.text();
    
    // Check if it looks like HTML
    if (responseText.trim().startsWith('<!DOCTYPE') || 
        responseText.trim().startsWith('<html')) {
      console.error('Server returned HTML instead of JSON:', responseText.substring(0, 200));
      throw new Error('Server returned HTML instead of JSON');
    }
    
    // Parse JSON
    try {
      const jsonData = JSON.parse(responseText);
      
      // Convert string boolean values to actual booleans for better consistency
      if (jsonData && typeof jsonData === 'object') {
        // Helper function to convert "0"/"1" to actual booleans
        const convertStringBooleans = (obj) => {
          if (!obj || typeof obj !== 'object') return obj;
          
          Object.keys(obj).forEach(key => {
            if (obj[key] === "1" || obj[key] === "true") {
              obj[key] = true;
            } else if (obj[key] === "0" || obj[key] === "false") {
              obj[key] = false;
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
              convertStringBooleans(obj[key]);
            }
          });
          
          return obj;
        };
        
        return convertStringBooleans(jsonData);
      }
      
      return jsonData;
    } catch (e) {
      console.error('Failed to parse JSON:', responseText.substring(0, 200));
      throw new Error('Invalid JSON response from server');
    }
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  }
};

/**
 * Creates a properly formatted API URL
 */
export const getApiUrl = (endpoint, queryParams = {}) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  
  // Build the base URL
  let url = `${API_BASE_URL}/${cleanEndpoint}`;
  
  // Add query parameters if any
  const params = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value.toString());
    }
  });
  
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  console.log('API URL constructed:', url);
  return url;
};

/**
 * Makes an API request using axios with better error handling
 */
export const apiRequest = async (method, endpoint, data = null, queryParams = {}) => {
  try {
    const url = getApiUrl(endpoint, queryParams);
    
    const config = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000, // 10 second timeout
      validateStatus: status => status < 500 // Resolve only if status < 500
    };
    
    if (data) {
      if (method.toLowerCase() === 'get') {
        config.params = data;
      } else {
        config.data = data;
      }
    }
    
    console.log(`API Request: ${method.toUpperCase()} ${url}`);
    const response = await axios(config);
    
    // Check for HTML in response
    if (typeof response.data === 'string' && 
        (response.data.includes('<!DOCTYPE') || response.data.includes('<html'))) {
      console.error('Server returned HTML instead of JSON');
      throw new Error('Server returned HTML instead of JSON');
    }
    
    return response.data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}; 