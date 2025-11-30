import { useEffect } from 'react';

/**
 * OAuth callback handler for Enoki authentication
 * NOTE: Enoki handles this automatically via EnokiFlow component
 * This page is kept for backward compatibility and manual redirect handling
 */
function AuthCallback() {
  useEffect(() => {
    // Send URL hash to parent window and close
    if (window.opener) {
      try {
        // Send hash to parent
        const hash = window.location.hash;
        if (hash) {
          window.opener.postMessage(
            { type: 'enoki-auth-callback', hash },
            window.location.origin
          );
        }
        
        // Close popup
        setTimeout(() => {
          window.close();
        }, 500);
      } catch (error) {
        console.error('Error handling auth callback:', error);
      }
    } else {
      // Redirect to home if not a popup
      window.location.href = '/';
    }
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔐</div>
        <div>Authenticating...</div>
        <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
          This window will close automatically
        </div>
      </div>
    </div>
  );
}

export default AuthCallback;
