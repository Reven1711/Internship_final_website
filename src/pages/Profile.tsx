import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, History, Mail, Building, CreditCard, MapPin, Phone, Pin, Building2, Edit, ChevronDown, ChevronUp, Plus, X, FileText, Download, Share2, IndianRupee } from 'lucide-react';
import './Profile.css';
import Popup from '../components/ui/Popup';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '../contexts/CompanyContext';
import { useToast } from '../hooks/use-toast';

const mockProfile = {
  profilePic: 'https://www.gstatic.com/images/branding/product/2x/avatar_square_blue_512dp.png',
  fullName: 'Jay Raval',
  gmail: 'jay.mrugesh.raval@gmail.com',
  organization: 'Chemical Industries Ltd.',
  gst: '22AAAAA0000A1Z5',
  address: 'B-20, Industrial Area, Mumbai, Maharashtra',
  phone: '+91 9876543210',
  pin: '400001',
  company: 'Mumbai Chemical Solutions',
};

const DUMMY_GST = '22AAAAA0000A1Z5';

const TABS = [
  { id: 'buy', label: 'Products You Buy', icon: ShoppingCart },
  { id: 'sell', label: 'Products You Sell', icon: Package },
  { id: 'history', label: 'History', icon: History },
];

interface ProfileProps {
  user: any;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [tab, setTab] = useState('buy');
  const [sellProducts, setSellProducts] = useState([]);
  const [buyProducts, setBuyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyLoading, setBuyLoading] = useState(true);
  const [searchBuy, setSearchBuy] = useState('');
  const [searchSell, setSearchSell] = useState('');
  const [expandedSellIdx, setExpandedSellIdx] = useState<number | null>(null);
  
  // Add product modal state
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Debug modal state
  useEffect(() => {
    console.log('🔍 Modal state changed:', showAddModal);
  }, [showAddModal]);

  // Clear cache when user changes
  useEffect(() => {
    if (user?.email) {
      console.log('👤 User changed, clearing cache');
      setBuyProductsCache({});
      setCacheInitialized(false);
    }
  }, [user?.email]);
  const [newProductName, setNewProductName] = useState('');
  const [addingProduct, setAddingProduct] = useState(false);
  const [addProductError, setAddProductError] = useState('');
  const [addProductWarning, setAddProductWarning] = useState('');
  const [addProductSuccess, setAddProductSuccess] = useState('');
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Delete confirmation modal state
  const [showDeleteBuyModal, setShowDeleteBuyModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string>('');
  const [showDeleteSellModal, setShowDeleteSellModal] = useState(false);
  const [sellProductToDelete, setSellProductToDelete] = useState<string>('');
  const [deleteBuySuccess, setDeleteBuySuccess] = useState(false);
  const [deleteSellSuccess, setDeleteSellSuccess] = useState(false);
  const [deleteBuyError, setDeleteBuyError] = useState('');
  const [deleteSellError, setDeleteSellError] = useState('');

  // Add sell product modal state
  const [showAddSellModal, setShowAddSellModal] = useState(false);
  const [sellProductForm, setSellProductForm] = useState([{
    productName: '',
    productCategory: 'Pharmaceutical',
    description: '',
    minimumQuantity: '',
    unit: 'Kg',
    customUnit: ''
  }]);
  const [addingSellProduct, setAddingSellProduct] = useState(false);
  const [sellLoading, setSellLoading] = useState(false);
  const [sellProductSuccess, setSellProductSuccess] = useState('');
  const [sellProductError, setSellProductError] = useState('');

  // Edit and delete sell products state
  const [editingSellProduct, setEditingSellProduct] = useState<any>(null);
  const [deletingSellProduct, setDeletingSellProduct] = useState<string | null>(null);
  const [editProductSuccess, setEditProductSuccess] = useState(false);
  const [editProductError, setEditProductError] = useState('');
  const [updatingProduct, setUpdatingProduct] = useState(false);

  // History section state
  const [historyTab, setHistoryTab] = useState<'inquiry' | 'quotation'>('inquiry');

  // New seller flow state
  const [isNewSeller, setIsNewSeller] = useState(false);
  const [hasAddedProduct, setHasAddedProduct] = useState(false);

  // Search state for history sections
  const [inquirySearch, setInquirySearch] = useState('');
  const [quotationSearch, setQuotationSearch] = useState('');
  
  // Date filter state for history sections
  const [inquiryDateFilter, setInquiryDateFilter] = useState('');
  const [quotationDateFilter, setQuotationDateFilter] = useState('');
  
  // Date range filter state for history sections
  const [inquiryStartDate, setInquiryStartDate] = useState('');
  const [inquiryEndDate, setInquiryEndDate] = useState('');
  const [quotationStartDate, setQuotationStartDate] = useState('');
  const [quotationEndDate, setQuotationEndDate] = useState('');

  // Edit profile popup state
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);

  // Pincode edit state
  const [isPincodeEditOpen, setIsPincodeEditOpen] = useState(false);
  const [newPincode, setNewPincode] = useState('');
  const [updatingPincode, setUpdatingPincode] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  const [pincodeSuccess, setPincodeSuccess] = useState('');

  // Quotation data state
  const [quotationData, setQuotationData] = useState<any[]>([]);
  const [quotationLoading, setQuotationLoading] = useState(false);

  // Inquiry data state
  const [inquiryData, setInquiryData] = useState<any[]>([]);
  const [inquiryLoading, setInquiryLoading] = useState(false);

  const [masterProductList, setMasterProductList] = useState<string[]>([]);

  // Cache for buy products to avoid unnecessary API calls
  const [buyProductsCache, setBuyProductsCache] = useState<{[key: string]: string[]}>({});
  const [cacheInitialized, setCacheInitialized] = useState(false);

  // Use company context
  const { selectedCompany, loading: companyLoading } = useCompany();
  
  // Use toast for notifications
  const { toast } = useToast();

  // Generate cache key based on user and company
  const getCacheKey = () => {
    if (!user?.email) return null;
    const baseKey = user.email;
    if (selectedCompany) {
      return `${baseKey}_${selectedCompany.contact}_${selectedCompany.name}`;
    }
    return baseKey;
  };

  // Get cached products or fetch from API
  const getBuyProducts = () => {
    const cacheKey = getCacheKey();
    if (!cacheKey) return [];
    
    if (buyProductsCache[cacheKey]) {
      return buyProductsCache[cacheKey];
    }
    
    return [];
  };

  // Update cache with new products
  const updateBuyProductsCache = (products: string[]) => {
    const cacheKey = getCacheKey();
    if (!cacheKey) return;
    
    setBuyProductsCache(prev => ({
      ...prev,
      [cacheKey]: products
    }));
    setBuyProducts(products);
  };

  // Force refresh cache from backend (for consistency)
  const forceRefreshCache = async () => {
    await fetchBuyProducts(true);
  };

  // Helper to normalize product names
  function normalizeName(name: string) {
    return name.trim().replace(/\s+/g, ' ').toLowerCase();
  }

  // Fetch user's buy products from Pinecone (always fetch fresh data)
  const fetchBuyProducts = async (forceRefresh = false) => {
    if (!user?.email) return;

    const cacheKey = getCacheKey();
    if (!cacheKey) return;

    // Only use cache for tab switches, never for initial load or company changes
    if (!forceRefresh && buyProductsCache[cacheKey] && cacheInitialized) {
      setBuyProducts(buyProductsCache[cacheKey]);
      return;
    }

    try {
      setBuyLoading(true);
      
      // Build URL with query parameters if company is selected
      let url = `/api/buy-products/${encodeURIComponent(user.email)}`;
      const params = new URLSearchParams();
      
      if (selectedCompany) {
        params.append('phoneNumber', selectedCompany.contact);
        params.append('companyName', selectedCompany.name);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        const products = data.products || [];
        updateBuyProductsCache(products);
        setCacheInitialized(true);
      } else {
        updateBuyProductsCache([]);
      }
    } catch (error) {
      updateBuyProductsCache([]);
    } finally {
      setBuyLoading(false);
    }
  };

