
import { useEffect, useState } from "react";

interface AdBannerProps {
  position: "header" | "sidebar" | "footer" | "content";
}

const AdBanner = ({ position }: AdBannerProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Different ad configurations for different positions with responsive sizing
    const adConfigs = {
      header: {
        key: '716ec023455c9639f2bf7e298fe9e3b8', // 728x90 leaderboard
        format: 'iframe',
        height: window.innerWidth >= 768 ? 90 : 50,
        width: window.innerWidth >= 768 ? 728 : 320,
        params: {}
      },
      sidebar: {
        key: '5c4fccf9169fae315e4826325256daf8', // 300x250 medium rectangle
        format: 'iframe',
        height: 250,
        width: 300,
        params: {}
      },
      footer: {
        key: '716ec023455c9639f2bf7e298fe9e3b8', // 728x90 leaderboard  
        format: 'iframe',
        height: window.innerWidth >= 768 ? 90 : 50,
        width: window.innerWidth >= 768 ? 728 : 320,
        params: {}
      },
      content: {
        key: '138c604a0075f7cbb8208e3b72c0c2d7', // 320x50 mobile banner
        format: 'iframe',
        height: 50,
        width: 320,
        params: {}
      }
    };

    const config = adConfigs[position];
    
    // Create unique container ID for this ad instance
    const uniqueId = `${position}-${Math.random().toString(36).substr(2, 9)}`;
    const containerId = `adsterra-${uniqueId}`;
    const adContainer = document.getElementById(`adsterra-${position}`);
    
    if (adContainer && !isLoaded) {
      console.log(`🎯 Loading ${position} ad with config:`, config);
      
      // Clear any existing ads
      adContainer.innerHTML = '';
      
      // Create ad script with inline configuration to avoid conflicts
      const scriptContent = `
        (function() {
          var atOptions_${uniqueId} = {
            'key': '${config.key}',
            'format': '${config.format}',
            'height': ${config.height},
            'width': ${config.width},
            'params': {}
          };
          
          // Temporarily set global atOptions for this ad
          window.atOptions = atOptions_${uniqueId};
          
          // Create and append invoke script
          var script = document.createElement('script');
          script.type = 'text/javascript';
          script.src = '//esteemcountryside.com/${config.key}/invoke.js';
          script.onload = function() {
            console.log('✅ ${position} ad script loaded successfully');
          };
           script.onerror = function() {
             console.error('❌ Failed to load ${position} ad script');
             var fallbackDiv = document.getElementById('${containerId}');
             if (fallbackDiv) {
               fallbackDiv.innerHTML = '<div style="background: #f8f9fa; border: 1px dashed #dee2e6; color: #6c757d; font-size: 12px; text-align: center; padding: 20px; border-radius: 4px;">Advertisement Space</div>';
             }
           };
          document.getElementById('${containerId}').appendChild(script);
        })();
      `;
      
      // Create ad div
      const adDiv = document.createElement('div');
      adDiv.id = containerId;
      adDiv.style.minHeight = `${config.height}px`;
      adDiv.style.width = position === 'sidebar' ? '300px' : '100%';
      adDiv.style.display = 'flex';
      adDiv.style.alignItems = 'center';
      adDiv.style.justifyContent = 'center';
      adDiv.style.margin = '0 auto';
      adContainer.appendChild(adDiv);
      
      // Execute the ad script after a short delay
      setTimeout(() => {
        const scriptElement = document.createElement('script');
        scriptElement.type = 'text/javascript';
        scriptElement.innerHTML = scriptContent;
        document.head.appendChild(scriptElement);
        setIsLoaded(true);
      }, 200);
    }

    return () => {
      // Cleanup on unmount
      if (adContainer) {
        const existingAd = adContainer.querySelector(`#${containerId}`);
        if (existingAd) {
          existingAd.remove();
        }
      }
    };
  }, [position, isLoaded]);

  const getAdContainerClasses = () => {
    switch (position) {
      case "header":
        return "w-full min-h-[60px] md:min-h-[100px] flex items-center justify-center py-2 md:py-4 mb-4 bg-card/30 border-b border-border relative z-10";
      case "sidebar":
        return "w-full max-w-[300px] min-h-[270px] flex items-center justify-center p-4 bg-card/30 rounded-lg border border-border mb-4 mx-auto relative z-10";
      case "footer":
        return "w-full min-h-[60px] md:min-h-[100px] flex items-center justify-center py-3 md:py-4 mt-8 bg-card/30 border-t border-border relative z-10";
      case "content":
        return "w-full max-w-[320px] min-h-[60px] flex items-center justify-center py-2 md:py-4 my-4 bg-card/30 rounded-lg border border-border mx-auto relative z-10";
      default:
        return "w-full min-h-[60px] flex items-center justify-center py-2 relative z-10";
    }
  };

  return (
    <div className={getAdContainerClasses()}>
      <div 
        id={`adsterra-${position}`}
        className="w-full flex items-center justify-center overflow-hidden relative"
        style={{ 
          minHeight: position === 'sidebar' ? '250px' : '50px',
          maxWidth: position === 'sidebar' ? '300px' : position === 'content' ? '320px' : '100%',
          zIndex: 1
        }}
      />
    </div>
  );
};

export default AdBanner;
