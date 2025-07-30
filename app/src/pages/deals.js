import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Header from '../components/Header';
import Footer from '../components/Footer';
import DealsDashboard from '../components/DealsDashboard';
import Preloader from '../components/Preloader'; // ✅ import preloader

const Deals = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const slug = location.pathname.split('/').filter(Boolean).pop(); // get last segment

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');

    if (!userId) {
      navigate('/login');
    } else {
      // simulate async auth check (or allow render after logic)
      setTimeout(() => setLoading(false), 300); // optional delay
    }
  }, [navigate]);

  if (loading) return <Preloader />;

  return (
    <div className="leads">
      <Header title={slug} />
      <DealsDashboard />
      <Footer />
    </div>
  );
};

export default Deals;
