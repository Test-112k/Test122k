
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Eye, Edit, Trash2, Lock, Globe } from "lucide-react";
import Navigation from "@/components/Navigation";
import AdBanner from "@/components/AdBanner";
import Footer from "@/components/Footer";
import CustomTemplates from "@/components/CustomTemplates";
import UserProfile from "@/components/UserProfile";

interface Paste {
  id: string;
  title: string;
  content: string;
  language: string;
  visibility: 'public' | 'private';
  authorUID: string;
  authorName: string;
  createdAt: any;
  expiresAt?: any;
  isPasswordProtected?: boolean;
  viewCount?: number;
}

const Dashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();
  const [pastes, setPastes] = useState<Paste[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      loadUserPastes();
    }
  }, [currentUser]);

  const loadUserPastes = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      // Query all pastes by the user, regardless of visibility
      const q = query(
        collection(db, 'pastes'), 
        where('authorUID', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const userPastes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Paste[];
        
        console.log('Loaded user pastes:', userPastes);
        setPastes(userPastes);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error loading user pastes:", error);
      toast({
        title: "Error",
        description: "Failed to load pastes.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handlePasteDelete = async (pasteId: string) => {
    try {
      await deleteDoc(doc(db, 'pastes', pasteId));
      toast({
        title: "Success",
        description: "Paste deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting paste:", error);
      toast({
        title: "Error",
        description: "Failed to delete paste.",
        variant: "destructive",
      });
    }
  };

  const handlePasteEdit = (pasteId: string) => {
    navigate(`/edit/${pasteId}`);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header Ad Banner - Separated with proper spacing */}
      <div className="w-full">
        <AdBanner position="header" />
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {currentUser?.displayName || currentUser?.email}!
                {userProfile?.role === 'admin' && (
                  <span className="ml-2 text-sm bg-primary text-primary-foreground px-2 py-1 rounded">
                    Admin Access
                  </span>
                )}
              </p>
            </div>

            <Tabs defaultValue="pastes" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                <TabsTrigger value="pastes">My Pastes</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>

              {/* Content Ad between tabs and content */}
              <AdBanner position="content" />

              <TabsContent value="pastes" className="space-y-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>My Pastes ({pastes.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <p>Loading pastes...</p>
                    ) : pastes.length === 0 ? (
                      <p>No pastes created yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {pastes.map((paste) => (
                          <div key={paste.id} className="p-4 bg-muted rounded-md">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-lg font-semibold">{paste.title}</h3>
                                  <div className="flex items-center gap-1">
                                    {paste.visibility === 'private' ? (
                                      <span title="Private">
                                        <Lock className="h-4 w-4 text-muted-foreground" />
                                      </span>
                                    ) : (
                                      <span title="Public">
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                      </span>
                                    )}
                                    {paste.isPasswordProtected && (
                                      <span title="Password Protected">
                                        <Lock className="h-4 w-4 text-amber-500" />
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>Created: {formatDate(paste.createdAt)}</span>
                                  <span>Language: {paste.language}</span>
                                  <span>Views: {paste.viewCount || 0}</span>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/paste/${paste.id}`)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePasteEdit(paste.id)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handlePasteDelete(paste.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="templates" className="space-y-6">
                <CustomTemplates />
              </TabsContent>

              <TabsContent value="profile" className="space-y-6">
                <UserProfile />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar with ad */}
          <div className="lg:col-span-1">
            <AdBanner position="sidebar" />
          </div>
        </div>
        
        {/* Footer Ad Banner - Separated with proper spacing */}
        <div className="w-full mt-8">
          <AdBanner position="footer" />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
