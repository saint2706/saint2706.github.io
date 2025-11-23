import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-primary text-slate-200 overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fun-pink/5 rounded-full blur-[100px]" />
      </div>

      <Navbar />

      <main className="flex-grow pt-24 px-4 z-10 relative">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