  // Fetch user's sell products from Pinecone - now filtered by selected company
  const fetchSellProducts = async () => {
    if (!user?.email) return;

    try {
      setSellLoading(true);
      const requestBody: any = { email: user.email };
      
      // Add company filters if a company is selected
      if (selectedCompany) {
        requestBody.companyName = selectedCompany.name;
        requestBody.companyContact = selectedCompany.contact;
      }

      const response = await fetch('/api/suppliers/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();

      if (response.ok) {
        setSellProducts(data.suppliers || []);
      } else {
        setSellProducts([]);
      }
    } catch (error) {
      setSellProducts([]);
    } finally {
      setSellLoading(false);
    }
  };

  // Fetch profile data from backend - now based on selected company
  const fetchProfileData = async () => {
    if (!user?.email) return;

    try {
      setProfileLoading(true);
      
      // Build URL with query parameters if company is selected
      let url = `/api/profile/${encodeURIComponent(user.email)}`;
      const params = new URLSearchParams();
      
      if (selectedCompany) {
        params.append('companyName', selectedCompany.name);
        params.append('companyContact', selectedCompany.contact);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setProfileData(data.profile);
      } else {
        setProfileData(null);
      }
    } catch (error) {
      setProfileData(null);
    } finally {
      setProfileLoading(false);
    }
  };

  // Helper function to get phone number from profile with fallback
  const getProfilePhoneNumber = () => {
    // Priority order: selected company contact > profile data > user data > mock
    let phoneNumber = selectedCompany?.contact;
    
    if (!phoneNumber && profileData) {
      phoneNumber = profileData["Seller POC Contact Number"] || profileData["Buyer Phone"];
    }
    
    if (!phoneNumber && user?.phoneNumber) {
      phoneNumber = user.phoneNumber;
    }
    
    if (!phoneNumber && user?.phone) {
      phoneNumber = user.phone;
    }
    
    // Only use mock phone as absolute last resort
    if (!phoneNumber) {
      phoneNumber = mockProfile.phone;
    }
    
    return phoneNumber;
  };

  // Helper function to add country code if missing
  const addCountryCode = (phoneNumber: string) => {
    if (!phoneNumber) return phoneNumber;
    
    // Remove any existing country code
    let cleanNumber = phoneNumber.replace(/^\+91\s*/, '').replace(/\s/g, '');
    
    // Add +91 if it's a 10-digit number
    if (cleanNumber.length === 10 && /^\d{10}$/.test(cleanNumber)) {
      return `+91${cleanNumber}`;
    }
    
    // Return as-is if it already has country code or is not a valid 10-digit number
    return phoneNumber;
  };

  // Fetch quotations from database with smart phone number handling
  const fetchQuotations = async () => {
    const basePhoneNumber = getProfilePhoneNumber();
    
    if (!basePhoneNumber || basePhoneNumber === mockProfile.phone) {
      setQuotationData([]);
      return;
    }

    try {
      setQuotationLoading(true);
      
      // Try first with the phone number as-is
      let phoneNumber = basePhoneNumber;
      let url = `/api/quotations/${encodeURIComponent(phoneNumber)}`;
      
      // Add email and company name as query parameters for better matching
      const params = new URLSearchParams();
      if (user?.email) {
        params.append('email', user.email);
      }
      if (selectedCompany?.name) {
        params.append('companyName', selectedCompany.name);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      let response = await fetch(url);
      let data = await response.json();

      if (response.ok) {
        setQuotationData(data.quotations || []);
      } else {
        setQuotationData([]);
      }
    } catch (error) {
      setQuotationData([]);
    } finally {
      setQuotationLoading(false);
    }
  };

  // Fetch inquiries from database with smart phone number handling
  const fetchInquiries = async () => {
    const basePhoneNumber = getProfilePhoneNumber();
    
    if (!basePhoneNumber || basePhoneNumber === mockProfile.phone) {
      setInquiryData([]);
      return;
    }

    try {
      setInquiryLoading(true);
      
      // Try first with the phone number as-is
      let phoneNumber = basePhoneNumber;
      let url = `/api/inquiries/${encodeURIComponent(phoneNumber)}`;
      
      let response = await fetch(url);
      let data = await response.json();

      if (response.ok && data.success) {
        setInquiryData(data.inquiries || []);
      } else {
        setInquiryData([]);
      }
    } catch (error) {
      setInquiryData([]);
    } finally {
      setInquiryLoading(false);
    }
  };

  // Fetch data when component mounts or when selected company changes
  useEffect(() => {
    if (user?.email && !companyLoading) {
      // Clear data immediately when company changes to prevent showing wrong data
      setBuyProducts([]);
      setSellProducts([]);
      setBuyLoading(true);
      setSellLoading(true);
      
      // Always fetch fresh data from backend to ensure consistency
      // Don't use cache for company changes or initial load
      fetchBuyProducts(true);
      
      fetchSellProducts();
      fetchProfileData();
    }
  }, [user?.email, selectedCompany, companyLoading]);

  // Fetch quotations and inquiries when profileData or selected company changes
  useEffect(() => {
    // Always fetch inquiries when not loading, regardless of profile data
    if (!companyLoading) {
      fetchQuotations();
      fetchInquiries();
    }
  }, [profileData, selectedCompany, companyLoading]);

  // Listen for company change events from the navbar
  useEffect(() => {
    const handleCompanyChange = (event: CustomEvent) => {
      if (user?.email && !companyLoading) {
        setBuyProducts([]);
        setSellProducts([]);
        setBuyLoading(true);
        setSellLoading(true);
        
        // Then refresh all data
        fetchBuyProducts();
        fetchSellProducts();
        fetchProfileData();
        fetchQuotations();
        fetchInquiries();
      }
    };

    window.addEventListener('companyChanged', handleCompanyChange as EventListener);
    
    return () => {
      window.removeEventListener('companyChanged', handleCompanyChange as EventListener);
    };
  }, [user?.email, companyLoading]);

  // Check URL parameters and restore active tab from sessionStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    const newSellerParam = urlParams.get('newSeller');
    
    // Check if user is a new seller
    if (newSellerParam === 'true' || sessionStorage.getItem('newSellerFlag') === 'true') {
      setIsNewSeller(true);
      setTab('sell'); // Force sell tab for new sellers
      // Clear the URL parameters and sessionStorage
      window.history.replaceState({}, document.title, window.location.pathname);
      sessionStorage.removeItem('newSellerFlag');
    } else {
      // Restore active tab from sessionStorage for regular users
      const savedTab = sessionStorage.getItem('profileActiveTab');
      if (savedTab && ['buy', 'sell', 'history'].includes(savedTab)) {
        setTab(savedTab);
        // Clear the stored tab after restoring
        sessionStorage.removeItem('profileActiveTab');
      }
    }
  }, []);

  // Check if new seller has added products
  useEffect(() => {
    if (isNewSeller && sellProducts.length > 0) {
      // Check if they have added at least one real product (not just the sample)
      const realProducts = sellProducts.filter(product => 
        product["Product Name"] && 
        product["Product Name"] !== "Sample Product"
      );
      
      if (realProducts.length > 0) {
        setHasAddedProduct(true);
        setIsNewSeller(false); // No longer a new seller
      }
    }
  }, [isNewSeller, sellProducts]);

  // Helper function to check if a date matches the filter
  const matchesDateFilter = (dateString: string, filterDate: string) => {
    if (!filterDate) return true;
    
    try {
      const itemDate = new Date(dateString);
      const filterDateObj = new Date(filterDate);
      
      // Compare only the date part (year, month, day)
      return itemDate.toDateString() === filterDateObj.toDateString();
    } catch (error) {
      return false;
    }
  };

