import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

export interface UserStats {
  totalPastes: number;
  totalViews: number;
  publicPastes: number;
  lastActive: any;
  createdAt: any;
  displayName?: string;
  email?: string;
  photoURL?: string;
  activeDays?: number;
  recentViews30Days?: number;
  isAdmin?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'pastes' | 'views' | 'public_pastes';
  unlocked: boolean;
  progress: number;
}

export interface UserAchievement {
  type: 'admin' | 'legendary' | 'viral' | 'popular' | 'active' | 'creator' | 'elite';
  title: string;
  description: string;
  priority: number;
}

export const saveUserInfo = async (user: User): Promise<void> => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    const userData = {
      displayName: user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
      lastActive: serverTimestamp(),
    };
    
    if (!userDoc.exists()) {
      // Create new user document
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        totalPastes: 0,
        totalViews: 0,
        publicPastes: 0,
        activeDays: 1,
        recentViews30Days: 0,
        isAdmin: false,
      });
      console.log('✅ New user info saved to database');
    } else {
      // Update existing user info
      await updateDoc(userRef, userData);
      console.log('✅ User info updated in database');
    }
  } catch (error) {
    console.error('❌ Error saving user info:', error);
  }
};

export const getUserStats = async (userId: string): Promise<UserStats | null> => {
  try {
    console.log('🏆 Loading user stats for achievements...');
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      console.log('📊 No user stats found, creating default stats');
      return {
        totalPastes: 0,
        totalViews: 0,
        publicPastes: 0,
        lastActive: new Date(),
        createdAt: new Date(),
        activeDays: 0,
        recentViews30Days: 0,
        isAdmin: false,
      };
    }
    
    const userData = userDoc.data() as UserStats;
    console.log('📊 User stats loaded:', userData);
    return userData;
  } catch (error) {
    console.error('Error getting user stats:', error);
    return null;
  }
};

export const getUserAchievements = async (userId: string): Promise<UserAchievement[]> => {
  const userStats = await getUserStats(userId);
  if (!userStats) return [];
  
  const achievements: UserAchievement[] = [];
  
  // Check admin status (highest priority)
  if (userStats.isAdmin) {
    achievements.push({
      type: 'admin',
      title: 'Admin',
      description: 'Platform Administrator',
      priority: 1
    });
  }
  
  // Check legendary status (100,000+ total views)
  if (userStats.totalViews >= 100000) {
    achievements.push({
      type: 'legendary',
      title: 'Legendary Creator',
      description: '100,000+ total views',
      priority: 2
    });
  }
  
  // Check viral status (10,000+ total views)
  if (userStats.totalViews >= 10000) {
    achievements.push({
      type: 'viral',
      title: 'Viral Creator',
      description: '10,000+ total views',
      priority: 3
    });
  }
  
  // Check elite status (50+ pastes + 5,000+ views)
  if (userStats.totalPastes >= 50 && userStats.totalViews >= 5000) {
    achievements.push({
      type: 'elite',
      title: 'Elite Member',
      description: '50+ pastes & 5,000+ views',
      priority: 4
    });
  }
  
  // Check popular status (1,000+ views in 30 days)
  if (userStats.recentViews30Days >= 1000) {
    achievements.push({
      type: 'popular',
      title: 'Popular Creator',
      description: '1,000+ views in 30 days',
      priority: 5
    });
  }
  
  // Check creator status (25+ pastes)
  if (userStats.totalPastes >= 25) {
    achievements.push({
      type: 'creator',
      title: 'Content Creator',
      description: '25+ pastes created',
      priority: 6
    });
  }
  
  // Check active status (20+ days active)
  if (userStats.activeDays >= 20) {
    achievements.push({
      type: 'active',
      title: 'Active Member',
      description: '20+ days active',
      priority: 7
    });
  }
  
  // Sort by priority (lower number = higher priority)
  return achievements.sort((a, b) => a.priority - b.priority);
};

export const updateUserStats = async (userId: string, viewsToAdd: number = 0): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Update stats
    const updateData: any = {
      lastActive: serverTimestamp(),
    };
    
    if (viewsToAdd > 0) {
      updateData.totalViews = increment(viewsToAdd);
      updateData.recentViews30Days = increment(viewsToAdd);
    }
    
    await updateDoc(userRef, updateData);
    console.log('✅ User stats updated successfully');
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
};

