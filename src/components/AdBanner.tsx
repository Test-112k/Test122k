import { useEffect } from "react";

interface AdBannerProps {
  position: "header" | "sidebar" | "footer" | "content";
}

const AdBanner = ({ position }: AdBannerProps) => {
  useEffect(() => {
    // Different ad configurations for different positions with responsive sizing
    const adConfigs = {
      header: {
        key: '716ec023455c9639f2bf7e298fe9e3b8', // 728x90 leaderboard
        format: 'iframe',
        height: window.innerWidth >= 1024 ? 90 : 50,
        width: window.innerWidth >= 1024 ? 728 : 320,
        params: {}
      },
      sidebar: {
        key: '5c4fccf9169fae315e4826325256daf8', // 300x250 medium rectangle
        format: 'iframe',
        height: window.innerWidth >= 1024 ? 250 : 200,
        width: window.innerWidth >= 1024 ? 300 : 280,
        params: {}
      },
      footer: {
        key: '716ec023455c9639f2bf7e298fe9e3b8', // 728x90 leaderboard
        format: 'iframe',
        height: window.innerWidth >= 1024 ? 90 : 50,
        width: window.innerWidth >= 1024 ? 728 : 320,
        params: {}
      },
      content: {
        key: '138c604a0075f7cbb8208e3b72c0c2d7', // 320x50 mobile banner
        format: 'iframe',
        height: window.innerWidth >= 1024 ? 90 : 50,
        width: window.innerWidth >= 1024 ? 728 : 320,
        params: {}
      }
    };

    const config = adConfigs[position];
    
    // Create unique container ID for this ad instance
    const containerId = `adsterra-${position}-${Date.now()}`;
    const adContainer = document.getElementById(`adsterra-${position}`);
    
    if (adContainer) {
      // Clear any existing ads
      adContainer.innerHTML = '';
      
      // Create ad div
      const adDiv = document.createElement('div');
      adDiv.id = containerId;
      adContainer.appendChild(adDiv);
      
      // Set atOptions for this specific ad
      (window as any).atOptions = config;

      // Load Adsterra ad script
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `//esteemcountryside.com/${config.key}/invoke.js`;
      script.async = true;
      
      adDiv.appendChild(script);
    }

    return () => {
      // Cleanup on unmount
      if (adContainer) {
        adContainer.innerHTML = '';
      }
    };
  }, [position]);

  const getAdContainerClasses = () => {
    switch (position) {
      case "header":
        return "w-full min-h-[60px] lg:min-h-[100px] flex items-center justify-center py-2 lg:py-4 mb-4 bg-card/30 border-b border-border";
      case "sidebar":
        return "w-full min-h-[210px] lg:min-h-[270px] flex items-center justify-center p-4 bg-card/30 rounded-lg border border-border mb-4";
      case "footer":
        return "w-full min-h-[60px] lg:min-h-[100px] flex items-center justify-center py-3 lg:py-4 mt-8 bg-card/30 border-t border-border";
      case "content":
        return "w-full min-h-[60px] lg:min-h-[100px] flex items-center justify-center py-2 lg:py-4 my-4 bg-card/30 rounded-lg border border-border";
      default:
        return "w-full min-h-[60px] flex items-center justify-center py-2";
    }
  };

  return (
    <div className={getAdContainerClasses()}>
      <div 
        id={`adsterra-${position}`}
        className="w-full flex items-center justify-center min-h-[50px] overflow-hidden"
      />
    </div>
  );
};

export default AdBanner;