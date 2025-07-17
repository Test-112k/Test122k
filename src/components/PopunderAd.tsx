import { useEffect } from 'react';

const PopunderAd = () => {
  useEffect(() => {
    const checkAndShowAd = () => {
      const today = new Date().toDateString();
      const storedData = localStorage.getItem('popunder_ad_data');
      
      let adData = { date: today, count: 0 };
      
      if (storedData) {
        const parsed = JSON.parse(storedData);
        if (parsed.date === today) {
          adData = parsed;
        }
      }
      
      // Show ad only if count is less than 2 for today
      if (adData.count < 2) {
        // Load the popunder script
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//esteemcountryside.com/9d/34/41/9d34413f62350743d04423c4096eb699.js';
        script.async = true;
        
        script.onload = () => {
          // Increment count after successful load
          adData.count += 1;
          localStorage.setItem('popunder_ad_data', JSON.stringify(adData));
        };
        
        document.head.appendChild(script);
        
        // Cleanup function to remove script
        return () => {
          if (document.head.contains(script)) {
            document.head.removeChild(script);
          }
        };
      }
    };
    
    // Delay execution to ensure page is fully loaded
    const timer = setTimeout(checkAndShowAd, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything visible
};

export default PopunderAd;