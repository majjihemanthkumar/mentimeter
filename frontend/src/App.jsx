import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Presenter from './pages/Presenter';
import Audience from './pages/Audience';
import Login from './pages/Login';
import Join from './pages/Join';

function App() {
  return (
    <Router>
      <div className="App font-sans bg-background min-h-screen">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/join" element={<Join />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/presenter/:code" element={<Presenter />} />
          <Route path="/audience/:code" element={<Audience />} />
          {/* Fallback for legacy compatibility or direct access */}
          <Route path="/presenter" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
