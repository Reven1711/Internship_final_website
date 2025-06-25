// Configuration for API URLs and environment variables
// This file centralizes all configuration for easy deployment management

export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
    endpoints: {
      // Authentication
      checkEmail: '/api/check-email',
      
      // Contact
      sendEmail: '/api/send-email',
      
      // Products
      approvedChemicals: '/api/approved-chemicals',
      unapprovedChemicals: '/api/unapproved-chemicals',
      approveChemical: '/api/unapproved-chemicals/approve',
      rejectChemical: '/api/unapproved-chemicals/reject',
      
      // Buy Products
      buyProducts: (email: string) => `/api/buy-products/${encodeURIComponent(email)}`,
      addBuyProduct: '/api/buy-products/add',
      removeBuyProduct: '/api/buy-products/remove',
      
      // Sell Products
      addSellProduct: '/api/sell-products/add',
      updateSellProduct: '/api/sell-products/update',
      deleteSellProduct: '/api/sell-products/delete',
      
      // Profile
      profile: (email: string) => `/api/profile/${encodeURIComponent(email)}`,
      
      // Quotations
      quotations: (phone: string) => `/api/quotations/${encodeURIComponent(phone)}`,
      
      // Inquiries
      inquiries: (phone: string) => `/api/inquiries/${encodeURIComponent(phone)}`,
      
      // Product Requests
      submitProductRequest: '/api/product-requests/submit',
      
      // Suppliers
      suppliersEmail: '/api/suppliers/email',
    }
  },
  
  // Firebase Configuration
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  },
  
  // Admin Configuration
  admin: {
    emails: import.meta.env.VITE_ADMIN_EMAILS?.split(',') || [],
  },
  
  // App Configuration
  app: {
    name: 'Sourceasy',
    description: 'AI-Powered Chemical Sourcing Platform from India',
    url: import.meta.env.VITE_APP_URL || 'https://www.sourceasy.ai',
  },
  
  // Environment
  env: {
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    mode: import.meta.env.MODE,
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${config.api.baseUrl}${endpoint}`;
};

// Export individual configs for convenience
export const { api, firebase, admin, app, env } = config; 