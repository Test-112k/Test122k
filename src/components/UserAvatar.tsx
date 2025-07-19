
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface UserAvatarProps {
  photoURL?: string | null;
  displayName?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const UserAvatar = ({ photoURL, displayName, size = "md", className = "" }: UserAvatarProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-6 w-6"
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Hide the image if it fails to load
    e.currentTarget.style.display = 'none';
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {photoURL && (
        <AvatarImage 
          src={photoURL} 
          alt={displayName || "User avatar"}
          onError={handleImageError}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      )}
      <AvatarFallback className="bg-muted text-muted-foreground">
        {displayName ? (
          <span className="text-xs font-medium">{getInitials(displayName)}</span>
        ) : (
          <User className={iconSizes[size]} />
        )}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
