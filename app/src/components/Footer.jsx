import {
  UserPlus,
  Handshake,
  ClipboardCheck,
  Settings
} from 'lucide-react';

import { NavLink } from 'react-router-dom';

import './Common.css';

const Footer = () => {
  return (
    <footer className="footer">
<NavLink
  to="/leads"
  className={({ isActive }) => `footer-item ${isActive ? 'footer-item--active' : ''}`}
>
  <UserPlus size={22} />
  <span>Leads</span>
</NavLink>
<NavLink to="/deals" className={({ isActive }) => `footer-item ${isActive ? 'footer-item--active' : ''}`}>
  <Handshake size={22} />
  <span>Deals</span>
</NavLink>
<NavLink to="/tasks" className={({ isActive }) => `footer-item ${isActive ? 'footer-item--active' : ''}`}>
  <ClipboardCheck size={22} />
  <span>Tasks</span>
</NavLink>
<NavLink to="/settings" className={({ isActive }) => `footer-item ${isActive ? 'footer-item--active' : ''}`}>
  <Settings size={22} />
  <span>Settings</span>
</NavLink>

    </footer>
  );
};

export default Footer;
