import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CustomCursor from '../shared/CustomCursor';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-primary text-primary overflow-hidden relative">
      {/* Custom interactive cursor */}
      <CustomCursor />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fun-pink/5 rounded-full blur-[100px]" />
      </div>

      {/* Skip navigation link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-accent focus:text-primary focus:px-4 focus:py-2 focus:rounded focus:z-[100]"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content" className="flex-grow pt-24 px-4 z-10 relative">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
