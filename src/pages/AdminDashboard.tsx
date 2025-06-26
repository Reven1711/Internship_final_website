import React, { useState, useEffect } from 'react';
import { X, Check, XCircle, Clock, CheckCircle, X as XIcon, RefreshCw } from 'lucide-react';
import './AdminDashboard.css';

interface ProductRequest {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

interface ReferralData {
  id: string;
  metadata: {
    email: string;
    referralCount: number;
    [key: string]: any;
  };
}

interface AdminDashboardProps {
  user?: {
    email?: string;
  };
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [pendingRequests, setPendingRequests] = useState<ProductRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ProductRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [adminEmail, setAdminEmail] = useState(user?.email || '');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [referralLoading, setReferralLoading] = useState(true);
  const [referralError, setReferralError] = useState('');
  const [rewardGiven, setRewardGiven] = useState<{ [phone: string]: boolean }>({});
  const [filter, setFilter] = useState<'all' | 'fiveplus' | 'rewarded'>('all');
  const [referralDisplayCount, setReferralDisplayCount] = useState(5);
  const [editProductName, setEditProductName] = useState<string>('');

  useEffect(() => {
    if (user?.email) {
      setAdminEmail(user.email);
      fetchPendingRequests();
      fetchReferrals();
    }
  }, [user?.email]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/unapproved-chemicals`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPendingRequests(data.requests || []);
        } else {
          setError(data.error || 'Failed to fetch pending requests');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch pending requests');
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      setError('Failed to fetch pending requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchReferrals = async () => {
    try {
      setReferralLoading(true);
      setReferralError('');
      const response = await fetch('/api/referrals');
      const data = await response.json();
      console.log('Fetched referrals from backend:', data);
      if (data.success) {
        setReferrals(data.referrals || []);
      } else {
        setReferralError(data.error || 'Failed to fetch referrals');
      }
    } catch (error) {
      setReferralError('Failed to fetch referrals');
    } finally {
      setReferralLoading(false);
    }
  };

  const handleOpenReviewModal = (request: ProductRequest) => {
    setSelectedRequest(request);
    setEditProductName(request.name);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      setProcessing(true);
      const response = await fetch('/api/unapproved-chemicals/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminEmail: adminEmail,
          id: selectedRequest.id,
          reviewNotes: reviewNotes,
          name: editProductName,
        }),
      });

      if (response.ok) {
        setSuccessMessage('Product Approved Successfully!');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setSelectedRequest(null);
          setReviewNotes('');
          fetchPendingRequests(); // Refresh the list
        }, 2000);
      } else {
        const errorData = await response.json();
        setSuccessMessage(errorData.error || 'Failed to approve request');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error approving request:', error);
      setSuccessMessage('Failed to approve request');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      setProcessing(true);
      const response = await fetch('/api/unapproved-chemicals/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminEmail: adminEmail,
          id: selectedRequest.id,
          reviewNotes: reviewNotes,
        }),
      });

      if (response.ok) {
        setSuccessMessage('Product Rejected Successfully!');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setSelectedRequest(null);
          setReviewNotes('');
          fetchPendingRequests(); // Refresh the list
        }, 2000);
      } else {
        const errorData = await response.json();
        setSuccessMessage(errorData.error || 'Failed to reject request');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      setSuccessMessage('Failed to reject request');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="status-icon pending" />;
      case 'approved':
        return <CheckCircle size={16} className="status-icon approved" />;
      case 'rejected':
        return <XIcon size={16} className="status-icon rejected" />;
      default:
        return <Clock size={16} className="status-icon pending" />;
    }
  };

  // Filtering logic
  const filteredReferrals = referrals.filter(ref => {
    const phone = ref.metadata.phone || ref.id.replace('whatsapp:+', '');
    if (filter === 'fiveplus') return ref.metadata.referralCount >= 5;
    if (filter === 'rewarded') return rewardGiven[phone];
    return true;
  })
  // Order by most referrals
  .sort((a, b) => (b.metadata.referralCount || 0) - (a.metadata.referralCount || 0));

  const visibleReferrals = filteredReferrals.slice(0, referralDisplayCount);
  const canShowMore = referralDisplayCount < filteredReferrals.length;

  // Add a refresh handler
  const handleRefresh = () => {
    fetchPendingRequests();
    fetchReferrals();
  };

  return (
    <div className="admin-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'stretch', flexWrap: 'wrap' }}>
      {/* Top bar with refresh button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button
          onClick={handleRefresh}
          title="Refresh Referrals & Requests"
          style={{
            background: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'background 0.2s',
            marginRight: 4,
          }}
        >
          <RefreshCw size={20} style={{ marginRight: 4 }} />
          <span style={{ fontWeight: 500, fontSize: 15, color: '#1e293b' }}>Refresh</span>
        </button>
      </div>
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Referrals Section - Modern Card UI in Dashboard Theme */}
        <div className="referrals-section" style={{ flex: '1 1 350px', maxWidth: 400, minWidth: 320, background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.10)', padding: 18, marginBottom: 32, border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14, color: '#1e293b', letterSpacing: 0.5 }}>User Referrals</h2>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button onClick={() => { setFilter('all'); setReferralDisplayCount(5); }} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: filter === 'all' ? '#1d4ed8' : '#f3f4f6', color: filter === 'all' ? '#fff' : '#1e293b', fontWeight: 500, fontSize: 14, transition: 'background 0.2s' }}>All</button>
            <button onClick={() => { setFilter('fiveplus'); setReferralDisplayCount(5); }} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: filter === 'fiveplus' ? '#1d4ed8' : '#f3f4f6', color: filter === 'fiveplus' ? '#fff' : '#1e293b', fontWeight: 500, fontSize: 14, transition: 'background 0.2s' }}>5+ Referrals</button>
            <button onClick={() => { setFilter('rewarded'); setReferralDisplayCount(5); }} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: filter === 'rewarded' ? '#1d4ed8' : '#f3f4f6', color: filter === 'rewarded' ? '#fff' : '#1e293b', fontWeight: 500, fontSize: 14, transition: 'background 0.2s' }}>Reward Given</button>
          </div>
          {referralLoading ? (
            <div style={{ color: '#64748b' }}>Loading referral data...</div>
          ) : referralError ? (
            <div className="error-message" style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 8 }}>{referralError}</div>
          ) : visibleReferrals.length === 0 ? (
            <div style={{ color: '#64748b' }}>No referral data found.</div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {visibleReferrals.map((ref) => {
                  const phone = ref.metadata.phone || ref.id.replace('whatsapp:+', '');
                  const count = ref.metadata.referralCount;
                  const isRewarded = rewardGiven[phone] || false;
                  return (
                    <div key={ref.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      background: isRewarded ? 'rgba(16,185,129,0.08)' : '#f9fafb',
                      borderRadius: 10,
                      boxShadow: isRewarded ? '0 2px 8px rgba(16,185,129,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
                      padding: '10px 14px',
                      border: count >= 5 ? '2px solid #facc15' : '1px solid #e2e8f0',
                      position: 'relative',
                      minHeight: 44,
                      transition: 'box-shadow 0.2s, background 0.2s',
                    }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ color: '#1e293b', fontWeight: 600, fontSize: 15, letterSpacing: 0.2 }}>{phone}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                          <span style={{ fontSize: 13, color: count >= 5 ? '#b45309' : '#2563eb', fontWeight: 600, background: count >= 5 ? 'rgba(250,204,21,0.13)' : 'rgba(37,99,235,0.10)', borderRadius: 8, padding: '2px 8px' }}>
                            {count} Referral{count !== 1 ? 's' : ''}
                            {count >= 5 && <span style={{ marginLeft: 6, color: '#facc15', fontWeight: 700 }} title="Top Referrer">★</span>}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setRewardGiven(prev => ({ ...prev, [phone]: !isRewarded }))}
                        style={{
                          background: isRewarded ? 'linear-gradient(135deg,#10b981,#059669)' : '#f3f4f6',
                          color: isRewarded ? '#fff' : '#059669',
                          border: 'none',
                          borderRadius: 8,
                          padding: '6px 12px',
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: 'pointer',
                          boxShadow: isRewarded ? '0 1px 4px rgba(16,185,129,0.13)' : 'none',
                          transition: 'background 0.2s, color 0.2s',
                          outline: isRewarded ? '2px solid #10b981' : 'none',
                        }}
                      >
                        {isRewarded ? 'Rewarded' : 'Mark Reward'}
                      </button>
                    </div>
                  );
                })}
              </div>
              {canShowMore && (
                <button
                  onClick={() => setReferralDisplayCount(c => c + 5)}
                  style={{ marginTop: 18, padding: '10px 24px', borderRadius: 10, border: 'none', background: '#f3f4f6', color: '#1e293b', fontWeight: 600, fontSize: 15, cursor: 'pointer', alignSelf: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                >
                  Show More
                </button>
              )}
            </>
          )}
        </div>

        {/* Product Requests Section */}
        <div className="requests-container" style={{ flex: '2 1 600px', minWidth: 340 }}>
          {loading ? (
            <div className="loading">Loading pending requests...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : pendingRequests.length === 0 ? (
            <div className="no-requests">
              <CheckCircle size={48} />
              <h3>No Pending Requests</h3>
              <p>All product requests have been reviewed or there are none to show.</p>
            </div>
          ) : (
            <div className="requests-grid">
              {pendingRequests.map((request) => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <h3>{request.name}</h3>
                    <span className="request-id">#{request.id.slice(-8)}</span>
                  </div>
                  
                  <div className="request-details">
                    <div className="detail-item">
                      <label>Requested by:</label>
                      <span>{request.email}</span>
                    </div>
                    <div className="detail-item">
                      <label>Status:</label>
                      <span>{request.status}</span>
                    </div>
                    <div className="detail-item">
                      <label>Submitted:</label>
                      <span>{formatDate(request.submittedAt)}</span>
                    </div>
                  </div>

                  <div className="request-actions">
                    <button
                      className="action-btn approve-btn"
                      onClick={() => handleOpenReviewModal(request)}
                    >
                      <Check size={16} />
                      Approve
                    </button>
                    <button
                      className="action-btn reject-btn"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Review Product Request</h3>
              <button 
                className="modal-close-btn"
                onClick={() => setSelectedRequest(null)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              {showSuccess && (
                <div style={{
                  padding: '12px',
                  marginBottom: '16px',
                  borderRadius: '6px',
                  backgroundColor: successMessage.includes('Successfully') ? '#d1fae5' : '#fee2e2',
                  color: successMessage.includes('Successfully') ? '#065f46' : '#991b1b',
                  border: `1px solid ${successMessage.includes('Successfully') ? '#10b981' : '#ef4444'}`,
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  {successMessage}
                </div>
              )}
              
              <div className="review-details">
                <label htmlFor="editProductName" style={{ fontWeight: 600, marginBottom: 4 }}>Product Name:</label>
                <input
                  id="editProductName"
                  type="text"
                  value={editProductName}
                  onChange={e => setEditProductName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    marginBottom: 10,
                    fontSize: 16,
                    fontWeight: 500,
                  }}
                />
                <p><strong>Requested by:</strong> {selectedRequest.email}</p>
                <p><strong>Status:</strong> {selectedRequest.status}</p>
                <p><strong>Submitted:</strong> {formatDate(selectedRequest.submittedAt)}</p>
              </div>
              
              <div className="review-notes">
                <label htmlFor="reviewNotes">Review Notes (optional):</label>
                <textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any notes about your decision..."
                  rows={3}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="modal-cancel-btn"
                onClick={() => {
                  setSelectedRequest(null);
                  setReviewNotes('');
                  setShowSuccess(false);
                  setSuccessMessage('');
                }}
                disabled={processing}
              >
                {showSuccess ? 'Close' : 'Cancel'}
              </button>
              <button 
                className="modal-reject-btn"
                onClick={handleReject}
                disabled={processing || showSuccess}
              >
                {processing ? 'Rejecting...' : 'Reject'}
              </button>
              <button 
                className="modal-approve-btn"
                onClick={handleApprove}
                disabled={processing || showSuccess}
              >
                {processing ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 