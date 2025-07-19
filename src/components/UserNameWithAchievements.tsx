
import { useState, useEffect } from 'react';
import { getUserAchievements, type UserAchievement } from '@/lib/userAchievements';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import UserAvatar from './UserAvatar';

interface UserNameWithAchievementsProps {
  userId?: string | null;
  userName: string;
  className?: string;
  showAvatar?: boolean;
  avatarSize?: "sm" | "md" | "lg";
}

interface UserProfile {
  photoURL?: string;
  displayName?: string;
}

const UserNameWithAchievements = ({ 
  userId, 
  userName, 
  className = "", 
  showAvatar = false,
  avatarSize = "sm"
}: UserNameWithAchievementsProps) => {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        // Load achievements and user profile in parallel
        const [userAchievements, profileDoc] = await Promise.all([
          getUserAchievements(userId),
          getDoc(doc(db, 'users', userId))
        ]);
        
        setAchievements(userAchievements);
        
        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          setUserProfile({
            photoURL: profileData.photoURL,
            displayName: profileData.displayName || userName
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId, userName]);

  // Get the highest priority achievement
  const topAchievement = achievements[0];

  if (loading && showAvatar) {
    return (
      <div className="flex items-center gap-2">
        <UserAvatar size={avatarSize} />
        <span className={className}>{userName}</span>
      </div>
    );
  }

  // Apply achievement styles with enhanced aura effects
  const achievementClasses = {
    admin: 'text-red-400 font-bold pulse-glow-red',
    legendary: 'text-purple-400 font-bold rainbow-glow',
    viral: 'text-yellow-400 font-bold pulse-glow-gold',
    elite: 'text-purple-400 font-bold pulse-glow-purple',
    popular: 'text-orange-400 font-bold pulse-glow-orange',
    creator: 'text-green-400 font-bold pulse-glow-green',
    active: 'text-blue-400 font-medium pulse-glow-blue'
  };

  const achievementClass = topAchievement ? achievementClasses[topAchievement.type] || '' : '';

  const nameElement = (
    <span 
      className={`${className} ${achievementClass}`}
      title={topAchievement ? `${topAchievement.title}: ${topAchievement.description}` : undefined}
    >
      {userName}
    </span>
  );

  if (showAvatar) {
    return (
      <div className="flex items-center gap-2">
        <UserAvatar 
          photoURL={userProfile?.photoURL} 
          displayName={userProfile?.displayName || userName}
          size={avatarSize}
        />
        {nameElement}
      </div>
    );
  }

  return nameElement;
};

export default UserNameWithAchievements;
