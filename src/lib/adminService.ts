
import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export const initializeAdminUser = async (email: string) => {
  try {
    console.log(`Initializing admin access for: ${email}`);
    return true;
  } catch (error) {
    console.error('Error initializing admin user:', error);
    return false;
  }
};

export const createUserProfile = async (uid: string, userData: {
  displayName?: string;
  email?: string;
  role?: 'user' | 'moderator' | 'admin';
  bio?: string;
  telegram?: string;
  website?: string;
  location?: string;
  discord?: string;
}) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    // Check if this is the admin email
    const isAdmin = userData.email === 'warzoneplayerg@gmail.com';
    
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        displayName: userData.displayName || '',
        email: userData.email || '',
        role: isAdmin ? 'admin' : 'user',
        createdAt: new Date(),
        banned: false,
        pasteCount: 0,
        totalViews: 0,
        bio: userData.bio || '',
        telegram: userData.telegram || '',
        website: userData.website || '',
        location: userData.location || '',
        discord: userData.discord || '',
        ...userData
      });
      
      console.log(`User profile created for ${userData.email} with role: ${isAdmin ? 'admin' : 'user'}`);
    } else {
      // Update existing user profile, ensuring admin gets admin role
      const existingData = userDoc.data();
      const updateData: any = {
        displayName: userData.displayName || existingData.displayName || '',
        email: userData.email || existingData.email || '',
      };

      // Force admin role for admin email
      if (isAdmin) {
        updateData.role = 'admin';
      } else if (!existingData.role) {
        updateData.role = 'user';
      }

      // Update other profile fields if provided
      if (userData.bio !== undefined) updateData.bio = userData.bio;
      if (userData.telegram !== undefined) updateData.telegram = userData.telegram;
      if (userData.website !== undefined) updateData.website = userData.website;
      if (userData.location !== undefined) updateData.location = userData.location;
      if (userData.discord !== undefined) updateData.discord = userData.discord;

      await updateDoc(userRef, updateData);
      
      console.log(`User profile updated for ${userData.email} with role: ${updateData.role || existingData.role}`);
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
  }
};

export const getUserProfile = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data();
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (uid: string, userData: {
  displayName?: string;
  bio?: string;
  telegram?: string;
  website?: string;
  location?: string;
  discord?: string;
}) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, userData);
    console.log('User profile updated successfully');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
