import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, User, ShoppingCart, Package, LogOut, Menu, X, Shield, ChevronDown, Building } from 'lucide-react';
import './DashboardNavbar.css';

interface DashboardNavbarProps {
  user: any;
  onLogout: () => void;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ user, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('Mumbai Chemical Solutions');
  const navigate = useNavigate();
  const location = useLocation();

  // Mock companies data - this will be replaced with backend data later
  const userCompanies = [
    { id: 1, name: 'Mumbai Chemical Solutions', gst: '22AAAAA0000A1Z5' },
    { id: 2, name: 'Delhi Industrial Chemicals', gst: '07BBBBB0000B2Z6' },
    { id: 3, name: 'Bangalore Pharma Ltd.', gst: '29CCCCC0000C3Z7' },
    { id: 4, name: 'Chennai Petrochemicals', gst: '33DDDDD0000D4Z8' }
  ];

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

  const toggleCompanyDropdown = () => {
    setIsCompanyDropdownOpen(!isCompanyDropdownOpen);
  };

  const handleCompanySelect = (company: { id: number, name: string, gst: string }) => {
    setSelectedCompany(company.name);
    setIsCompanyDropdownOpen(false);
    // TODO: Trigger data refetch based on selected company
    console.log('Switched to company:', company.name);
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

            {/* Company Switcher */}
            <div className="company-switcher-container">
              <button 
                onClick={toggleCompanyDropdown}
                className="company-switcher-button"
              >
                <Building className="company-switcher-icon" />
                <span className="company-switcher-text">{selectedCompany}</span>
                <ChevronDown className={`company-switcher-chevron ${isCompanyDropdownOpen ? 'rotated' : ''}`} />
              </button>
              
              {isCompanyDropdownOpen && (
                <div className="company-dropdown">
                  <div className="company-dropdown-header">
                    <span>Select Company</span>
                  </div>
                  {userCompanies.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => handleCompanySelect(company)}
                      className={`company-dropdown-item ${selectedCompany === company.name ? 'active' : ''}`}
                    >
                      <div className="company-dropdown-info">
                        <span className="company-dropdown-name">{company.name}</span>
                        <span className="company-dropdown-gst">GST: {company.gst}</span>
                      </div>
                      {selectedCompany === company.name && (
                        <div className="company-dropdown-check">✓</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
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

      {/* Mobile Menu */}
      <div className={`dashboard-mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="dashboard-mobile-content">
          {/* Mobile Company Switcher */}
          <div className="mobile-company-section">
            <div className="mobile-company-dropdown-container">
              <button 
                onClick={toggleCompanyDropdown}
                className="mobile-company-dropdown-button"
              >
                <Building className="mobile-company-dropdown-icon" />
                <span className="mobile-company-dropdown-text">{selectedCompany}</span>
                <ChevronDown className={`mobile-company-dropdown-chevron ${isCompanyDropdownOpen ? 'rotated' : ''}`} />
              </button>
              
              {isCompanyDropdownOpen && (
                <div className="mobile-company-dropdown">
                  <div className="mobile-company-dropdown-header">
                    <span>Select Company</span>
                  </div>
                  {userCompanies.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => handleCompanySelect(company)}
                      className={`mobile-company-dropdown-item ${selectedCompany === company.name ? 'active' : ''}`}
                    >
                      <div className="mobile-company-dropdown-info">
                        <span className="mobile-company-dropdown-name">{company.name}</span>
                        <span className="mobile-company-dropdown-gst">GST: {company.gst}</span>
                      </div>
                      {selectedCompany === company.name && (
                        <div className="mobile-company-dropdown-check">✓</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="dashboard-mobile-divider" />
          
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