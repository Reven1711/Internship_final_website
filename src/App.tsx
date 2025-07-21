import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./lib/firebase";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BlogPage from "./components/BlogPage";
import AllArticles from "./components/AllArticles";
import MobileLoader from "./components/MobileLoader";
import { useIsMobile } from "./hooks/use-mobile";
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import LoginModal from './components/Login';
import Header from './components/Header';
import DashboardNavbar from './components/DashboardNavbar';
import Dashboard from './pages/Dashboard';
import AboutPage from './pages/AboutPage';
import WhatWeBuy from './pages/WhatWeBuy';
import WhatWeSell from './pages/WhatWeSell';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import HowItWorksPage from './pages/HowItWorksPage';
import AIAgentPage from './pages/AIAgentPage';
import ContactPage from './pages/ContactPage';
import CommunityPage from './pages/CommunityPage';
import AboutPagePublic from './pages/AboutPagePublic';
import { CompanyProvider } from './contexts/CompanyContext';
import ProfileMockup from './pages/ProfileMockup';
import { Toaster } from './components/ui/toaster';

// Function to check if email exists in Pinecone database
const checkEmailInDatabase = async (email: string) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Failed to check email in database');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return { exists: false, message: 'Database check failed' };
  }
};

// Wrapper component to access navigation
const AppContent = ({ user, onLoginClick, onLogout, handleAuthSuccess, isLoginModalOpen, handleLoginClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Handle logout with React Router navigation
  const handleLogoutWithNavigation = async () => {
    try {
      await signOut(auth);
      onLogout();
      // Use React Router navigation instead of window.location.href
      navigate('/', { replace: true });
    } catch (error) {
      // Still navigate to homepage even if there's an error
      navigate('/', { replace: true });
    }
  };

  // Handle auth success with React Router navigation
  const handleAuthSuccessWithNavigation = (userData) => {
    handleAuthSuccess(userData);
    // Redirect based on user type
    if (userData.userType === 'buyer' || userData.isSupplier === false) {
      // Buyer - redirect to buyer profile
      navigate('/dashboard/buyer', { replace: true });
    } else {
      // Supplier - redirect to regular profile
      navigate('/dashboard/profile', { replace: true });
    }
  };

  // Check if user has access to current route
  const hasRouteAccess = (pathname) => {
    if (!user) return true; // Public routes
    
    const isSupplier = user.userType === 'supplier' || user.isSupplier === true;
    const isBuyer = user.userType === 'buyer' || user.isSupplier === false;
    
    // Supplier-only routes
    if (pathname === '/dashboard/profile' && !isSupplier) {
      return false;
    }
    
    // Buyer-only routes
    if (pathname === '/dashboard/buyer' && !isBuyer) {
      return false;
    }
    
    return true;
  };

  // Redirect if user doesn't have access to current route
  useEffect(() => {
    if (user && !hasRouteAccess(location.pathname)) {
      if (user.userType === 'buyer' || user.isSupplier === false) {
        navigate('/dashboard/buyer', { replace: true });
      } else {
        navigate('/dashboard/profile', { replace: true });
      }
    }
  }, [user, location.pathname, navigate]);

  return (
    <>
      {user ? (
        // Logged in user - show dashboard navbar and routes
        <>
          <DashboardNavbar user={user} onLogout={handleLogoutWithNavigation} />
          <div style={{ paddingTop: '4.5rem', minHeight: 'calc(100vh - 4.5rem)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1 }}>
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/dashboard" element={<Dashboard user={user} onLogout={handleLogoutWithNavigation} />} />
                  
                  {/* Supplier-only routes */}
                  {user.userType === 'supplier' || user.isSupplier === true ? (
                  <Route path="/dashboard/profile" element={<Profile user={user} />} />
                  ) : (
                    <Route path="/dashboard/profile" element={<Navigate to="/dashboard/buyer" replace />} />
                  )}
                  
                  {/* Buyer-only routes */}
                  {user.userType === 'buyer' || user.isSupplier === false ? (
                  <Route path="/dashboard/buyer" element={<ProfileMockup user={user} />} />
                  ) : (
                    <Route path="/dashboard/buyer" element={<Navigate to="/dashboard/profile" replace />} />
                  )}
                  
                  {/* Common routes for both user types */}
                  <Route path="/dashboard/about" element={<AboutPage user={user} />} />
                  <Route path="/dashboard/what-we-buy" element={<WhatWeBuy user={user} />} />
                  <Route path="/dashboard/what-we-sell" element={<WhatWeSell user={user} />} />
                  <Route path="/dashboard/admin" element={<AdminDashboard user={user} />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-use" element={<TermsOfUse />} />
                  <Route path="/howitworks" element={<HowItWorksPage user={user} onLoginClick={onLoginClick} onLogout={handleLogoutWithNavigation} />} />
                  <Route path="/aiagent" element={<AIAgentPage user={user} onLoginClick={onLoginClick} onLogout={handleLogoutWithNavigation} />} />
                  <Route path="/contact" element={<ContactPage user={user} onLoginClick={onLoginClick} onLogout={handleLogoutWithNavigation} />} />
                  <Route path="/community" element={<CommunityPage user={user} onLoginClick={onLoginClick} onLogout={handleLogoutWithNavigation} />} />
                  <Route path="/about" element={<AboutPagePublic user={user} onLoginClick={onLoginClick} onLogout={handleLogoutWithNavigation} />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </AnimatePresence>
            </div>
            <Footer />
          </div>
        </>
      ) : (
        // Not logged in - show original header and routes
        <>
          <Header user={user} onLoginClick={onLoginClick} onLogout={handleLogoutWithNavigation} />
          <div style={{ minHeight: 'calc(100vh - 4.5rem)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1 }}>
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<Index onLoginClick={onLoginClick} user={user} onLogout={handleLogoutWithNavigation} />} />
                  <Route path="/blog/:id" element={<BlogPage />} />
                  <Route path="/articles" element={<AllArticles />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-use" element={<TermsOfUse />} />
                  <Route path="/howitworks" element={<HowItWorksPage user={user} onLoginClick={onLoginClick} onLogout={handleLogoutWithNavigation} />} />
                  <Route path="/aiagent" element={<AIAgentPage user={user} onLoginClick={onLoginClick} onLogout={handleLogoutWithNavigation} />} />
                  <Route path="/contact" element={<ContactPage user={user} onLoginClick={onLoginClick} onLogout={handleLogoutWithNavigation} />} />
                  <Route path="/community" element={<CommunityPage user={user} onLoginClick={onLoginClick} onLogout={handleLogoutWithNavigation} />} />
                  <Route path="/about" element={<AboutPagePublic user={user} onLoginClick={onLoginClick} onLogout={handleLogoutWithNavigation} />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnimatePresence>
            </div>
            <Footer />
          </div>
        </>
      )}
      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleLoginClose}
        onAuthSuccess={handleAuthSuccessWithNavigation}
      />
    </>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const isMobile = useIsMobile();

  const handleLogout = () => {
    setUser(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log('Auth state changed - user:', firebaseUser.email);
        
        // Check if user's email exists in either supplier or buyer database
        const emailCheckResult = await checkEmailInDatabase(firebaseUser.email || '');
        console.log('Email check result in App.tsx:', emailCheckResult);
        
        if (!emailCheckResult.exists) {
          // Email not found in either database - user needs to register
          console.log('User email not found in any database, needs registration');
          setUser(null);
          setIsAuthInitialized(true);
          return;
        }

        // Email found in database, fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Include data from Pinecone based on user type
            if (emailCheckResult.userType === 'supplier') {
            setUser({
              ...userData,
              supplierData: emailCheckResult.supplierData || null,
                isSupplier: true,
                userType: 'supplier'
              });
            } else {
              setUser({
                ...userData,
                buyerData: emailCheckResult.buyerData || null,
                isSupplier: false,
                userType: 'buyer'
            });
            }
          } else {
            // Create new user data based on type
            if (emailCheckResult.userType === 'supplier') {
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                supplierData: emailCheckResult.supplierData || null,
                isSupplier: true,
                userType: 'supplier'
              });
            } else {
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                buyerData: emailCheckResult.buyerData || null,
                isSupplier: false,
                userType: 'buyer'
              });
            }
          }
        } catch (err) {
          console.log('Error fetching user from Firestore:', err);
          // Fallback user data
          if (emailCheckResult.userType === 'supplier') {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              supplierData: emailCheckResult.supplierData || null,
              isSupplier: true,
              userType: 'supplier'
            });
          } else {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
              buyerData: emailCheckResult.buyerData || null,
              isSupplier: false,
              userType: 'buyer'
          });
          }
        }
      } else {
        setUser(null);
      }
      setIsAuthInitialized(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Only show loader for mobile devices
    if (isMobile) {
      setIsLoading(true);
    }
  }, [isMobile]);

  const handleLoadComplete = () => {
    setIsLoading(false);
  };

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleLoginClose = () => {
    setIsLoginModalOpen(false);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    // setIsLoginModalOpen(false); // REMOVE THIS LINE to allow modal to close itself after showing success message
  };

  // Show loading state while auth is initializing
  if (!isAuthInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <CompanyProvider>
        <div style={isMobile && isLoading ? { display: 'none' } : {}}>
          <AppContent 
            user={user}
            onLoginClick={handleLoginClick}
            onLogout={handleLogout}
            handleAuthSuccess={handleAuthSuccess}
            isLoginModalOpen={isLoginModalOpen}
            handleLoginClose={handleLoginClose}
          />
        </div>
      </CompanyProvider>
      <Toaster />
      {/* Loader overlays only on mobile while loading */}
      {isMobile && isLoading && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#fff' }}>
          <MobileLoader onLoadComplete={handleLoadComplete} />
        </div>
      )}
    </BrowserRouter>
  );
};

export default App;