export const getAchievements = async (userId: string): Promise<Achievement[]> => {
  const userStats = await getUserStats(userId);
  
  if (!userStats) {
    return getDefaultAchievements();
  }
  
  const achievements: Achievement[] = [
    {
      id: 'first_paste',
      title: 'First Steps',
      description: 'Create your first paste',
      icon: '🎯',
      requirement: 1,
      type: 'pastes',
      unlocked: userStats.totalPastes >= 1,
      progress: Math.min(userStats.totalPastes, 1),
    },
    {
      id: 'paste_creator',
      title: 'Paste Creator',
      description: 'Create 5 pastes',
      icon: '📝',
      requirement: 5,
      type: 'pastes',
      unlocked: userStats.totalPastes >= 5,
      progress: Math.min(userStats.totalPastes, 5),
    },
    {
      id: 'prolific_writer',
      title: 'Prolific Writer',
      description: 'Create 25 pastes',
      icon: '✍️',
      requirement: 25,
      type: 'pastes',
      unlocked: userStats.totalPastes >= 25,
      progress: Math.min(userStats.totalPastes, 25),
    },
    {
      id: 'paste_master',
      title: 'Paste Master',
      description: 'Create 100 pastes',
      icon: '🏆',
      requirement: 100,
      type: 'pastes',
      unlocked: userStats.totalPastes >= 100,
      progress: Math.min(userStats.totalPastes, 100),
    },
    {
      id: 'first_view',
      title: 'Getting Noticed',
      description: 'Get your first view',
      icon: '👁️',
      requirement: 1,
      type: 'views',
      unlocked: userStats.totalViews >= 1,
      progress: Math.min(userStats.totalViews, 1),
    },
    {
      id: 'popular_content',
      title: 'Popular Content',
      description: 'Get 100 total views',
      icon: '🔥',
      requirement: 100,
      type: 'views',
      unlocked: userStats.totalViews >= 100,
      progress: Math.min(userStats.totalViews, 100),
    },
    {
      id: 'viral_creator',
      title: 'Viral Creator',
      description: 'Get 1000 total views',
      icon: '⭐',
      requirement: 1000,
      type: 'views',
      unlocked: userStats.totalViews >= 1000,
      progress: Math.min(userStats.totalViews, 1000),
    },
    {
      id: 'view_legend',
      title: 'View Legend',
      description: 'Get 10000 total views',
      icon: '👑',
      requirement: 10000,
      type: 'views',
      unlocked: userStats.totalViews >= 10000,
      progress: Math.min(userStats.totalViews, 10000),
    },
    {
      id: 'public_sharer',
      title: 'Public Sharer',
      description: 'Create your first public paste',
      icon: '🌍',
      requirement: 1,
      type: 'public_pastes',
      unlocked: userStats.publicPastes >= 1,
      progress: Math.min(userStats.publicPastes, 1),
    },
    {
      id: 'community_contributor',
      title: 'Community Contributor',
      description: 'Create 10 public pastes',
      icon: '🤝',
      requirement: 10,
      type: 'public_pastes',
      unlocked: userStats.publicPastes >= 10,
      progress: Math.min(userStats.publicPastes, 10),
    },
    {
      id: 'open_source_hero',
      title: 'Open Source Hero',
      description: 'Create 50 public pastes',
      icon: '🦸',
      requirement: 50,
      type: 'public_pastes',
      unlocked: userStats.publicPastes >= 50,
      progress: Math.min(userStats.publicPastes, 50),
    },
  ];
  
  return achievements;
};

const getDefaultAchievements = (): Achievement[] => {
  return [
    {
      id: 'first_paste',
      title: 'First Steps',
      description: 'Create your first paste',
      icon: '🎯',
      requirement: 1,
      type: 'pastes',
      unlocked: false,
      progress: 0,
    },
    {
      id: 'paste_creator',
      title: 'Paste Creator',
      description: 'Create 5 pastes',
      icon: '📝',
      requirement: 5,
      type: 'pastes',
      unlocked: false,
      progress: 0,
    },
    {
      id: 'prolific_writer',
      title: 'Prolific Writer',
      description: 'Create 25 pastes',
      icon: '✍️',
      requirement: 25,
      type: 'pastes',
      unlocked: false,
      progress: 0,
    },
    {
      id: 'paste_master',
      title: 'Paste Master',
      description: 'Create 100 pastes',
      icon: '🏆',
      requirement: 100,
      type: 'pastes',
      unlocked: false,
      progress: 0,
    },
    {
      id: 'first_view',
      title: 'Getting Noticed',
      description: 'Get your first view',
      icon: '👁️',
      requirement: 1,
      type: 'views',
      unlocked: false,
      progress: 0,
    },
    {
      id: 'popular_content',
      title: 'Popular Content',
      description: 'Get 100 total views',
      icon: '🔥',
      requirement: 100,
      type: 'views',
      unlocked: false,
      progress: 0,
    },
    {
      id: 'viral_creator',
      title: 'Viral Creator',
      description: 'Get 1000 total views',
      icon: '⭐',
      requirement: 1000,
      type: 'views',
      unlocked: false,
      progress: 0,
    },
    {
      id: 'view_legend',
      title: 'View Legend',
      description: 'Get 10000 total views',
      icon: '👑',
      requirement: 10000,
      type: 'views',
      unlocked: false,
      progress: 0,
    },
    {
      id: 'public_sharer',
      title: 'Public Sharer',
      description: 'Create your first public paste',
      icon: '🌍',
      requirement: 1,
      type: 'public_pastes',
      unlocked: false,
      progress: 0,
    },
    {
      id: 'community_contributor',
      title: 'Community Contributor',
      description: 'Create 10 public pastes',
      icon: '🤝',
      requirement: 10,
      type: 'public_pastes',
      unlocked: false,
      progress: 0,
    },
    {
      id: 'open_source_hero',
      title: 'Open Source Hero',
      description: 'Create 50 public pastes',
      icon: '🦸',
      requirement: 50,
      type: 'public_pastes',
      unlocked: false,
      progress: 0,
    },
  ];
};
