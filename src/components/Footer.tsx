import { Link } from "react-router-dom";
import { Code, Heart, Github, Twitter, Mail } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-2">
                <Code className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Aura Paste
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              The modern way to share code, text, and ideas. Fast, secure, and beautiful.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com/aurapaste" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com/aurapaste" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="mailto:contact@aurapaste.dev" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Create Paste
                </Link>
              </li>
              <li>
                <Link to="/recent" className="text-muted-foreground hover:text-primary transition-colors">
                  Recent Pastes
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/legal#terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/legal#privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/legal#cookies" className="text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:legal@aurapaste.dev" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Legal Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="mailto:support@aurapaste.dev" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a 
                  href="mailto:contact@aurapaste.dev" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/aurapaste/issues" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Report Bug
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/aurapaste/discussions" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Community
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Aura Paste. Made with{" "}
            <Heart className="inline h-4 w-4 text-red-500" />{" "}
            for the developer community.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;