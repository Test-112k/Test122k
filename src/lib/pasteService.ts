import { db, auth } from './firebase';
import { collection, doc, setDoc, getDoc, query, where, getDocs, addDoc, deleteDoc, orderBy, limit, serverTimestamp, updateDoc, increment, runTransaction } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { encryptSensitiveContent, decryptContent, containsSensitiveData } from './encryption';
import { updateUserStats } from './userAchievements';

export interface Paste {
  id: string;
  title: string;
  content: string;
  language: string;
  authorUID?: string | null;
  authorName: string;
  visibility: 'public' | 'private';
  createdAt: any; // Firebase Timestamp or string
  expiresAt?: string;
  viewCount: number;
  url: string;
  password?: string;
  isPasswordProtected: boolean;
}

export const createPaste = async (
  pasteData: Omit<Paste, 'id' | 'createdAt' | 'viewCount' | 'url' | 'expiresAt' | 'isPasswordProtected'> & { 
    expiryOption?: string;
    password?: string;
  },
  user?: User | null
): Promise<Paste> => {
  try {
    console.log('Creating paste...');
    
    // Validate required fields
    if (!pasteData.content || pasteData.content.trim() === '') {
      throw new Error('Content is required');
    }

    // Calculate expiry date based on option
    let expiresAt: string | undefined;
    if (pasteData.expiryOption && pasteData.expiryOption !== 'never') {
      const expiryDate = new Date();
      switch (pasteData.expiryOption) {
        case '1hour':
          expiryDate.setHours(expiryDate.getHours() + 1);
          break;
        case '6hours':
          expiryDate.setHours(expiryDate.getHours() + 6);
          break;
        case '1day':
          expiryDate.setDate(expiryDate.getDate() + 1);
          break;
        case '3days':
          expiryDate.setDate(expiryDate.getDate() + 3);
          break;
        case '1week':
          expiryDate.setDate(expiryDate.getDate() + 7);
          break;
        default:
          expiryDate.setMonth(expiryDate.getMonth() + 1);
      }
      expiresAt = expiryDate.toISOString();
    } else {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      expiresAt = expiryDate.toISOString();
    }

    // Generate a document reference to get the ID first
    const docRef = doc(collection(db, 'pastes'));
    
    // Check if password is provided and not empty
    const hasPassword = pasteData.password && pasteData.password.trim();
    
    // Encrypt content if it contains sensitive data
    const processedContent = encryptSensitiveContent(pasteData.content);
    
    // Create Firestore document with required fields
    const firestoreDoc = {
      content: processedContent,
      title: pasteData.title || 'Untitled Paste',
      language: pasteData.language || 'text',
      authorName: pasteData.authorName || user?.displayName || user?.email || 'Anonymous',
      visibility: pasteData.visibility || 'public',
      createdAt: serverTimestamp(),
      authorUID: user?.uid ?? null,
      viewCount: 0,
      isPasswordProtected: !!hasPassword,
      ...(expiresAt && { expiresAt }),
      ...(hasPassword && { password: pasteData.password!.trim() })
    };
    
    // Save to Firestore
    await setDoc(docRef, firestoreDoc);
    
    // Create complete paste object for return value
    const completePaste: Paste = {
      id: docRef.id,
      title: firestoreDoc.title,
      content: processedContent,
      language: pasteData.language || 'text',
      authorUID: user?.uid ?? null,
      authorName: pasteData.authorName || user?.displayName || user?.email || 'Anonymous',
      visibility: firestoreDoc.visibility,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt,
      viewCount: 0,
      url: `${window.location.origin}/p/${docRef.id}`,
      isPasswordProtected: !!hasPassword,
      ...(hasPassword && { password: pasteData.password!.trim() })
    };
    
    return completePaste;
  } catch (error: any) {
    console.error('Error creating paste:', error);
    throw new Error(`Failed to create paste: ${error.message || 'Unknown error'}`);
  }
};

