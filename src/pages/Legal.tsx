import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Scale, Shield, FileText } from "lucide-react";
import Navigation from "@/components/Navigation";
import AdBanner from "@/components/AdBanner";

const Legal = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Set dark mode as default
    document.documentElement.classList.add("dark");
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Legal Documents</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Please read our legal documents to understand how we handle your data and the terms of using Aura Paste.
          </p>
        </div>

        <Tabs defaultValue="terms" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="terms" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Terms of Service
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy Policy
            </TabsTrigger>
            <TabsTrigger value="cookies" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Cookie Policy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="terms">
            <Card>
              <CardHeader>
                <CardTitle>Terms of Service</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-6 text-sm">
                    <section>
                      <h3 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h3>
                      <p className="text-muted-foreground">
                        By accessing and using Aura Paste ("Service"), you accept and agree to be bound by the terms and provision of this agreement.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">2. Use License</h3>
                      <p className="text-muted-foreground mb-3">
                        Permission is granted to temporarily use Aura Paste for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                      </p>
                      <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                        <li>modify or copy the materials</li>
                        <li>use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
                        <li>attempt to decompile or reverse engineer any software contained on the website</li>
                        <li>remove any copyright or other proprietary notations from the materials</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">3. User Content</h3>
                      <p className="text-muted-foreground mb-3">
                        By uploading content to Aura Paste, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content in connection with the Service.
                      </p>
                      <p className="text-muted-foreground">
                        You are responsible for the content you upload and must ensure you have the right to share it. We reserve the right to remove any content that violates these terms or applicable laws.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">4. Prohibited Uses</h3>
                      <p className="text-muted-foreground mb-3">You may not use Aura Paste to:</p>
                      <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                        <li>Upload malicious code, viruses, or harmful content</li>
                        <li>Share illegal, copyrighted, or inappropriate material</li>
                        <li>Spam or abuse the service</li>
                        <li>Violate any applicable laws or regulations</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">5. Disclaimer</h3>
                      <p className="text-muted-foreground">
                        The materials on Aura Paste are provided on an 'as is' basis. Aura Paste makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">6. Limitations</h3>
                      <p className="text-muted-foreground">
                        In no event shall Aura Paste or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Aura Paste, even if Aura Paste or an authorized representative has been notified orally or in writing of the possibility of such damage.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">7. Accuracy of Materials</h3>
                      <p className="text-muted-foreground">
                        The materials appearing on Aura Paste could include technical, typographical, or photographic errors. Aura Paste does not warrant that any of the materials on its website are accurate, complete, or current.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">8. Modifications</h3>
                      <p className="text-muted-foreground">
                        Aura Paste may revise these terms of service at any time without notice. By using this service, you are agreeing to be bound by the then current version of these terms of service.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">9. Contact Information</h3>
                      <p className="text-muted-foreground">
                        If you have any questions about these Terms of Service, please contact us at legal@aurapaste.netlify.app
                      </p>
                    </section>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-6 text-sm">
                    <section>
                      <h3 className="text-lg font-semibold mb-3">1. Information We Collect</h3>
                      <p className="text-muted-foreground mb-3">
                        We collect information you provide directly to us, such as when you create an account, upload content, or contact us. This may include:
                      </p>
                      <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                        <li>Account information (email, username, password)</li>
                        <li>Profile information (display name, avatar, bio)</li>
                        <li>Content you upload (pastes, comments)</li>
                        <li>Usage data and analytics</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">2. How We Use Your Information</h3>
                      <p className="text-muted-foreground mb-3">We use the information we collect to:</p>
                      <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                        <li>Provide, maintain, and improve our services</li>
                        <li>Process transactions and send related information</li>
                        <li>Send technical notices and support messages</li>
                        <li>Respond to your comments and questions</li>
                        <li>Monitor and analyze trends and usage</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">3. Information Sharing</h3>
                      <p className="text-muted-foreground">
                        We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information in the following circumstances:
                      </p>
                      <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-3">
                        <li>With your consent</li>
                        <li>To comply with laws or respond to legal requests</li>
                        <li>To protect our rights and prevent fraud</li>
                        <li>In connection with a business transfer</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">4. Data Security</h3>
                      <p className="text-muted-foreground">
                        We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">5. Data Retention</h3>
                      <p className="text-muted-foreground">
                        We retain your information for as long as your account is active or as needed to provide services. We may retain certain information after account deletion as required by law or for legitimate business purposes.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">6. Your Rights</h3>
                      <p className="text-muted-foreground mb-3">You have the right to:</p>
                      <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                        <li>Access and update your personal information</li>
                        <li>Delete your account and associated data</li>
                        <li>Opt out of marketing communications</li>
                        <li>Request a copy of your data</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">7. Cookies and Tracking</h3>
                      <p className="text-muted-foreground">
                        We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie settings through your browser.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">8. Changes to This Policy</h3>
                      <p className="text-muted-foreground">
                        We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the effective date.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">9. Contact Us</h3>
                      <p className="text-muted-foreground">
                        If you have any questions about this Privacy Policy, please contact us at privacy@aurapaste.netlify.app
                      </p>
                    </section>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cookies">
            <Card>
              <CardHeader>
                <CardTitle>Cookie Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-6 text-sm">
                    <section>
                      <h3 className="text-lg font-semibold mb-3">1. What Are Cookies</h3>
                      <p className="text-muted-foreground">
                        Cookies are small text files that are stored on your computer or mobile device when you visit a website. They help the website remember information about your visit, such as your preferred language and other settings.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">2. How We Use Cookies</h3>
                      <p className="text-muted-foreground mb-3">We use cookies for several purposes:</p>
                      <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                        <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
                        <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                        <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
                        <li><strong>Authentication Cookies:</strong> Keep you logged in to your account</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">3. Types of Cookies We Use</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-foreground">Essential Cookies</h4>
                          <p className="text-muted-foreground">These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you.</p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-foreground">Functional Cookies</h4>
                          <p className="text-muted-foreground">These cookies enable the website to provide enhanced functionality and personalization, such as remembering your dark mode preference.</p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-foreground">Analytics Cookies</h4>
                          <p className="text-muted-foreground">These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.</p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-foreground">Authentication Cookies</h4>
                          <p className="text-muted-foreground">These cookies keep you logged in to your account and remember your authentication status.</p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">4. Third-Party Cookies</h3>
                      <p className="text-muted-foreground mb-3">
                        We may use third-party services that set their own cookies. These include:
                      </p>
                      <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                        <li>Google Analytics for website analytics</li>
                        <li>Firebase for authentication and database services</li>
                        <li>CDN providers for faster content delivery</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">5. Managing Cookies</h3>
                      <p className="text-muted-foreground mb-3">
                        You can control and manage cookies in various ways:
                      </p>
                      <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                        <li><strong>Browser Settings:</strong> Most browsers allow you to refuse or accept cookies</li>
                        <li><strong>Delete Cookies:</strong> You can delete all cookies that are already on your device</li>
                        <li><strong>Block Cookies:</strong> You can set your browser to prevent cookies from being placed</li>
                        <li><strong>Opt-out Tools:</strong> Use industry opt-out tools for advertising cookies</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">6. Cookie Consent</h3>
                      <p className="text-muted-foreground">
                        By continuing to use our website, you consent to our use of cookies as described in this policy. You can withdraw your consent at any time by adjusting your browser settings.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">7. Updates to This Policy</h3>
                      <p className="text-muted-foreground">
                        We may update this Cookie Policy from time to time to reflect changes in our practices or for legal reasons. Please check this page regularly for updates.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">8. Contact Information</h3>
                      <p className="text-muted-foreground">
                        If you have any questions about our use of cookies, please contact us at cookies@aurapaste.netlify.app
                      </p>
                    </section>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AdBanner position="footer" />
    </div>
  );
};

export default Legal;