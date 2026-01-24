import React from 'react';
import { Github, Linkedin, Coffee, Heart } from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    {
      href: "https://github.com/saint2706",
      icon: <Github size={24} />,
      label: "Visit my GitHub profile",
      hoverColor: "hover:bg-fun-yellow"
    },
    {
      href: "https://www.linkedin.com/in/rishabh-agrawal-1807321b9",
      icon: <Linkedin size={24} />,
      label: "Visit my LinkedIn profile",
      hoverColor: "hover:bg-accent"
    },
  ];

  return (
    <footer className="py-12 mt-20 border-t-[3px] border-[color:var(--color-border)] bg-primary">
      <div className="max-w-4xl mx-auto px-4">
        {/* Social Links */}
        <div className="flex justify-center gap-4 mb-8">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-3 bg-card border-[3px] border-[color:var(--color-border)] text-primary transition-all duration-200 cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none ${link.hoverColor}`}
              style={{ boxShadow: 'var(--nb-shadow)' }}
              aria-label={link.label}
            >
              {link.icon}
            </a>
          ))}
        </div>

        {/* Made with love - Centered */}
        <div className="flex justify-center">
          <div
            className="bg-fun-yellow border-[3px] border-[color:var(--color-border)] px-6 py-3"
            style={{ boxShadow: 'var(--nb-shadow)' }}
          >
            <p className="text-black font-heading font-bold text-sm flex items-center justify-center gap-2">
              Made with <Coffee size={16} className="text-black" aria-hidden="true" />
              <span className="sr-only">coffee</span>
              + <Heart size={16} className="text-fun-pink" aria-hidden="true" />
              <span className="sr-only">love</span>
              by Rishabh Agrawal
            </p>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-secondary font-sans text-sm md:text-xs mt-6 text-center leading-relaxed">
          © {new Date().getFullYear()} All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
