import { getApiConfig } from '../../utils/config';

export const API_CONFIG = {
    getBaseUrl: async () => {
        const config = await getApiConfig();
        return config.API_BASE_URL;
    },
    
    getApiUrl: async (endpoint) => {
        const config = await getApiConfig();
        return `${config.API_BASE_URL}/api${endpoint}`;
    },
    
    getUploadsUrl: async (path) => {
        const config = await getApiConfig();
        return `${config.API_BASE_URL}${config.UPLOADS_PATH}${path}`;
    }
}; 