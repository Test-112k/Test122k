
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, where, orderBy, getDocs } from 'firebase/firestore';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Users, FileText, AlertTriangle, FileCode, Ban, Check, X, Shield, ShieldCheck, Trash2 } from 'lucide-react';
import Navigation from '@/components/Navigation';

interface User {
  id: string;
  displayName?: string;
  email?: string;
  role: 'user' | 'moderator' | 'admin';
  banned?: boolean;
  createdAt?: any;
  pasteCount?: number;
}

interface Paste {
  id: string;
  title: string;
  content: string;
  visibility: 'public' | 'private';
  authorUID?: string;
  authorName: string;
  createdAt: any;
  viewCount: number;
  reported?: boolean;
}

interface Report {
  id: string;
  pasteId: string;
  reporterUID: string;
  reason: string;
  createdAt: any;
  resolved?: boolean;
}

interface Template {
  id: string;
  name: string;
  content: string;
  userId: string;
  createdAt: any;
}

interface DashboardStats {
  totalUsers: number;
  totalPastes: number;
  publicPastesToday: number;
  flaggedPastes: number;
  bannedUsers: number;
}

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [pastes, setPastes] = useState<Paste[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPastes: 0,
    publicPastesToday: 0,
    flaggedPastes: 0,
    bannedUsers: 0
  });

  // Check if user is admin
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setIsAdmin(userData.role === 'admin');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  // Load users data
  useEffect(() => {
    if (!isAdmin) return;

    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(usersData);
    });

    return unsubscribe;
  }, [isAdmin]);

  // Load pastes data
  useEffect(() => {
    if (!isAdmin) return;

    const unsubscribe = onSnapshot(
      query(collection(db, 'pastes'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const pastesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Paste));
        setPastes(pastesData);
      }
    );

    return unsubscribe;
  }, [isAdmin]);

  // Load reports data
  useEffect(() => {
    if (!isAdmin) return;

    const unsubscribe = onSnapshot(collection(db, 'reports'), (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
      setReports(reportsData);
    });

    return unsubscribe;
  }, [isAdmin]);

  // Load templates data
  useEffect(() => {
    if (!isAdmin) return;

    const loadTemplates = async () => {
      const templatesData: Template[] = [];
      for (const user of users) {
        const templatesQuery = query(collection(db, 'customTemplates'), where('userId', '==', user.id));
        const snapshot = await getDocs(templatesQuery);
        snapshot.docs.forEach(doc => {
          templatesData.push({ id: doc.id, ...doc.data() } as Template);
        });
      }
      setTemplates(templatesData);
    };

    if (users.length > 0) {
      loadTemplates();
    }
  }, [isAdmin, users]);

  // Calculate stats
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const publicPastesToday = pastes.filter(paste => {
      const pasteDate = paste.createdAt?.toDate?.() || new Date(paste.createdAt);
      return paste.visibility === 'public' && pasteDate >= today;
    }).length;

    setStats({
      totalUsers: users.length,
      totalPastes: pastes.length,
      publicPastesToday,
      flaggedPastes: pastes.filter(paste => paste.reported).length,
      bannedUsers: users.filter(user => user.banned).length
    });
  }, [users, pastes]);

  const handleUserRoleChange = async (userId: string, newRole: 'user' | 'moderator') => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      toast({
        title: 'Success',
        description: `User role updated to ${newRole}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  const handleUserBan = async (userId: string, banned: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { banned });
      toast({
        title: 'Success',
        description: `User ${banned ? 'banned' : 'unbanned'} successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${banned ? 'ban' : 'unban'} user`,
        variant: 'destructive',
      });
    }
  };

  const handleDeletePaste = async (pasteId: string) => {
    try {
      await deleteDoc(doc(db, 'pastes', pasteId));
      toast({
        title: 'Success',
        description: 'Paste deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete paste',
        variant: 'destructive',
      });
    }
  };

  const handlePasteVisibilityChange = async (pasteId: string, visibility: 'public' | 'private') => {
    try {
      await updateDoc(doc(db, 'pastes', pasteId), { visibility });
      toast({
        title: 'Success',
        description: `Paste visibility changed to ${visibility}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update paste visibility',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteDoc(doc(db, 'customTemplates', templateId));
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      await updateDoc(doc(db, 'reports', reportId), { resolved: true });
      toast({
        title: 'Success',
        description: 'Report resolved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resolve report',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!currentUser || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage your Aura Paste platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Pastes</CardTitle>
              <FileText className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalPastes}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Public Today</CardTitle>
              <FileText className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.publicPastesToday}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Flagged Pastes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.flaggedPastes}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Banned Users</CardTitle>
              <Ban className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.bannedUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="users" className="text-white">Users</TabsTrigger>
            <TabsTrigger value="pastes" className="text-white">Pastes</TabsTrigger>
            <TabsTrigger value="reports" className="text-white">Reports</TabsTrigger>
            <TabsTrigger value="templates" className="text-white">Templates</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-gray-400">Manage user roles and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-300">Email</TableHead>
                      <TableHead className="text-gray-300">Role</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Created</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="border-gray-700">
                        <TableCell className="text-white">{user.displayName || 'No Name'}</TableCell>
                        <TableCell className="text-gray-300">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'moderator' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.banned ? 'destructive' : 'default'}>
                            {user.banned ? 'Banned' : 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {user.role !== 'admin' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUserRoleChange(user.id, user.role === 'moderator' ? 'user' : 'moderator')}
                                >
                                  {user.role === 'moderator' ? <Shield className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                                </Button>
                                <Button
                                  size="sm"
                                  variant={user.banned ? 'default' : 'destructive'}
                                  onClick={() => handleUserBan(user.id, !user.banned)}
                                >
                                  {user.banned ? <Check className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pastes Tab */}
          <TabsContent value="pastes">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Paste Management</CardTitle>
                <CardDescription className="text-gray-400">Moderate and manage all pastes</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Title</TableHead>
                      <TableHead className="text-gray-300">Author</TableHead>
                      <TableHead className="text-gray-300">Visibility</TableHead>
                      <TableHead className="text-gray-300">Views</TableHead>
                      <TableHead className="text-gray-300">Created</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastes.slice(0, 20).map((paste) => (
                      <TableRow key={paste.id} className="border-gray-700">
                        <TableCell className="text-white">{paste.title || 'Untitled'}</TableCell>
                        <TableCell className="text-gray-300">{paste.authorName}</TableCell>
                        <TableCell>
                          <Badge variant={paste.visibility === 'public' ? 'default' : 'secondary'}>
                            {paste.visibility}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">{paste.viewCount || 0}</TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(paste.createdAt?.toDate?.() || paste.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => window.open(`/p/${paste.id}`, '_blank')}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePasteVisibilityChange(paste.id, paste.visibility === 'public' ? 'private' : 'public')}
                            >
                              {paste.visibility === 'public' ? 'Make Private' : 'Make Public'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeletePaste(paste.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Report Management</CardTitle>
                <CardDescription className="text-gray-400">Handle user reports and moderation</CardDescription>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No reports found</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Paste ID</TableHead>
                        <TableHead className="text-gray-300">Reason</TableHead>
                        <TableHead className="text-gray-300">Reporter</TableHead>
                        <TableHead className="text-gray-300">Date</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id} className="border-gray-700">
                          <TableCell className="text-white">{report.pasteId}</TableCell>
                          <TableCell className="text-gray-300">{report.reason}</TableCell>
                          <TableCell className="text-gray-300">{report.reporterUID}</TableCell>
                          <TableCell className="text-gray-300">
                            {new Date(report.createdAt?.toDate?.() || report.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={report.resolved ? 'default' : 'destructive'}>
                              {report.resolved ? 'Resolved' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {!report.resolved && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResolveReport(report.id)}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Template Management</CardTitle>
                <CardDescription className="text-gray-400">Manage user-created templates</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-300">Owner</TableHead>
                      <TableHead className="text-gray-300">Created</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id} className="border-gray-700">
                        <TableCell className="text-white">{template.name}</TableCell>
                        <TableCell className="text-gray-300">{template.userId}</TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(template.createdAt?.toDate?.() || template.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
