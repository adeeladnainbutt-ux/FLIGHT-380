import React, { useState } from 'react';
import { Button } from './ui/button';
import { Phone, Menu, User, LogIn, LogOut } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export const Header = ({ onNavigateHome, user, onSignIn, onSignOut }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navLinks = [
    { name: 'Home', href: '#home', isHome: true },
    { name: 'Destinations', href: '#destinations', isHome: false },
    { name: 'Deals', href: '#deals', isHome: false },
    { name: 'About', href: '#about', isHome: false },
    { name: 'Contact', href: '#contact', isHome: false }
  ];

  const handleNavClick = (e, link) => {
    if (link.isHome && onNavigateHome) {
      e.preventDefault();
      onNavigateHome();
    }
    setMobileMenuOpen(false);
  };

  const handleLogoClick = (e) => {
    if (onNavigateHome) {
      e.preventDefault();
      onNavigateHome();
    }
  };

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-sm z-50">
      {/* Top bar with phone number */}
      <div className="bg-brand-600 text-white py-1.5 px-4">
        <div className="container mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <a href="tel:01908220000" className="font-medium hover:underline">
              01908 220000
            </a>
            <span className="hidden sm:inline text-white/80 ml-2">| Available 24/7</span>
          </div>
          <div className="hidden sm:block text-white/90">
            Book with confidence - ATOL Protected
          </div>
        </div>
      </div>
      
      {/* Main header */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#home" onClick={handleLogoClick} className="flex items-center gap-2 group cursor-pointer">
          <img 
            src="/logo-f380.png" 
            alt="Flight380" 
            className="h-10 sm:h-12 w-auto"
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link)}
              className="text-slate-700 hover:text-brand-600 font-medium transition-colors duration-200 cursor-pointer text-sm lg:text-base"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <User className="w-8 h-8 p-1 bg-brand-100 rounded-full text-brand-600" />
                )}
                <span className="text-sm font-medium text-slate-700 hidden lg:inline">{user.name?.split(' ')[0]}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onSignOut}
                className="text-slate-600 hover:text-brand-600"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" className="font-medium" onClick={onSignIn}>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
              <Button 
                className="bg-brand-600 hover:bg-brand-700 font-semibold"
                onClick={onSignIn}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col h-full">
              {/* User info in mobile */}
              {user && (
                <div className="flex items-center gap-3 py-4 border-b">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <User className="w-10 h-10 p-2 bg-brand-100 rounded-full text-brand-600" />
                  )}
                  <div>
                    <div className="font-medium text-slate-900">{user.name}</div>
                    <div className="text-sm text-slate-500">{user.email}</div>
                  </div>
                </div>
              )}
              
              <nav className="flex flex-col gap-2 mt-6">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link)}
                    className="text-lg font-medium text-slate-700 hover:text-brand-600 transition-colors py-3 px-2 rounded-lg hover:bg-brand-50"
                  >
                    {link.name}
                  </a>
                ))}
              </nav>
              
              <div className="mt-auto pb-6">
                {/* Phone number in mobile */}
                <a 
                  href="tel:01908220000" 
                  className="flex items-center gap-2 text-brand-600 font-semibold mb-4 p-3 bg-brand-50 rounded-lg"
                >
                  <Phone className="h-5 w-5" />
                  01908 220000
                </a>
                
                {user ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      onSignOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Button 
                      variant="outline" 
                      className="w-full font-medium"
                      onClick={() => {
                        onSignIn();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign In
                    </Button>
                    <Button 
                      className="w-full bg-brand-600 hover:bg-brand-700 font-semibold"
                      onClick={() => {
                        onSignIn();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
