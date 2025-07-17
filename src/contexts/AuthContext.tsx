
import { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  updateEmail,
  updateProfile
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserProfile, getUserProfile } from "@/lib/adminService";

interface AuthContextType {
  currentUser: User | null;
  userProfile: any;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
  updateUserEmail: (email: string) => Promise<void>;
  updateUserPassword: (password: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserProfile = async () => {
    if (currentUser) {
      const profile = await getUserProfile(currentUser.uid);
      setUserProfile(profile);
    }
  };

  const signup = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile in Firestore
    await createUserProfile(result.user.uid, {
      displayName: result.user.displayName || '',
      email: result.user.email || ''
    });
  };

  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Ensure user profile exists and is up to date
    await createUserProfile(result.user.uid, {
      displayName: result.user.displayName || '',
      email: result.user.email || ''
    });
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (currentUser) {
      await updateProfile(currentUser, { displayName, photoURL });
      await refreshUserProfile();
    }
  };

  const updateUserEmail = async (email: string) => {
    if (currentUser) {
      await updateEmail(currentUser, email);
    }
  };

  const updateUserPassword = async (password: string) => {
    if (currentUser) {
      await updatePassword(currentUser, password);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email);
      setCurrentUser(user);
      
      if (user) {
        // Always ensure user profile exists and is updated
        await createUserProfile(user.uid, {
          displayName: user.displayName || '',
          email: user.email || ''
        });
        
        // Load user profile
        const profile = await getUserProfile(user.uid);
        console.log('User profile loaded:', profile);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword,
    refreshUserProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
