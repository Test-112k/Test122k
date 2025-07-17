import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code, Copy, Download, ExternalLink, Eye, FileText, Trash2 } from "lucide-react";
import Navigation from "@/components/Navigation";
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
      const q = query(collection(db, 'pastes'), where('authorUID', '==', currentUser.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const userPastes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Paste[];
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
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

          <TabsContent value="pastes" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>My Pastes</CardTitle>
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
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">{paste.title}</h3>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePasteEdit(paste.id)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handlePasteDelete(paste.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(paste.createdAt?.toDate()).toLocaleDateString()}
                        </p>
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
    </div>
  );
};

export default Dashboard;
