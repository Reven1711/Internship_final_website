import React, { useState, useEffect } from 'react';
import { X, Check, XCircle, Clock, CheckCircle, X as XIcon } from 'lucide-react';
import './AdminDashboard.css';

interface ProductRequest {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
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

  useEffect(() => {
    if (user?.email) {
      setAdminEmail(user.email);
      fetchPendingRequests();
    }
  }, [user?.email]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/unapproved-chemicals/pending?adminEmail=${adminEmail}`);
      
      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data.requests || []);
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
        }),
      });

      if (response.ok) {
        alert('Product request approved successfully!');
        setSelectedRequest(null);
        setReviewNotes('');
        fetchPendingRequests(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request');
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
        alert('Product request rejected successfully!');
        setSelectedRequest(null);
        setReviewNotes('');
        fetchPendingRequests(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
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

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading pending requests...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard - Product Requests</h1>
        <p>Manage pending product requests from users</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="requests-container">
        {pendingRequests.length === 0 ? (
          <div className="no-requests">
            <CheckCircle size={48} />
            <h3>No Pending Requests</h3>
            <p>All product requests have been reviewed.</p>
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
                    onClick={() => setSelectedRequest(request)}
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
              <div className="review-details">
                <h4>{selectedRequest.name}</h4>
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
                onClick={() => setSelectedRequest(null)}
                disabled={processing}
              >
                Cancel
              </button>
              <button 
                className="modal-reject-btn"
                onClick={handleReject}
                disabled={processing}
              >
                {processing ? 'Rejecting...' : 'Reject'}
              </button>
              <button 
                className="modal-approve-btn"
                onClick={handleApprove}
                disabled={processing}
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