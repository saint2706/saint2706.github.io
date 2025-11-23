import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Hero from './components/home/Hero';
import Projects from './components/pages/Projects';
import Resume from './components/pages/Resume';
import Chatbot from './components/shared/Chatbot';
import RoastMode from './components/shared/RoastMode';

const ScrollToTopHelper = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTopHelper />
      <Layout>
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/resume" element={<Resume />} />
        </Routes>

        {/* Floating Interactions */}
        <Chatbot />
        <RoastMode />
      </Layout>
    </Router>
  );
}

export default App;
