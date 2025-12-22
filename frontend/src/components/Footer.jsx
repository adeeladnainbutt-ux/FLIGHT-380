import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/logo-f380.png" alt="Flight380" className="h-10 w-auto brightness-0 invert" />
            </div>
            <p className="text-sm text-slate-400">
              Your trusted partner for finding the best flight deals worldwide. Book with confidence and fly with ease.
            </p>
            <div className="flex gap-3">
              <a href="#" className="bg-slate-800 p-2 rounded-lg hover:bg-brand-600 transition-colors duration-300">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="bg-slate-800 p-2 rounded-lg hover:bg-brand-600 transition-colors duration-300">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="bg-slate-800 p-2 rounded-lg hover:bg-brand-600 transition-colors duration-300">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="bg-slate-800 p-2 rounded-lg hover:bg-brand-600 transition-colors duration-300">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#about" className="text-sm hover:text-brand-400 transition-colors">About Us</a></li>
              <li><a href="#destinations" className="text-sm hover:text-brand-400 transition-colors">Destinations</a></li>
              <li><a href="#deals" className="text-sm hover:text-brand-400 transition-colors">Special Deals</a></li>
              <li><a href="#careers" className="text-sm hover:text-brand-400 transition-colors">Careers</a></li>
              <li><a href="#blog" className="text-sm hover:text-brand-400 transition-colors">Travel Blog</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#help" className="text-sm hover:text-brand-400 transition-colors">Help Center</a></li>
              <li><a href="#faq" className="text-sm hover:text-brand-400 transition-colors">FAQs</a></li>
              <li><a href="#booking" className="text-sm hover:text-brand-400 transition-colors">Manage Booking</a></li>
              <li><a href="#terms" className="text-sm hover:text-brand-400 transition-colors">Terms & Conditions</a></li>
              <li><a href="#privacy" className="text-sm hover:text-brand-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-brand-400 mt-1 flex-shrink-0" />
                <span className="text-sm">
                  277 Dunstable Road<br />
                  Luton, Bedfordshire<br />
                  LU4 8BS
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand-400 flex-shrink-0" />
                <a href="tel:01908220000" className="text-sm hover:text-brand-400 transition-colors">
                  01908 220000
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-400 flex-shrink-0" />
                <a href="mailto:info@flight380.co.uk" className="text-sm hover:text-brand-400 transition-colors">
                  info@flight380.co.uk
                </a>
              </li>
            </ul>
            
            {/* WhatsApp */}
            <div className="mt-4 p-3 bg-slate-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-400 font-medium text-sm mb-1">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Support
              </div>
              <a 
                href="https://wa.me/447404386262" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-slate-300 hover:text-green-400 transition-colors"
              >
                +44 7404 386262
              </a>
              <div className="text-xs text-slate-500 mt-1">08:00 AM - 11:59 PM (GMT)</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400 text-center md:text-left">
            © 2025 Flight380. All rights reserved. ATOL Protected.
          </p>
          <div className="flex gap-6">
            <a href="#terms" className="text-sm text-slate-400 hover:text-brand-400 transition-colors">Terms</a>
            <a href="#privacy" className="text-sm text-slate-400 hover:text-brand-400 transition-colors">Privacy</a>
            <a href="#cookies" className="text-sm text-slate-400 hover:text-brand-400 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
