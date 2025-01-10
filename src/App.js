import React from 'react';
import HeroSection from './components/HeroSection.js';
import RankingsTable from './components/RankingsTable.js';
import Footer from './components/Footer.js';
import './App.css';

function App() {
  return (
    <div>
      <HeroSection />
      <RankingsTable />
      <Footer />
    </div>
  );
}

export default App;
