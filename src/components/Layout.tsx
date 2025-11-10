import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Receipt,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  Package,
} from "lucide-react";
import Footer from "@/components/Footer";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const FOOTER_HEIGHT = 72;
const HEADER_HEIGHT = 72; // Increased for navigation

const Layout = ({ children, currentPage, onPageChange }: LayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", icon: BarChart3, key: "dashboard" },
    { name: "Quotations", icon: FileText, key: "quotations" },
    { name: "Invoices", icon: Receipt, key: "invoices" },
    { name: "Customers", icon: Users, key: "customers" },
    { name: "Stock Register", icon: Package, key: "stock-register" },
    { name: "Settings", icon: Settings, key: "settings" },
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header Navigation */}
      <header className="bg-card border-b shadow-sm px-4 py-3" style={{ height: HEADER_HEIGHT }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Company Logo" className="w-10 h-10" />
              <h1 className="text-xl font-bold text-primary">ARTISAN</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Button
                  key={item.key}
                  variant={currentPage === item.key ? "default" : "ghost"}
                  className="flex items-center gap-2"
                  onClick={() => onPageChange(item.key)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              ))}
            </nav>

            {/* Right side - Mobile menu button only */}
            <div className="flex items-center">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-card">
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => (
                <Button
                  key={item.key}
                  variant={currentPage === item.key ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    onPageChange(item.key);
                    setMobileMenuOpen(false);
                  }}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col" style={{ paddingBottom: FOOTER_HEIGHT }}>
        {/* Page Title Bar */}
        <div className="bg-muted/30 px-6 py-4 border-b">
          <h2 className="text-2xl font-semibold text-foreground capitalize text-center">
            {currentPage.replace('-', ' ')}
          </h2>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>

      {/* Fixed footer */}
      <footer
        className="fixed bottom-0 left-0 right-0 bg-gray-900 text-gray-300 border-t z-40"
        style={{ height: FOOTER_HEIGHT }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
          <p className="text-sm select-none">
            &copy; {new Date().getFullYear()} Dexorzo Creations. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
