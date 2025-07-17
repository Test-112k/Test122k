import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Code, 
  Users, 
  Shield, 
  Clock, 
  Globe, 
  Zap,
  Heart,
  Github,
  Twitter,
  Mail
} from "lucide-react";
import Navigation from "@/components/Navigation";
import AdBanner from "@/components/AdBanner";
import Footer from "@/components/Footer";

const About = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Set dark mode as default
    document.documentElement.classList.add("dark");
    
    // SEO meta tags
    document.title = "About Aura Paste - Fast, Secure Code & Text Sharing Platform";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn about Aura Paste - the fastest way to share code snippets, text, and ideas online. Secure, beautiful, and developer-friendly paste sharing platform with syntax highlighting.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Learn about Aura Paste - the fastest way to share code snippets, text, and ideas online. Secure, beautiful, and developer-friendly paste sharing platform with syntax highlighting.';
      document.head.appendChild(meta);
    }

    // Add keywords meta tag
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'code sharing, pastebin, text sharing, syntax highlighting, developer tools, code snippets, programming, web development');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = 'code sharing, pastebin, text sharing, syntax highlighting, developer tools, code snippets, programming, web development';
      document.head.appendChild(meta);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const features = [
    {
      icon: Code,
      title: "Syntax Highlighting",
      description: "Beautiful syntax highlighting for 20+ programming languages including JavaScript, Python, Java, and more."
    },
    {
      icon: Clock,
      title: "Lightning Fast",
      description: "Create and share pastes instantly with our optimized platform. No waiting, no delays."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Choose between public and private visibility. Your data is protected with industry-standard security."
    },
    {
      icon: Users,
      title: "User Dashboard",
      description: "Manage all your pastes in one place. Track views, edit details, and organize your content."
    },
    {
      icon: Globe,
      title: "Public Discovery",
      description: "Share your knowledge with the community through public pastes that others can discover."
    },
    {
      icon: Zap,
      title: "Developer Friendly",
      description: "Built by developers, for developers. Clean URLs, easy sharing, and powerful features."
    }
  ];

  const stats = [
    { label: "Languages Supported", value: "20+" },
    { label: "Average Load Time", value: "<1s" },
    { label: "Uptime Guarantee", value: "99.9%" },
    { label: "Max File Size", value: "1MB" }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navigation />
      
      {/* Header Ad Banner */}
      <AdBanner position="header" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Hero Section */}
            <div className="text-center mb-12 animate-fade-in">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-4 mr-4">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  About Aura Paste
                </h1>
              </div>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                The modern way to share code, text, and ideas. Fast, secure, and beautiful - built for developers and creators who demand the best.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <Badge variant="secondary">Open Source Friendly</Badge>
                <Badge variant="secondary">Developer Tools</Badge>
                <Badge variant="secondary">Syntax Highlighting</Badge>
                <Badge variant="secondary">Secure Sharing</Badge>
              </div>
            </div>

            {/* Mission Statement */}
            <Card className="mb-12 animate-scale-in">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground text-center leading-relaxed">
                  At Aura Paste, we believe sharing code and ideas should be effortless, secure, and beautiful. 
                  We're building the next generation of paste sharing tools that developers and creators love to use. 
                  Our platform combines speed, security, and aesthetics to create the perfect environment for sharing knowledge.
                </p>
              </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-center mb-8">Why Choose Aura Paste?</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <Card key={index} className="text-center hover-scale animate-scale-in">
                    <CardHeader>
                      <feature.icon className="h-12 w-12 mx-auto text-primary mb-2" />
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Stats Section */}
            <Card className="mb-12 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Platform Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  {stats.map((stat, index) => (
                    <div key={index}>
                      <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Technology Stack */}
            <Card className="mb-12 animate-scale-in">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Built with Modern Technology</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center mb-6">
                  Aura Paste is built using cutting-edge web technologies to ensure the best performance, security, and user experience.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Badge variant="outline">React</Badge>
                  <Badge variant="outline">TypeScript</Badge>
                  <Badge variant="outline">Firebase</Badge>
                  <Badge variant="outline">Tailwind CSS</Badge>
                  <Badge variant="outline">Vite</Badge>
                  <Badge variant="outline">PWA Ready</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Contact Section */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center mb-6">
                  Have questions, feedback, or suggestions? We'd love to hear from you!
                </p>
                <div className="flex justify-center space-x-6">
                  <a href="mailto:contact@aurapaste.dev" className="flex items-center text-primary hover:underline">
                    <Mail className="h-5 w-5 mr-2" />
                    Email Us
                  </a>
                  <a href="https://github.com/aurapaste" className="flex items-center text-primary hover:underline">
                    <Github className="h-5 w-5 mr-2" />
                    GitHub
                  </a>
                  <a href="https://twitter.com/aurapaste" className="flex items-center text-primary hover:underline">
                    <Twitter className="h-5 w-5 mr-2" />
                    Twitter
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar with Ad */}
          <div className="lg:col-span-1">
            <AdBanner position="sidebar" />
          </div>
        </div>
      </div>

      {/* Footer Ad */}
      <AdBanner position="footer" />
      <Footer />
    </div>
  );
};

export default About;