export const getPaste = async (pasteId: string, password?: string): Promise<Paste | null> => {
  try {
    if (!pasteId || pasteId.trim() === '') {
      throw new Error('Paste ID is required');
    }

    const pasteDoc = await getDoc(doc(db, 'pastes', pasteId));
    
    if (!pasteDoc.exists()) {
      return null;
    }

    const paste = pasteDoc.data() as Paste;
    
    // Decrypt content if it's encrypted
    paste.content = decryptContent(paste.content);
    
    // Check if paste has expired first
    if (paste.expiresAt && new Date(paste.expiresAt) <= new Date()) {
      throw new Error('This paste has expired');
    }
    
    // Check if paste is password protected
    if (paste.isPasswordProtected && paste.password) {
      if (!password || password !== paste.password) {
        throw new Error('Password required to view this paste');
      }
    }
    
    return {
      ...paste,
      id: pasteId,
      viewCount: paste.viewCount || 0,
      url: `${window.location.origin}/p/${pasteId}`,
      authorName: paste.authorName || 'Anonymous'
    };
  } catch (error: any) {
    console.error('Error fetching paste:', error);
    throw error;
  }
};

export const getUserPastes = async (userId: string): Promise<Paste[]> => {
  try {
    if (!userId || userId.trim() === '') {
      return [];
    }

    const userPastesQuery = query(
      collection(db, 'pastes'),
      where('authorUID', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(userPastesQuery);
    
    const userPastes = querySnapshot.docs.map(doc => {
      const paste = { ...doc.data(), id: doc.id } as Paste;
      paste.content = decryptContent(paste.content);
      if (paste.createdAt && typeof paste.createdAt !== 'string') {
        paste.createdAt = paste.createdAt.toDate().toISOString();
      }
      return paste;
    });
    
    const pastesWithUrls = userPastes.map(paste => {
      if (!paste.url) {
        paste.url = `${window.location.origin}/p/${paste.id}`;
      }
      return paste;
    });
    
    return pastesWithUrls;
  } catch (error: any) {
    console.error('Error fetching user pastes:', error);
    return [];
  }
};

export const deletePaste = async (pasteId: string, userId?: string): Promise<void> => {
  try {
    if (!pasteId || pasteId.trim() === '') {
      throw new Error('Paste ID is required');
    }

    const pasteDoc = await getDoc(doc(db, 'pastes', pasteId));
    
    if (!pasteDoc.exists()) {
      throw new Error('Paste not found');
    }

    const paste = pasteDoc.data() as Paste;
    
    if (userId && paste.authorUID !== userId) {
      throw new Error('You can only delete your own pastes');
    }

    await deleteDoc(doc(db, 'pastes', pasteId));
  } catch (error) {
    console.error('Error deleting paste:', error);
    throw new Error(`Failed to delete paste: ${error.message || 'Unknown error'}`);
  }
};

export const downloadPaste = (paste: Paste): void => {
  try {
    const fileExtension = getFileExtension(paste.language);
    const fileName = `${paste.title || `paste-${paste.id}`}.${fileExtension}`;
    
    const blob = new Blob([paste.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading paste:', error);
  }
};

const getFileExtension = (language: string): string => {
  const extensions: Record<string, string> = {
    javascript: 'js',
    python: 'py',
    java: 'java',
    html: 'html',
    css: 'css',
    json: 'json',
    xml: 'xml',
    sql: 'sql',
    typescript: 'ts',
    php: 'php',
    cpp: 'cpp',
    c: 'c',
    ruby: 'rb',
    go: 'go',
    rust: 'rs',
    swift: 'swift',
    kotlin: 'kt',
    text: 'txt'
  };
  
  return extensions[language] || 'txt';
};

export const getRecentPublicPastes = async (limitCount: number = 20): Promise<Paste[]> => {
  try {
    const q = query(
      collection(db, 'pastes'),
      where('visibility', '==', 'public'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return [];
    }
    
    const pastes = querySnapshot.docs.map(doc => {
      const data = doc.data() as Paste;
      
      if (!data.url) {
        data.url = `${window.location.origin}/p/${doc.id}`;
      }
      
      data.content = decryptContent(data.content);
      
      if (data.createdAt && typeof data.createdAt !== 'string') {
        data.createdAt = data.createdAt.toDate().toISOString();
      }
      
      return { ...data, id: doc.id };
    });
    
    const now = new Date();
    const validPastes = pastes.filter(paste => {
      return !paste.expiresAt || new Date(paste.expiresAt) > now;
    });
    
    return validPastes;
  } catch (error: any) {
    console.error('Error fetching recent public pastes:', error);
    return [];
  }
};

export const updatePaste = async (pasteId: string, updateData: {
  title: string;
  content: string;
  language: string;
  visibility: 'public' | 'private';
}): Promise<void> => {
  try {
    const pasteRef = doc(db, 'pastes', pasteId);
    
    const processedContent = encryptSensitiveContent(updateData.content);
    
    await updateDoc(pasteRef, {
      title: updateData.title,
      content: processedContent,
      language: updateData.language,
      visibility: updateData.visibility,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating paste:', error);
    throw new Error(`Failed to update paste: ${error.message || 'Unknown error'}`);
  }
};

export const incrementViewCount = async (pasteId: string, authorUID?: string | null): Promise<void> => {
  try {
    // Create a more robust session ID that works for guests and logged-in users
    const userAgent = navigator.userAgent;
    const timestamp = Date.now();
    const currentUser = auth.currentUser;
    
    // Create unique identifier for guests using browser fingerprint + IP simulation
    const guestFingerprint = btoa(
      userAgent + 
      navigator.language + 
      screen.width + 
      screen.height + 
      Intl.DateTimeFormat().resolvedOptions().timeZone
    ).substring(0, 20);
    
    // Use user ID for logged-in users, guest fingerprint for anonymous users
    const sessionIdentifier = currentUser?.uid || `guest_${guestFingerprint}`;
    const sessionId = `${sessionIdentifier}-${Math.floor(timestamp / (1000 * 60 * 60))}`; // Hourly session
    
    console.log('🔄 Attempting to increment view count for paste:', pasteId, 'Session:', sessionIdentifier);
    
    // Use transaction to ensure atomic operations
    await runTransaction(db, async (transaction) => {
      const pasteRef = doc(db, 'pastes', pasteId);
      const viewTrackingRef = doc(db, 'viewTracking', `${pasteId}_${sessionId}`);
      
      // Check if this session has already viewed this paste
      const viewTrackingDoc = await transaction.get(viewTrackingRef);
      
      if (!viewTrackingDoc.exists()) {
        // First view from this session, increment counter
        transaction.update(pasteRef, {
          viewCount: increment(1)
        });
        
        // Record this view to prevent duplicate counting
        transaction.set(viewTrackingRef, {
          pasteId,
          sessionId,
          timestamp: serverTimestamp(),
          authorUID,
          isGuest: !currentUser,
          userAgent: userAgent.substring(0, 100) // Store first 100 chars for analytics
        });
        
        console.log('✅ View count incremented for paste:', pasteId, currentUser ? '(logged-in user)' : '(guest)');
        
        // Update user stats if author exists
        if (authorUID) {
          try {
            await updateUserStats(authorUID, 1);
          } catch (error) {
            console.warn('Failed to update user stats:', error);
          }
        }
      } else {
        console.log('ℹ️ View already counted for this session');
      }
    });
  } catch (error) {
    console.error('❌ Error incrementing view count:', error);
    
    // Fallback: try simple increment without transaction
    try {
      const pasteRef = doc(db, 'pastes', pasteId);
      await updateDoc(pasteRef, {
        viewCount: increment(1)
      });
      console.log('✅ Fallback view count increment successful');
    } catch (fallbackError) {
      console.error('❌ Fallback view count increment failed:', fallbackError);
    }
  }
};
