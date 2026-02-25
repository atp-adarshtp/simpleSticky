import React from "react";
import "./ConfirmationModal.css"; // Create CSS for modal styling

const ConfirmationModal = ({ isVisible, onConfirm, onCancel }) => {
  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Are you sure you want to delete this collection?</h2>
        <div className="modal-buttons">
          <button onClick={onConfirm}>Okay</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
