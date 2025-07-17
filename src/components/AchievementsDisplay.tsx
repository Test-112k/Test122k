
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Crown, Zap, User, CheckCircle, Lock, Shield, Flame, Target, Sparkles, Award, Eye, Clock } from 'lucide-react';
import { getAchievements, getUserAchievements, getUserStats, type Achievement, type UserAchievement, type UserStats } from '@/lib/userAchievements';
import { useAuth } from '@/contexts/AuthContext';

const AchievementsDisplay = () => {
  const { currentUser } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAchievements = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        console.log('🏆 Loading achievements and user stats...');
        const [allAchievements, userAchievementList, stats] = await Promise.all([
          getAchievements(currentUser.uid),
          getUserAchievements(currentUser.uid),
          getUserStats(currentUser.uid)
        ]);
        setAchievements(allAchievements);
        setUserAchievements(userAchievementList);
        setUserStats(stats);
      } catch (error) {
        console.error('Error loading achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAchievements();
    
    // Set up interval to refresh achievements every 30 seconds for real-time updates
    const interval = setInterval(loadAchievements, 30000);
    
    return () => clearInterval(interval);
  }, [currentUser]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'pastes':
        return <Trophy className="h-4 w-4" />;
      case 'views':
        return <Star className="h-4 w-4" />;
      case 'public_pastes':
        return <Crown className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getAchievementIcon = (unlocked: boolean) => {
    return unlocked ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <Lock className="h-4 w-4 text-muted-foreground" />
    );
  };

  const getAuraTypeIcon = (type: string) => {
    switch (type) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-400" />;
      case 'legendary':
        return <Sparkles className="h-4 w-4 text-purple-400" />;
      case 'viral':
        return <Flame className="h-4 w-4 text-yellow-400" />;
      case 'elite':
        return <Award className="h-4 w-4 text-purple-400" />;
      case 'popular':
        return <Target className="h-4 w-4 text-orange-400" />;
      case 'creator':
        return <Trophy className="h-4 w-4 text-green-400" />;
      case 'active':
        return <Zap className="h-4 w-4 text-blue-400" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const getAuraClass = (type: string) => {
    const auraClasses = {
      admin: 'pulse-glow-red',
      legendary: 'rainbow-glow',
      viral: 'pulse-glow-gold',
      elite: 'pulse-glow-purple',
      popular: 'pulse-glow-orange',
      creator: 'pulse-glow-green',
      active: 'pulse-glow-blue'
    };
    return auraClasses[type] || '';
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-muted rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-2 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentUser) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Log in to view achievements</p>
        </CardContent>
      </Card>
    );
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const completionPercentage = Math.round((unlockedCount / achievements.length) * 100);

  return (
    <div className="space-y-6">
      {/* Aura Achievements */}
      {userAchievements.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Aura Effects
              <Badge variant="secondary" className="text-xs bg-green-900/30 text-green-400 border-green-700 ml-auto">
                Live
              </Badge>
            </CardTitle>
            <CardDescription>
              Special visual effects for your username
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userAchievements.map((achievement) => (
                <div
                  key={achievement.type}
                  className={`flex items-center gap-3 p-4 rounded-lg border bg-card/50 animate-fade-in ${getAuraClass(achievement.type)}`}
                >
                  <div className="flex items-center gap-2">
                    {getAuraTypeIcon(achievement.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium ${getAuraClass(achievement.type)}`}>
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Stats Overview */}
      {userStats && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Your Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{userStats.totalPastes}</div>
                <div className="text-sm text-muted-foreground">Total Pastes</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{userStats.totalViews}</div>
                <div className="text-sm text-muted-foreground">Total Views</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{userStats.publicPastes}</div>
                <div className="text-sm text-muted-foreground">Public Pastes</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{userStats.activeDays}</div>
                <div className="text-sm text-muted-foreground">Active Days</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Achievements */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Progress Achievements
          </CardTitle>
          <CardDescription>
            {unlockedCount} of {achievements.length} unlocked ({completionPercentage}%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all animate-fade-in ${
                  achievement.unlocked 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30' 
                    : 'bg-muted/50 border-border hover:bg-muted/70'
                }`}
              >
                <div className="flex items-center gap-2">
                  {getIcon(achievement.type)}
                  {getAchievementIcon(achievement.unlocked)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${achievement.unlocked ? 'text-green-700 dark:text-green-300' : 'text-muted-foreground'}`}>
                        {achievement.title}
                      </h4>
                      <span className="text-lg">{achievement.icon}</span>
                    </div>
                    <Badge variant={achievement.unlocked ? "default" : "secondary"} className="ml-2">
                      {achievement.progress} / {achievement.requirement}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                  {!achievement.unlocked && (
                    <Progress 
                      value={(achievement.progress / achievement.requirement) * 100} 
                      className="mt-2 h-2"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementsDisplay;
