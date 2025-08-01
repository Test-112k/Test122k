
import { useEffect, useState } from "react";

// Extend Window interface for atOptions
declare global {
  interface Window {
    atOptions: any;
  }
}

interface AdBannerProps {
  position: "header" | "sidebar" | "footer" | "content";
}

const AdBanner = ({ position }: AdBannerProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // All ad codes exactly as provided by user - properly separated and configured
    const adConfigs = {
      header: {
        key: '716ec023455c9639f2bf7e298fe9e3b8', // 728x90 leaderboard - user provided code
        format: 'iframe',
        height: window.innerWidth >= 768 ? 90 : 50,
        width: window.innerWidth >= 768 ? 728 : 320,
        params: {}
      },
      sidebar: {
        key: '5c4fccf9169fae315e4826325256daf8', // 300x250 medium rectangle - user provided code
        format: 'iframe',
        height: 250,
        width: 300,
        params: {}
      },
      footer: {
        key: '716ec023455c9639f2bf7e298fe9e3b8', // 728x90 leaderboard - same as header
        format: 'iframe',
        height: window.innerWidth >= 768 ? 90 : 50,
        width: window.innerWidth >= 768 ? 728 : 320,
        params: {}
      },
      content: {
        key: '138c604a0075f7cbb8208e3b72c0c2d7', // 320x50 mobile banner - user provided code
        format: 'iframe',
        height: 50,
        width: 320,
        params: {}
      }
    };

    const config = adConfigs[position];
    const adContainer = document.getElementById(`adsterra-${position}`);
    
    if (adContainer && !isLoaded) {
      console.log(`🎯 Loading ${position} ad with config:`, config);
      
      // Clear any existing content
      adContainer.innerHTML = '';
      
      // Create visible placeholder first
      const placeholder = document.createElement('div');
      placeholder.style.cssText = `
        background: hsl(var(--muted));
        border: 2px dashed hsl(var(--border));
        color: hsl(var(--foreground));
        font-size: 14px;
        text-align: center;
        padding: 20px;
        border-radius: 8px;
        min-height: ${config.height}px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        z-index: 10;
        position: relative;
      `;
      placeholder.innerHTML = `Loading ${position} Advertisement...`;
      adContainer.appendChild(placeholder);
      
      // Set global atOptions for this ad
      window.atOptions = {
        'key': config.key,
        'format': config.format,
        'height': config.height,
        'width': config.width,
        'params': {}
      };
      
      // Create and load the ad script
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `//esteemcountryside.com/${config.key}/invoke.js`;
      script.async = true;
      
      script.onload = () => {
        console.log(`✅ ${position} ad script loaded successfully`);
        // Remove placeholder after successful load
        setTimeout(() => {
          if (placeholder && placeholder.parentNode) {
            placeholder.remove();
          }
        }, 2000);
      };
      
      script.onerror = () => {
        console.error(`❌ Failed to load ${position} ad script`);
        placeholder.innerHTML = `Advertisement Unavailable`;
        placeholder.style.color = 'hsl(var(--muted-foreground))';
      };
      
      // Append script to container
      adContainer.appendChild(script);
      setIsLoaded(true);
    }

    return () => {
      // Cleanup on unmount - remove any ad scripts
      const adContainer = document.getElementById(`adsterra-${position}`);
      if (adContainer) {
        const scripts = adContainer.querySelectorAll('script');
        scripts.forEach(script => script.remove());
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
