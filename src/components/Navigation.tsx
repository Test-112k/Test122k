import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, User, Settings, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const NavLinks = ({ mobile = false }) => (
    <>
      <Link
        to="/"
        className={`text-foreground hover:text-primary transition-colors ${mobile ? 'block py-2' : ''}`}
        onClick={() => mobile && setIsOpen(false)}
      >
        Home
      </Link>
      <Link
        to="/recent"
        className={`text-foreground hover:text-primary transition-colors ${mobile ? 'block py-2' : ''}`}
        onClick={() => mobile && setIsOpen(false)}
      >
        Recent
      </Link>
      <Link
        to="/about"
        className={`text-foreground hover:text-primary transition-colors ${mobile ? 'block py-2' : ''}`}
        onClick={() => mobile && setIsOpen(false)}
      >
        About
      </Link>
      {currentUser && (
        <>
          <Link
            to="/dashboard"
            className={`text-foreground hover:text-primary transition-colors ${mobile ? 'block py-2' : ''}`}
            onClick={() => mobile && setIsOpen(false)}
          >
            Dashboard
          </Link>
          {userProfile?.role === 'admin' && (
            <Link
              to="/admin"
              className={`text-primary hover:text-primary/80 transition-colors flex items-center gap-1 ${mobile ? 'block py-2' : ''}`}
              onClick={() => mobile && setIsOpen(false)}
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </>
      )}
    </>
  );

  const UserMenu = ({ mobile = false }) => (
    <>
      {currentUser ? (
        <div className={`flex ${mobile ? 'flex-col space-y-2' : 'items-center space-x-2'}`}>
          <span className={`text-sm text-muted-foreground ${mobile ? 'py-1' : ''}`}>
            {currentUser.displayName || currentUser.email}
            {userProfile?.role === 'admin' && (
              <span className="ml-2 text-xs bg-primary text-primary-foreground px-1 rounded">
                Admin
              </span>
            )}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className={`${mobile ? 'justify-start' : ''}`}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      ) : (
        <div className={`flex ${mobile ? 'flex-col space-y-2' : 'space-x-2'}`}>
          <Link to="/login" onClick={() => mobile && setIsOpen(false)}>
            <Button variant="ghost" size="sm" className={mobile ? 'w-full justify-start' : ''}>
              <User className="h-4 w-4 mr-2" />
              Login
            </Button>
          </Link>
          <Link to="/signup" onClick={() => mobile && setIsOpen(false)}>
            <Button size="sm" className={mobile ? 'w-full' : ''}>
              Sign Up
            </Button>
          </Link>
        </div>
      )}
    </>
  );

  return (
    <div className="bg-background border-b border-border">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="font-bold text-xl text-foreground">
          AuraPaste
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <NavLinks />
          <UserMenu />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-background border-r border-border w-64">
              <div className="flex flex-col space-y-4 p-4">
                <Link to="/" className="font-bold text-xl text-foreground">
                  AuraPaste
                </Link>
                <NavLinks mobile />
                <UserMenu mobile />
                {currentUser && (
                  <Link to="/settings" className="text-foreground hover:text-primary transition-colors block py-2">
                    <Settings className="h-4 w-4 mr-2 inline-block align-middle" />
                    Settings
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
