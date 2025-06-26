import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, History, Mail, Building, CreditCard, MapPin, Phone, Pin, Building2, Edit, ChevronDown, ChevronUp, Plus, X, FileText, Download, Share2 } from 'lucide-react';
import './Profile.css';
import Popup from '../components/ui/Popup';
import { useNavigate } from 'react-router-dom';

// Rupee symbol component
const RupeeIcon = ({ size = 16, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M6 3h12" />
    <path d="M6 8h12" />
    <path d="M6 13l8.5 8" />
    <path d="M15 13c-2.5 0-5-1.5-5-4" />
  </svg>
);

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
  user?: {
    displayName?: string;
    email?: string;
    photoURL?: string;
    phone?: string;
  };
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

  // Fetch master product list
  useEffect(() => {
    const fetchMasterProducts = async () => {
      try {
        const response = await fetch('/api/approved-chemicals');
        if (response.ok) {
          const data = await response.json();
          setMasterProductList(data.chemicals || []);
        } else {
          console.error('Failed to fetch approved chemicals');
          // Fallback to static list if API fails
          setMasterProductList([
            'Acetic Acid', 'Sulfuric Acid', 'Hydrochloric Acid', 'Sodium Hydroxide',
            'Nitric Acid', 'Phosphoric Acid', 'Citric Acid', 'Oxalic Acid',
            'Formic Acid', 'Lactic Acid', 'Tartaric Acid', 'Malic Acid',
            'Potassium Hydroxide', 'Calcium Hydroxide', 'Ammonium Hydroxide',
            'Sodium Carbonate', 'Potassium Carbonate', 'Calcium Carbonate',
            'Sodium Bicarbonate', 'Potassium Bicarbonate', 'Ammonium Carbonate',
            'Sodium Sulfate', 'Potassium Sulfate', 'Calcium Sulfate',
            'Sodium Chloride', 'Potassium Chloride', 'Calcium Chloride',
            'Sodium Nitrate', 'Potassium Nitrate', 'Calcium Nitrate',
            'Sodium Phosphate', 'Potassium Phosphate', 'Calcium Phosphate',
            'Sodium Acetate', 'Potassium Acetate', 'Calcium Acetate',
            'Sodium Citrate', 'Potassium Citrate', 'Calcium Citrate',
            'Sodium Oxalate', 'Potassium Oxalate', 'Calcium Oxalate',
            'Sodium Formate', 'Potassium Formate', 'Calcium Formate',
            'Sodium Lactate', 'Potassium Lactate', 'Calcium Lactate',
            'Sodium Tartrate', 'Potassium Tartrate', 'Calcium Tartrate',
            'Sodium Malate', 'Potassium Malate', 'Calcium Malate'
          ]);
        }
      } catch (error) {
        console.error('Error fetching approved chemicals:', error);
        // Fallback to static list if API fails
        setMasterProductList([
          'Acetic Acid', 'Sulfuric Acid', 'Hydrochloric Acid', 'Sodium Hydroxide',
          'Nitric Acid', 'Phosphoric Acid', 'Citric Acid', 'Oxalic Acid',
          'Formic Acid', 'Lactic Acid', 'Tartaric Acid', 'Malic Acid',
          'Potassium Hydroxide', 'Calcium Hydroxide', 'Ammonium Hydroxide',
          'Sodium Carbonate', 'Potassium Carbonate', 'Calcium Carbonate',
          'Sodium Bicarbonate', 'Potassium Bicarbonate', 'Ammonium Carbonate',
          'Sodium Sulfate', 'Potassium Sulfate', 'Calcium Sulfate',
          'Sodium Chloride', 'Potassium Chloride', 'Calcium Chloride',
          'Sodium Nitrate', 'Potassium Nitrate', 'Calcium Nitrate',
          'Sodium Phosphate', 'Potassium Phosphate', 'Calcium Phosphate',
          'Sodium Acetate', 'Potassium Acetate', 'Calcium Acetate',
          'Sodium Citrate', 'Potassium Citrate', 'Calcium Citrate',
          'Sodium Oxalate', 'Potassium Oxalate', 'Calcium Oxalate',
          'Sodium Formate', 'Potassium Formate', 'Calcium Formate',
          'Sodium Lactate', 'Potassium Lactate', 'Calcium Lactate',
          'Sodium Tartrate', 'Potassium Tartrate', 'Calcium Tartrate',
          'Sodium Malate', 'Potassium Malate', 'Calcium Malate'
        ]);
      }
    };

    fetchMasterProducts();
  }, []);

  // Helper to normalize product names
  function normalizeName(name: string) {
    return name.trim().replace(/\s+/g, ' ').toLowerCase();
  }

  // Fetch user's buy products from Pinecone
  const fetchBuyProducts = async () => {
    if (!user?.email) return;

    try {
      setBuyLoading(true);
      const response = await fetch(`/api/buy-products/${encodeURIComponent(user.email)}`);
      const data = await response.json();

      if (response.ok) {
        setBuyProducts(data.products || []);
      } else {
        console.error('Error fetching buy products:', data.error);
        setBuyProducts([]);
      }
    } catch (error) {
      console.error('Error fetching buy products:', error);
      setBuyProducts([]);
    } finally {
      setBuyLoading(false);
    }
  };

  // Fetch user's sell products from Pinecone
  const fetchSellProducts = async () => {
    if (!user?.email) return;

    try {
      setSellLoading(true);
      const response = await fetch('/api/suppliers/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await response.json();

      if (response.ok) {
        setSellProducts(data.suppliers || []);
      } else {
        console.error('Error fetching sell products:', data.error);
        setSellProducts([]);
      }
    } catch (error) {
      console.error('Error fetching sell products:', error);
      setSellProducts([]);
    } finally {
      setSellLoading(false);
    }
  };

  // Fetch profile data from backend
  const fetchProfileData = async () => {
    if (!user?.email) return;

    try {
      setProfileLoading(true);
      const response = await fetch(`/api/profile/${encodeURIComponent(user.email)}`);
      if (response.ok) {
        const data = await response.json();
        setProfileData(data.profile);
      } else {
        setProfileData(null);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setProfileData(null);
    } finally {
      setProfileLoading(false);
    }
  };

  // Fetch quotations from database
  const fetchQuotations = async () => {
    // Use phone number from profileData if available, otherwise fall back to user.phone or mock data
    const phoneNumber = profileData?.["Seller POC Contact Number"] || user?.phone || mockProfile.phone;
    
    console.log('Fetching quotations with phone number:', phoneNumber);
    console.log('Profile data:', profileData);
    console.log('User data:', user);
    
    if (!phoneNumber) {
      console.log('No phone number available for fetching quotations');
      setQuotationData([]);
      return;
    }

    try {
      setQuotationLoading(true);
      const response = await fetch(`/api/quotations/${encodeURIComponent(phoneNumber)}`);
      const data = await response.json();

      console.log('Quotations API response:', data);

      if (response.ok) {
        setQuotationData(data.quotations || []);
      } else {
        console.error('Error fetching quotations:', data.error);
        setQuotationData([]);
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
      setQuotationData([]);
    } finally {
      setQuotationLoading(false);
    }
  };

  // Fetch inquiries from database
  const fetchInquiries = async () => {
    // Use phone number from profileData if available, otherwise fall back to user.phone or mock data
    const phoneNumber = profileData?.["Seller POC Contact Number"] || user?.phone || mockProfile.phone;
    
    console.log('Fetching inquiries with phone number:', phoneNumber);
    console.log('Profile data:', profileData);
    console.log('User data:', user);
    
    if (!phoneNumber) {
      console.log('No phone number available for fetching inquiries');
      setInquiryData([]);
      return;
    }

    try {
      setInquiryLoading(true);
      const response = await fetch(`/api/inquiries/${encodeURIComponent(phoneNumber)}`);
      const data = await response.json();

      console.log('Inquiries API response:', data);

      if (response.ok) {
        setInquiryData(data.inquiries || []);
      } else {
        console.error('Error fetching inquiries:', data.error);
        setInquiryData([]);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      setInquiryData([]);
    } finally {
      setInquiryLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    if (user?.email) {
      fetchBuyProducts();
      fetchSellProducts();
      fetchProfileData();
    }
  }, [user?.email]);

  // Fetch quotations and inquiries when profileData is available
  useEffect(() => {
    if (profileData) {
      fetchQuotations();
      fetchInquiries();
    }
  }, [profileData]);

  // Restore active tab from sessionStorage
  useEffect(() => {
    const savedTab = sessionStorage.getItem('profileActiveTab');
    if (savedTab && ['buy', 'sell', 'history'].includes(savedTab)) {
      setTab(savedTab);
      // Clear the stored tab after restoring
      sessionStorage.removeItem('profileActiveTab');
    }
  }, []);

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
      const response = await fetch('/api/buy-products/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: user.email, 
          productName: trimmedProductName 
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setBuyProducts(data.products);
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
      }
    } catch (error) {
      setAddProductError('Failed to add product');
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
        const data = await response.json();
        alert(`Product request submitted successfully! Request ID: ${data.requestId}\n\nOur team will review your request and add it to the database if approved.`);
        setNewProductName('');
        setAddProductError('');
        setAddProductWarning('');
        setShowAddModal(false);
      } else {
        const errorData = await response.json();
        setAddProductError(errorData.error || 'Failed to submit product request');
      }
    } catch (error) {
      console.error('Error submitting product request:', error);
      setAddProductError('Failed to submit product request');
    } finally {
      setAddingProduct(false);
    }
  };

  // Remove product function
  const handleRemoveProduct = async (productName: string) => {
    if (!user?.email) return;

    try {
      const response = await fetch('/api/buy-products/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: user.email, 
          productName: productName 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBuyProducts(data.products);
        setDeleteBuySuccess(true);
        setDeleteBuyError(''); // Always clear error on success
      } else {
        const errorData = await response.json();
        setDeleteBuyError(errorData.error || 'Failed to remove product');
      }
    } catch (error) {
      console.error('Error removing product:', error);
      setDeleteBuyError('Failed to remove product');
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
      alert('Please fill in at least one product');
      return;
    }

    // Validate remaining products
    const isValid = validProducts.every(product => 
      product.minimumQuantity.trim() && 
      (product.unit !== 'Other' || product.customUnit.trim())
    );

    if (!isValid) {
      alert('Please fill in all required fields for the products you want to add');
      return;
    }

    try {
      setAddingSellProduct(true);
      
      // Call backend API to add products (only valid ones)
      const response = await fetch('/api/sell-products/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          products: validProducts
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh the sell products list
        await fetchSellProducts();
        
        setSellProductSuccess(`Successfully added ${data.count} product(s)!`);
        
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
      console.error('Error adding sell products:', error);
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
      
      const response = await fetch('/api/sell-products/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: editingSellProduct.productId,
          updatedData: editingSellProduct
        }),
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
      console.error('Error updating sell product:', error);
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
      const response = await fetch('/api/sell-products/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: user.email, 
          productId: productId 
        }),
      });

      if (response.ok) {
        // Refresh the sell products list
        await fetchSellProducts();
        setDeleteSellSuccess(true);
        setDeleteSellError(''); // Always clear error on success
      } else {
        const errorData = await response.json();
        setDeleteSellError(errorData.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting sell product:', error);
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
      console.error('Error updating pincode:', error);
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
        <div className="profile-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab-btn ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
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
              
              {buyLoading ? (
                <div className="loading-state">
                  <p>Loading your buy products...</p>
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
              
              <h2 className="section-title">Products You Sell</h2>
              
              {sellLoading ? (
                <div className="loading-state">
                  <p>Loading your products...</p>
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
                                      setSellProductToDelete(product.productId);
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
              {/* Tabs Row: Inquiry Raised / Quotation Sent and Search Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '48px', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => setHistoryTab('inquiry')}
                    style={{
                      background: historyTab === 'inquiry' ? '#2563eb' : 'white',
                      color: historyTab === 'inquiry' ? 'white' : '#2563eb',
                      border: '1.5px solid #2563eb',
                      borderRadius: '10px 10px 0 0',
                      fontWeight: 600,
                      fontSize: '1rem',
                      padding: '10px 28px',
                      boxShadow: historyTab === 'inquiry' ? '0 4px 12px rgba(37,99,235,0.08)' : '0 2px 8px rgba(37,99,235,0.04)',
                      cursor: 'pointer',
                      outline: 'none',
                      borderBottom: historyTab === 'inquiry' ? '2px solid #2563eb' : 'none',
                      height: '40px',
                    }}
                  >
                    Inquiry Raised
                  </button>
                  <button
                    onClick={() => setHistoryTab('quotation')}
                    style={{
                      background: historyTab === 'quotation' ? '#2563eb' : 'white',
                      color: historyTab === 'quotation' ? 'white' : '#2563eb',
                      border: '1.5px solid #2563eb',
                      borderRadius: '10px 10px 0 0',
                      fontWeight: 600,
                      fontSize: '1rem',
                      padding: '10px 28px',
                      boxShadow: historyTab === 'quotation' ? '0 4px 12px rgba(37,99,235,0.08)' : '0 2px 8px rgba(37,99,235,0.04)',
                      cursor: 'pointer',
                      outline: 'none',
                      borderBottom: historyTab === 'quotation' ? '2px solid #2563eb' : 'none',
                      height: '40px',
                    }}
                  >
                    Quotation Sent
                  </button>
                </div>
                {/* Search Bar Only */}
                {historyTab === 'inquiry' && (
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
                )}
                {historyTab === 'quotation' && (
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
                )}
              </div>
              {/* Date Pickers Row: Always below */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '12px 0 24px 0', flexWrap: 'wrap' }}>
                {historyTab === 'inquiry' && (
                  <>
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
                  </>
                )}
                {historyTab === 'quotation' && (
                  <>
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
                  </>
                )}
              </div>

              {/* Inquiry Raised Content */}
              {historyTab === 'inquiry' && (
                <div className="inquiry-content">
                  {inquiryLoading ? (
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
                          Loading inquiries...
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
                        }}>
                          {(() => {
                            const phoneNumber = profileData?.["Seller POC Contact Number"] || user?.phone || mockProfile.phone;
                            return phoneNumber ? 
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
                          const productNames = Array.isArray(inquiry.products) 
                            ? inquiry.products.join(' ').toLowerCase()
                            : inquiry.productName.toLowerCase();
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
                                {Array.isArray(inquiry.products) 
                                  ? inquiry.products.join(', ')
                                  : inquiry.productName}
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
                  {quotationLoading ? (
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
                          Loading quotations...
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
                        }}>
                          {(() => {
                            const phoneNumber = profileData?.["Seller POC Contact Number"] || user?.phone || mockProfile.phone;
                            return phoneNumber ? 
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
                  const trimmedValue = value.trim();
                  const normalizedNew = normalizeName(trimmedValue);
                  if (
                    trimmedValue &&
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