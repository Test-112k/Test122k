
import { useEffect, useRef } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Delay ad loading to improve page performance
    const loadAd = () => {
      const adConfigs = {
        header: {
          key: '716ec023455c9639f2bf7e298fe9e3b8',
          format: 'iframe',
          height: window.innerWidth >= 768 ? 90 : 50,
          width: window.innerWidth >= 768 ? 728 : 320,
          params: {}
        },
        sidebar: {
          key: '5c4fccf9169fae315e4826325256daf8',
          format: 'iframe',
          height: 250,
          width: 300,
          params: {}
        },
        footer: {
          key: '716ec023455c9639f2bf7e298fe9e3b8',
          format: 'iframe',
          height: window.innerWidth >= 768 ? 90 : 50,
          width: window.innerWidth >= 768 ? 728 : 320,
          params: {}
        },
        content: {
          key: '138c604a0075f7cbb8208e3b72c0c2d7',
          format: 'iframe',
          height: 50,
          width: 320,
          params: {}
        }
      };

      const config = adConfigs[position];
      if (!containerRef.current) return;

      console.log(`🎯 Loading ${position} ad with config:`, config);
      
      // Clear any existing content
      containerRef.current.innerHTML = '';
      
      // Create visible placeholder that ensures ads are visible
      const placeholder = document.createElement('div');
      placeholder.style.cssText = `
        background: linear-gradient(45deg, hsl(var(--muted)) 0%, hsl(var(--card)) 100%);
        border: 1px solid hsl(var(--border));
        color: hsl(var(--foreground));
        font-size: 12px;
        text-align: center;
        padding: 10px;
        border-radius: 6px;
        min-height: ${config.height}px;
        width: ${config.width}px;
        max-width: 100%;
        display: flex !important;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        z-index: 1000;
        position: relative;
        margin: 0 auto;
        box-sizing: border-box;
        opacity: 1;
        visibility: visible;
      `;
      placeholder.innerHTML = `${position.toUpperCase()} AD (${config.width}x${config.height})`;
      containerRef.current.appendChild(placeholder);
      
      // Set global atOptions with unique identifier
      window.atOptions = {
        'key': config.key,
        'format': config.format,
        'height': config.height,
        'width': config.width,
        'params': {}
      };
      
      // Create ad script with unique ID
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `//esteemcountryside.com/${config.key}/invoke.js?t=${Date.now()}`;
      script.async = true;
      script.id = `ad-script-${position}-${Date.now()}`;
      
      script.onload = () => {
        console.log(`✅ ${position} ad script loaded - checking for ad content`);
        
        // Check if ad loaded after 3 seconds
        setTimeout(() => {
          const hasAdContent = containerRef.current?.querySelector('iframe') || 
                              containerRef.current?.querySelector('ins') ||
                              containerRef.current?.querySelector('[data-ad]');
          
          if (hasAdContent) {
            console.log(`✅ ${position} ad content detected, removing placeholder`);
            placeholder.remove();
          } else {
            console.log(`⚠️ No ${position} ad content found, keeping placeholder`);
            placeholder.innerHTML = `${position.toUpperCase()} AD SLOT (No ads available)`;
            placeholder.style.opacity = '0.7';
          }
        }, 3000);
      };
      
      script.onerror = () => {
        console.error(`❌ Failed to load ${position} ad script`);
        placeholder.innerHTML = `${position.toUpperCase()} AD ERROR`;
        placeholder.style.borderColor = 'hsl(var(--destructive))';
      };
      
      // Append script to container
      containerRef.current.appendChild(script);
    };

    // Delay ad loading by 1 second to improve initial page load
    const timer = setTimeout(loadAd, 1000);
    
    return () => {
      clearTimeout(timer);
      if (containerRef.current) {
        const scripts = containerRef.current.querySelectorAll('script');
        scripts.forEach(script => script.remove());
      }
    };
  }, [position]);

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
        ref={containerRef}
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
