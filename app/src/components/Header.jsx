import {
  Reply,
  Users,
  List,
  Plus,
  CheckCircle,
  ClipboardList,
  Bell
} from 'lucide-react';
import './Common.css'

const Header = ({ title }) => {
    return(
    <header className="header">
        
         <h2 className="header__title"> Sales Lite - <span>{title ? title.charAt(0).toUpperCase() + title.slice(1) : 'Dashboard'}</span></h2>
        <Bell className="header__icon" size={20} />
      </header>

    )
}

export default Header;