import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useZKLogin } from '@/contexts/ZKLoginContext';
import { extractTokenFromHash } from '@/config/zklogin';

// Capture token IMMEDIATELY before React Router can interfere
// This runs as soon as the module loads
const captureTokenFromURL = () => {
  if (typeof window === 'undefined') return null;
  
  const hash = window.location.hash;
  if (!hash) return null;
  
  console.log('[AuthCallback] Capturing token immediately from hash:', hash);
  
  // Remove the '#' and parse
  const hashParams = new URLSearchParams(hash.substring(1));
  const token = hashParams.get('id_token');
  
  if (token) {
    console.log('[AuthCallback] Token captured! Storing in sessionStorage');
    sessionStorage.setItem('oauth_id_token_immediate', token);
    return token;
  }
  
  return null;
};

// Capture immediately when module loads
const immediateToken = captureTokenFromURL();

/**
 * AuthCallback - Handles OAuth redirect and completes ZKLogin flow
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const { handleCallback } = useZKLogin();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processCallback = async () => {
      try {
        console.log('[AuthCallback] Starting OAuth callback processing...');
        console.log('[AuthCallback] Current URL:', window.location.href);
        
        // Try multiple sources for the token
        let idToken = 
          immediateToken || // Token captured at module load
          sessionStorage.getItem('oauth_id_token_immediate') || // From immediate capture
          sessionStorage.getItem('oauth_id_token') || // From previous attempt
          extractTokenFromHash(); // Try extracting again
        
        console.log('[AuthCallback] ID Token found:', idToken ? 'YES' : 'NO');
        console.log('[AuthCallback] Token source:', 
          immediateToken ? 'immediate capture' : 
          sessionStorage.getItem('oauth_id_token_immediate') ? 'sessionStorage (immediate)' :
          sessionStorage.getItem('oauth_id_token') ? 'sessionStorage (previous)' :
          'extract attempt'
        );

        if (!idToken) {
          console.error('[AuthCallback] All token sources failed');
          throw new Error('No ID token found in OAuth callback');
        }

        console.log('[AuthCallback] Calling handleCallback...');
        // Process the callback and complete authentication
        await handleCallback(idToken);
        
        // Clear all temporary token storage
        sessionStorage.removeItem('oauth_id_token');
        sessionStorage.removeItem('oauth_id_token_immediate');
        
        console.log('[AuthCallback] Success! Redirecting to passport...');
        // Redirect to passport page on success
        navigate('/passport', { replace: true });
      } catch (error) {
        console.error('[AuthCallback] OAuth callback error:', error);
        
        // Clear the temporary token storage on error
        sessionStorage.removeItem('oauth_id_token');
        sessionStorage.removeItem('oauth_id_token_immediate');
        
        // Redirect to home with error message
        navigate('/?auth_error=' + encodeURIComponent(error.message), { replace: true });
      }
    };

    processCallback();
  }, [handleCallback, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <h2 className="text-2xl font-bold font-mono">Completing Authentication</h2>
      <p className="text-muted-foreground">Please wait while we verify your credentials...</p>
    </div>
  );
};

export default AuthCallback;
