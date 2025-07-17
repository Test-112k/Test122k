
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code, FileText, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface CustomTemplate {
  id: string;
  name: string;
  content: string;
  language: string;
  description?: string;
  userId: string;
  createdAt: any;
}

interface TemplateSelectorProps {
  onSelectTemplate: (template: any) => void;
  onClose: () => void;
}

const TemplateSelector = ({ onSelectTemplate, onClose }: TemplateSelectorProps) => {
  const { currentUser } = useAuth();
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadCustomTemplates();
    }
  }, [currentUser]);

  const loadCustomTemplates = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const templatesQuery = query(
        collection(db, 'templates'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(templatesQuery);
      const templates = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as CustomTemplate[];
      
      setCustomTemplates(templates);
    } catch (error) {
      console.error('Error loading custom templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: CustomTemplate) => {
    onSelectTemplate({
      name: template.name,
      content: template.content,
      language: template.language
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            Custom Templates
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4">
          {!currentUser ? (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Log in to use custom templates</p>
            </div>
          ) : loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-700 rounded"></div>
              ))}
            </div>
          ) : customTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FileText className="h-8 w-8 mx-auto mb-2 text-gray-500" />
              <p className="text-sm">No custom templates yet.</p>
              <p className="text-xs">Create templates in your dashboard!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {customTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm text-white">{template.name}</h4>
                    <Badge variant="secondary" className="text-xs bg-blue-900/30 text-blue-400 border-blue-700">
                      {template.language}
                    </Badge>
                  </div>
                  {template.description && (
                    <p className="text-xs text-gray-400 mb-2">{template.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {template.content.length} characters
                    </span>
                    <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20">
                      <Code className="h-3 w-3 mr-1" />
                      Use
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
