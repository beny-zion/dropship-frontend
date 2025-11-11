'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Youtube, Mail, ChevronDown } from 'lucide-react';

function FooterSection({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-neutral-800 md:border-none">
      {/* Mobile: Collapsible Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 md:cursor-default"
        aria-expanded={isOpen}
      >
        <h3 className="text-white text-sm font-light tracking-widest uppercase">{title}</h3>
        <ChevronDown
          className={`w-4 h-4 text-neutral-400 transition-transform md:hidden ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Content - Hidden on mobile unless open, always visible on desktop */}
      <div
        className={`overflow-hidden transition-all duration-300 md:block ${
          isOpen ? 'max-h-96 mb-4' : 'max-h-0 md:max-h-none'
        }`}
      >
        <div className="pb-4 md:pb-0">{children}</div>
      </div>
    </div>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-neutral-400 mt-auto border-t border-neutral-800">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 md:gap-12">
          {/* About Section */}
          <FooterSection title="אודותינו" defaultOpen={true}>
            <p className="text-sm font-light leading-relaxed mb-6">
              TORINO - החנות המובילה למוצרים איכותיים ביבוא אישי. אנחנו מציעים מגוון רחב של מוצרים במחירים תחרותיים עם משלוח מהיר לכל הארץ.
            </p>
            <Link href="/about" className="text-white text-sm font-light tracking-wide hover:text-neutral-300 transition-colors inline-block border-b border-white pb-1">
              קרא עוד
            </Link>
          </FooterSection>

          {/* Quick Links */}
          <FooterSection title="קישורים מהירים">
            <ul className="space-y-3">
              <li>
                <Link href="/products" className="text-sm font-light tracking-wide hover:text-white transition-colors block">
                  כל המוצרים
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-sm font-light tracking-wide hover:text-white transition-colors block">
                  עגלת קניות
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-sm font-light tracking-wide hover:text-white transition-colors block">
                  החשבון שלי
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-sm font-light tracking-wide hover:text-white transition-colors block">
                  ההזמנות שלי
                </Link>
              </li>
            </ul>
          </FooterSection>

          {/* Customer Service */}
          <FooterSection title="שירות לקוחות">
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-sm font-light tracking-wide hover:text-white transition-colors block">
                  תקנון האתר
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm font-light tracking-wide hover:text-white transition-colors block">
                  מדיניות פרטיות
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-sm font-light tracking-wide hover:text-white transition-colors block">
                  מדיניות משלוחים
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-sm font-light tracking-wide hover:text-white transition-colors block">
                  החזרות והחלפות
                </Link>
              </li>
            </ul>
          </FooterSection>

          {/* Contact Info */}
          <FooterSection title="צור קשר">
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-sm font-light">
                <Mail className="w-4 h-4 text-white flex-shrink-0" />
                <a href="mailto:torino900100@gmail.com" className="hover:text-white transition-colors break-all">
                  torino900100@gmail.com
                </a>
              </div>

              {/* Social Media - Hidden for now */}
              <div className="hidden">
                <h4 className="text-white text-xs font-light tracking-widest uppercase mb-4">עקבו אחרינו</h4>
                <div className="flex gap-4">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 border border-neutral-700 hover:border-white hover:bg-white group transition-all flex items-center justify-center"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 border border-neutral-700 hover:border-white hover:bg-white group transition-all flex items-center justify-center"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 border border-neutral-700 hover:border-white hover:bg-white group transition-all flex items-center justify-center"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
                  </a>
                </div>
              </div>
            </div>
          </FooterSection>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-light tracking-wide text-neutral-500">
            <p>
              &copy; {currentYear} TORINO. כל הזכויות שמורות
            </p>
            <div className="flex gap-6">
              <Link href="/terms" className="hover:text-white transition-colors">
                תנאי שימוש
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                פרטיות
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
