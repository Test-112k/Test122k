
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useState } from "react";

interface UserAvatarProps {
  photoURL?: string | null;
  displayName?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const UserAvatar = ({ photoURL, displayName, size = "md", className = "" }: UserAvatarProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

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

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  // Clean and validate the photo URL
  const cleanPhotoURL = photoURL?.trim();
  const hasValidPhoto = cleanPhotoURL && !imageError && (cleanPhotoURL.startsWith('http://') || cleanPhotoURL.startsWith('https://'));

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {hasValidPhoto && (
        <AvatarImage 
          src={cleanPhotoURL} 
          alt={displayName || "User avatar"}
          onLoad={handleImageLoad}
          onError={handleImageError}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          className="object-cover"
          loading="lazy"
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
