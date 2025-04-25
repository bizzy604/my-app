'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocs() {
  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // API credential states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Get the API token from localStorage on component mount
  useEffect(() => {
    // Initialize token from localStorage if it exists
    const savedToken = localStorage.getItem('innobid_api_token');
    if (savedToken) {
      setToken(savedToken);
      setLoginSuccess(true);
    }
  }, []);

  // Setup Swagger with authorization
  useEffect(() => {
    const fetchSpec = async () => {
      try {
        const response = await fetch('/api/swagger');
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized: You must be logged in to view API documentation');
          }
          throw new Error(`Failed to fetch API documentation: ${response.statusText}`);
        }
        const data = await response.json();
        setSpec(data);
      } catch (err: any) {
        console.error('Error fetching API spec:', err);
        setError(err.message || 'Failed to load API documentation');
      } finally {
        setLoading(false);
      }
    };

    fetchSpec();
  }, []);

  // Handle API login
  const handleApiLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    try {
      // Validate inputs
      if (!email || !password) {
        setLoginError('Email and password are required');
        return;
      }
      
      // Make API request to get token
      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setLoginError(data.error || 'Failed to authenticate');
        return;
      }
      
      // Save token in localStorage
      localStorage.setItem('innobid_api_token', data.token);
      setToken(data.token);
      setLoginSuccess(true);
      
      // Clear login form
      setEmail('');
      setPassword('');
    } catch (err: any) {
      console.error('API login error:', err);
      setLoginError('An error occurred while trying to log in');
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('innobid_api_token');
    setToken(null);
    setLoginSuccess(false);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading API documentation...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center max-w-lg p-6 bg-red-50 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Error</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Swagger UI configuration plugins
  const swaggerPlugins = () => {
    return {
      wrapComponents: {
        authorizeBtn: () => () => null, // Hide the default authorize button
      },
    };
  };

  // Configure Swagger UI with the auth token
  const swaggerUIProps = {
    spec: spec || {},
    plugins: [swaggerPlugins],
    requestInterceptor: (req: any) => {
      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }
      return req;
    },
  };

  return (
    <div className="swagger-container">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-t-lg">
        <h1 className="text-2xl font-bold text-white">Innobid API Documentation</h1>
        <p className="text-blue-100 mt-1">
          Secure API documentation for authorized users only
        </p>
      </div>
      
      {/* API Authentication Section */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">API Authentication</h2>
        
        {loginSuccess ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="text-green-700 font-medium">API Token Active</span>
            </div>
            <p className="text-green-600 mt-1 text-sm">
              Your API token is set and will be automatically used for all API requests.
            </p>
            <div className="mt-4">
              <button 
                onClick={handleLogout}
                className="px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
              >
                Remove Token
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleApiLogin} className="bg-white p-5 border border-gray-200 rounded-md shadow-sm">
            <div className="text-sm text-gray-600 mb-4">
              <p>Enter your Innobid credentials to get an API token. This token will be used for all API requests.</p>
            </div>
            
            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-red-700 text-sm">
                {loginError}
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>
            
            <div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Get API Token
              </button>
            </div>
          </form>
        )}
        
        <div className="mt-4 text-sm text-gray-600">
          <h3 className="font-medium text-gray-700 mb-2">Using your API token:</h3>
          <p className="mb-2">For all API requests, add the following header:</p>
          <div className="bg-gray-100 p-3 rounded font-mono text-sm overflow-x-auto">
            Authorization: Bearer YOUR_API_TOKEN
          </div>
        </div>
      </div>
      
      {/* Swagger UI Component */}
      {spec ? (
        <SwaggerUI {...swaggerUIProps} />
      ) : (
        <div className="p-6 text-center">
          <p className="text-red-600">Failed to load API specification</p>
        </div>
      )}
    </div>
  );
}
