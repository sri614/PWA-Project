import React, { useEffect, useState } from 'react';
import './Settings.css';

function Settings() {
  const [user, setUser] = useState({});

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('user_details'));
      if (data) setUser(data);
    } catch (err) {
      console.error('Invalid user data in localStorage');
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    alert('Logged out');
    window.location.reload();
  };

  return (
    <div className="settings">
      <div className="settings__card">
        <h2 className="settings__card-name">{user.name}</h2>
        <p className="settings__card-email">{user.email}</p>
      </div>

      <div className="settings__section">
        <h3 className="settings__section-title">Personal Information</h3>
        <div className="settings__field">
          <label className="settings__label">User ID</label>
          <input className="settings__input" value={user.user_id || ''} readOnly />
        </div>
        <div className="settings__field">
          <label className="settings__label">Email</label>
          <input className="settings__input" value={user.email || ''} readOnly />
        </div>
        <div className="settings__field">
          <label className="settings__label">Phone</label>
          <input className="settings__input" value={user.phone || ''} readOnly />
        </div>
      </div>

      <button className="settings__logout" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Settings;
