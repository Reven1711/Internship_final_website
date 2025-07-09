import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';

interface Company {
  id: string;
  name: string;
  gst: string;
  contact: string;
  region: string;
  address: string;
  email: string;
  verified: boolean;
  rating: number;
}

interface CompanyContextType {
  companies: Company[];
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company) => void;
  fetchCompanies: (email: string, phoneNumber?: string) => Promise<void>;
  clearCache: () => void;
  loading: boolean;
  error: string | null;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

interface CompanyProviderProps {
  children: ReactNode;
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cache to prevent duplicate API calls
  const cacheRef = useRef<Map<string, { data: Company[], timestamp: number }>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const fetchCompanies = useCallback(async (email: string, phoneNumber?: string) => {
    if (!email) return;

    // Create cache key
    const cacheKey = `${email}_${phoneNumber || 'all'}`;
    const cached = cacheRef.current.get(cacheKey);
    
    // Check if we have valid cached data
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('📋 Using cached companies data for:', email);
      setCompanies(cached.data);
      
      // If no company is selected and we have companies, select the first one
      if (!selectedCompany && cached.data.length > 0) {
        console.log('🎯 Auto-selecting first company from cache:', cached.data[0]);
        setSelectedCompany(cached.data[0]);
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching companies for email:', email);
      console.log('📞 Phone number (optional):', phoneNumber);
      
      // Build URL with query parameters
      let url = `/api/user-companies/${encodeURIComponent(email)}`;
      const params = new URLSearchParams();
      
      // Only add phone number if it's provided and we want to filter by it
      if (phoneNumber) {
        params.append('phoneNumber', phoneNumber);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      console.log('🌐 Making request to:', url);
      
      const response = await fetch(url);
      const data = await response.json();

      console.log('📡 API Response:', data);

      if (response.ok) {
        console.log('✅ Companies fetched successfully:', data.companies);
        const companiesData = data.companies || [];
        setCompanies(companiesData);
        
        // Cache the result
        cacheRef.current.set(cacheKey, {
          data: companiesData,
          timestamp: Date.now()
        });
        
        // If no company is selected and we have companies, select the first one
        if (!selectedCompany && companiesData.length > 0) {
          console.log('🎯 Auto-selecting first company:', companiesData[0]);
          setSelectedCompany(companiesData[0]);
        }
      } else {
        console.error('❌ API Error:', data.error);
        setError(data.error || 'Failed to fetch companies');
        setCompanies([]);
      }
    } catch (err) {
      console.error('❌ Error fetching companies:', err);
      setError('Failed to fetch companies');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCompany]); // Only depend on selectedCompany

  const handleSetSelectedCompany = useCallback((company: Company) => {
    setSelectedCompany(company);
    // Store the selected company in localStorage for persistence
    localStorage.setItem('selectedCompany', JSON.stringify(company));
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    console.log('Cache cleared.');
  }, []);

  // Load selected company from localStorage on mount
  useEffect(() => {
    const savedCompany = localStorage.getItem('selectedCompany');
    if (savedCompany) {
      try {
        const parsedCompany = JSON.parse(savedCompany);
        setSelectedCompany(parsedCompany);
      } catch (err) {
        console.error('Error parsing saved company:', err);
        localStorage.removeItem('selectedCompany');
      }
    }
  }, []);

  const value: CompanyContextType = {
    companies,
    selectedCompany,
    setSelectedCompany: handleSetSelectedCompany,
    fetchCompanies,
    clearCache,
    loading,
    error
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
}; 