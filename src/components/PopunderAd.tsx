
import { useEffect } from 'react';

const PopunderAd = () => {
  useEffect(() => {
    const checkAndShowAd = () => {
      // Use sessionStorage instead of localStorage for session-based limiting
      const sessionKey = 'popunder_ad_shown';
      const hasShownInSession = sessionStorage.getItem(sessionKey);
      
      // Show ad only if not shown in current session
      if (!hasShownInSession) {
        console.log('🎯 Loading popunder ad...');
        
        // Load the popunder script - exact user provided code: 9d34413f62350743d04423c4096eb699.js
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//esteemcountryside.com/9d/34/41/9d34413f62350743d04423c4096eb699.js';
        script.async = true;
        
        script.onload = () => {
          // Mark as shown for this session
          sessionStorage.setItem(sessionKey, 'true');
          console.log('✅ Popunder ad loaded and marked for session');
        };
        
        script.onerror = () => {
          console.error('❌ Failed to load popunder ad script');
        };
        
        document.head.appendChild(script);
        
        // Cleanup function to remove script
        return () => {
          if (document.head.contains(script)) {
            document.head.removeChild(script);
          }
        };
      } else {
        console.log('🚫 Popunder ad already shown in this session');
      }
    };
    
    // Delay execution to ensure page is fully loaded and user interaction
    const timer = setTimeout(checkAndShowAd, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything visible
};

export default PopunderAd;
