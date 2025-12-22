import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const AuthCallback = ({ onAuthSuccess, onAuthError }) => {
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Extract session_id from URL fragment
        const hash = window.location.hash;
        const sessionIdMatch = hash.match(/session_id=([^&]+)/);
        
        if (!sessionIdMatch) {
          throw new Error('No session ID found');
        }

        const sessionId = sessionIdMatch[1];

        // Exchange session_id for session data
        const response = await axios.get(
          'https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data',
          {
            headers: {
              'X-Session-ID': sessionId
            }
          }
        );

        const userData = response.data;

        // Store session in our backend
        await axios.post(
          `${API_URL}/api/auth/session`,
          {
            session_token: userData.session_token,
            user_data: {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              picture: userData.picture
            }
          },
          { withCredentials: true }
        );

        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname);

        // Notify parent of success
        onAuthSuccess(userData);

      } catch (error) {
        console.error('Auth callback error:', error);
        window.history.replaceState(null, '', window.location.pathname);
        onAuthError(error.message || 'Authentication failed');
      }
    };

    processAuth();
  }, [onAuthSuccess, onAuthError]);

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-brand-600 mx-auto mb-4" />
        <p className="text-lg text-slate-600">Completing sign in...</p>
      </div>
    </div>
  );
};
