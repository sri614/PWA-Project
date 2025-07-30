import React from 'react';
import { Loader } from 'lucide-react';
import './Preloader.css';

const Preloader = () => {
  return (
    <div className="preloader">
      <Loader className="preloader__icon" />
      <p className="preloader__text">Please wait...</p>
    </div>
  );
};

export default Preloader;
