import React from 'react';
import { Button } from './ui/button';
import { Plane, Menu, User } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export const Header = () => {
  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Destinations', href: '#destinations' },
    { name: 'Deals', href: '#deals' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' }
  ];

  return (
    <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#home" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-br from-teal-600 to-cyan-600 p-2 rounded-lg group-hover:shadow-lg transition-all duration-300">
            <Plane className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent">
            Flight380
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-slate-700 hover:text-teal-600 font-medium transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" className="font-medium">
            Sign In
          </Button>
          <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 font-semibold">
            Sign Up
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4 mt-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-lg font-medium text-slate-700 hover:text-teal-600 transition-colors py-2"
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-3 mt-6">
                <Button variant="outline" className="w-full font-medium">
                  Sign In
                </Button>
                <Button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 font-semibold">
                  Sign Up
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};