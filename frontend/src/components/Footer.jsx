import React from 'react';
import { Plane, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-teal-600 to-cyan-600 p-2 rounded-lg">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Flight380</span>
            </div>
            <p className="text-sm text-slate-400">
              Your trusted partner for finding the best flight deals worldwide. Book with confidence and fly with ease.
            </p>
            <div className="flex gap-3">
              <a href="#" className="bg-slate-800 p-2 rounded-lg hover:bg-teal-600 transition-colors duration-300">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="bg-slate-800 p-2 rounded-lg hover:bg-teal-600 transition-colors duration-300">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="bg-slate-800 p-2 rounded-lg hover:bg-teal-600 transition-colors duration-300">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="bg-slate-800 p-2 rounded-lg hover:bg-teal-600 transition-colors duration-300">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#about" className="text-sm hover:text-teal-400 transition-colors">About Us</a></li>
              <li><a href="#destinations" className="text-sm hover:text-teal-400 transition-colors">Destinations</a></li>
              <li><a href="#deals" className="text-sm hover:text-teal-400 transition-colors">Special Deals</a></li>
              <li><a href="#careers" className="text-sm hover:text-teal-400 transition-colors">Careers</a></li>
              <li><a href="#blog" className="text-sm hover:text-teal-400 transition-colors">Travel Blog</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#help" className="text-sm hover:text-teal-400 transition-colors">Help Center</a></li>
              <li><a href="#faq" className="text-sm hover:text-teal-400 transition-colors">FAQs</a></li>
              <li><a href="#booking" className="text-sm hover:text-teal-400 transition-colors">Manage Booking</a></li>
              <li><a href="#terms" className="text-sm hover:text-teal-400 transition-colors">Terms & Conditions</a></li>
              <li><a href="#privacy" className="text-sm hover:text-teal-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-teal-400 mt-1 flex-shrink-0" />
                <span className="text-sm">123 Aviation Street, London, UK</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-teal-400 flex-shrink-0" />
                <span className="text-sm">+44 20 1234 5678</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-teal-400 flex-shrink-0" />
                <span className="text-sm">info@flight380.co.uk</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400 text-center md:text-left">
            © 2025 Flight380. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#terms" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">Terms</a>
            <a href="#privacy" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">Privacy</a>
            <a href="#cookies" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};