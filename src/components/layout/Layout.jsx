import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CustomCursor from '../shared/CustomCursor';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-primary text-primary overflow-hidden relative">
      {/* Custom interactive cursor */}
      <CustomCursor />

      {/* Neubrutalism subtle grid background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-border) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-border) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Skip navigation link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-fun-yellow focus:text-black focus:px-4 focus:py-2 focus:border-2 focus:border-black focus:z-[100] focus:font-heading focus:font-bold"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content" className="flex-grow pt-28 px-4 z-10 relative">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
