import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Dashboard from '../components/Dashboard';
import Preloader from '../components/Preloader'; // ✅ reuse preloader

const Leads = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const slug = location.pathname.split('/').filter(Boolean).pop();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');

    if (!userId) {
      navigate('/login');
    } else {
      setTimeout(() => setLoading(false), 300); // short delay for smooth loading
    }
  }, [navigate]);

  if (loading) return <Preloader />;

  return (
    <div className="leads">
      <Header title={slug} />
      <Dashboard />
      <Footer />
    </div>
  );
};

export default Leads;
