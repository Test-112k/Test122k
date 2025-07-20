
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useState, useEffect } from "react";

interface UserAvatarProps {
  photoURL?: string | null;
  displayName?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const UserAvatar = ({ photoURL, displayName, size = "md", className = "" }: UserAvatarProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

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

  // Reset image states when photoURL changes
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [photoURL]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleImageLoad = () => {
    console.log('✅ Avatar image loaded successfully:', photoURL);
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = (e: any) => {
    console.warn('❌ Avatar image failed to load:', photoURL, e);
    setImageError(true);
    setImageLoaded(false);
  };

  // Clean and validate the photo URL
  const cleanPhotoURL = photoURL?.trim();
  const hasValidPhoto = cleanPhotoURL && 
    !imageError && 
    (cleanPhotoURL.startsWith('http://') || 
     cleanPhotoURL.startsWith('https://') || 
     cleanPhotoURL.startsWith('data:'));

  console.log('🖼️ Avatar render:', { 
    photoURL: cleanPhotoURL, 
    hasValidPhoto, 
    imageError, 
    imageLoaded,
    displayName 
  });

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {hasValidPhoto && (
        <AvatarImage 
          src={cleanPhotoURL} 
          alt={displayName || "User avatar"}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className="object-cover"
        />
      )}
      <AvatarFallback className="bg-muted text-muted-foreground border">
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
