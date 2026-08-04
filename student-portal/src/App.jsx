import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Register } from './pages/Register';
import { TypingArena } from './pages/TypingArena';
import { ResultView } from './pages/ResultView';
import { EventJoin } from './pages/EventJoin';
import { NotFound } from './pages/NotFound';

export const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/student/:eventCode" element={<EventJoin />} />
              <Route path="/event/:eventCode" element={<EventJoin />} />
              <Route path="/arena" element={<TypingArena />} />
              <Route path="/results" element={<ResultView />} />
              <Route path="*" element={<NotFound />} />
            </Routes>

          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
};





export default App;
