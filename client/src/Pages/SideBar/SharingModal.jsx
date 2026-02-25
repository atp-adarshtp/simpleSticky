import React, { useState } from 'react';
import './SharingModal.css';

const SharingModal = ({ 
  isVisible, 
  onClose, 
  onShare, 
  collectionId, 
  collectionTitle,
  isSharing = false,
  sharingError = null 
}) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('read');

  const handleSubmit = (e) => {
    e.preventDefault();
    onShare(collectionId, email, permission);
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Share "{collectionTitle}"</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="share-form">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="permission">Permission:</label>
            <select
              id="permission"
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
            >
              <option value="read">Read only</option>
              <option value="write">Read & Write</option>
            </select>
          </div>
          
          {sharingError && (
            <div className="error-message">
              {sharingError}
            </div>
          )}
          
          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="share-button" disabled={isSharing}>
              {isSharing ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SharingModal;