  // Helper function to check if a date falls within a date range
  const matchesDateRangeFilter = (dateString: string, startDate: string, endDate: string) => {
    if (!startDate && !endDate) return true;
    
    try {
      const itemDate = new Date(dateString);
      itemDate.setHours(0, 0, 0, 0); // Set to start of day for comparison
      
      if (startDate && endDate) {
        // Both start and end dates are set
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        startDateObj.setHours(0, 0, 0, 0);
        endDateObj.setHours(23, 59, 59, 999); // Set to end of day
        
        return itemDate >= startDateObj && itemDate <= endDateObj;
      } else if (startDate) {
        // Only start date is set
        const startDateObj = new Date(startDate);
        startDateObj.setHours(0, 0, 0, 0);
        return itemDate >= startDateObj;
      } else if (endDate) {
        // Only end date is set
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999); // Set to end of day
        return itemDate <= endDateObj;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  };

  // Add new product function
  const handleAddProduct = async () => {
    if (!newProductName.trim() || !user?.email) {
      setAddProductError('Please enter a valid chemical or product.');
      return;
    }

    // Check for duplicates on the client side first (normalized)
    const trimmedProductName = newProductName.trim();
    const normalizedNew = normalizeName(trimmedProductName);
    const productExists = buyProducts.some(existingProduct => 
      normalizeName(existingProduct) === normalizedNew
    );

    if (productExists) {
      setAddProductError("Product already exists in your list");
      return;
    }

    try {
      setAddingProduct(true);
      setAddProductError('');
      setAddProductWarning('');
      
      // Prepare request body with company information
      const requestBody: any = { 
        email: user.email, 
        productName: trimmedProductName 
      };
      
      // Add company information if available
      if (selectedCompany) {
        requestBody.phoneNumber = selectedCompany.contact;
        requestBody.companyName = selectedCompany.name;
      }
      
      const response = await fetch('/api/buy-products/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      if (response.ok) {
        const data = await response.json();
        
        // Update cache with backend response to ensure consistency
        updateBuyProductsCache(data.products);
        setNewProductName('');
        setAddProductError('');
        setAddProductWarning('');
        setAddProductSuccess('Product Added Successfully!');
        
        // Close modal after 2 seconds
        setTimeout(() => {
          setShowAddModal(false);
          setAddProductSuccess('');
        }, 2000);
      } else {
        const errorData = await response.json();
        setAddProductError(errorData.error || 'Failed to add product');
        
        // Force refresh cache to ensure consistency
        setTimeout(() => {
          forceRefreshCache();
        }, 1000);
      }
    } catch (error) {
      setAddProductError('Failed to add product');
      
      // Force refresh cache to ensure consistency
      setTimeout(() => {
        forceRefreshCache();
      }, 1000);
    } finally {
      setAddingProduct(false);
    }
  };

  // New function to handle "Other Product" requests
  const handleSubmitOtherProductRequest = async () => {
    if (!newProductName.trim() || !user?.email) {
      return;
    }

    try {
      setAddingProduct(true);
      setAddProductError('');
      setAddProductWarning('');

      const response = await fetch('/api/product-requests/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          productName: newProductName.trim(),
          description: `Product requested by ${user.email}`,
          category: 'Chemical'
        }),
      });

