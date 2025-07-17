
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Save, User, Mail, Lock, Link, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const UserProfile = () => {
  const { currentUser, updateUserProfile, updateUserEmail, updateUserPassword, userProfile, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || "");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [telegram, setTelegram] = useState("");
  const [discord, setDiscord] = useState("");
  const [newEmail, setNewEmail] = useState(currentUser?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Load user profile data when component mounts or userProfile changes
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || currentUser?.displayName || "");
      setBio(userProfile.bio || "");
      setWebsite(userProfile.website || "");
      setTelegram(userProfile.telegram || "");
      setDiscord(userProfile.discord || "");
      setPhotoURL(userProfile.photoURL || currentUser?.photoURL || "");
    }
  }, [userProfile, currentUser]);

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      // Update Firebase Auth profile
      await updateUserProfile(displayName, photoURL);
      
      // Update Firestore user profile with additional data
      if (currentUser) {
        const { updateUserProfile: updateFirestoreProfile } = await import("@/lib/adminService");
        await updateFirestoreProfile(currentUser.uid, {
          displayName,
          bio,
          telegram,
          website,
          discord,
          location: "" // keeping location empty for now
        });
        
        // Refresh user profile to get updated data
        await refreshUserProfile();
      }
      
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (newEmail === currentUser?.email) {
      toast({
        title: "Error",
        description: "New email must be different from current email",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      await updateUserEmail(newEmail);
      toast({
        title: "Success",
        description: "Email updated successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update email",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      await updateUserPassword(newPassword);
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: "Success",
        description: "Password updated successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const removeCurrentAvatar = () => {
    setPhotoURL("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Profile Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={photoURL || currentUser?.photoURL || ""} />
                  <AvatarFallback>
                    {(displayName || currentUser?.displayName || currentUser?.email || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Label htmlFor="photoURL">Avatar Image URL</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="photoURL"
                      type="url"
                      placeholder="https://example.com/your-avatar.jpg"
                      value={photoURL}
                      onChange={(e) => setPhotoURL(e.target.value)}
                      className="flex-1"
                    />
                    {photoURL && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={removeCurrentAvatar}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        Clear
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter a direct link to an image (JPG, PNG, GIF, etc.)
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div>
                  <Label htmlFor="telegram">Telegram</Label>
                  <Input
                    id="telegram"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="@username or t.me/username"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="discord">Discord</Label>
                <Input
                  id="discord"
                  value={discord}
                  onChange={(e) => setDiscord(e.target.value)}
                  placeholder="username#1234 or discord.gg/invite"
                />
              </div>

              <Button onClick={handleUpdateProfile} disabled={isUpdating} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isUpdating ? "Updating..." : "Update Profile"}
              </Button>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentEmail">Current Email</Label>
                <Input
                  id="currentEmail"
                  value={currentUser?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div>
                <Label htmlFor="newEmail">New Email</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="new@example.com"
                />
              </div>

              <Button onClick={handleUpdateEmail} disabled={isUpdating} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isUpdating ? "Updating..." : "Update Email"}
              </Button>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Password Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>

              <Button onClick={handleUpdatePassword} disabled={isUpdating} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isUpdating ? "Updating..." : "Update Password"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfile;
