import { QueryClient } from '@tanstack/react-query';

// API URL
const API_URL = 'http://localhost:8000';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

// Helper function for API requests
export const apiRequest = async (method, endpoint, data = null) => {
  const url = `${API_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for session authentication
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (response.ok) {
    return response;
  }

  // Handle error responses
  let errorMessage;
  try {
    const errorData = await response.json();
    errorMessage = errorData.error || 'An error occurred';
  } catch (e) {
    errorMessage = 'An error occurred';
  }

  const error = new Error(errorMessage);
  error.status = response.status;
  throw error;
};

// Query function for GET requests
export const getQueryFn = (options = {}) => {
  return async ({ queryKey }) => {
    const [endpoint] = queryKey;
    
    try {
      const response = await apiRequest('GET', endpoint);
      
      if (response.status === 204) {
        return null;
      }
      
      return await response.json();
    } catch (error) {
      if (error.status === 401 && options.on401 === 'returnNull') {
        return null;
      }
      throw error;
    }
  };
};
