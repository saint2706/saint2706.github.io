import React from 'react';
import { Github, Linkedin, Twitter, Coffee } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-8 mt-20 border-t border-secondary bg-primary">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="flex justify-center gap-6 mb-6">
          <a href="https://github.com/saint2706" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-accent transition-colors">
            <Github size={24} />
          </a>
          <a href="https://www.linkedin.com/in/rishabh-agrawal-1807321b9" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-accent transition-colors">
            <Linkedin size={24} />
          </a>
          <a href="https://twitter.com/saint2706" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-accent transition-colors">
            <Twitter size={24} />
          </a>
        </div>
        <p className="text-muted font-mono text-sm flex items-center justify-center gap-2">
          Made with <Coffee size={14} className="text-fun-yellow" /> and AI by Rishabh Agrawal
        </p>
      </div>
    </footer>
  );
};

export default Footer;
