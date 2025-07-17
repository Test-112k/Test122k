import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getPaste, updatePaste, type Paste } from "@/lib/pasteService";

const EditPaste = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [paste, setPaste] = useState<Paste | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("text");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Redirect if not logged in
  if (!authLoading && !currentUser) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    const loadPaste = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const pasteData = await getPaste(id);
        
        if (!pasteData) {
          toast({
            title: "Error",
            description: "Paste not found",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }

        // Check if user owns the paste
        if (pasteData.authorUID !== currentUser?.uid) {
          toast({
            title: "Error",
            description: "You can only edit your own pastes",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }

        setPaste(pasteData);
        setTitle(pasteData.title);
        setContent(pasteData.content);
        setLanguage(pasteData.language);
        setVisibility(pasteData.visibility);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load paste",
          variant: "destructive",
        });
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadPaste();
  }, [id, currentUser, navigate, toast]);

  const handleSave = async () => {
    if (!paste || !currentUser) return;

    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await updatePaste(paste.id, {
        title: title || "Untitled Paste",
        content: content.trim(),
        language,
        visibility,
      });

      toast({
        title: "Success",
        description: "Paste updated successfully!",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update paste",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading paste...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Paste</h1>
              <p className="text-muted-foreground">Make changes to your paste</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Paste Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter paste title..."
                />
              </div>

              {/* Language and Visibility */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Plain Text</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="css">CSS</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="xml">XML</SelectItem>
                      <SelectItem value="sql">SQL</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="php">PHP</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                      <SelectItem value="c">C</SelectItem>
                      <SelectItem value="ruby">Ruby</SelectItem>
                      <SelectItem value="go">Go</SelectItem>
                      <SelectItem value="rust">Rust</SelectItem>
                      <SelectItem value="swift">Swift</SelectItem>
                      <SelectItem value="kotlin">Kotlin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Visibility</label>
                  <Select value={visibility} onValueChange={(value: "public" | "private") => setVisibility(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="text-sm font-medium mb-2 block">Content</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your paste content..."
                  className="min-h-[400px] font-mono"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditPaste;