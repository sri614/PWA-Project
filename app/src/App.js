import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Leads from './pages/leads';
import Login from './pages/login';
import Deals from './pages/deals';
import Tasks from './pages/tasks';
import Settings from './pages/settings';




const App = () => {
  const userId = localStorage.getItem('user_id');
  const isAuthenticated = !!userId;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? '/leads' : '/login'} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/leads" element={<Leads /> } />
        <Route path='/deals' element= {<Deals/>} />
        <Route path='/tasks' element={<Tasks/>} />
        <Route path='/settings' element={<Settings/>} />

      </Routes>
    </Router>
  );
};

export default App;
