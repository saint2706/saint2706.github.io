import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/layout/Layout';
import Hero from './components/home/Hero';
import PageWrapper from './components/shared/PageWrapper';
import ScrollToTop from './components/shared/ScrollToTop';
import PageLoading from './components/shared/PageLoading';

// Lazy load page components to improve initial bundle size and load time
const Chatbot = lazy(() => import('./components/shared/Chatbot'));
const Projects = lazy(() => import('./components/pages/Projects'));
const Resume = lazy(() => import('./components/pages/Resume'));
const Blog = lazy(() => import('./components/pages/Blog'));
const Contact = lazy(() => import('./components/pages/Contact'));
const Games = lazy(() => import('./components/pages/Games'));
const Playground = lazy(() => import('./components/pages/Playground'));
const NotFound = lazy(() => import('./components/pages/NotFound'));

const ScrollToTopHelper = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Animated routes component that uses location for AnimatePresence
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      {/* Suspense wrapper with fallback UI handles loading state for lazy routes */}
      <Suspense fallback={<PageLoading />} key={location.pathname}>
        <Routes location={location}>
          <Route
            path="/"
            element={
              <PageWrapper>
                <Hero />
              </PageWrapper>
            }
          />
          <Route
            path="/projects"
            element={
              <PageWrapper>
                <Projects />
              </PageWrapper>
            }
          />
          <Route
            path="/resume"
            element={
              <PageWrapper>
                <Resume />
              </PageWrapper>
            }
          />
          <Route
            path="/blog"
            element={
              <PageWrapper>
                <Blog />
              </PageWrapper>
            }
          />
          <Route
            path="/contact"
            element={
              <PageWrapper>
                <Contact />
              </PageWrapper>
            }
          />
          <Route
            path="/games"
            element={
              <PageWrapper>
                <Games />
              </PageWrapper>
            }
          />
          <Route
            path="/playground"
            element={
              <PageWrapper>
                <Playground />
              </PageWrapper>
            }
          />
          {/* Catch-all 404 route */}
          <Route
            path="*"
            element={
              <PageWrapper>
                <NotFound />
              </PageWrapper>
            }
          />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTopHelper />
      <Layout>
        <AnimatedRoutes />

        {/* Floating Interactions - Combined FAB */}
        <Suspense fallback={null}>
          <Chatbot />
        </Suspense>
        <ScrollToTop />
      </Layout>
    </Router>
  );
}

export default App;
