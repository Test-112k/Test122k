import { db } from './firebase';
import { collection, doc, setDoc, getDoc, query, where, getDocs, addDoc, deleteDoc, orderBy, limit, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
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
    console.log('=== PASTE CREATION DEBUG ===');
    console.log('Creating paste with data:', pasteData);
    console.log('User:', user ? { uid: user.uid, email: user.email } : 'No user');
    
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
          // For 'never' option, set to 1 month from now
          expiryDate.setMonth(expiryDate.getMonth() + 1);
      }
      expiresAt = expiryDate.toISOString();
    } else {
      // For 'never' option, set to 1 month from now
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      expiresAt = expiryDate.toISOString();
    }

    // Generate a document reference to get the ID first
    const docRef = doc(collection(db, 'pastes'));
    console.log('Generated document ID:', docRef.id);

    // Check if password is provided and not empty
    const hasPassword = pasteData.password && pasteData.password.trim();
    
    // Encrypt content if it contains sensitive data
    const processedContent = encryptSensitiveContent(pasteData.content);
    const isSensitive = containsSensitiveData(pasteData.content);
    
    if (isSensitive) {
      console.log('🔒 Sensitive content detected and encrypted');
    }

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

    console.log('Firestore document to be saved:', firestoreDoc);
    
    // Save only the required fields to Firestore
    console.log('Attempting to save document to Firestore...');
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
      createdAt: new Date().toISOString(), // For immediate return use
      expiresAt: expiresAt,
      viewCount: 0,
      url: `${window.location.origin}/p/${docRef.id}`,
      isPasswordProtected: !!hasPassword,
      ...(hasPassword && { password: pasteData.password!.trim() })
    };
    console.log('✅ Document saved successfully with ID:', docRef.id);
    
    // Return paste with current timestamp for immediate use
    const returnPaste = {
      ...completePaste,
      createdAt: new Date().toISOString()
    };
    
    console.log('=== PASTE CREATION SUCCESS ===');
    return returnPaste;
  } catch (error: any) {
    console.error('=== PASTE CREATION ERROR ===');
    console.error('Full error object:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    // More specific error messages
    if (error.code === 'permission-denied') {
      throw new Error('Unable to save paste. Please try refreshing the page or check your internet connection.');
    } else if (error.code === 'unavailable') {
      throw new Error('Service temporarily unavailable. Please try again in a moment.');
    } else if (error.code === 'unauthenticated' && pasteData.visibility === 'private') {
      throw new Error('Please log in to create private pastes.');
    }
    
    throw new Error(`Failed to create paste: ${error.message || 'Unknown error'}`);
  }
};

