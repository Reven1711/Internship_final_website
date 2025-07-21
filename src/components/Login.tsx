import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './Login.css';
import { auth, googleProvider, db } from '../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import RegistrationMessage from './RegistrationMessage';
import { useToast } from '../hooks/use-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showRegistrationMessage, setShowRegistrationMessage] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [tempUserData, setTempUserData] = useState(null);
  
  // Use toast for notifications
  const { toast } = useToast();

  // Only reset modal state when it is closed, not on every open
  useEffect(() => {
    if (!isOpen) {
      setShowSuccessMessage(false);
      setShowRegistrationMessage(false);
      setShowPhoneInput(false);
      setUserEmail('');
      setPhoneNumber('');
      setLoading(false);
      setTempUserData(null);
    }
  }, [isOpen]);

  // Debug effect to track success message state changes
  useEffect(() => {
    console.log('Success message state changed to:', showSuccessMessage);
  }, [showSuccessMessage]);

  // Function to check if email exists in Pinecone database
  const checkEmailInDatabase = async (email: string, phoneNumber?: string) => {
    try {
      console.log('Checking email in database:', email, 'phoneNumber:', phoneNumber);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, phoneNumber }),
      });

      if (!response.ok) {
        throw new Error('Failed to check email in database');
      }

      const data = await response.json();
      console.log('API response:', data);
      return data;
    } catch (error) {
      console.error('Error checking email in database:', error);
      // If there's an error checking the database, don't allow login
      return { exists: false, message: 'Database check failed, please try again later' };
    }
  };

  // Function to add user as buyer
  const addUserAsBuyer = async (email: string, phoneNumber: string, displayName: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/add-buyer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, phoneNumber, displayName }),
      });

      if (!response.ok) {
        throw new Error('Failed to add user as buyer');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding user as buyer:', error);
      throw error;
    }
  };

  // Google sign-in
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      console.log('Google sign-in successful, checking email in database...');
      
      // Check if email exists in either supplier or buyer database
      const emailCheckResult = await checkEmailInDatabase(user.email || '');
      // Always define userData after getting user and emailCheckResult
      const userData = { 
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
        isSupplier: emailCheckResult.userType === 'supplier',
        userType: emailCheckResult.userType,
        // Store phone number from database
        phoneNumber: emailCheckResult.userType === 'buyer' ? emailCheckResult.buyerData?.['Buyer Phone'] : 
                    emailCheckResult.userType === 'supplier' ? emailCheckResult.supplierData?.mobileNumber : null,
        ...(emailCheckResult.userType === 'supplier' ? { supplierData: emailCheckResult.supplierData } : {}),
        ...(emailCheckResult.userType === 'buyer' ? { buyerData: emailCheckResult.buyerData } : {})
      };
      
      // If not found, only show phone input for buyers
      if (!emailCheckResult.exists) {
        if (emailCheckResult.userType === 'buyer' || emailCheckResult.userType === undefined) {
          setUserEmail(user.email || '');
          setShowPhoneInput(true);
          setLoading(false);
          return;
        } else {
          // If userType is supplier or unknown, treat as success
          console.log('LOGIN FIX: Seller or unknown type, showing success message');
          setShowSuccessMessage(true);
          setTempUserData(userData);
          // Show success message and wait for user to click Continue
          return;
        }
      }
      // Email found in database, proceed with login
      console.log('LOGIN FIX: Email found, showing success message');
      setShowSuccessMessage(true);
      setTempUserData(userData);
      // Show success message and wait for user to click Continue
      return;
    } catch (error: any) {
      console.error('Error during Google sign-in:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      let errorMessage = 'Google sign-in failed';
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your Firebase security rules.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Firebase service unavailable. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Sign-in Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle phone number submission
  const handlePhoneSubmit = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Check email again with phone number
      const emailCheckResult = await checkEmailInDatabase(userEmail, phoneNumber);
      
      if (emailCheckResult.exists) {
        // This shouldn't happen, but handle it gracefully
        toast({
          title: "Registration Error",
          description: "Email already exists in database",
          variant: "destructive",
        });
        setShowPhoneInput(false);
        setLoading(false);
        return;
      }

      // Add user as buyer to buyer database
      const buyerResult = await addUserAsBuyer(userEmail, phoneNumber, 'Buyer');
      
      // Get current Firebase user
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // Create user data for buyer
      const userData = { 
        uid: currentUser.uid,
        email: userEmail,
        displayName: currentUser.displayName || 'Buyer',
        photoURL: currentUser.photoURL,
        createdAt: new Date().toISOString(),
        phoneNumber: phoneNumber,
        isSupplier: false,
        userType: 'buyer',
        buyerData: buyerResult.buyerData
      };
      
      console.log('Buyer data to save:', userData);
      
      await setDoc(doc(db, 'users', currentUser.uid), userData, { merge: true });
      
      // Show success message and wait for user to click Continue
      setShowSuccessMessage(true);
      setTempUserData(userData);
      // Do NOT auto-close or call onAuthSuccess here; let the Continue button handle it
      return;
    } catch (error: any) {
      console.error('Error adding user as buyer:', error);
      toast({
        title: "Registration Error",
        description: "Failed to register as buyer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseRegistrationMessage = () => {
    setShowRegistrationMessage(false);
    setUserEmail('');
    onClose(); // Close the login modal as well since user is not logged in
  };

  const handleCloseSuccessMessage = () => {
    setShowSuccessMessage(false);
    if (tempUserData) {
      onAuthSuccess(tempUserData);
      setTempUserData(null);
    }
    onClose();
  };

  if (!isOpen) return null;

  // Debug logging
  console.log('Rendering modal body - showSuccessMessage:', showSuccessMessage, 'showRegistrationMessage:', showRegistrationMessage);

  return (
    <>
      <div className="login-modal-overlay" onClick={onClose}>
        <div className="login-modal-content" onClick={e => e.stopPropagation()}>
          <div className="login-modal-header">
            <h2 className="login-modal-title">Sign In</h2>
            <button className="login-modal-close" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div className="login-modal-body">
            {showSuccessMessage ? (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <h3 className="success-title">Sign in completed successfully!</h3>
                <p className="success-text">Welcome to Sourceasy.</p>
                <button onClick={handleCloseSuccessMessage} className="success-close-button">
                  Continue
                </button>
              </div>
            ) : showPhoneInput ? (
              <div className="phone-input-form">
                <div className="form-group">
                  <label className="form-label">Phone Number Required</label>
                  <p className="form-description">
                    To continue as a buyer, you must provide your phone number. This is required for account verification and communication.
                  </p>
                  <div className="input-group">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter your phone number (required)"
                      className="phone-input"
                      disabled={loading}
                      required
                    />
                  </div>
                  <p className="form-note">
                    * Phone number is mandatory for buyer registration
                  </p>
                </div>
                <div className="button-group">
                  <button 
                    onClick={handlePhoneSubmit} 
                    className="submit-button" 
                    disabled={loading || !phoneNumber.trim()}
                  >
                    {loading ? 'Processing...' : 'Login'}
                  </button>
                  <button 
                    onClick={() => {
                      setShowPhoneInput(false);
                      setPhoneNumber('');
                      signOut(auth);
                    }} 
                    className="cancel-button"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="login-form">
                <div className="form-group">
                  <label className="form-label">Sign in with your Google account</label>
                  <p className="form-description">
                    Sign in to access your Sourceasy account and start trading.
                  </p>
                </div>
                <button onClick={handleGoogleSignIn} className="google-signin-button" disabled={loading}>
                  <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {loading ? 'Signing in...' : 'Continue with Google'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <RegistrationMessage 
        isOpen={showRegistrationMessage}
        onClose={handleCloseRegistrationMessage}
        email={userEmail}
      />
    </>
  );
};

export default LoginModal;