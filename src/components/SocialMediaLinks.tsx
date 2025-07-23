
import { ExternalLink, MessageCircle, Hash } from "lucide-react";

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
    if (discord.startsWith('https://discord.com/') || discord.startsWith('http://discord.com/')) {
      return discord;
    }
    return null; // For username#1234 format, we can't create a direct link
  };


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
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm">Telegram</span>
        </a>
      )}
      
      {discord && (
        <>
          {formatDiscordUrl(discord) ? (
            <a
              href={formatDiscordUrl(discord)!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
              title="Discord"
            >
              <Hash className="h-4 w-4" />
              <span className="text-sm">Discord</span>
            </a>
          ) : (
            <div className="flex items-center gap-1 text-indigo-400">
              <Hash className="h-4 w-4" />
              <span className="text-sm" title="Discord Username">{discord}</span>
            </div>
          )}
        </>
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
