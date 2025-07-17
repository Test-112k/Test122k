
import { useEffect } from "react";

interface AdBannerProps {
  position: "header" | "sidebar" | "footer";
}

const AdBanner = ({ position }: AdBannerProps) => {
  useEffect(() => {
    // Different ad configurations for different positions with responsive sizing
    const adConfigs = {
      header: {
        key: '138c604a0075f7cbb8208e3b72c0c2d7',
        format: 'iframe',
        height: window.innerWidth >= 1024 ? 90 : 50, // Larger on desktop
        width: window.innerWidth >= 1024 ? 728 : 320, // Leaderboard on desktop
        params: {}
      },
      sidebar: {
        key: '138c604a0075f7cbb8208e3b72c0c2d7',
        format: 'iframe',
        height: window.innerWidth >= 1024 ? 600 : 250, // Much larger on desktop
        width: window.innerWidth >= 1024 ? 336 : 300, // Large rectangle on desktop
        params: {}
      },
      footer: {
        key: '138c604a0075f7cbb8208e3b72c0c2d7',
        format: 'iframe',
        height: window.innerWidth >= 1024 ? 90 : 50, // Larger on desktop
        width: window.innerWidth >= 1024 ? 728 : 320, // Leaderboard on desktop
        params: {}
      }
    };

    const config = adConfigs[position];
    
    // Set atOptions for this specific ad
    (window as any).atOptions = config;

    // Load Adsterra ad script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `//bluetackclasp.com/${config.key}/invoke.js`;
    script.async = true;
    
    const adContainer = document.getElementById(`adsterra-${position}`);
    if (adContainer) {
      adContainer.appendChild(script);
    }

    return () => {
      // Cleanup script on unmount
      if (adContainer && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [position]);

  const getAdContainerClasses = () => {
    switch (position) {
      case "header":
        return "w-full min-h-[60px] lg:min-h-[100px] flex items-center justify-center py-2 lg:py-4 mb-4 bg-card/30 border-b border-border";
      case "sidebar":
        return "w-full min-h-[260px] lg:min-h-[620px] flex items-center justify-center p-4 bg-card/30 rounded-lg border border-border mb-4";
      case "footer":
        return "w-full min-h-[60px] lg:min-h-[100px] flex items-center justify-center py-3 lg:py-4 mt-8 bg-card/30 border-t border-border";
      default:
        return "w-full min-h-[60px] flex items-center justify-center py-2";
    }
  };

  return (
    <div className={getAdContainerClasses()}>
      <div 
        id={`adsterra-${position}`}
        className="w-full flex items-center justify-center min-h-[50px]"
      />
    </div>
  );
};

export default AdBanner;