export const getPaste = async (pasteId: string, password?: string): Promise<Paste | null> => {
  try {
    console.log('Fetching paste with ID:', pasteId);
    
    if (!pasteId || pasteId.trim() === '') {
      throw new Error('Paste ID is required');
    }

    const pasteDoc = await getDoc(doc(db, 'pastes', pasteId));
    
    if (!pasteDoc.exists()) {
      console.log('Paste not found:', pasteId);
      return null;
    }

    const paste = pasteDoc.data() as Paste;
    console.log('Paste found:', paste);
    
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
    console.log('=== GET USER PASTES DEBUG ===');
    console.log('Fetching pastes for user:', userId);
    
    if (!userId || userId.trim() === '') {
      console.log('❌ User ID is empty or invalid');
      return [];
    }

    // Query specifically for user's pastes using authorUID
    console.log('Querying Firestore for user pastes...');
    const userPastesQuery = query(
      collection(db, 'pastes'),
      where('authorUID', '==', userId), // Changed from authorId to authorUID
      orderBy('createdAt', 'desc')
    );
    
    console.log('Executing user pastes query...');
    const querySnapshot = await getDocs(userPastesQuery);
    console.log('Query executed successfully, found', querySnapshot.size, 'user documents');
    
    // Map the results and decrypt content
    const userPastes = querySnapshot.docs.map(doc => {
      const paste = { ...doc.data(), id: doc.id } as Paste;
      // Decrypt content if it's encrypted
      paste.content = decryptContent(paste.content);
      // Convert Firestore timestamp to string if needed
      if (paste.createdAt && typeof paste.createdAt !== 'string') {
        paste.createdAt = paste.createdAt.toDate().toISOString();
      }
      console.log('Processing user paste:', paste.id, 'title:', paste.title);
      return paste;
    });
    
    console.log('✅ User pastes found:', userPastes.length);
    
    // Ensure proper URLs
    const pastesWithUrls = userPastes.map(paste => {
      if (!paste.url) {
        paste.url = `${window.location.origin}/p/${paste.id}`;
      }
      return paste;
    });
    
    console.log('📝 User pastes breakdown:', {
      total: pastesWithUrls.length,
      public: pastesWithUrls.filter(p => p.visibility === 'public').length,
      private: pastesWithUrls.filter(p => p.visibility === 'private').length
    });
    console.log('=== GET USER PASTES SUCCESS ===');
    
    return pastesWithUrls;
  } catch (error: any) {
    console.error('=== GET USER PASTES ERROR ===');
    console.error('Full error object:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    // Handle permission errors specifically
    if (error.code === 'permission-denied') {
      console.error('Permission denied - check Firestore rules. Users should be able to read pastes.');
      return [];
    }
    
    // Return empty array for other errors to prevent crash
    console.error('Returning empty array due to error');
    return [];
  }
};

export const deletePaste = async (pasteId: string, userId?: string): Promise<void> => {
  try {
    console.log('Deleting paste with ID:', pasteId, 'by user:', userId);
    
    if (!pasteId || pasteId.trim() === '') {
      throw new Error('Paste ID is required');
    }

    // Get the paste first to check ownership
    const pasteDoc = await getDoc(doc(db, 'pastes', pasteId));
    
    if (!pasteDoc.exists()) {
      throw new Error('Paste not found');
    }

    const paste = pasteDoc.data() as Paste;
    
    // Check if user owns the paste (if userId is provided) - use authorUID
    if (userId && paste.authorUID !== userId) {
      throw new Error('You can only delete your own pastes');
    }

    // Delete the document
    await deleteDoc(doc(db, 'pastes', pasteId));
    console.log('Paste deleted successfully');
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
    console.log('File downloaded:', fileName);
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
    console.log('🔍 Fetching recent public pastes, limit:', limitCount);
    
    // Query for public pastes ordered by creation date
    const q = query(
      collection(db, 'pastes'),
      where('visibility', '==', 'public'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    console.log('📤 Executing public pastes query...');
    const querySnapshot = await getDocs(q);
    console.log('📥 Query executed, found', querySnapshot.size, 'public documents');
    
    if (querySnapshot.empty) {
      console.log('📋 No public documents found in pastes collection');
      return [];
    }
    
    const pastes = querySnapshot.docs.map(doc => {
      const data = doc.data() as Paste;
      console.log('Processing public paste:', doc.id, 'visibility:', data.visibility, 'author:', data.authorName);
      
      // Ensure the paste has a proper URL
      if (!data.url) {
        data.url = `${window.location.origin}/p/${doc.id}`;
      }
      
      // Decrypt content for preview
      data.content = decryptContent(data.content);
      
      // Convert Firestore timestamp to string if needed
      if (data.createdAt && typeof data.createdAt !== 'string') {
        data.createdAt = data.createdAt.toDate().toISOString();
      }
      
      return { ...data, id: doc.id };
    });
    
    // Filter out expired pastes
    const now = new Date();
    const validPastes = pastes.filter(paste => {
      const isNotExpired = !paste.expiresAt || new Date(paste.expiresAt) > now;
      
      if (!isNotExpired) {
        console.log(`❌ Paste ${paste.id} filtered out: expired`);
      }
      
      return isNotExpired;
    });
    
    console.log('✅ Valid public pastes found:', validPastes.length);
    console.log('📊 Public pastes summary:', validPastes.map(p => ({ id: p.id, title: p.title, author: p.authorName, visibility: p.visibility })));
    
    return validPastes;
  } catch (error: any) {
    console.error('❌ Error fetching recent public pastes:', error);
    console.error('Error details:', { message: error.message, code: error.code });
    
    // Handle permission errors gracefully
    if (error.code === 'permission-denied') {
      console.warn('Permission denied when fetching public pastes - check Firestore rules');
      return [];
    }
    
    // Return empty array on error to prevent page crash
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
    
    // Encrypt content if it contains sensitive data
    const processedContent = encryptSensitiveContent(updateData.content);
    
    await updateDoc(pasteRef, {
      title: updateData.title,
      content: processedContent,
      language: updateData.language,
      visibility: updateData.visibility,
      updatedAt: serverTimestamp()
    });
    
    console.log('Paste updated successfully');
  } catch (error) {
    console.error('Error updating paste:', error);
    throw new Error(`Failed to update paste: ${error.message || 'Unknown error'}`);
  }
};

export const incrementViewCount = async (pasteId: string, authorUID?: string | null): Promise<void> => {
  try {
    console.log('Incrementing view count for paste:', pasteId, 'author:', authorUID);
    
    const pasteRef = doc(db, 'pastes', pasteId);
    
    // Increment the view count
    await updateDoc(pasteRef, {
      viewCount: increment(1)
    });
    
    console.log('✅ View count incremented successfully for paste:', pasteId);
    
    // Update user stats if author exists
    if (authorUID) {
      try {
        await updateUserStats(authorUID, 1);
        console.log('✅ User stats updated for author:', authorUID);
      } catch (error) {
        console.warn('Failed to update user stats:', error);
      }
    }
  } catch (error) {
    console.error('❌ Error incrementing view count:', error);
    // Don't throw error to prevent disrupting the main flow
  }
};
