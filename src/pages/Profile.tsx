import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, History, Mail, Building, CreditCard, MapPin, Phone, Pin, Building2, Edit, ChevronDown, ChevronUp, Plus, X, FileText, DollarSign, Download, Share2 } from 'lucide-react';
import './Profile.css';

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
  const [editIdx, setEditIdx] = useState(-1);
  const [editProduct, setEditProduct] = useState(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [searchBuy, setSearchBuy] = useState('');
  const [searchSell, setSearchSell] = useState('');
  const [expandedSellIdx, setExpandedSellIdx] = useState<number | null>(null);
  
  // Add product modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [addingProduct, setAddingProduct] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

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

  // Edit and delete sell products state
  const [editingSellProduct, setEditingSellProduct] = useState<any>(null);
  const [deletingSellProduct, setDeletingSellProduct] = useState<string | null>(null);

  // History section state
  const [historyTab, setHistoryTab] = useState<'inquiry' | 'quotation'>('inquiry');

  // Search state for history sections
  const [inquirySearch, setInquirySearch] = useState('');
  const [quotationSearch, setQuotationSearch] = useState('');

  // Dummy data for history section
  const inquiryData = [
    {
      id: 1,
      date: '2024-01-15',
      productName: 'Acetic Acid',
      productCategory: 'Pharmaceutical',
      moq: 100,
      unit: 'Kg',
      pdfLink: 'https://example.com/inquiry1.pdf'
    },
    {
      id: 2,
      date: '2024-01-10',
      productName: 'Sulfuric Acid',
      productCategory: 'Industrial',
      moq: 500,
      unit: 'Litre',
      pdfLink: 'https://example.com/inquiry2.pdf'
    },
    {
      id: 3,
      date: '2024-01-05',
      productName: 'Hydrochloric Acid',
      productCategory: 'Laboratory',
      moq: 50,
      unit: 'Kg',
      pdfLink: 'https://example.com/inquiry3.pdf'
    },
    {
      id: 4,
      date: '2023-12-28',
      productName: 'Sodium Hydroxide',
      productCategory: 'Industrial',
      moq: 200,
      unit: 'Kg',
      pdfLink: 'https://example.com/inquiry4.pdf'
    }
  ];

  const quotationData = [
    {
      id: 1,
      productName: 'Acetic Acid',
      unitRate: 85,
      cashRate: 80,
      paymentTerms: '50% advance, 50% before delivery',
      deliveryTime: '7-10 business days',
      additionalExpenses: 'Transportation charges extra',
      description: 'High purity acetic acid suitable for pharmaceutical applications'
    },
    {
      id: 2,
      productName: 'Sulfuric Acid',
      unitRate: 45,
      cashRate: 42,
      paymentTerms: '100% advance payment',
      deliveryTime: '5-7 business days',
      additionalExpenses: 'GST extra as applicable',
      description: 'Concentrated sulfuric acid for industrial use'
    },
    {
      id: 3,
      productName: 'Hydrochloric Acid',
      unitRate: 65,
      cashRate: 60,
      paymentTerms: '30% advance, 70% on delivery',
      deliveryTime: '3-5 business days',
      additionalExpenses: 'Packaging charges included',
      description: 'Laboratory grade hydrochloric acid'
    },
    {
      id: 4,
      productName: 'Sodium Hydroxide',
      unitRate: 55,
      cashRate: 52,
      paymentTerms: 'Net 30 days',
      deliveryTime: '10-15 business days',
      additionalExpenses: 'Insurance charges extra',
      description: 'Industrial grade sodium hydroxide pellets'
    }
  ];

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

  // Fetch data when component mounts
  useEffect(() => {
    if (user?.email) {
      fetchBuyProducts();
      fetchSellProducts();
      fetchProfileData();
    }
  }, [user?.email]);

  // Restore active tab from sessionStorage
  useEffect(() => {
    const savedTab = sessionStorage.getItem('profileActiveTab');
    if (savedTab && ['buy', 'sell', 'history'].includes(savedTab)) {
      setTab(savedTab);
      // Clear the stored tab after restoring
      sessionStorage.removeItem('profileActiveTab');
    }
  }, []);

  // Add new product function
  const handleAddProduct = async () => {
    console.log("handleAddProduct called with:", { newProductName, userEmail: user?.email });
    
    if (!newProductName.trim() || !user?.email) {
      console.log("Validation failed:", { newProductName: newProductName.trim(), userEmail: user?.email });
      return;
    }

    try {
      setAddingProduct(true);
      console.log("Making API call to add product:", { email: user.email, productName: newProductName.trim() });
      
      const response = await fetch('/api/buy-products/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: user.email, 
          productName: newProductName.trim() 
        }),
      });

      console.log("Add product response status:", response.status);
      console.log("Add product response ok:", response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log("Add product success data:", data);
        setBuyProducts(data.products);
        setNewProductName('');
        setShowAddModal(false);
      } else {
        const errorData = await response.json();
        console.error("Add product error:", errorData);
        alert(errorData.error || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
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
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to remove product');
      }
    } catch (error) {
      console.error('Error removing product:', error);
      alert('Failed to remove product');
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
        
        setShowAddSellModal(false);
        setSellProductForm([{
          productName: '',
          productCategory: 'Pharmaceutical',
          description: '',
          minimumQuantity: '',
          unit: 'Kg',
          customUnit: ''
        }]);
        
        alert(`Successfully added ${data.count} product(s)!`);
        
        // Store current tab before reloading
        sessionStorage.setItem('profileActiveTab', tab);
        // Reload the page to show changes
        window.location.reload();
      } else {
        if (data.duplicates && data.duplicates.length > 0) {
          alert(`Some products already exist: ${data.duplicates.join(', ')}`);
        } else {
          alert(data.error || 'Failed to add products');
        }
      }
    } catch (error) {
      console.error('Error adding sell products:', error);
      alert('Failed to add products');
    } finally {
      setAddingSellProduct(false);
    }
  };

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setEditProduct({ ...sellProducts[idx] });
  };

  const handleEditChange = (e) => {
    setEditProduct({ ...editProduct, [e.target.name]: e.target.value });
  };

  const handleEditSave = (idx) => {
    const updated = [...sellProducts];
    updated[idx] = editProduct;
    setSellProducts(updated);
    setEditIdx(-1);
    setEditProduct(null);
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
  };

  // Update sell product
  const handleUpdateSellProduct = async () => {
    if (!editingSellProduct) return;

    try {
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
        setEditingSellProduct(null);
        alert('Product updated successfully!');
        
        // Store current tab before reloading
        sessionStorage.setItem('profileActiveTab', tab);
        // Reload the page to show changes
        window.location.reload();
      } else {
        alert(data.error || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating sell product:', error);
      alert('Failed to update product');
    }
  };

  // Delete sell product
  const handleDeleteSellProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      setDeletingSellProduct(productId);
      
      const response = await fetch('/api/sell-products/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh the sell products list
        await fetchSellProducts();
        alert('Product deleted successfully!');
        
        // Store current tab before reloading
        sessionStorage.setItem('profileActiveTab', tab);
        // Reload the page to show changes
        window.location.reload();
      } else {
        alert(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting sell product:', error);
      alert('Failed to delete product');
    } finally {
      setDeletingSellProduct(null);
    }
  };

  const handleAddressEdit = () => setIsEditingAddress(true);
  const handleAddressSave = () => {
    setIsEditingAddress(false);
    // Optionally, update backend here
  };
  const handlePinEdit = () => setIsEditingPin(true);
  const handlePinSave = () => {
    setIsEditingPin(false);
    // Optionally, update backend here
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
                  {isEditingAddress ? (
                    <>
                      <input
                        className="profile-edit-input"
                        value={profileData?.["Seller Address"] || mockProfile.address}
                        onChange={e => {
                          // Handle address change
                        }}
                        style={{marginRight: 8, width: '80%'}}
                      />
                      <button className="profile-edit-save" onClick={handleAddressSave}>Save</button>
                    </>
                  ) : (
                    <>
                      <span className="info-value" style={{marginRight: 8}}>{profileData?.["Seller Address"] || mockProfile.address}</span>
                      <button className="profile-edit-icon-btn" onClick={handleAddressEdit} title="Edit address">
                        <Edit size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="info-item">
              <Pin className="info-icon" />
              <div style={{width: '100%'}}>
                <span className="info-label">PIN CODE</span>
                <div className="profile-edit-row">
                  {isEditingPin ? (
                    <>
                      <input
                        className="profile-edit-input"
                        value={profileData?.["PIN Code"] || mockProfile.pin}
                        onChange={e => {
                          // Handle pin change
                        }}
                        style={{marginRight: 8, width: '50%'}}
                      />
                      <button className="profile-edit-save" onClick={handlePinSave}>Save</button>
                    </>
                  ) : (
                    <>
                      <span className="info-value" style={{marginRight: 8}}>{profileData?.["PIN Code"] || mockProfile.pin}</span>
                      <button className="profile-edit-icon-btn" onClick={handlePinEdit} title="Edit pincode">
                        <Edit size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Only show phone number if it exists */}
            {userPhone && (
              <div className="info-item">
                <Phone className="info-icon" />
                <div>
                  <span className="info-label">PHONE</span>
                  <span className="info-value">{userPhone}</span>
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
                  onClick={() => setShowAddModal(true)}
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
              
              <h2 className="section-title">Products You Have Bought</h2>
              
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
                          onClick={() => handleRemoveProduct(product)}
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
                  onClick={() => setShowAddSellModal(true)}
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
                    .map((product, i) => {
                      const isExpanded = expandedSellIdx === i;
                      return (
                        <div
                          key={i}
                          className={`sell-item-card${isExpanded ? ' expanded' : ''}`}
                          style={{ cursor: 'pointer', marginBottom: 16, border: '1px solid #eee', borderRadius: 8, boxShadow: isExpanded ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', transition: 'box-shadow 0.2s' }}
                        >
                          <div 
                            style={{ display: 'flex', alignItems: 'center', padding: 16 }}
                            onClick={() => setExpandedSellIdx(isExpanded ? null : i)}
                          >
                            <Package className="buy-icon" />
                            <span style={{ flex: 1, marginLeft: 12, fontWeight: 600 }}>{product.productName}</span>
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </div>
                          {isExpanded && (
                            <div 
                              style={{ padding: 16, borderTop: '1px solid #eee', background: '#fafbfc' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="product-header">
                                {editIdx === i ? (
                                  <input
                                    name="productName"
                                    value={editProduct.productName}
                                    onChange={handleEditChange}
                                    className="profile-edit-input"
                                    placeholder="Product Name"
                                    style={{fontWeight: 600, fontSize: '18px', marginBottom: 0}}
                                  />
                                ) : (
                                  <h3 className="product-name">{product.productName}</h3>
                                )}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button className="edit-btn" onClick={() => handleEditSellProduct(product)}>
                                    <Edit size={16} />
                                  </button>
                                  <button 
                                    className="edit-btn" 
                                    onClick={() => handleDeleteSellProduct(product.productId)}
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
                              {editIdx === i ? (
                                <input
                                  name="productCategory"
                                  value={editProduct.productCategory}
                                  onChange={handleEditChange}
                                  className="profile-edit-input"
                                  placeholder="Category"
                                  style={{marginBottom: 8}}
                                />
                              ) : (
                                <p className="product-category">{product.productCategory}</p>
                              )}
                              {editIdx === i ? (
                                <textarea
                                  name="productDescription"
                                  value={editProduct.productDescription}
                                  onChange={handleEditChange}
                                  className="profile-edit-input"
                                  placeholder="Product Description"
                                  style={{marginBottom: 8, width: '100%', minHeight: 60}}
                                />
                              ) : (
                                <p className="product-description">{product.productDescription}</p>
                              )}
                              <div className="product-details">
                                <div className="detail-item">
                                  <Package size={16} />
                                  {editIdx === i ? (
                                    <input
                                      name="minimumOrderQuantity"
                                      value={editProduct.minimumOrderQuantity}
                                      onChange={handleEditChange}
                                      className="profile-edit-input"
                                      placeholder="Minimum Order Quantity"
                                      type="number"
                                      style={{width: 120}}
                                    />
                                  ) : (
                                    <span>Min Order: {product.minimumOrderQuantity} {product.productUnit}</span>
                                  )}
                                </div>
                              </div>
                              {editIdx === i && (
                                <button className="profile-edit-save" style={{marginTop: 12}} onClick={() => handleEditSave(i)}>Save</button>
                              )}
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
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
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
                    <DollarSign size={16} />
                    Quotation Sent
                  </button>
                </div>
                {/* Search Bar - Aligned and centered with tabs */}
                <div style={{ display: 'flex', alignItems: 'center', height: '48px' }}>
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
                        width: '250px',
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
                        width: '250px',
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
              </div>

              {/* Inquiry Raised Content */}
              {historyTab === 'inquiry' && (
                <div className="inquiry-content">
                  <div className="inquiry-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '20px'
                  }}>
                    {inquiryData
                      .filter(inquiry => 
                        inquiry.productName.toLowerCase().includes(inquirySearch.toLowerCase()) ||
                        inquiry.productCategory.toLowerCase().includes(inquirySearch.toLowerCase()) ||
                        inquiry.unit.toLowerCase().includes(inquirySearch.toLowerCase())
                      )
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
                              {inquiry.productName}
                            </h3>
                            <p style={{
                              fontSize: '14px',
                              color: '#6b7280',
                              margin: '0'
                            }}>
                              {inquiry.productCategory}
                            </p>
                          </div>
                          <div style={{
                            textAlign: 'right'
                          }}>
                            <div style={{
                              fontSize: '12px',
                              color: '#6b7280',
                              marginBottom: '4px'
                            }}>
                              Date
                            </div>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#1f2937'
                            }}>
                              {new Date(inquiry.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="inquiry-details" style={{
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
                              MOQ
                            </div>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#1f2937'
                            }}>
                              {inquiry.moq} {inquiry.unit}
                            </div>
                          </div>
                          <div>
                            <div style={{
                              fontSize: '12px',
                              color: '#6b7280',
                              marginBottom: '2px'
                            }}>
                              Unit
                            </div>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#1f2937'
                            }}>
                              {inquiry.unit}
                            </div>
                          </div>
                        </div>

                        <div className="inquiry-actions">
                          <a
                            href={inquiry.pdfLink}
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
                            View PDF
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quotation Sent Content */}
              {historyTab === 'quotation' && (
                <div className="quotation-content">
                  <div className="quotation-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                    gap: '20px'
                  }}>
                    {quotationData
                      .filter(quotation => 
                        quotation.productName.toLowerCase().includes(quotationSearch.toLowerCase()) ||
                        quotation.description.toLowerCase().includes(quotationSearch.toLowerCase()) ||
                        quotation.paymentTerms.toLowerCase().includes(quotationSearch.toLowerCase()) ||
                        quotation.deliveryTime.toLowerCase().includes(quotationSearch.toLowerCase())
                      )
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
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: '0 0 8px 0'
                          }}>
                            {quotation.productName}
                          </h3>
                          <p style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            margin: '0',
                            lineHeight: '1.5'
                          }}>
                            {quotation.description}
                          </p>
                        </div>

                        <div className="quotation-pricing" style={{
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

                        <div className="quotation-details" style={{
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
                onClick={() => setShowAddModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <label htmlFor="productName">Chemical Name:</label>
              <input
                id="productName"
                type="text"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="Enter chemical name (e.g., Acetic Acid)"
                className="modal-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddProduct();
                  }
                }}
              />
            </div>
            <div className="modal-footer">
              <button 
                className="modal-cancel-btn"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-submit-btn"
                onClick={handleAddProduct}
                disabled={!newProductName.trim() || addingProduct}
              >
                {addingProduct ? 'Adding...' : 'Add Product'}
              </button>
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
                onClick={() => setShowAddSellModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
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
              >
                + Add More
              </button>
              <button 
                className="modal-cancel-btn"
                onClick={() => setShowAddSellModal(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-submit-btn"
                onClick={handleSubmitSellProducts}
                disabled={addingSellProduct}
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
            </div>
            <div className="modal-footer">
              <button 
                className="modal-cancel-btn"
                onClick={() => setEditingSellProduct(null)}
              >
                Cancel
              </button>
              <button 
                className="modal-submit-btn"
                onClick={handleUpdateSellProduct}
                disabled={!editingSellProduct.productName.trim()}
              >
                Update Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;