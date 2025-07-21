import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, User, Shield, LogOut, Building, ChevronDown } from 'lucide-react';
import { useCompany } from '../contexts/CompanyContext';
import './DashboardNavbar.css';

interface DashboardNavbarProps {
  user: any;
  onLogout: () => void;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ user, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use company context instead of mock data
  const { companies, selectedCompany, setSelectedCompany, fetchCompanies, loading, error } = useCompany();

  // Add a ref to track if we've already fetched companies for this user
  const hasFetchedRef = useRef<Set<string>>(new Set());

  // Check if user is admin based on environment variable
  const adminEmails = import.meta.env.VITE_ADMIN_EMAILS ? 
    import.meta.env.VITE_ADMIN_EMAILS.split(',') : 
    ['meet.r@ahduni.edu.in', 'jay.r1@ahduni.edu.in']; // Fallback for development
  
  const isAdmin = user?.email && adminEmails.includes(user.email);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
    // Show different profile links based on user type
    ...(user?.userType === 'buyer' || user?.isSupplier === false ? [
      { id: 'profile', label: 'Profile', icon: User, path: '/dashboard/buyer' }
    ] : [
      { id: 'profile', label: 'Profile', icon: User, path: '/dashboard/profile' }
    ])
  ];

  // Add admin item if user is admin
  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin', icon: Shield, path: '/dashboard/admin' });
  }

  // Fetch companies when user changes - only once per user
  useEffect(() => {
    if (user?.email && !hasFetchedRef.current.has(user.email)) {
      console.log('👤 User email detected:', user.email);
      console.log('🔄 Triggering company fetch...');
      // Fetch all companies for this email without phone number filter
      fetchCompanies(user.email);
      // Mark this user as fetched
      hasFetchedRef.current.add(user.email);
    } else if (!user?.email) {
      console.log('❌ No user email available');
      // Clear the fetched set when user logs out
      hasFetchedRef.current.clear();
    }
  }, [user?.email]); // Remove fetchCompanies from dependency array

  // Add debugging for companies state
  useEffect(() => {
    console.log('📋 Companies state updated:', companies);
    console.log('🎯 Selected company:', selectedCompany);
    console.log('⏳ Loading state:', loading);
    console.log('❌ Error state:', error);
  }, [companies, selectedCompany, loading, error]);

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

  const handleCompanySelect = (company: any) => {
    console.log('🎯 Company selected:', company);
    setSelectedCompany(company);
    setIsCompanyDropdownOpen(false);
    
    // Store the selected company in localStorage for persistence
    localStorage.setItem('selectedCompany', JSON.stringify(company));
    
    // Trigger a data refresh by dispatching a custom event
    // This will notify all components to refetch their data
    window.dispatchEvent(new CustomEvent('companyChanged', { 
      detail: { company } 
    }));
    
    console.log('🔄 Company change event dispatched');
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Show loading state or fallback if no companies
  const displayCompanyName = selectedCompany?.name || 'Loading...';
  const hasMultipleCompanies = companies.length > 1;

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

            {/* Company Switcher - only show if user has multiple companies */}
            {hasMultipleCompanies && (
              <div className="company-switcher-container">
                <button 
                  onClick={toggleCompanyDropdown}
                  className="company-switcher-button"
                  disabled={loading}
                >
                  <Building className="company-switcher-icon" />
                  <span className="company-switcher-text">{displayCompanyName}</span>
                  <ChevronDown className={`company-switcher-chevron ${isCompanyDropdownOpen ? 'rotated' : ''}`} />
                </button>
                
                {isCompanyDropdownOpen && (
                  <div className="company-dropdown">
                    <div className="company-dropdown-header">
                      <span>Select Company</span>
                    </div>
                    {companies.map((company) => (
                      <button
                        key={company.id}
                        onClick={() => handleCompanySelect(company)}
                        className={`company-dropdown-item ${selectedCompany?.id === company.id ? 'active' : ''}`}
                      >
                        <div className="company-dropdown-info">
                          <span className="company-dropdown-name">{company.name}</span>
                          <span className="company-dropdown-gst">GST: {company.gst}</span>
                        </div>
                        {selectedCompany?.id === company.id && (
                          <div className="company-dropdown-check">✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

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
      {isMobileMenuOpen && (
        <>
          <div className="dashboard-mobile-menu">
            <div className="dashboard-mobile-content">
              {/* Mobile Company Switcher - only show if user has multiple companies */}
              {hasMultipleCompanies && (
                <div className="mobile-company-section">
                  <div className="mobile-company-dropdown-container">
                    <button 
                      onClick={toggleCompanyDropdown}
                      className="mobile-company-dropdown-button"
                      disabled={loading}
                    >
                      <Building className="mobile-company-dropdown-icon" />
                      <span className="mobile-company-dropdown-text">{displayCompanyName}</span>
                      <ChevronDown className={`mobile-company-dropdown-chevron ${isCompanyDropdownOpen ? 'rotated' : ''}`} />
                    </button>
                    {isCompanyDropdownOpen && (
                      <div className="mobile-company-dropdown">
                        <div className="mobile-company-dropdown-header">
                          <span>Select Company</span>
                        </div>
                        {companies.map((company) => (
                          <button
                            key={company.id}
                            onClick={() => handleCompanySelect(company)}
                            className={`mobile-company-dropdown-item ${selectedCompany?.id === company.id ? 'active' : ''}`}
                          >
                            <div className="mobile-company-dropdown-info">
                              <span className="mobile-company-dropdown-name">{company.name}</span>
                              <span className="mobile-company-dropdown-gst">GST: {company.gst}</span>
                            </div>
                            {selectedCompany?.id === company.id && (
                              <div className="mobile-company-dropdown-check">✓</div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="dashboard-mobile-divider" />
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`dashboard-mobile-nav-button ${isActive(item.path) ? 'active' : ''} ${item.id === 'admin' ? 'admin-button' : ''}`}
                >
                  <item.icon className="dashboard-mobile-nav-icon" />
                  <span>{item.label}</span>
                </button>
              ))}
              <div className="dashboard-mobile-divider" />
              <button onClick={handleLogout} className="dashboard-mobile-logout-button">
                <LogOut className="dashboard-mobile-logout-icon" />
                <span>Logout</span>
              </button>
            </div>
          </div>
          <div
            className="dashboard-mobile-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              top: '4.5rem',
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.3)',
              zIndex: 9998
            }}
          />
        </>
      )}
    </>
  );
};

export default DashboardNavbar; 