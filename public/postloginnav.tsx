
import React from 'react';
import { Home, User, ShoppingCart, Package, LogOut } from 'lucide-react';
import './DashboardNavbar.css';

interface DashboardNavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ activeTab, onTabChange, onLogout }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'about', label: 'About', icon: User },
    { id: 'buy', label: 'What We Buy', icon: ShoppingCart },
    { id: 'sell', label: 'What We Sell', icon: Package }
  ];

  return (
    <nav className="dashboard-navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <img src="/Sourceasy-logo-Superfinal001.png" alt="Sourceasy" className="brand-logo" />
          <span className="brand-text">ourceasy Dashboard</span>
        </div>
        
        <div className="navbar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              <item.icon className="nav-icon" />
              <span>{item.label}</span>
            </button>
          ))}
          <button
            onClick={onLogout}
            className="nav-item logout-btn"
          >
            <LogOut className="nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;