      if (response.ok) {
        toast({
          title: "Product Request Submitted",
          description: `Request ID: ${data.requestId}. Our team will review your request and add it to the database if approved.`,
        });
        setNewProductName('');
        setAddProductError('');
        setAddProductWarning('');
        setShowAddModal(false);
      } else {
        setAddProductError(errorData.error || 'Failed to submit product request');
      }
    } catch (error) {
      setAddProductError('Failed to submit product request');
    } finally {
      setAddingProduct(false);
    }
  };

  // Remove product function
  const handleRemoveProduct = async (productName: string) => {
    if (!user?.email) return;

    try {
      // Prepare request body with company information
      const requestBody: any = { 
        email: user.email, 
        productName: productName 
      };
      
      // Add company information if available
      if (selectedCompany) {
        requestBody.phoneNumber = selectedCompany.contact;
        requestBody.companyName = selectedCompany.name;
      }
      
      const response = await fetch('/api/buy-products/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        // Update cache with backend response to ensure consistency
        updateBuyProductsCache(data.products);
        setDeleteBuySuccess(true);
        setDeleteBuyError(''); // Always clear error on success
        
        // Force refresh to ensure UI is updated immediately
        setTimeout(() => {
          forceRefreshCache();
        }, 500);
      } else {
        if (errorData.error && (
          errorData.error.includes('No products found for this email') ||
          errorData.error.includes('Product not found in your list')
        )) {
          // Treat this as success since the product is effectively removed
          setDeleteBuySuccess(true);
          setDeleteBuyError('');
          // Force refresh cache immediately to ensure consistency
          forceRefreshCache();
        } else {
          setDeleteBuyError(errorData.error || 'Failed to remove product');
          // Force refresh cache to ensure consistency
          setTimeout(() => {
            forceRefreshCache();
          }, 1000);
        }
      }
    } catch (error) {
      setDeleteBuyError('Failed to remove product');
      
      // Force refresh cache to ensure consistency
      setTimeout(() => {
        forceRefreshCache();
      }, 1000);
    }
  };

  // Add more rows to sell product form
  const handleAddMoreSellProducts = () => {
    setSellProductForm([...sellProductForm, {
      productName: '',
      productCategory: 'Pharmaceutical',
      description: '',
      minimumQuantity: '',
      unit: 'Kg',
      customUnit: ''
    }]);
  };

  // Delete a row from sell product form
  const handleDeleteSellProductRow = (index: number) => {
    if (sellProductForm.length > 1) {
      const updatedProducts = sellProductForm.filter((_, i) => i !== index);
      setSellProductForm(updatedProducts);
    }
  };

  // Update sell product form data
  const handleSellProductChange = (index: number, field: string, value: string) => {
    const updatedProducts = [...sellProductForm];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setSellProductForm(updatedProducts);
  };

  // Submit sell products
  const handleSubmitSellProducts = async () => {
    if (!user?.email) return;

    // Filter out empty rows (rows where productName is empty)
    const validProducts = sellProductForm.filter(product => 
      product.productName.trim() !== ''
    );

    if (validProducts.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in at least one product",
        variant: "destructive",
      });
      return;
    }

    // Validate remaining products
    const isValid = validProducts.every(product => 
      product.minimumQuantity.trim() && 
      (product.unit !== 'Other' || product.customUnit.trim())
    );

    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields for the products you want to add",
        variant: "destructive",
      });
      return;
    }

    try {
      setAddingSellProduct(true);
      
      // Call backend API to add products (only valid ones)
      const requestBody: any = {
        email: user.email,
        products: validProducts
      };
      
      // Add company filters if a company is selected
      if (selectedCompany) {
        requestBody.phoneNumber = selectedCompany.contact;
        requestBody.companyName = selectedCompany.name;
      }
      
      const response = await fetch('/api/sell-products/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh the sell products list
        await fetchSellProducts();
        
        // Special message for new sellers
        if (isNewSeller) {
          setSellProductSuccess(`Welcome to Sourceasy! Your first product has been added successfully. You can now access all features!`);
        } else {
          setSellProductSuccess(`Successfully added ${data.count} product(s)!`);
        }
        
        // Reset form
        setSellProductForm([{
          productName: '',
          productCategory: 'Pharmaceutical',
          description: '',
          minimumQuantity: '',
          unit: 'Kg',
          customUnit: ''
        }]);
        
        // Close modal after 3 seconds
        setTimeout(() => {
          setShowAddSellModal(false);
          setSellProductSuccess('');
          setSellProductError('');
        }, 3000);
        
        // Store current tab before reloading
        sessionStorage.setItem('profileActiveTab', tab);
        // Reload the page to show changes
        window.location.reload();
      } else {
        if (data.duplicates && data.duplicates.length > 0) {
          setSellProductError(`Some products already exist: ${data.duplicates.join(', ')}`);
        } else {
          setSellProductError(data.error || 'Failed to add products');
        }
      }
    } catch (error) {
      setSellProductError('Failed to add products');
    } finally {
      setAddingSellProduct(false);
    }
  };

  // Edit sell product
  const handleEditSellProduct = (product: any) => {
    setEditingSellProduct({
      productId: product.productId,
      productName: product.productName,
      productDescription: product.productDescription,
      productCategory: product.productCategory,
      minimumOrderQuantity: product.minimumOrderQuantity,
      productUnit: product.productUnit
    });
    setEditProductSuccess(false);
    setEditProductError('');
    setUpdatingProduct(false);
  };

  // Update sell product
  const handleUpdateSellProduct = async () => {
    if (!editingSellProduct) return;

    try {
      setUpdatingProduct(true);
      setEditProductError('');
      
      const requestBody: any = {
        productId: editingSellProduct.productId,
        updatedData: editingSellProduct,
        email: user.email
      };
      
      // Add company filters if a company is selected
      if (selectedCompany) {
        requestBody.phoneNumber = selectedCompany.contact;
        requestBody.companyName = selectedCompany.name;
      }
      
      const response = await fetch('/api/sell-products/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh the sell products list
        await fetchSellProducts();
        setEditProductSuccess(true);
        setEditProductError('');
      } else {
        setEditProductError(data.error || 'Failed to update product');
      }
    } catch (error) {
      setEditProductError('Failed to update product');
    } finally {
      setUpdatingProduct(false);
    }
  };

  // Delete sell product
  const handleDeleteSellProduct = async (productId: string) => {
    if (!user?.email) return;

    try {
      setDeletingSellProduct(productId);
      
      const requestBody: any = {
        email: user.email,
        productId: productId // Always Pinecone record ID
      };
      
      // Add company filters if a company is selected
      if (selectedCompany) {
        requestBody.phoneNumber = selectedCompany.contact;
        requestBody.companyName = selectedCompany.name;
      }
      
      const response = await fetch('/api/sell-products/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        // Refresh the sell products list
        await fetchSellProducts();
        setDeleteSellSuccess(true);
        setDeleteSellError(''); // Always clear error on success
      } else {
        setDeleteSellError(errorData.error || 'Failed to delete product');
      }
    } catch (error) {
      setDeleteSellError('Failed to delete product');
    } finally {
      setDeletingSellProduct(null);
    }
  };

  // Edit profile popup handlers
  const handleEditProfile = () => {
    setIsEditPopupOpen(true);
  };

  const closeEditPopup = () => {
    setIsEditPopupOpen(false);
  };

  // WhatsApp handler for phone number change
  const handleWhatsAppPhoneChange = () => {
    const message = "Hi, I want to change my phone number";
    const whatsappUrl = `https://wa.me/+916352615629?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setIsEditPopupOpen(false);
  };

  // Pincode edit handlers
  const handleEditPincode = () => {
    setNewPincode(profileData?.["PIN Code"] || mockProfile.pin);
    setPincodeError('');
    setPincodeSuccess('');
    setIsPincodeEditOpen(true);
  };

  const closePincodeEdit = () => {
    setIsPincodeEditOpen(false);
    setNewPincode('');
    setPincodeError('');
    setPincodeSuccess('');
  };

  const handleUpdatePincode = async () => {
    if (!newPincode.trim()) {
      setPincodeError('Pincode is required');
      return;
    }

    if (!/^\d{6}$/.test(newPincode.trim())) {
      setPincodeError('Pincode must be exactly 6 digits');
      return;
    }

    setUpdatingPincode(true);
    setPincodeError('');

    try {
      const response = await fetch('/api/update-pincode', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: profileData?.["Seller Email Address"] || user?.email,
          newPincode: newPincode.trim()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPincodeSuccess(data.message);
        // Update the local profile data
        setProfileData(prev => ({
          ...prev,
          "PIN Code": newPincode.trim()
        }));
        // Close the modal after 2 seconds
        setTimeout(() => {
          closePincodeEdit();
        }, 2000);
      } else {
        setPincodeError(data.error || 'Failed to update pincode');
      }
    } catch (error) {
      setPincodeError('Failed to update pincode. Please try again.');
    } finally {
      setUpdatingPincode(false);
    }
  };

  // Use profileData if available, otherwise fall back to mock data
  const displayName = profileData?.["Seller Name"] || user?.displayName || mockProfile.fullName;
  const email = profileData?.["Seller Email Address"] || user?.email || mockProfile.gmail;
  const profilePhoto = user?.photoURL;
  const userPhone = profileData?.["Seller POC Contact Number"] || user?.phone || mockProfile.phone;
  const company = profileData?.["Seller Name"] || mockProfile.company;
  const gstValue = DUMMY_GST;

  return (
    <div className="profile-container">
      {/* Sidebar */}
      <aside className="profile-sidebar">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <img 
                src={profilePhoto || 'https://www.gstatic.com/images/branding/product/2x/avatar_square_blue_512dp.png'} 
                alt="Profile" 
                className="profile-avatar-img"
              />
            </div>
            <h2 className="profile-name">{displayName}</h2>
            <p className="profile-company">{company}</p>
          </div>
          
          <div className="profile-info">
            <div className="info-item">
              <Mail className="info-icon" />
              <div>
                <span className="info-label">EMAIL</span>
                <span className="info-value">{email}</span>
              </div>
            </div>
            <div className="info-item">
              <Building2 className="info-icon" />
              <div>
                <span className="info-label">COMPANY</span>
                <span className="info-value">{company}</span>
              </div>
            </div>
            <div className="info-item">
              <CreditCard className="info-icon" />
              <div>
                <span className="info-label">GST NUMBER</span>
                <span className="info-value">{gstValue}</span>
              </div>
            </div>
            
            <div className="info-item">
              <MapPin className="info-icon" />
              <div style={{width: '100%'}}>
                <span className="info-label">ADDRESS</span>
                <div className="profile-edit-row">
                  <span className="info-value">{profileData?.["Seller Address"] || mockProfile.address}</span>
                </div>
              </div>
            </div>
            <div className="info-item">
              <Pin className="info-icon" />
              <div style={{width: '100%'}}>
                <span className="info-label">PIN CODE</span>
                <div className="profile-edit-row">
                  <span className="info-value">{profileData?.["PIN Code"] || mockProfile.pin}</span>
                  <button 
                    onClick={handleEditPincode}
                    className="edit-button"
                    title="Edit PIN Code"
                  >
                    <Edit size={14} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Only show phone number if it exists */}
            {userPhone && (
              <div className="info-item">
                <Phone className="info-icon" />
                <div>
                  <span className="info-label">PHONE</span>
                  <div className="profile-edit-row">
                    <span className="info-value">{userPhone}</span>
                    <button 
                      onClick={handleEditProfile}
                      className="edit-button"
                      title="Edit Phone Number"
                    >
                      <Edit size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="profile-main">
        {/* New Seller Blocking Overlay */}
        {isNewSeller && !hasAddedProduct && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '12px',
              maxWidth: '500px',
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ 
                color: '#1f2937', 
                marginBottom: '16px',
                fontSize: '24px',
                fontWeight: '600'
              }}>
                Welcome to Sourceasy! 🎉
              </h2>
              <p style={{ 
                color: '#6b7280', 
                marginBottom: '24px',
                fontSize: '16px',
                lineHeight: '1.6'
              }}>
                You've successfully registered as a supplier. To get started, please add at least one product to your catalog.
              </p>
              <div style={{
                backgroundColor: '#f3f4f6',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px',
                textAlign: 'left'
              }}>
                <p style={{ 
                  color: '#374151', 
                  margin: '0 0 8px 0',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  📋 What you need to do:
                </p>
                <ul style={{ 
                  color: '#6b7280', 
                  margin: '0',
                  paddingLeft: '20px',
                  fontSize: '14px'
                }}>
                  <li>Click "Add Product" button above</li>
                  <li>Fill in your product details</li>
                  <li>Submit your first product</li>
                </ul>
              </div>
              <button
                onClick={() => {
                  setTab('sell');
                  setShowAddSellModal(true);
                }}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              >
                Add Your First Product
              </button>
            </div>
          </div>
        )}
        <div className="profile-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab-btn ${tab === t.id ? 'active' : ''}`}
              onClick={() => {
                // Prevent tab switching for new sellers who haven't added products
                if (isNewSeller && !hasAddedProduct && t.id !== 'sell') {
                  return;
                }
                setTab(t.id);
              }}
              style={{
                opacity: isNewSeller && !hasAddedProduct && t.id !== 'sell' ? 0.5 : 1,
                cursor: isNewSeller && !hasAddedProduct && t.id !== 'sell' ? 'not-allowed' : 'pointer'
              }}
            >
              <t.icon className="tab-icon" />
              {t.label}
            </button>
          ))}
        </div>
        
        <div className="tab-content">
          {tab === 'buy' && (
            <div className="buy-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <input
                  className="product-search-input"
                  type="text"
                  placeholder="Search products you buy..."
                  value={searchBuy}
                  onChange={e => setSearchBuy(e.target.value)}
                  style={{ width: '70%' }}
                />
                <button 
                  className="add-product-btn"
                  onClick={() => {
                    setShowAddModal(true);
                    setAddProductError('');
                    setAddProductWarning('');
                    console.log('🔘 Modal state set to true');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <Plus size={16} />
                  Add Product
                </button>
              </div>
              
              <h2 className="section-title">Products You Buy</h2>
              
              {companyLoading || buyLoading ? (
                <div className="loading-state">
                  <p>{companyLoading ? 'Loading company data...' : 'Loading your buy products...'}</p>
                </div>
              ) : buyProducts.length === 0 ? (
                <div className="empty-state">
                  <p>No products found in your buy list.</p>
                  <p>Click "Add Product" to start adding chemicals you buy.</p>
                </div>
              ) : (
                <div className="buy-grid">
                  {buyProducts
                    .filter(product => product.toLowerCase().includes(searchBuy.toLowerCase()))
                    .map((product, i) => (
                      <div key={i} className="buy-item" style={{ position: 'relative' }}>
                        <Package className="buy-icon" />
                        <span style={{ flex: 1 }}>{product}</span>
                        <button
                          onClick={() => {
                            setShowDeleteBuyModal(true);
                            setProductToDelete(product);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            transition: 'background-color 0.2s'
                          }}
                          title="Remove product"
                        >
                          <X size={16} />
                        </button>
                      </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {tab === 'sell' && (
            <div className="sell-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <input
                  className="product-search-input"
                  type="text"
                  placeholder="Search products you sell..."
                  value={searchSell}
                  onChange={e => setSearchSell(e.target.value)}
                  style={{ width: '70%' }}
                />
                <button 
                  className="add-product-btn"
                  onClick={() => {
                    setShowAddSellModal(true);
                    setSellProductSuccess('');
                    setSellProductError('');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <Plus size={16} />
                  Add Product
                </button>
              </div>
              
              <h2 className="section-title">
                Products You Sell
                {isNewSeller && !hasAddedProduct && (
                  <span style={{
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '500',
                    marginLeft: '12px',
                    display: 'inline-block'
                  }}>
                    New Seller
                  </span>
                )}
              </h2>
              
              {companyLoading || sellLoading ? (
                <div className="loading-state">
                  <p>{companyLoading ? 'Loading company data...' : 'Loading your products...'}</p>
                </div>
              ) : sellProducts.length === 0 ? (
                <div className="empty-state">
                  <p>No products found for your account.</p>
                  <p>Products you add to the system will appear here.</p>
                </div>
              ) : (
                <div className="sell-grid">
                  {sellProducts
                    .filter(product => product.productName.toLowerCase().includes(searchSell.toLowerCase()))
                    .map((product, i, arr) => {
                      // 3 columns per row
                      const columns = 3;
                      const expandedRow = expandedSellIdx !== null ? Math.floor(expandedSellIdx / columns) : null;
                      const thisRow = Math.floor(i / columns);
                      const isRowExpanded = expandedRow !== null && thisRow === expandedRow;
                      return (
                        <div
                          key={i}
                          className={`sell-item-card${isRowExpanded ? ' expanded' : ''}`}
                          style={{ cursor: 'pointer', marginBottom: 16, border: '1px solid #eee', borderRadius: 8, boxShadow: isRowExpanded ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', transition: 'box-shadow 0.2s' }}
                        >
                          <div 
                            style={{ display: 'flex', alignItems: 'center', padding: 16 }}
                            onClick={() => setExpandedSellIdx(isRowExpanded ? null : i)}
                          >
                            <Package className="buy-icon" />
                            <span style={{ flex: 1, marginLeft: 12, fontWeight: 600 }}>{product.productName}</span>
                            {isRowExpanded ? (
                              <ChevronUp size={20} style={{ color: '#3A8DCA' }} className="chevron-icon" />
                            ) : (
                              <ChevronDown size={20} style={{ color: '#3A8DCA' }} className="chevron-icon" />
                            )}
                          </div>
                          {isRowExpanded && (
                            <div 
                              style={{ padding: 16, borderTop: '1px solid #eee', background: '#fafbfc' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="product-header">
                                <h3 className="product-name">{product.productName}</h3>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button className="edit-btn" onClick={() => handleEditSellProduct(product)}>
                                    <Edit size={16} />
                                  </button>
                                  <button 
                                    className="edit-btn" 
                                    onClick={() => {
                                      setShowDeleteSellModal(true);
                                      setSellProductToDelete(product.productId); // Always use Pinecone record ID
                                    }}
                                    disabled={deletingSellProduct === product.productId}
                                  >
                                    {deletingSellProduct === product.productId ? (
                                      <span style={{ fontSize: '12px' }}>...</span>
                                    ) : (
                                      <X size={16} />
                                    )}
                                  </button>
                                </div>
                              </div>
                              <p className="product-category">{product.productCategory}</p>
                              <p className="product-description">{product.productDescription}</p>
                              <div className="product-details">
                                <div className="detail-item">
                                  <Package size={16} />
                                  <span>MOQ: {product.minimumOrderQuantity} {product.productUnit}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
          
          {tab === 'history' && (
            <div className="history-content">
              {/* History Tabs and Search Bar in one row */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                marginBottom: '0',
                gap: '24px',
              }}>
                <div className="history-tabs" style={{
                  display: 'flex',
                  gap: '0',
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '4px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  maxWidth: 'fit-content',
                  height: '48px',
                  alignItems: 'center',
                }}>
                  <button
                    className={`history-tab-btn ${historyTab === 'inquiry' ? 'active' : ''}`}
                    onClick={() => setHistoryTab('inquiry')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      border: 'none',
                      background: historyTab === 'inquiry' ? '#eff6ff' : 'none',
                      color: historyTab === 'inquiry' ? '#2563eb' : '#6b7280',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease',
                      borderBottom: historyTab === 'inquiry' ? '2px solid #2563eb' : 'none',
                      height: '40px',
                    }}
                  >
                    <FileText size={16} />
                    Inquiry Raised
                  </button>
                  <button
                    className={`history-tab-btn ${historyTab === 'quotation' ? 'active' : ''}`}
                    onClick={() => setHistoryTab('quotation')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      border: 'none',
                      background: historyTab === 'quotation' ? '#eff6ff' : 'none',
                      color: historyTab === 'quotation' ? '#2563eb' : '#6b7280',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease',
                      borderBottom: historyTab === 'quotation' ? '2px solid #2563eb' : 'none',
                      height: '40px',
                    }}
                  >
                    <IndianRupee size={16} />
                    Quotation Sent
                  </button>
                </div>
              </div>
              {/* Search Bar and Date Pickers in their own new line */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '18px 0 24px 0', flexWrap: 'wrap' }}>
                {historyTab === 'inquiry' && (
                  <>
                    <input
                      type="text"
                      placeholder="Search inquiries..."
                      value={inquirySearch}
                      onChange={(e) => setInquirySearch(e.target.value)}
                      style={{
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        width: '180px',
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
                        height: '40px',
                        boxSizing: 'border-box',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                    <div className="date-range-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap' }}>From:</span>
                      <input
                        type="date"
                        value={inquiryStartDate}
                        onChange={(e) => setInquiryStartDate(e.target.value)}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '12px',
                          width: '120px',
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                          height: '32px',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap' }}>To:</span>
                      <input
                        type="date"
                        value={inquiryEndDate}
                        onChange={(e) => setInquiryEndDate(e.target.value)}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '12px',
                          width: '120px',
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                          height: '32px',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      />
                      </div>
                    </div>
                  </>
                )}
                {historyTab === 'quotation' && (
                  <>
                    <input
                      type="text"
                      placeholder="Search quotations..."
                      value={quotationSearch}
                      onChange={(e) => setQuotationSearch(e.target.value)}
                      style={{
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        width: '180px',
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
                        height: '40px',
                        boxSizing: 'border-box',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                    <div className="date-range-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap' }}>From:</span>
                      <input
                        type="date"
                        value={quotationStartDate}
                        onChange={(e) => setQuotationStartDate(e.target.value)}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '12px',
                          width: '120px',
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                          height: '32px',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap' }}>To:</span>
                      <input
                        type="date"
                        value={quotationEndDate}
                        onChange={(e) => setQuotationEndDate(e.target.value)}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '12px',
                          width: '120px',
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                          height: '32px',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Inquiry Raised Content */}
              {historyTab === 'inquiry' && (
                <div className="inquiry-content">
                  {companyLoading || inquiryLoading ? (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '40px',
                      color: '#6b7280'
                    }}>
                      <div style={{
                        textAlign: 'center'
                      }}>
                        <div style={{
                          fontSize: '16px',
                          marginBottom: '8px'
                        }}>
                          {companyLoading ? 'Loading company data...' : 'Loading inquiries...'}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#9ca3af'
                        }}>
                          Please wait while we fetch your inquiry history
                        </div>
                      </div>
                    </div>
                  ) : inquiryData.length === 0 ? (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '40px',
                      color: '#6b7280'
                    }}>
                      <div style={{
                        textAlign: 'center'
                      }}>
                        <div style={{
                          fontSize: '16px',
                          marginBottom: '8px'
                        }}>
                          No inquiries found
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#9ca3af'
                        }}                        >
                          {(() => {
                            const phoneNumber = getProfilePhoneNumber();
                            return phoneNumber && phoneNumber !== mockProfile.phone ? 
                              `No inquiries found for phone number: ${phoneNumber}` : 
                              'Phone number not available to fetch inquiries';
                          })()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="inquiry-grid" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                      gap: '20px'
                    }}>
                      {inquiryData
                        .filter(inquiry => {
                          const searchTerm = inquirySearch.toLowerCase();
                          const productNames = (inquiry.product || inquiry.productName || '').toLowerCase();
                          const matchesSearch = productNames.includes(searchTerm) ||
                            inquiry.deliveryLocation.toLowerCase().includes(searchTerm) ||
                            inquiry.quantity.toLowerCase().includes(searchTerm) ||
                            inquiry.orderId.toLowerCase().includes(searchTerm);
                          
                          const matchesDate = matchesDateRangeFilter(inquiry.inquiryDate, inquiryStartDate, inquiryEndDate);
                          
                          return matchesSearch && matchesDate;
                        })
                        .map((inquiry) => (
                        <div key={inquiry.id} className="inquiry-card" style={{
                          background: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          padding: '20px',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          transition: 'box-shadow 0.2s ease'
                        }}>
                          <div className="inquiry-header" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '16px'
                          }}>
                            <div>
                              <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#1f2937',
                                margin: '0 0 4px 0'
                              }}>
                                {inquiry.product || inquiry.productName || 'Unknown Product'}
                              </h3>
                              {inquiry.formattedDate && (
                                <div style={{
                                  fontSize: '12px',
                                  color: '#6b7280',
                                  marginTop: '4px'
                                }}>
                                  {inquiry.formattedDate}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px',
                            marginBottom: '16px'
                          }}>
                            <div>
                              <div style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                marginBottom: '2px'
                              }}>
                                Quantity
                              </div>
                              <div style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#1f2937'
                              }}>
                                {inquiry.quantity}
                              </div>
                            </div>
                            <div>
                              <div style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                marginBottom: '2px'
                              }}>
                                Delivery Location
                              </div>
                              <div style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#1f2937'
                              }}>
                                {inquiry.deliveryLocation}
                              </div>
                            </div>
                          </div>

                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <a
                              href={inquiry.comparisonReportLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                backgroundColor: '#2563eb',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'background-color 0.2s ease',
                                width: 'fit-content'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                            >
                              <FileText size={16} />
                              View Report
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Quotation Sent Content */}
              {historyTab === 'quotation' && (
                <div className="quotation-content">
                  {companyLoading || quotationLoading ? (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '40px',
                      color: '#6b7280'
                    }}>
                      <div style={{
                        textAlign: 'center'
                      }}>
                        <div style={{
                          fontSize: '16px',
                          marginBottom: '8px'
                        }}>
                          {companyLoading ? 'Loading company data...' : 'Loading quotations...'}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#9ca3af'
                        }}>
                          Please wait while we fetch your quotation history
                        </div>
                      </div>
                    </div>
                  ) : quotationData.length === 0 ? (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '40px',
                      color: '#6b7280'
                    }}>
                      <div style={{
                        textAlign: 'center'
                      }}>
                        <div style={{
                          fontSize: '16px',
                          marginBottom: '8px'
                        }}>
                          No quotations found
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#9ca3af'
                        }}                        >
                          {(() => {
                            const phoneNumber = getProfilePhoneNumber();
                            return phoneNumber && phoneNumber !== mockProfile.phone ? 
                              `No quotations found for phone number: ${phoneNumber}` : 
                              'Phone number not available to fetch quotations';
                          })()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="quotation-grid" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                      gap: '20px'
                    }}>
                      {quotationData
                        .filter(quotation => {
                          const searchTerm = quotationSearch.toLowerCase();
                          const matchesSearch = quotation.productName.toLowerCase().includes(searchTerm) ||
                            quotation.description.toLowerCase().includes(searchTerm) ||
                            quotation.paymentTerms.toLowerCase().includes(searchTerm) ||
                            quotation.deliveryTime.toLowerCase().includes(searchTerm);
                          
                          const matchesDate = matchesDateRangeFilter(quotation.submissionDate, quotationStartDate, quotationEndDate);
                          
                          return matchesSearch && matchesDate;
                        })
                        .map((quotation) => (
                        <div key={quotation.id} className="quotation-card" style={{
                          background: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          padding: '20px',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          transition: 'box-shadow 0.2s ease'
                        }}>
                          <div className="quotation-header" style={{
                            marginBottom: '16px'
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              marginBottom: '8px'
                            }}>
                              <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#1f2937',
                                margin: '0'
                              }}>
                                {quotation.productName}
                              </h3>
                              {quotation.formattedDate && (
                                <div style={{
                                  fontSize: '12px',
                                  color: '#6b7280'
                                }}>
                                  {quotation.formattedDate}
                                </div>
                              )}
                            </div>
                            <p style={{
                              fontSize: '14px',
                              color: '#6b7280',
                              margin: '0',
                              lineHeight: '1.5'
                            }}>
                              {quotation.description}
                            </p>
                          </div>

                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px',
                            marginBottom: '16px',
                            padding: '12px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px'
                          }}>
                            <div>
                              <div style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                marginBottom: '2px'
                              }}>
                                Unit Rate
                              </div>
                              <div style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#059669'
                              }}>
                                ₹{quotation.unitRate}/unit
                              </div>
                            </div>
                            <div>
                              <div style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                marginBottom: '2px'
                              }}>
                                Cash Rate
                              </div>
                              <div style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#dc2626'
                              }}>
                                ₹{quotation.cashRate}/unit
                              </div>
                            </div>
                          </div>

                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            marginBottom: '16px'
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <span style={{
                                fontSize: '12px',
                                color: '#6b7280'
                              }}>
                                Payment Terms
                              </span>
                              <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#1f2937'
                              }}>
                                {quotation.paymentTerms}
                              </span>
                            </div>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <span style={{
                                fontSize: '12px',
                                color: '#6b7280'
                              }}>
                                Delivery Time
                              </span>
                              <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#1f2937'
                              }}>
                                {quotation.deliveryTime}
                              </span>
                            </div>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <span style={{
                                fontSize: '12px',
                                color: '#6b7280'
                              }}>
                                Additional Expenses
                              </span>
                              <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#1f2937'
                              }}>
                                {quotation.additionalExpenses}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Product</h3>
              <button 
                className="modal-close-btn"
                onClick={() => {
                  setShowAddModal(false);
                  setAddProductError('');
                  setAddProductWarning('');
                  setAddProductSuccess('');
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {addProductSuccess && (
                <div style={{
                  padding: '12px',
                  marginBottom: '16px',
                  borderRadius: '6px',
                  backgroundColor: '#d1fae5',
                  color: '#065f46',
                  border: '1px solid #10b981',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  {addProductSuccess}
                </div>
              )}
              
              <label htmlFor="productName">Chemical Name:</label>
              <input
                id="productName"
                type="text"
                value={newProductName}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewProductName(value);
                  
                  if (addProductError) setAddProductError('');
                  if (addProductWarning) setAddProductWarning('');
                  if (addProductSuccess) setAddProductSuccess('');
                  
                  // Check for duplicates in real-time (normalized)
                  const trimmedProductName = value.trim();
                  const normalizedNew = normalizeName(trimmedProductName);
                  if (
                    trimmedProductName &&
                    buyProducts.some(existingProduct => normalizeName(existingProduct) === normalizedNew)
                  ) {
                    setAddProductWarning("This product already exists in your list");
                  }
                }}
                placeholder="Enter chemical name (e.g., Acetic Acid)"
                className={`modal-input ${addProductError || addProductWarning ? 'error' : ''}`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddProduct();
                  }
                }}
              />
              {addProductError && (
                <div className="error-message">
                  {addProductError}
                </div>
              )}
              {addProductWarning && (
                <div className="warning-message">
                  {addProductWarning}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="modal-cancel-btn"
                onClick={() => {
                  setShowAddModal(false);
                  setAddProductError('');
                  setAddProductWarning('');
                  setAddProductSuccess('');
                }}
              >
                {addProductSuccess ? 'Close' : 'Cancel'}
              </button>
              {addProductWarning && addProductWarning.includes('not in our database') ? (
                // Show both buttons when product is not in master list
                <>
                  <button 
                    className="modal-submit-btn"
                    onClick={handleSubmitOtherProductRequest}
                    disabled={!newProductName.trim() || addingProduct || !!addProductSuccess}
                    style={{ backgroundColor: '#059669' }}
                  >
                    {addingProduct ? 'Submitting...' : 'Request as Other Product'}
                  </button>
                  <button 
                    className="modal-submit-btn"
                    onClick={handleAddProduct}
                    disabled={!newProductName.trim() || addingProduct || !!addProductSuccess}
                    style={{ backgroundColor: '#2563eb' }}
                  >
                    {addingProduct ? 'Adding...' : 'Add Anyway'}
                  </button>
                </>
              ) : (
                // Show single button for normal flow
                <button 
                  className="modal-submit-btn"
                  onClick={handleAddProduct}
                  disabled={!newProductName.trim() || addingProduct || !!addProductError || !!addProductSuccess}
                >
                  {addingProduct ? 'Adding...' : 'Add Product'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Sell Product Modal */}
      {showAddSellModal && (
        <div className="modal-overlay" onClick={() => setShowAddSellModal(false)}>
          <div className="modal-content sell-product-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90%', width: '1200px' }}>
            <div className="modal-header">
              <h3>Register Products</h3>
              <button 
                className="modal-close-btn"
                onClick={() => {
                  setShowAddSellModal(false);
                  setSellProductSuccess('');
                  setSellProductError('');
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {sellProductSuccess && (
                <div style={{
                  padding: '12px',
                  marginBottom: '16px',
                  borderRadius: '6px',
                  backgroundColor: '#d1fae5',
                  color: '#065f46',
                  border: '1px solid #10b981',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  {sellProductSuccess}
                </div>
              )}
              
              {sellProductError && (
                <div style={{
                  padding: '12px',
                  marginBottom: '16px',
                  borderRadius: '6px',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  border: '1px solid #ef4444',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  {sellProductError}
                </div>
              )}
              
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, marginBottom: '2rem', borderRadius: '0.5rem', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(to right, #1A3556, #5DA8E0)', color: 'white' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.875rem' }}>Sr No</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.875rem' }}>Product Name</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.875rem' }}>Product Category</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.875rem' }}>Description</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.875rem' }}>Minimum Quantity</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.875rem' }}>Unit</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.875rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sellProductForm.map((product, index) => (
                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa' }}>
                      <td style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0' }}>{index + 1}</td>
                      <td style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0' }}>
                        <input
                          type="text"
                          value={product.productName}
                          onChange={(e) => handleSellProductChange(index, 'productName', e.target.value)}
                          style={{ width: '100%', padding: '0.75rem', border: '1px solid #B0B8C4', borderRadius: '0.5rem', fontSize: '1rem' }}
                          placeholder="Product name"
                          required
                        />
                      </td>
                      <td style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0' }}>
                        <select
                          value={product.productCategory}
                          onChange={(e) => handleSellProductChange(index, 'productCategory', e.target.value)}
                          style={{ width: '100%', padding: '0.75rem', border: '1px solid #B0B8C4', borderRadius: '0.5rem', fontSize: '1rem' }}
                          required
                        >
                          <option value="Pharmaceutical">Pharmaceutical</option>
                          <option value="Industrial">Industrial</option>
                          <option value="Agrochemical">Agrochemical</option>
                          <option value="Laboratory">Laboratory</option>
                        </select>
                      </td>
                      <td style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0' }}>
                        <input
                          type="text"
                          value={product.description}
                          onChange={(e) => handleSellProductChange(index, 'description', e.target.value)}
                          style={{ width: '100%', padding: '0.75rem', border: '1px solid #B0B8C4', borderRadius: '0.5rem', fontSize: '1rem' }}
                          placeholder="Description"
                        />
                      </td>
                      <td style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0' }}>
                        <input
                          type="number"
                          value={product.minimumQuantity}
                          onChange={(e) => handleSellProductChange(index, 'minimumQuantity', e.target.value)}
                          style={{ width: '100%', padding: '0.75rem', border: '1px solid #B0B8C4', borderRadius: '0.5rem', fontSize: '1rem' }}
                          placeholder="Min quantity"
                          min="1"
                          required
                        />
                      </td>
                      <td style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0' }}>
                        <select
                          value={product.unit}
                          onChange={(e) => handleSellProductChange(index, 'unit', e.target.value)}
                          style={{ width: '100%', padding: '0.75rem', border: '1px solid #B0B8C4', borderRadius: '0.5rem', fontSize: '1rem' }}
                          required
                        >
                          <option value="Piece">Piece</option>
                          <option value="Dozen">Dozen</option>
                          <option value="Unit">Unit</option>
                          <option value="Cm">Cm</option>
                          <option value="Inch">Inch</option>
                          <option value="Feet">Feet</option>
                          <option value="Meter">Meter</option>
                          <option value="Gram">Gram</option>
                          <option value="Kg">Kg</option>
                          <option value="Tonne">Tonne</option>
                          <option value="Mtonne">Mtonne</option>
                          <option value="Litre">Litre</option>
                          <option value="Other">Other</option>
                        </select>
                        {product.unit === 'Other' && (
                          <input
                            type="text"
                            value={product.customUnit}
                            onChange={(e) => handleSellProductChange(index, 'customUnit', e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #B0B8C4', borderRadius: '0.5rem', fontSize: '1rem', marginTop: '0.5rem' }}
                            placeholder="Specify unit"
                            required
                          />
                        )}
                      </td>
                      <td style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0', textAlign: 'center' }}>
                        {sellProductForm.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSellProductRow(index)}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.25rem',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: '32px',
                              height: '32px'
                            }}
                            title="Delete row"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-submit-btn"
                onClick={handleAddMoreSellProducts}
                style={{
                  backgroundColor: '#5DA8E0',
                  marginRight: '12px'
                }}
                disabled={!!sellProductSuccess}
              >
                + Add More
              </button>
              <button 
                className="modal-cancel-btn"
                onClick={() => {
                  setShowAddSellModal(false);
                  setSellProductSuccess('');
                  setSellProductError('');
                }}
              >
                {sellProductSuccess ? 'Close' : 'Cancel'}
              </button>
              <button 
                className="modal-submit-btn"
                onClick={handleSubmitSellProducts}
                disabled={addingSellProduct || !!sellProductSuccess}
              >
                {addingSellProduct ? 'Adding...' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Sell Product Modal */}
      {editingSellProduct && (
        <div className="modal-overlay" onClick={() => setEditingSellProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Product</h3>
              <button 
                className="modal-close-btn"
                onClick={() => setEditingSellProduct(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {editProductSuccess ? (
                <div className="success-message">
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '48px', color: '#10b981', marginBottom: '16px' }}>✓</div>
                    <h3 style={{ color: '#10b981', marginBottom: '8px' }}>Product Successfully Changed!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '20px' }}>Your product has been updated successfully.</p>
                    <button 
                      className="modal-submit-btn"
                      onClick={() => {
                        setEditingSellProduct(null);
                        setEditProductSuccess(false);
                        setEditProductError('');
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {editProductError && (
                    <div className="error-message" style={{ 
                      backgroundColor: '#fef2f2', 
                      border: '1px solid #fecaca', 
                      color: '#dc2626', 
                      padding: '12px', 
                      borderRadius: '6px', 
                      marginBottom: '16px',
                      fontSize: '14px'
                    }}>
                      {editProductError}
                    </div>
                  )}
                  
                  <label htmlFor="editProductName">Product Name:</label>
                  <input
                    id="editProductName"
                    type="text"
                    value={editingSellProduct.productName}
                    onChange={(e) => setEditingSellProduct({
                      ...editingSellProduct,
                      productName: e.target.value
                    })}
                    className="modal-input"
                    placeholder="Product name"
                  />
                  
                  <label htmlFor="editProductCategory">Category:</label>
                  <select
                    id="editProductCategory"
                    value={editingSellProduct.productCategory}
                    onChange={(e) => setEditingSellProduct({
                      ...editingSellProduct,
                      productCategory: e.target.value
                    })}
                    className="modal-input"
                  >
                    <option value="Pharmaceutical">Pharmaceutical</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Agrochemical">Agrochemical</option>
                    <option value="Laboratory">Laboratory</option>
                  </select>
                  
                  <label htmlFor="editProductDescription">Description:</label>
                  <textarea
                    id="editProductDescription"
                    value={editingSellProduct.productDescription}
                    onChange={(e) => setEditingSellProduct({
                      ...editingSellProduct,
                      productDescription: e.target.value
                    })}
                    className="modal-input"
                    placeholder="Product description"
                    rows={3}
                  />
                  
                  <label htmlFor="editMinimumQuantity">Minimum Order Quantity:</label>
                  <input
                    id="editMinimumQuantity"
                    type="number"
                    value={editingSellProduct.minimumOrderQuantity}
                    onChange={(e) => setEditingSellProduct({
                      ...editingSellProduct,
                      minimumOrderQuantity: parseInt(e.target.value) || 0
                    })}
                    className="modal-input"
                    placeholder="Minimum quantity"
                    min="1"
                  />
                  
                  <label htmlFor="editProductUnit">Unit:</label>
                  <select
                    id="editProductUnit"
                    value={editingSellProduct.productUnit}
                    onChange={(e) => setEditingSellProduct({
                      ...editingSellProduct,
                      productUnit: e.target.value
                    })}
                    className="modal-input"
                  >
                    <option value="Piece">Piece</option>
                    <option value="Dozen">Dozen</option>
                    <option value="Unit">Unit</option>
                    <option value="Cm">Cm</option>
                    <option value="Inch">Inch</option>
                    <option value="Feet">Feet</option>
                    <option value="Meter">Meter</option>
                    <option value="Gram">Gram</option>
                    <option value="Kg">Kg</option>
                    <option value="Tonne">Tonne</option>
                    <option value="Mtonne">Mtonne</option>
                    <option value="Litre">Litre</option>
                  </select>
                </>
              )}
            </div>
            {!editProductSuccess && (
              <div className="modal-footer">
                <button 
                  className="modal-cancel-btn"
                  onClick={() => {
                    setEditingSellProduct(null);
                    setEditProductSuccess(false);
                    setEditProductError('');
                  }}
                  disabled={updatingProduct}
                >
                  Cancel
                </button>
                <button 
                  className="modal-submit-btn"
                  onClick={handleUpdateSellProduct}
                  disabled={!editingSellProduct.productName.trim() || updatingProduct}
                >
                  {updatingProduct ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modals */}
      {showDeleteBuyModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteBuyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button 
                className="modal-close-btn"
                onClick={() => {
                  setShowDeleteBuyModal(false);
                  setDeleteBuySuccess(false);
                  setDeleteBuyError('');
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {deleteBuySuccess && (
                <div style={{
                  padding: '12px',
                  marginBottom: '16px',
                  borderRadius: '6px',
                  backgroundColor: '#d1fae5',
                  color: '#065f46',
                  border: '1px solid #10b981',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  Product Deleted Successfully!
                </div>
              )}
              
              {deleteBuyError && (
                <div style={{
                  padding: '12px',
                  marginBottom: '16px',
                  borderRadius: '6px',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  border: '1px solid #ef4444',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  {deleteBuyError}
                </div>
              )}
              
              {!deleteBuySuccess && (
                <>
                  <p>Are you sure you want to remove <strong>"{productToDelete}"</strong> from your buy list?</p>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                    This action cannot be undone.
                  </p>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="modal-cancel-btn"
                onClick={() => {
                  setShowDeleteBuyModal(false);
                  setDeleteBuySuccess(false);
                  setDeleteBuyError('');
                }}
              >
                {deleteBuySuccess ? 'Close' : 'Cancel'}
              </button>
              {!deleteBuySuccess && (
                <button 
                  className="modal-submit-btn"
                  style={{ backgroundColor: '#dc3545' }}
                  onClick={() => {
                    handleRemoveProduct(productToDelete);
                  }}
                >
                  Remove Product
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showDeleteSellModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteSellModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button 
                className="modal-close-btn"
                onClick={() => {
                  setShowDeleteSellModal(false);
                  setDeleteSellSuccess(false);
                  setDeleteSellError('');
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {deleteSellSuccess && (
                <div style={{
                  padding: '12px',
                  marginBottom: '16px',
                  borderRadius: '6px',
                  backgroundColor: '#d1fae5',
                  color: '#065f46',
                  border: '1px solid #10b981',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  Product Deleted Successfully!
                </div>
              )}
              
              {!deleteSellSuccess && deleteSellError && (
                <div style={{
                  padding: '12px',
                  marginBottom: '16px',
                  borderRadius: '6px',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  border: '1px solid #ef4444',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  {deleteSellError}
                </div>
              )}
              
              {!deleteSellSuccess && (
                <>
                  <p>Are you sure you want to delete this product from your sell list?</p>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                    This action cannot be undone.
                  </p>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="modal-cancel-btn"
                onClick={() => {
                  setShowDeleteSellModal(false);
                  setDeleteSellSuccess(false);
                  setDeleteSellError('');
                }}
              >
                {deleteSellSuccess ? 'Close' : 'Cancel'}
              </button>
              {!deleteSellSuccess && (
                <button 
                  className="modal-submit-btn"
                  style={{ backgroundColor: '#dc3545' }}
                  onClick={() => {
                    handleDeleteSellProduct(sellProductToDelete);
                  }}
                >
                  Delete Product
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Popup */}
      <Popup
        isOpen={isEditPopupOpen}
        onClose={closeEditPopup}
        title="Contact our Agent"
        message="For assistance in updating your PIN code or phone number, please reach out to our AI Agent on WhatsApp."
        buttonText="Change via WhatsApp"
        onButtonClick={handleWhatsAppPhoneChange}
      />

      {/* Pincode Edit Modal */}
      {isPincodeEditOpen && (
        <div className="modal-overlay" onClick={closePincodeEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update PIN Code</h3>
              <button 
                className="modal-close-btn"
                onClick={closePincodeEdit}
                disabled={updatingPincode}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {pincodeSuccess && (
                <div style={{
                  padding: '12px',
                  marginBottom: '16px',
                  borderRadius: '6px',
                  backgroundColor: '#d1fae5',
                  color: '#065f46',
                  border: '1px solid #10b981',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  {pincodeSuccess}
                </div>
              )}
              
              {pincodeError && (
                <div style={{
                  padding: '12px',
                  marginBottom: '16px',
                  borderRadius: '6px',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  border: '1px solid #ef4444',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  {pincodeError}
                </div>
              )}
              
              {!pincodeSuccess && (
                <>
                  <p style={{ marginBottom: '16px', color: '#6b7280' }}>
                    Enter your new 6-digit PIN code. This will update all your product records.
                  </p>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '500',
                      color: '#374151'
                    }}>
                      New PIN Code:
                    </label>
                    <input
                      type="text"
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      placeholder="Enter 6-digit PIN code"
                      maxLength={6}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      disabled={updatingPincode}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="modal-cancel-btn"
                onClick={closePincodeEdit}
                disabled={updatingPincode}
              >
                {pincodeSuccess ? 'Close' : 'Cancel'}
              </button>
              {!pincodeSuccess && (
                <button 
                  className="modal-submit-btn"
                  onClick={handleUpdatePincode}
                  disabled={!newPincode.trim() || newPincode.length !== 6 || updatingPincode}
                >
                  {updatingPincode ? 'Updating...' : 'Update PIN Code'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;