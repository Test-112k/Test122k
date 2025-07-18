import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Users, Clock, Copy, Download, ExternalLink, Eye, AlertCircle, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { createPaste, downloadPaste } from "@/lib/pasteService";
import Navigation from "@/components/Navigation";
import AdBanner from "@/components/AdBanner";
import Footer from "@/components/Footer";
import TemplateSelector from "@/components/TemplateSelector";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("text");
  const [visibility, setVisibility] = useState("public");
  const [expiryOption, setExpiryOption] = useState("never");
  const [password, setPassword] = useState("");
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdPaste, setCreatedPaste] = useState<any>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleCreatePaste = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content for your paste.",
        variant: "destructive",
      });
      return;
    }

    if (isPasswordProtected && !password.trim()) {
      toast({
        title: "Error",
        description: "Please enter a password to protect your paste.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    try {
      console.log('=== STARTING PASTE CREATION FROM UI ===');
      
      const paste = await createPaste({
        title: title || "Untitled Paste",
        content,
        language,
        authorName: currentUser?.displayName || currentUser?.email || "Anonymous",
        visibility: visibility as "public" | "private",
        expiryOption: expiryOption,
        password: isPasswordProtected ? password : undefined
      }, currentUser);

      console.log('✅ Paste created successfully from UI:', paste);
      setCreatedPaste(paste);
      
      toast({
        title: "Paste Created!",
        description: "Your paste has been created successfully.",
      });

      // Redirect to dashboard if user is logged in to see the new paste
      if (currentUser) {
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (error: any) {
      console.error('❌ Error creating paste from UI:', error);
      
      toast({
        title: "Error Creating Paste",
        description: error.message || "Failed to create paste. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyUrl = async () => {
    if (createdPaste?.url) {
      try {
        await navigator.clipboard.writeText(createdPaste.url);
        toast({
          title: "Copied!",
          description: "Paste URL copied to clipboard.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy URL.",
        });
      }
    }
  };

  const copyContent = async () => {
    if (createdPaste?.content) {
      try {
        await navigator.clipboard.writeText(createdPaste.content);
        toast({
          title: "Copied!",
          description: "Paste content copied to clipboard.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy content.",
        });
      }
    }
  };

  const handleDownload = () => {
    if (createdPaste) {
      downloadPaste(createdPaste);
    }
  };

  const resetForm = () => {
    setCreatedPaste(null);
    setContent("");
    setTitle("");
    setExpiryOption("never");
    setPassword("");
    setIsPasswordProtected(false);
  };

  const handleTemplateSelect = (template: any) => {
    setTitle(template.name);
    setContent(template.content);
    setLanguage(template.language);
    toast({
      title: "Template Applied",
      description: `${template.name} template has been loaded`,
    });
  };

  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  const lineCount = content.split('\n').length;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <Navigation />
      
      {/* Header Ad Banner - Separated with proper spacing */}
      <div className="w-full">
        <AdBanner position="header" />
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {/* Hero Section */}
            <div className="text-center mb-8 lg:mb-12 animate-fade-in">
              <div className="flex items-center justify-center mb-4">
                <img 
                  src="/lovable-uploads/8289d881-3e57-4f96-b277-7a90d7f2f6ef.png" 
                  alt="AuraPaste Logo" 
                  className="h-16 md:h-24 lg:h-32 w-auto"
                />
              </div>
              <p className="text-lg md:text-xl text-muted-foreground mb-6 lg:mb-8 max-w-2xl mx-auto">
                Share your code, text, and ideas with the world. Fast, secure, and beautiful paste sharing for developers and creators.
              </p>
            </div>

            {!currentUser && (
              <Alert className="mb-6 bg-card border-border">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-foreground">
                  You're not logged in. You can still create public pastes, but logging in allows you to manage your pastes and create private ones.
                </AlertDescription>
              </Alert>
            )}

            {/* Features Grid - Much smaller for mobile */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-12">
              <Card className="text-center hover-scale animate-scale-in bg-card border-border">
                <CardHeader className="pb-1 px-1 sm:px-4 pt-2 sm:pt-4">
                  <Code className="h-4 sm:h-6 lg:h-8 w-4 sm:w-6 lg:w-8 mx-auto text-primary mb-1" />
                  <CardTitle className="text-xs sm:text-sm lg:text-base text-foreground">
                    Highlighting
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-1 sm:px-4 pb-2 sm:pb-4">
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Code colors
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover-scale animate-scale-in bg-card border-border">
                <CardHeader className="pb-1 px-1 sm:px-4 pt-2 sm:pt-4">
                  <Clock className="h-4 sm:h-6 lg:h-8 w-4 sm:w-6 lg:w-8 mx-auto text-primary mb-1" />
                  <CardTitle className="text-xs sm:text-sm lg:text-base text-foreground">
                    Fast
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-1 sm:px-4 pb-2 sm:pb-4">
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Share now
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover-scale animate-scale-in bg-card border-border">
                <CardHeader className="pb-1 px-1 sm:px-4 pt-2 sm:pt-4">
                  <Users className="h-4 sm:h-6 lg:h-8 w-4 sm:w-6 lg:w-8 mx-auto text-primary mb-1" />
                  <CardTitle className="text-xs sm:text-sm lg:text-base text-foreground">
                    Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-1 sm:px-4 pb-2 sm:pb-4">
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Manage all
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Paste Creation Form or Preview */}
            {!createdPaste ? (
              
              <Card className="max-w-4xl mx-auto animate-fade-in pulse-glow bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-xl lg:text-2xl text-center text-foreground">Create New Paste</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="title" className="text-foreground">Title (Optional)</Label>
                      {currentUser && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowTemplates(true)}
                          className="text-xs sm:text-sm border-border hover:bg-muted"
                        >
                          📝 Templates
                        </Button>
                      )}
                    </div>
                    <Input
                      id="title"
                      placeholder="Give your paste a title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-input border-border text-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language" className="text-sm">Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          <SelectItem value="text">Plain Text</SelectItem>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="typescript">TypeScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="html">HTML</SelectItem>
                          <SelectItem value="css">CSS</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="xml">XML</SelectItem>
                          <SelectItem value="sql">SQL</SelectItem>
                          <SelectItem value="php">PHP</SelectItem>
                          <SelectItem value="cpp">C++</SelectItem>
                          <SelectItem value="c">C</SelectItem>
                          <SelectItem value="ruby">Ruby</SelectItem>
                          <SelectItem value="go">Go</SelectItem>
                          <SelectItem value="rust">Rust</SelectItem>
                          <SelectItem value="swift">Swift</SelectItem>
                          <SelectItem value="kotlin">Kotlin</SelectItem>
                          <SelectItem value="dart">Dart</SelectItem>
                          <SelectItem value="yaml">YAML</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="visibility" className="text-sm">Visibility</Label>
                      <Select value={visibility} onValueChange={setVisibility}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">🌍 Public</SelectItem>
                          <SelectItem value="private">🔒 Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                      <Label htmlFor="expiry" className="text-sm">Expiry</Label>
                      <Select value={expiryOption} onValueChange={setExpiryOption}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Select expiry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1hour">⏰ 1 Hour</SelectItem>
                          <SelectItem value="6hours">🕕 6 Hours</SelectItem>
                          <SelectItem value="1day">📅 1 Day</SelectItem>
                          <SelectItem value="3days">📆 3 Days</SelectItem>
                          <SelectItem value="1week">📈 1 Week</SelectItem>
                          <SelectItem value="never">♾️ Never Expire</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Password Protection Section */}
                  <div className="space-y-4 border rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="passwordProtect"
                        checked={isPasswordProtected}
                        onChange={(e) => setIsPasswordProtected(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="passwordProtect" className="flex items-center space-x-2">
                        <Lock className="h-4 w-4" />
                        <span>Password Protect This Paste</span>
                      </Label>
                    </div>
                    
                    {isPasswordProtected && (
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter password to protect your paste..."
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground">
                          Users will need this password to view your paste.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-foreground">Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Paste your content here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[200px] md:min-h-[300px] font-mono bg-input border-border text-foreground"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Lines: {lineCount}</span>
                      <span>Words: {wordCount}</span>
                      <span>Characters: {content.length}</span>
                    </div>
                  </div>

                  {/* Content Ad between form sections */}
                  <AdBanner position="content" />
                  <Button 
                    onClick={handleCreatePaste}
                    disabled={isCreating}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-3 text-lg hover-scale"
                  >
                    {isCreating ? "Creating Paste..." : "Create Paste"}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              
              <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
                <Card className="pulse-glow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl text-green-600">✓ Paste Created Successfully!</CardTitle>
                      <Button variant="outline" onClick={resetForm} className="hover-scale">
                        Create Another
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid lg:grid-cols-4 gap-6">
                      <div className="lg:col-span-3">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{createdPaste.title}</h3>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                                {createdPaste.language}
                              </span>
                              {createdPaste.isPasswordProtected && (
                                <span className="text-sm text-yellow-600 bg-yellow-100 px-2 py-1 rounded flex items-center space-x-1">
                                  <Lock className="h-3 w-3" />
                                  <span>Protected</span>
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="relative">
                            <textarea
                              readOnly
                              value={createdPaste.content}
                              className="w-full h-64 p-4 font-mono text-sm bg-muted/50 border rounded-lg resize-none"
                            />
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" onClick={copyContent} className="hover-scale">
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Text
                            </Button>
                            
                            <Button variant="outline" size="sm" onClick={copyUrl} className="hover-scale">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Copy URL
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => navigate(`/p/${createdPaste.id}`)}
                              className="hover-scale"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Paste
                            </Button>
                            
                            <Button variant="outline" size="sm" onClick={handleDownload} className="hover-scale">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="lg:col-span-1">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Paste Details</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">ID:</span>
                              <br />
                              <code className="text-xs bg-muted px-1 rounded">{createdPaste.id}</code>
                            </div>
                            
                            <div>
                              <span className="text-muted-foreground">Author:</span>
                              <br />
                              {createdPaste.authorName}
                            </div>
                            
                            <div>
                              <span className="text-muted-foreground">Visibility:</span>
                              <br />
                              <span className="capitalize">{createdPaste.visibility}</span>
                            </div>

                            {createdPaste.isPasswordProtected && (
                              <div>
                                <span className="text-muted-foreground">Protection:</span>
                                <br />
                                <span className="text-yellow-600">Password Protected</span>
                              </div>
                            )}
                            
                            <div>
                              <span className="text-muted-foreground">Created:</span>
                              <br />
                              {new Date(createdPaste.createdAt).toLocaleString()}
                            </div>

                            {createdPaste.expiresAt && (
                              <div>
                                <span className="text-muted-foreground">Expires:</span>
                                <br />
                                {new Date(createdPaste.expiresAt).toLocaleString()}
                              </div>
                            )}
                            
                            <div>
                              <span className="text-muted-foreground">URL:</span>
                              <br />
                              <code className="text-xs bg-muted px-1 rounded break-all">
                                {createdPaste.url}
                              </code>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          
          {/* Sidebar Ad - Properly spaced */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-8">
              <AdBanner position="sidebar" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Ad - Separated with proper spacing */}
      <div className="w-full">
        <AdBanner position="footer" />
      </div>
      
      <Footer />
      
      {/* Template Selector Modal */}
      {showTemplates && (
        <TemplateSelector
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
};

export default Index;
