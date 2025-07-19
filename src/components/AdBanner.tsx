
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
        height: window.innerWidth >= 768 ? 250 : 200,
        width: window.innerWidth >= 768 ? 300 : 280,
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
        height: window.innerWidth >= 768 ? 90 : 50,
        width: window.innerWidth >= 768 ? 728 : 320,
        params: {}
      }
    };

    const config = adConfigs[position];
    
    // Create unique container ID for this ad instance
    const containerId = `adsterra-${position}-${Date.now()}`;
    const adContainer = document.getElementById(`adsterra-${position}`);
    
    if (adContainer && !isLoaded) {
      console.log(`🎯 Loading ${position} ad with config:`, config);
      
      // Clear any existing ads
      adContainer.innerHTML = '';
      
      // Create ad div
      const adDiv = document.createElement('div');
      adDiv.id = containerId;
      adDiv.style.minHeight = `${config.height}px`;
      adDiv.style.width = '100%';
      adDiv.style.display = 'flex';
      adDiv.style.alignItems = 'center';
      adDiv.style.justifyContent = 'center';
      adContainer.appendChild(adDiv);
      
      // Set atOptions globally for this specific ad
      (window as any).atOptions = {
        key: config.key,
        format: config.format,
        height: config.height,
        width: config.width,
        params: config.params
      };

      // Load Adsterra ad script
      setTimeout(() => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `//esteemcountryside.com/${config.key}/invoke.js`;
        script.async = true;
        
        script.onload = () => {
          console.log(`✅ ${position} ad script loaded successfully`);
          setIsLoaded(true);
        };
        
        script.onerror = () => {
          console.error(`❌ Failed to load ${position} ad script`);
          // Show fallback content
          adDiv.innerHTML = '<div style="color: #666; font-size: 12px; text-align: center;">Advertisement</div>';
        };
        
        adDiv.appendChild(script);
      }, 500); // Small delay to ensure DOM is ready
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
        return "w-full min-h-[60px] md:min-h-[100px] flex items-center justify-center py-2 md:py-4 mb-4 bg-card/30 border-b border-border";
      case "sidebar":
        return "w-full min-h-[210px] md:min-h-[270px] flex items-center justify-center p-4 bg-card/30 rounded-lg border border-border mb-4";
      case "footer":
        return "w-full min-h-[60px] md:min-h-[100px] flex items-center justify-center py-3 md:py-4 mt-8 bg-card/30 border-t border-border";
      case "content":
        return "w-full min-h-[60px] md:min-h-[100px] flex items-center justify-center py-2 md:py-4 my-4 bg-card/30 rounded-lg border border-border";
      default:
        return "w-full min-h-[60px] flex items-center justify-center py-2";
    }
  };

  return (
    <div className={getAdContainerClasses()}>
      <div 
        id={`adsterra-${position}`}
        className="w-full flex items-center justify-center min-h-[50px] overflow-hidden"
        style={{ minHeight: position === 'sidebar' ? '200px' : '50px' }}
      />
    </div>
  );
};

export default AdBanner;
