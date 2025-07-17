import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Eye, 
  User, 
  Copy,
  Code,
  FileText
} from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AdBanner from "@/components/AdBanner";
import Footer from "@/components/Footer";
import UserNameWithAchievements from "@/components/UserNameWithAchievements";
import { getRecentPublicPastes, type Paste } from "@/lib/pasteService";
import { useToast } from "@/hooks/use-toast";

const Recent = () => {
  const [recentPastes, setRecentPastes] = useState<Paste[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Ensure dark mode is always active
    document.documentElement.classList.add("dark");
    
    // SEO meta tags
    document.title = "Recent Public Pastes - Discover Latest Code Snippets | Aura Paste";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Discover the latest public code snippets and text pastes shared by the community. Find recent programming examples, tutorials, and more on Aura Paste.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Discover the latest public code snippets and text pastes shared by the community. Find recent programming examples, tutorials, and more on Aura Paste.';
      document.head.appendChild(meta);
    }

    loadRecentPastes();
  }, []);

  const loadRecentPastes = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading recent public pastes...');
      
      const pastes = await getRecentPublicPastes(50);
      console.log('📋 Raw fetched pastes:', pastes);
      console.log('📊 Total pastes fetched:', pastes.length);
      
      // Ensure all pastes are public and not expired, then sort by latest first
      const now = new Date();
      const validPublicPastes = pastes.filter(paste => {
        console.log(`Checking paste ${paste.id}: visibility=${paste.visibility}, expired=${paste.expiresAt ? new Date(paste.expiresAt) <= now : false}`);
        
        if (paste.visibility !== 'public') {
          console.log(`❌ Paste ${paste.id} rejected: not public (${paste.visibility})`);
          return false;
        }
        
        if (paste.expiresAt && new Date(paste.expiresAt) <= now) {
          console.log(`❌ Paste ${paste.id} rejected: expired`);
          return false;
        }
        
        console.log(`✅ Paste ${paste.id} accepted`);
        return true;
      }).sort((a, b) => {
        // Sort by creation date, newest first
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log('🔓 Valid public pastes after filtering and sorting:', validPublicPastes.length);
      console.log('📝 Valid pastes:', validPublicPastes.map(p => ({ id: p.id, title: p.title, visibility: p.visibility })));
      
      setRecentPastes(validPublicPastes);
    } catch (error) {
      console.error('❌ Failed to load recent pastes:', error);
      toast({
        title: "Error",
        description: "Failed to load recent pastes. Please try again.",
        variant: "destructive",
      });
      setRecentPastes([]);
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Copied!",
        description: "Paste URL copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    
    // For recently uploaded pastes, show more precise time
    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getLanguageIcon = (language: string) => {
    if (language === 'text') return FileText;
    return Code;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      {/* Header Ad Banner - Properly spaced */}
      <div className="w-full">
        <AdBanner position="header" />
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Hero Section */}
            <div className="text-center mb-6 lg:mb-12 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-primary to-accent rounded-full p-2 sm:p-3 mb-2 sm:mb-0 sm:mr-3">
                  <Clock className="h-5 sm:h-6 lg:h-8 w-5 sm:w-6 lg:w-8 text-primary-foreground" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Recent Pastes
                </h1>
              </div>
              <p className="text-sm sm:text-base lg:text-xl text-muted-foreground mb-4 lg:mb-8 max-w-2xl mx-auto px-4">
                Discover the latest public code snippets, tutorials, and ideas shared by our community. Fresh content updated in real-time, sorted by newest first.
              </p>
            </div>

            {/* Recent Pastes List */}
            <div className="space-y-4 lg:space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading recent pastes...</p>
                </div>
              ) : recentPastes.length === 0 ? (
                <Card className="text-center py-12 bg-card border-border">
                  <CardContent>
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-foreground">No Recent Public Pastes</h3>
                    <p className="text-muted-foreground mb-4">Be the first to share a public paste!</p>
                    <Link to="/">
                      <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">Create Paste</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                recentPastes.map((paste) => {
                  const LanguageIcon = getLanguageIcon(paste.language);
                  return (
                    <Link key={paste.id} to={`/p/${paste.id}`} className="block">
                      <Card className="hover-scale animate-fade-in bg-card border-border hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <LanguageIcon className="h-4 w-4 text-primary flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium text-foreground truncate">
                                    {paste.title}
                                  </h3>
                                  <Badge variant="secondary" className="bg-secondary text-secondary-foreground text-xs">
                                    {paste.language}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    <UserNameWithAchievements 
                                      userId={paste.authorUID} 
                                      userName={paste.authorName}
                                    />
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    {paste.viewCount || 0} views
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(paste.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                copyUrl(paste.url);
                              }}
                              className="text-muted-foreground hover:text-foreground flex-shrink-0"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
          
          {/* Sidebar with Ad - Properly spaced */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-8">
              <AdBanner position="sidebar" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Ad - Properly spaced */}
      <div className="w-full">
        <AdBanner position="footer" />
      </div>
      
      <Footer />
    </div>
  );
};

export default Recent;
