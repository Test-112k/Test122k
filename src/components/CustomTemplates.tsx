
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Code, Trash2, Edit, FileText } from "lucide-react";
import { updateDoc } from 'firebase/firestore';
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDocs, query, where, deleteDoc, serverTimestamp } from 'firebase/firestore';

interface CustomTemplate {
  id: string;
  name: string;
  content: string;
  language: string;
  description?: string;
  userId: string;
  createdAt: any;
}

interface CustomTemplatesProps {
  onSelectTemplate?: (template: CustomTemplate) => void;
}

const CustomTemplates = ({ onSelectTemplate }: CustomTemplatesProps) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CustomTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    language: 'text',
    description: ''
  });

  useEffect(() => {
    if (currentUser) {
      loadUserTemplates();
    }
  }, [currentUser]);

  const loadUserTemplates = async () => {
    if (!currentUser) {
      console.log('No current user, skipping template load');
      return;
    }
    
    try {
      console.log('Loading templates for user:', currentUser.uid);
      setLoading(true);
      const templatesQuery = query(
        collection(db, 'templates'),
        where('userId', '==', currentUser.uid)
      );
      
      console.log('Executing Firestore query...');
      const querySnapshot = await getDocs(templatesQuery);
      console.log('Query result:', querySnapshot.docs.length, 'documents found');
      
      const userTemplates = querySnapshot.docs.map(doc => {
        const data = { ...doc.data(), id: doc.id };
        console.log('Template data:', data);
        return data;
      }) as CustomTemplate[];
      
      console.log('Processed templates:', userTemplates);
      setTemplates(userTemplates);
    } catch (error) {
      console.error('Error loading custom templates:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      toast({
        title: "Error",
        description: `Failed to load custom templates: ${error?.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async () => {
    console.log('Creating template - currentUser:', currentUser);
    console.log('Template data:', newTemplate);
    
    if (!currentUser) {
      toast({
        title: "Error",
        description: "Please log in to create custom templates.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newTemplate.name.trim() || !newTemplate.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in name and content.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Attempting to create template in Firestore...');
      const templateDoc = doc(collection(db, 'templates'));
      const templateData = {
        ...newTemplate,
        authorUID: currentUser.uid,
        userId: currentUser.uid,
        createdAt: serverTimestamp()
      };
      console.log('Template document data:', templateData);
      
      await setDoc(templateDoc, templateData);
      console.log('Template created successfully!');

      toast({
        title: "Success",
        description: "Custom template created successfully!",
      });

      setNewTemplate({ name: '', content: '', language: 'text', description: '' });
      setShowCreateDialog(false);
      loadUserTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error
      });
      toast({
        title: "Error",
        description: `Failed to create template: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      await deleteDoc(doc(db, 'templates', templateId));
      toast({
        title: "Success",
        description: "Template deleted successfully!",
      });
      loadUserTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (template: CustomTemplate) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      content: template.content,
      language: template.language,
      description: template.description || ''
    });
    setShowEditDialog(true);
  };

  const updateTemplate = async () => {
    if (!editingTemplate || !currentUser) {
      return;
    }
    
    if (!newTemplate.name.trim() || !newTemplate.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in name and content.",
        variant: "destructive",
      });
      return;
    }

    try {
      const templateRef = doc(db, 'templates', editingTemplate.id);
      await updateDoc(templateRef, {
        name: newTemplate.name,
        content: newTemplate.content,
        language: newTemplate.language,
        description: newTemplate.description
      });

      toast({
        title: "Success",
        description: "Template updated successfully!",
      });

      setNewTemplate({ name: '', content: '', language: 'text', description: '' });
      setShowEditDialog(false);
      setEditingTemplate(null);
      loadUserTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: "Error",
        description: `Failed to update template: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-400" />
          My Templates
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="ml-auto bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Create Custom Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Template name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-gray-800 border-gray-700"
                />
                <Input
                  placeholder="Description (optional)"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-gray-800 border-gray-700"
                />
                <Select
                  value={newTemplate.language}
                  onValueChange={(value) => setNewTemplate(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="text">Plain Text</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="css">CSS</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="php">PHP</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Template content"
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                  className="bg-gray-800 border-gray-700 min-h-[200px]"
                />
                <div className="flex gap-2">
                  <Button onClick={createTemplate} className="bg-blue-600 hover:bg-blue-700">
                    Create Template
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="border-gray-700">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Edit Template Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Edit Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Template name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-gray-800 border-gray-700"
                />
                <Input
                  placeholder="Description (optional)"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-gray-800 border-gray-700"
                />
                <Select
                  value={newTemplate.language}
                  onValueChange={(value) => setNewTemplate(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="text">Plain Text</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="css">CSS</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="php">PHP</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Template content"
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                  className="bg-gray-800 border-gray-700 min-h-[200px]"
                />
                <div className="flex gap-2">
                  <Button onClick={updateTemplate} className="bg-green-600 hover:bg-green-700">
                    Update Template
                  </Button>
                  <Button variant="outline" onClick={() => setShowEditDialog(false)} className="border-gray-700">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-500" />
            <p className="text-sm">No custom templates yet.</p>
            <p className="text-xs">Create your first template to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm text-white truncate">{template.name}</h4>
                      <Badge variant="secondary" className="text-xs bg-blue-900/30 text-blue-400 border-blue-700">
                        {template.language}
                      </Badge>
                    </div>
                    {template.description && (
                      <p className="text-xs text-gray-400 mb-2">{template.description}</p>
                    )}
                    <div className="text-xs text-gray-500 mb-2">
                      {template.content.length} characters
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {onSelectTemplate && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onSelectTemplate(template)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                      >
                        <Code className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(template)}
                      className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteTemplate(template.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomTemplates;
