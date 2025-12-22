import React, { useState } from 'react';
import { Button } from './ui/button';
import { Phone, Menu, User, LogIn, LogOut } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from './ui/sheet';

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
      <div className="bg-brand-600 text-white py-2 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <a href="tel:01908220000" className="flex items-center gap-2 font-semibold text-sm sm:text-base">
            <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>01908 220000</span>
          </a>
          <span className="hidden sm:block text-sm text-white/90">ATOL Protected • 24/7 Support</span>
        </div>
      </div>
      
      {/* Main header */}
      <div className="container mx-auto px-4 h-20 sm:h-24 md:h-28 flex items-center justify-between">
        {/* Logo */}
        <a href="#home" onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer flex-shrink-0">
          <img 
            src="/logo-f380.png" 
            alt="Flight380" 
            className="h-14 sm:h-20 md:h-24 w-auto"
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link)}
              className="text-slate-700 hover:text-brand-600 font-medium transition-colors duration-200 cursor-pointer text-sm"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <User className="w-8 h-8 p-1 bg-brand-100 rounded-full text-brand-600" />
                )}
                <span className="text-sm font-medium text-slate-700">{user.name?.split(' ')[0]}</span>
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
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] max-w-[320px] p-0">
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="p-4 border-b bg-brand-50">
                <img src="/logo-f380.png" alt="Flight380" className="h-10" />
              </div>
              
              {/* User info in mobile */}
              {user && (
                <div className="flex items-center gap-3 p-4 border-b bg-slate-50">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full" />
                  ) : (
                    <User className="w-12 h-12 p-2 bg-brand-100 rounded-full text-brand-600" />
                  )}
                  <div>
                    <div className="font-semibold text-slate-900">{user.name}</div>
                    <div className="text-sm text-slate-500">{user.email}</div>
                  </div>
                </div>
              )}
              
              <nav className="flex flex-col p-4 gap-1 flex-1">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.name}>
                    <a
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link)}
                      className="text-base font-medium text-slate-700 hover:text-brand-600 transition-colors py-3 px-3 rounded-lg hover:bg-brand-50"
                    >
                      {link.name}
                    </a>
                  </SheetClose>
                ))}
              </nav>
              
              <div className="p-4 border-t bg-slate-50">
                {/* Phone number in mobile */}
                <a 
                  href="tel:01908220000" 
                  className="flex items-center justify-center gap-2 text-brand-600 font-bold mb-4 p-3 bg-brand-100 rounded-lg text-lg"
                >
                  <Phone className="h-5 w-5" />
                  01908 220000
                </a>
                
                {user ? (
                  <Button 
                    variant="outline" 
                    className="w-full h-12"
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
                      className="w-full h-12 font-medium"
                      onClick={() => {
                        onSignIn();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign In
                    </Button>
                    <Button 
                      className="w-full h-12 bg-brand-600 hover:bg-brand-700 font-semibold"
                      onClick={() => {
                        onSignIn();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign Up Free
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
