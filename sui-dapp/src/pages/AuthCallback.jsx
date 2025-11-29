import { useEffect } from 'react';

/**
 * OAuth callback handler for Enoki authentication
 * NOTE: Enoki handles this automatically via EnokiFlow component
 * This page is kept for backward compatibility and manual redirect handling
 */
function AuthCallback() {
  useEffect(() => {
    // URL hash'i parent window'a gönder ve kapat
    if (window.opener) {
      try {
        // Hash'i parent'a gönder
        const hash = window.location.hash;
        if (hash) {
          window.opener.postMessage(
            { type: 'enoki-auth-callback', hash },
            window.location.origin
          );
        }
        
        // Popup'ı kapat
        setTimeout(() => {
          window.close();
        }, 500);
      } catch (error) {
        console.error('Error handling auth callback:', error);
      }
    } else {
      // Popup değilse ana sayfaya yönlendir
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
