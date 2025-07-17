import { useState, useEffect } from 'react';
import { getUserAchievements, type UserAchievement } from '@/lib/userAchievements';

interface UserNameWithAchievementsProps {
  userId?: string | null;
  userName: string;
  className?: string;
}

const UserNameWithAchievements = ({ userId, userName, className = "" }: UserNameWithAchievementsProps) => {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAchievements = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const userAchievements = await getUserAchievements(userId);
        setAchievements(userAchievements);
      } catch (error) {
        console.error('Error loading user achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAchievements();
  }, [userId]);

  // Get the highest priority achievement
  const topAchievement = achievements[0];

  if (loading) {
    return <span className={className}>{userName}</span>;
  }

  if (!topAchievement) {
    return <span className={className}>{userName}</span>;
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

  const achievementClass = achievementClasses[topAchievement.type] || '';

  return (
    <span 
      className={`${className} ${achievementClass}`}
      title={`${topAchievement.title}: ${topAchievement.description}`}
    >
      {userName}
    </span>
  );
};

export default UserNameWithAchievements;