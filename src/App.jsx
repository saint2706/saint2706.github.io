import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/layout/Layout';
import Hero from './components/home/Hero';
import Projects from './components/pages/Projects';
import Resume from './components/pages/Resume';
import Blog from './components/pages/Blog';
import Contact from './components/pages/Contact';
import Games from './components/pages/Games';
import Chatbot from './components/shared/Chatbot';
import RoastMode from './components/shared/RoastMode';
import PageWrapper from './components/shared/PageWrapper';
import ScrollToTop from './components/shared/ScrollToTop';
import KonamiNotification from './components/shared/KonamiNotification';
import useKonamiCode from './hooks/useKonamiCode';

const ScrollToTopHelper = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Animated routes component that uses location for AnimatePresence
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Hero /></PageWrapper>} />
        <Route path="/projects" element={<PageWrapper><Projects /></PageWrapper>} />
        <Route path="/resume" element={<PageWrapper><Resume /></PageWrapper>} />
        <Route path="/blog" element={<PageWrapper><Blog /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/games" element={<PageWrapper><Games /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [isRetroMode, resetRetroMode] = useKonamiCode();

  return (
    <Router>
      <ScrollToTopHelper />
      <Layout>
        <AnimatedRoutes />

        {/* Floating Interactions */}
        <Chatbot />
        <RoastMode />
        <ScrollToTop />

        {/* Konami Code Easter Egg */}
        <KonamiNotification isActive={isRetroMode} onClose={resetRetroMode} />
      </Layout>
    </Router>
  );
}

export default App;

