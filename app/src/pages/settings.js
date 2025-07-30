import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Settings from '../components/Settings';
import Preloader from '../components/Preloader';

const Setting = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const slug = location.pathname.split('/').filter(Boolean).pop();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user_id');
    if (!userData) {
      navigate('/login');
    } else {
      setTimeout(() => setLoading(false), 300);
    }
  }, [navigate]);

  if (loading) return <Preloader />;

  return (
    <div className="leads">
      <Header title={slug} />
      <Settings />
      <Footer />
    </div>
  );
};

export default Setting;
