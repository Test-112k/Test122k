
import { ExternalLink } from "lucide-react";

interface SocialMediaLinksProps {
  telegram?: string;
  discord?: string;
  website?: string;
  className?: string;
}

const SocialMediaLinks = ({ telegram, discord, website, className = "" }: SocialMediaLinksProps) => {
  const formatTelegramUrl = (telegram: string) => {
    if (telegram.startsWith('https://t.me/') || telegram.startsWith('http://t.me/')) {
      return telegram;
    }
    if (telegram.startsWith('@')) {
      return `https://t.me/${telegram.slice(1)}`;
    }
    if (telegram.startsWith('t.me/')) {
      return `https://${telegram}`;
    }
    return `https://t.me/${telegram}`;
  };

  const formatDiscordUrl = (discord: string) => {
    if (discord.startsWith('https://discord.gg/') || discord.startsWith('http://discord.gg/')) {
      return discord;
    }
    if (discord.startsWith('discord.gg/')) {
      return `https://${discord}`;
    }
    return null; // For username#1234 format, we can't create a direct link
  };

  const TelegramIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.379 2.655-1.407 3.119-2.286 3.119-.624 0-1.056-.468-1.317-.832-.13-.182-.221-.338-.275-.443-.016-.031-.024-.049-.024-.049l.016-.016c.177-.178.354-.355.531-.532.708-.708 1.404-1.404 1.404-1.404s-.177-.177-.354-.354c-.708-.708-1.404-1.404-1.404-1.404s.177-.177.354-.354c.708-.708 1.404-1.404 1.404-1.404s-.177-.177-.354-.354c-.708-.708-1.404-1.404-1.404-1.404l.531-.531c.353-.353.707-.707 1.06-1.06.177-.177.354-.354.531-.531.177-.177.354-.354.531-.531.177-.177.354-.354.531-.531.177-.177.354-.354.531-.531.177-.177.354-.354.531-.531l.016-.016s.008.018.024.049c.054.105.145.261.275.443.261.364.693.832 1.317.832.879 0 1.907-.464 2.286-3.119 0 0 .727-4.87.896-6.728.054-.598-.081-1.061-.405-1.388-.324-.327-.787-.462-1.385-.405z"/>
    </svg>
  );

  const DiscordIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.369a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.010c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );

  if (!telegram && !discord && !website) {
    return null;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {telegram && (
        <a
          href={formatTelegramUrl(telegram)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
          title="Telegram"
        >
          <TelegramIcon />
          <span className="text-sm">Telegram</span>
        </a>
      )}
      
      {discord && (
        <div className="flex items-center gap-1 text-indigo-400">
          <DiscordIcon />
          <span className="text-sm">
            {formatDiscordUrl(discord) ? (
              <a
                href={formatDiscordUrl(discord)!}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-300 transition-colors"
                title="Discord"
              >
                Discord
              </a>
            ) : (
              <span title="Discord Username">{discord}</span>
            )}
          </span>
        </div>
      )}
      
      {website && (
        <a
          href={website.startsWith('http') ? website : `https://${website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
          title="Website"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="text-sm">Website</span>
        </a>
      )}
    </div>
  );
};

export default SocialMediaLinks;
