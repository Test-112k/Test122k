
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
    // Immediate ad loading for better visibility
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
      
      // Set global atOptions before creating script
      window.atOptions = {
        'key': config.key,
        'format': config.format,
        'height': config.height,
        'width': config.width,
        'params': {}
      };
      
      // Create ad script first
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `//esteemcountryside.com/${config.key}/invoke.js`;
      script.async = true;
      
      script.onload = () => {
        console.log(`✅ ${position} ad script loaded successfully`);
        
        // For sidebar ads, ensure they're always visible
        if (position === 'sidebar') {
          setTimeout(() => {
            const hasAdContent = containerRef.current?.querySelector('iframe') || 
                                containerRef.current?.querySelector('ins') ||
                                containerRef.current?.querySelector('[data-ad]') ||
                                containerRef.current?.children.length > 1;
            
            if (!hasAdContent) {
              console.log(`⚠️ No ${position} ad content found, creating prominent fallback`);
              const fallback = document.createElement('div');
              fallback.style.cssText = `
                background: linear-gradient(135deg, hsl(var(--primary)/0.1) 0%, hsl(var(--accent)/0.1) 100%);
                border: 2px solid hsl(var(--primary)/0.3);
                color: hsl(var(--primary));
                font-size: 14px;
                font-weight: 600;
                text-align: center;
                padding: 20px;
                border-radius: 8px;
                min-height: ${config.height}px;
                width: ${config.width}px;
                max-width: 100%;
                display: flex !important;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 8px;
                margin: 0 auto;
                box-shadow: 0 4px 12px hsl(var(--primary)/0.1);
              `;
              fallback.innerHTML = `
                <div style="font-size: 16px;">📢 SIDEBAR AD</div>
                <div style="font-size: 12px; opacity: 0.8;">${config.width} × ${config.height}</div>
                <div style="font-size: 10px; opacity: 0.6;">Key: ${config.key}</div>
              `;
              containerRef.current?.appendChild(fallback);
            } else {
              console.log(`✅ ${position} ad content detected and visible`);
            }
          }, 1500);
        } else {
          // For other ads, use simpler fallback
          setTimeout(() => {
            const hasAdContent = containerRef.current?.querySelector('iframe') || 
                                containerRef.current?.querySelector('ins') ||
                                containerRef.current?.querySelector('[data-ad]') ||
                                containerRef.current?.children.length > 1;
            
            if (!hasAdContent) {
              console.log(`⚠️ No ${position} ad content found, showing placeholder`);
              const placeholder = document.createElement('div');
              placeholder.style.cssText = `
                background: linear-gradient(135deg, hsl(var(--primary)/0.05) 0%, hsl(var(--accent)/0.05) 100%);
                border: 1px solid hsl(var(--border));
                color: hsl(var(--muted-foreground));
                font-size: 12px;
                text-align: center;
                padding: 8px;
                border-radius: 6px;
                min-height: ${config.height}px;
                width: 100%;
                display: flex !important;
                align-items: center;
                justify-content: center;
                font-weight: 500;
                opacity: 0.7;
              `;
              placeholder.innerHTML = `${position.toUpperCase()} AD (${config.width}×${config.height})`;
              containerRef.current?.appendChild(placeholder);
            }
          }, 1500);
        }
      };
      
      script.onerror = () => {
        console.error(`❌ Failed to load ${position} ad script`);
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
          background: hsl(var(--destructive)/0.1);
          border: 1px solid hsl(var(--destructive)/0.3);
          color: hsl(var(--destructive));
          font-size: 12px;
          text-align: center;
          padding: 8px;
          border-radius: 6px;
          min-height: ${config.height}px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        errorDiv.innerHTML = `AD ERROR - ${position}`;
        containerRef.current?.appendChild(errorDiv);
      };
      
      // Append script to container
      containerRef.current.appendChild(script);
    };

    // Load immediately for better UX
    loadAd();
    
    return () => {
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
