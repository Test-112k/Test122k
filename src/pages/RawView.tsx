import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getPaste, type Paste } from "@/lib/pasteService";

const RawView = () => {
  const { id } = useParams<{ id: string }>();
  const [paste, setPaste] = useState<Paste | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaste = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const fetchedPaste = await getPaste(id);
        
        if (fetchedPaste) {
          setPaste(fetchedPaste);
          // Set minimal title for raw view
          document.title = `${fetchedPaste.title} (Raw) - Aura Paste`;
        } else {
          setError("Paste not found");
        }
      } catch (error: any) {
        console.error('Error fetching paste:', error);
        if (error.message === 'Password required to view this paste') {
          setError("This paste is password protected. Please view it from the main paste page.");
        } else {
          setError(error.message || "Failed to load paste");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPaste();
  }, [id]);

  // Return just plain text for raw view
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!paste) {
    return <div>Paste not found</div>;
  }

  // Return pure text content with minimal styling for raw view
  return (
    <pre style={{ 
      fontFamily: 'monospace', 
      whiteSpace: 'pre-wrap', 
      margin: 0, 
      padding: '8px',
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      minHeight: '100vh',
      fontSize: '14px',
      lineHeight: '1.4'
    }}>
      {paste.content}
    </pre>
  );
};

export default RawView;