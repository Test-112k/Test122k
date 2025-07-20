import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Download, Eye, Lock, AlertCircle, FileText, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPaste, downloadPaste, incrementViewCount, type Paste } from "@/lib/pasteService";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import UserNameWithAchievements from "@/components/UserNameWithAchievements";
import UserAvatar from "@/components/UserAvatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getUserProfile } from "@/lib/adminService";
import AdBanner from "@/components/AdBanner";
import PopunderAd from "@/components/PopunderAd";

const PasteView = () => {
  const { id } = useParams<{ id: string }>();
  const [paste, setPaste] = useState<Paste | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [authorProfile, setAuthorProfile] = useState<any>(null);
  const [viewIncremented, setViewIncremented] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const fetchPaste = async (passwordAttempt?: string) => {
    if (!id) {
      setError("Invalid paste URL");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setPasswordError(false);
      
      const fetchedPaste = await getPaste(id, passwordAttempt);
      
      if (fetchedPaste) {
        setPaste(fetchedPaste);
        setNeedsPassword(false);
        setPasswordError(false);
        
        // Update page title immediately
        document.title = `${fetchedPaste.title} - Aura Paste`;
        
        // Load author profile asynchronously with better error handling
        if (fetchedPaste.authorUID && !authorProfile) {
          console.log('📱 Loading author profile for:', fetchedPaste.authorUID);
          getUserProfile(fetchedPaste.authorUID)
            .then(profile => {
              console.log('✅ Author profile loaded:', profile);
              setAuthorProfile(profile);
            })
            .catch(error => {
              console.error('❌ Error loading author profile:', error);
              // Set a minimal profile to prevent endless loading
              setAuthorProfile({ 
                displayName: fetchedPaste.authorName,
                photoURL: null 
              });
            });
        }
        
        // Increment view count only once
        if (!viewIncremented) {
          console.log('👁️ Incrementing view count...');
          setViewIncremented(true);
          incrementViewCount(id, fetchedPaste.authorUID);
        }
      } else {
        setError("Paste not found or has been deleted");
      }
    } catch (error: any) {
      console.error('Error fetching paste:', error);
      
      if (error.message === 'Password required to view this paste') {
        setNeedsPassword(true);
        setError(null);
        if (passwordAttempt) {
          setPasswordError(true);
        }
      } else if (error.message === 'This paste has expired') {
        setError("This paste has expired and is no longer available.");
      } else {
        setError(error.message || "Failed to load paste.");
      }
    } finally {
      setLoading(false);
      setVerifyingPassword(false);
    }
  };

  useEffect(() => {
    document.title = "Loading... - Aura Paste";
    fetchPaste();
  }, [id]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast({
        title: "Error",
        description: "Please enter the password.",
        variant: "destructive",
      });
      return;
    }

    setVerifyingPassword(true);
    await fetchPaste(password);
  };

  const copyContent = async () => {
    if (paste?.content) {
      try {
        await navigator.clipboard.writeText(paste.content);
        toast({
          title: "Copied!",
          description: "Paste content copied to clipboard.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy content.",
          variant: "destructive",
        });
      }
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
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

  const handleDownload = () => {
    if (paste) {
      downloadPaste(paste);
    }
  };

  const reportPaste = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to report a paste.",
        variant: "destructive",
      });
      return;
    }

    if (!paste) return;

    try {
      setIsReporting(true);
      const reportDoc = doc(collection(db, 'reports'));
      await setDoc(reportDoc, {
        pasteId: paste.id,
        pasteTitle: paste.title,
        pasteAuthor: paste.authorUID,
        reportedBy: currentUser.uid,
        reporterName: currentUser.displayName || currentUser.email,
        reason: 'Inappropriate content',
        status: 'pending',
        createdAt: serverTimestamp()
      });

      toast({
        title: "Report Submitted",
        description: "Thank you for reporting this paste. We'll review it shortly.",
      });
    } catch (error) {
      console.error('Error reporting paste:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsReporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <AdBanner position="header" />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading paste...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (needsPassword) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <AdBanner position="header" />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card className="bg-card border-border">
              <CardHeader className="text-center">
                <Lock className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                <CardTitle className="text-foreground">Password Protected Paste</CardTitle>
                <p className="text-muted-foreground">
                  This paste is password protected. Please enter the password to view it.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={verifyingPassword}
                      className="bg-input border-border text-foreground"
                    />
                    {passwordError && (
                      <p className="text-sm text-destructive">
                        Incorrect password. Please try again.
                      </p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={verifyingPassword}
                  >
                    {verifyingPassword ? "Verifying..." : "Unlock Paste"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <AdBanner position="header" />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="max-w-md mx-auto bg-destructive/10 border-destructive/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-foreground">{error}</AlertDescription>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }

  if (!paste) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <AdBanner position="header" />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="max-w-md mx-auto bg-destructive/10 border-destructive/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-foreground">Paste not found</AlertDescription>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PopunderAd />
      <Navigation />
      <AdBanner position="header" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Author Info - Left Column */}
            <div className="lg:col-span-1">
              <Card className="bg-card border-border lg:sticky lg:top-4 z-20 mb-4">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Author</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <UserAvatar 
                      photoURL={authorProfile?.photoURL} 
                      displayName={paste?.authorName || authorProfile?.displayName || 'Author'}
                      size="lg"
                      className="mx-auto mb-3"
                    />
                    <div className="text-lg font-semibold text-foreground mb-3">
                      {paste?.authorUID ? (
                        <UserNameWithAchievements userId={paste.authorUID} userName={paste.authorName} />
                      ) : (
                        <span>{paste?.authorName}</span>
                      )}
                    </div>
                  </div>
                  
                  {authorProfile?.bio && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Bio</h4>
                      <p className="text-sm text-muted-foreground">{authorProfile.bio}</p>
                    </div>
                  )}
                  
                  {(authorProfile?.website || authorProfile?.telegram || authorProfile?.discord) && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Links</h4>
                      <div className="space-y-2">
                        {authorProfile.website && (
                          <a 
                            href={authorProfile.website.startsWith('http') ? authorProfile.website : `https://${authorProfile.website}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm break-all block"
                          >
                            🌐 {authorProfile.website.startsWith('http') ? authorProfile.website : `https://${authorProfile.website}`}
                          </a>
                        )}
                        {authorProfile.telegram && (
                          <a 
                            href={authorProfile.telegram.startsWith('http') ? authorProfile.telegram : `https://t.me/${authorProfile.telegram.replace('@', '')}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm break-all block"
                          >
                            📱 {authorProfile.telegram.startsWith('http') ? authorProfile.telegram : `https://t.me/${authorProfile.telegram.replace('@', '')}`}
                          </a>
                        )}
                        {authorProfile.discord && (
                          <div className="text-muted-foreground text-sm break-all">
                            🎮 {authorProfile.discord}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-border">
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>Created: {(() => {
                        if (!paste?.createdAt) return 'Unknown date';
                        try {
                          if (paste.createdAt && typeof paste.createdAt === 'object' && paste.createdAt.toDate) {
                            return paste.createdAt.toDate().toLocaleDateString();
                          }
                          if (typeof paste.createdAt === 'string') {
                            return new Date(paste.createdAt).toLocaleDateString();
                          }
                          return 'Unknown date';
                        } catch (error) {
                          return 'Unknown date';
                        }
                      })()}</div>
                      <div>Language: <span className="capitalize">{paste?.language}</span></div>
                      <div>Views: {paste?.viewCount || 0}</div>
                      {paste?.expiresAt && (
                        <div>Expires: {new Date(paste.expiresAt).toLocaleDateString()}</div>
                      )}
                      {paste?.isPasswordProtected && (
                        <div className="text-yellow-500 flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          <span>Protected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Sidebar Ad */}
              <AdBanner position="sidebar" />
            </div>

            {/* Paste Content - Right Column */}
            <div className="lg:col-span-2">
              {/* Content Ad */}
              <AdBanner position="content" />
              
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl text-foreground">{paste.title}</CardTitle>
                    
                    {/* Desktop buttons */}
                    <div className="hidden sm:flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={copyContent} className="border-border text-foreground hover:bg-muted">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Text
                      </Button>
                      
                      <Button variant="outline" size="sm" onClick={copyUrl} className="border-border text-foreground hover:bg-muted">
                        <Eye className="h-4 w-4 mr-2" />
                        Copy URL
                      </Button>
                      
                      <Button variant="outline" size="sm" onClick={handleDownload} className="border-border text-foreground hover:bg-muted">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      
                      <Link to={`/p/${id}/raw`}>
                        <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted">
                          <FileText className="h-4 w-4 mr-2" />
                          Raw
                        </Button>
                      </Link>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={reportPaste}
                        disabled={isReporting}
                        className="border-border text-foreground hover:bg-muted hover:text-destructive"
                      >
                        <Flag className="h-4 w-4 mr-2" />
                        {isReporting ? 'Reporting...' : 'Report'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Mobile buttons */}
                  <div className="sm:hidden flex flex-col gap-2 mb-4">
                    <Button variant="outline" size="sm" onClick={copyContent} className="border-border text-foreground hover:bg-muted w-full">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Text
                    </Button>
                    
                    <Button variant="outline" size="sm" onClick={copyUrl} className="border-border text-foreground hover:bg-muted w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Copy URL
                    </Button>
                    
                    <Button variant="outline" size="sm" onClick={handleDownload} className="border-border text-foreground hover:bg-muted w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    
                    <Link to={`/p/${id}/raw`} className="w-full">
                      <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Raw
                      </Button>
                    </Link>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={reportPaste}
                      disabled={isReporting}
                      className="border-border text-foreground hover:bg-muted hover:text-destructive w-full"
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      {isReporting ? 'Reporting...' : 'Report'}
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm font-mono max-h-[70vh]">
                      <code className="text-foreground">{paste.content}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <AdBanner position="footer" />
      <Footer />
    </div>
  );
};

export default PasteView;
