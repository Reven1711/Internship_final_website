import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, User, ShoppingCart, Package, LogOut, Menu, X, Shield } from 'lucide-react';
import './DashboardNavbar.css';

interface DashboardNavbarProps {
  user: any;
  onLogout: () => void;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ user, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is admin based on environment variable
  const adminEmails = import.meta.env.VITE_ADMIN_EMAILS ? 
    import.meta.env.VITE_ADMIN_EMAILS.split(',') : 
    ['meet.r@ahduni.edu.in', 'jay.r1@ahduni.edu.in']; // Fallback for development
  
  const isAdmin = user?.email && adminEmails.includes(user.email);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
    { id: 'profile', label: 'Profile', icon: User, path: '/dashboard/profile' }
  ];

  // Add admin item if user is admin
  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin', icon: Shield, path: '/dashboard/admin' });
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      <header className={`dashboard-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="dashboard-navbar-container">
          <div className="dashboard-navbar-content">
            {/* Logo - matching pre-login navbar */}
            <div className="dashboard-logo" onClick={() => navigate('/dashboard')}>
              <img src="/Sourceasy-logo-Superfinal001.png" alt="Sourceasy Logo" className="dashboard-logo-img" />
              <h1 className="dashboard-logo-text">ourceasy</h1>
            </div>

            {/* Right side cluster - navigation and logout */}
            <div className="dashboard-right-cluster">
              {/* Desktop Navigation */}
              <nav className="dashboard-nav">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`dashboard-nav-button ${isActive(item.path) ? 'active' : ''} ${item.id === 'admin' ? 'admin-button' : ''}`}
                  >
                    <item.icon className="dashboard-nav-icon" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              {/* Logout Button */}
              <button onClick={handleLogout} className="dashboard-logout-button">
                <LogOut className="dashboard-logout-icon" />
                <span>Logout</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMobileMenu}
                className={`dashboard-mobile-toggle mobile-nav-toggle${isMobileMenuOpen ? ' active' : ''}`}
                aria-label="Toggle menu"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      <div className={`dashboard-mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="dashboard-mobile-content">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { navigate(item.path); setIsMobileMenuOpen(false); }}
              className={`dashboard-mobile-nav-button ${isActive(item.path) ? 'active' : ''} ${item.id === 'admin' ? 'admin-button' : ''}`}
            >
              <item.icon className="dashboard-mobile-nav-icon" />
              <span>{item.label}</span>
            </button>
          ))}
          <div className="dashboard-mobile-divider" />
          <button
            onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
            className="dashboard-mobile-logout-button"
          >
            <LogOut className="dashboard-mobile-logout-icon" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default DashboardNavbar; 