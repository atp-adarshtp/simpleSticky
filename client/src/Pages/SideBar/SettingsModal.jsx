import React from 'react';
import './SettingsModal.css';

const SettingsModal = ({ 
  isVisible, 
  onClose, 
  collection,
  onShare,
  onEdit,
  onDelete
}) => {
  if (!isVisible) return null;

  const handleShare = () => {
    onShare(collection);
    onClose();
  };

  const handleEdit = () => {
    onEdit(collection);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${collection.title}"? This action cannot be undone.`)) {
      onDelete(collection.collectionId);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Settings for "{collection.title}"</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="settings-options">
          <button className="settings-option" onClick={handleShare}>
            <i className="fa-solid fa-share"></i>
            <span>Share Collection</span>
          </button>
          
          {!collection.isSharedWithMe && (
            <button className="settings-option" onClick={handleEdit}>
              <i className="fa-solid fa-pen"></i>
              <span>Edit Name</span>
            </button>
          )}
          
          {!collection.isSharedWithMe && (
            <button className="settings-option delete-option" onClick={handleDelete}>
              <i className="fa-solid fa-trash"></i>
              <span>Delete Collection</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;