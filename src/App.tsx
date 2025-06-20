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
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import Footer from './components/Footer';

// Function to check if email exists in Pinecone database
const checkEmailInDatabase = async (email: string) => {
  try {
    const response = await fetch('http://localhost:5000/api/check-email', {
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
    console.error('Error checking email in database:', error);
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
      console.error('Error during logout:', error);
      // Still navigate to homepage even if there's an error
      navigate('/', { replace: true });
    }
  };

  // Handle auth success with React Router navigation
  const handleAuthSuccessWithNavigation = (userData) => {
    handleAuthSuccess(userData);
    // Use React Router navigation instead of window.location.href
    navigate('/dashboard/profile', { replace: true });
  };

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
                  <Route path="/dashboard/profile" element={<Profile user={user} />} />
                  <Route path="/dashboard/about" element={<AboutPage user={user} />} />
                  <Route path="/dashboard/what-we-buy" element={<WhatWeBuy user={user} />} />
                  <Route path="/dashboard/what-we-sell" element={<WhatWeSell user={user} />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-use" element={<TermsOfUse />} />
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
        // Check if user's email exists in Pinecone database
        const emailCheckResult = await checkEmailInDatabase(firebaseUser.email || '');
        
        if (!emailCheckResult.exists) {
          // Email not found in database, sign out the user
          console.log('User email not found in database, signing out...');
          await signOut(auth);
          setUser(null);
          setIsAuthInitialized(true);
          return;
        }

        // Email found in database, fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Include supplier data from Pinecone
            setUser({
              ...userData,
              supplierData: emailCheckResult.supplierData || null
            });
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              supplierData: emailCheckResult.supplierData || null
            });
          }
        } catch (err) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            supplierData: emailCheckResult.supplierData || null
          });
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
    setIsLoginModalOpen(false);
  };

  // Show loading state while auth is initializing
  if (!isAuthInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main app is always rendered, but hidden on mobile while loading */}
      <div style={isMobile && isLoading ? { display: 'none' } : {}}>
        <BrowserRouter>
          <AppContent 
            user={user}
            onLoginClick={handleLoginClick}
            onLogout={handleLogout}
            handleAuthSuccess={handleAuthSuccess}
            isLoginModalOpen={isLoginModalOpen}
            handleLoginClose={handleLoginClose}
          />
        </BrowserRouter>
      </div>
      {/* Loader overlays only on mobile while loading */}
      {isMobile && isLoading && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#fff' }}>
          <MobileLoader onLoadComplete={handleLoadComplete} />
        </div>
      )}
    </>
  );
};

export default App;
