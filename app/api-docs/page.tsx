'use client';

import { useEffect, useState, FormEvent } from 'react';
import SwaggerUI from 'swagger-ui-react';

export default function ApiDocs() {
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // API credential states
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);

  // Load CSS on client side only
  useEffect(() => {
    // Load Swagger UI CSS via direct DOM manipulation
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css';
    document.head.appendChild(link);
    
    // Get token from localStorage
    const storedToken = localStorage.getItem('innobid_api_token');
    if (storedToken) {
      setToken(storedToken);
      setLoginSuccess(true);
    }
  }, []);

  // Setup Swagger with authorization
  useEffect(() => {
    const fetchSpec = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/swagger');
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        setSpec(data);
      } catch (err: any) {
        console.error('Error fetching API spec:', err);
        setError(err.message || 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchSpec();
    }
  }, [token]);

  // Handle login
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setLoginError(null);
      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      
      const data = await response.json();
      localStorage.setItem('innobid_api_token', data.token);
      setToken(data.token);
      setLoginSuccess(true);
    } catch (err: any) {
      console.error('Login error:', err);
      setLoginError(err.message || 'Authentication failed');
    }
  };

  // Show login form if no token
  if (!loginSuccess) {
    return (
      <div className="swagger-login p-8">
        <h1 className="text-2xl font-bold mb-4">API Access</h1>
        <p className="mb-4">Please sign in to access the API documentation.</p>
        
        <form onSubmit={handleLogin} className="space-y-4 max-w-md">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 mt-1"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 mt-1"
              required
            />
          </div>
          
          {loginError && (
            <div className="text-red-500 text-sm">{loginError}</div>
          )}
          
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700"
          >
            Sign In
          </button>
        </form>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8">Loading API documentation...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      {spec && <SwaggerUI spec={spec} />}
    </div>
  );
}
