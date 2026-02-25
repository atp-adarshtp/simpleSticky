import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Draggable from "react-draggable";
import Sidebar from "../SideBar/SideBar";
import "../Dashboard/Dashboard.css"
import config from "../../config";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbtack, faTrash } from '@fortawesome/free-solid-svg-icons';

// Modal Component
const Modal = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Welcome! Start by creating a collection.</h2>
        <div className="modal-actions">
          {/* <button className="modal-button" onClick={onClose}>
            Cancel
          </button> */}
        </div>
      </div>
    </div>
  );
};

// Note Component
const Note = ({
  note,
  isEditing,
  editingContent,
  onEdit,
  onPinToggle,
  onDelete,
  onContentChange,
  onDragStop,
  isSaving,
}) => {
  const [isUnpinning, setIsUnpinning] = useState(false);

  const handlePinClick = async (e) => {
    e.stopPropagation();
    
    // If the note is pinned, unpin it
    if (note.pinned) {
      // Add unpin animation
      setIsUnpinning(true);
      setTimeout(() => {
        onPinToggle(note.noteId, false);
        setIsUnpinning(false);
      }, 300); // Animation duration
    } 
    // If the note is not pinned, delete it
    else {
      if (window.confirm('Are you sure you want to delete this note?')) {
        await onDelete(note.noteId);
      }
    }
  };

  return (
    <Draggable
      defaultPosition={{ x: note.x || 0, y: note.y || 0 }}
      bounds="parent"
      onStop={(e, data) => onDragStop(note.noteId, data.x, data.y)}
      disabled={note.pinned} // Disable dragging when pinned
    >
      <div className={`absolute bg-yellow-200 p-4 shadow-lg rounded-md ${note.pinned ? 'border-2 border-blue-500' : ''} ${isUnpinning ? 'animate-pulse scale-95' : ''}`}>
        {isEditing ? (
          <>
            <FontAwesomeIcon
              icon={faThumbtack}
              className={`cursor-pointer text-xs absolute top-2 right-2 ${note.pinned ? 'text-blue-600 rotate-45' : 'text-gray-400 hover:text-blue-500'}`}
              onClick={handlePinClick}
              title={note.pinned ? 'Unpin note' : 'Delete note'}
            />
            <textarea
              className="w-full h-20 bg-transparent text-xs resize-none focus:outline-none"
              placeholder="....."
              value={editingContent}
              onChange={onContentChange}
              autoFocus
            />
            {isSaving && <p className="text-gray-500 text-xs">Saving...</p>}
          </>
        ) : (
          <div onClick={() => onEdit(note.noteId, note.content)}>
            <FontAwesomeIcon
              icon={faThumbtack}
              className={`cursor-pointer text-xs absolute top-2 right-2 ${note.pinned ? 'text-blue-600 rotate-45' : 'text-gray-400 hover:text-blue-500'}`}
              onClick={handlePinClick}
              title={note.pinned ? 'Unpin note' : 'Delete note'}
            />
            <textarea
              className="w-full h-20 bg-transparent text-xs resize-none focus:outline-none"
              placeholder="New Note"
              readOnly
              value={note.content}
            />
          </div>
        )}
      </div>
    </Draggable>
  );
};

// Dashboard Component
const Dashboard = () => {
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(true); // Show modal on refresh
  const dashboardRef = useRef(null);

  // Axios config for authenticated requests
  const axiosConfig = {
    headers: {
      "x-api-key": "your-secret-api-key",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  // Fetch notes for a collection
  const fetchNotes = async (collectionId) => {
    try {
      const response = await axios.get(
        `${config.REACT_APP_LOCAL_COLLECTIONS_URL}/${collectionId}/notes`,
        axiosConfig
      );
      setNotes(response.data);
    } catch (error) {
      console.error("Error fetching notes:", error.message);
    }
  };

  // Handle collection selection, close modal when a collection is clicked
  const handleCollectionClick = (collectionId) => {
    setSelectedCollectionId(collectionId);
    fetchNotes(collectionId);
    setShowModal(false); // Automatically close modal
  };

  // Handle double-click to create a new note
  const createNote = async (x, y) => {
    try {
      const response = await axios.post(
        `${config.REACT_APP_LOCAL_COLLECTIONS_URL}/${selectedCollectionId}/notes`,
        { content: "", x, y },
        axiosConfig
      );
      setNotes((prevNotes) => [...prevNotes, response.data]);
      handleEditNote(response.data.noteId, response.data.content); // Trigger edit mode
    } catch (error) {
      console.error("Error creating note:", error.message);
    }
  };

  const handleDoubleClick = (e) => {
    if (selectedCollectionId) {
      const noteWidth = 200; // Adjust width based on your note
      const noteHeight = 100; // Adjust height based on your note

      const { left, top } = dashboardRef.current.getBoundingClientRect();
      const x = e.clientX - left - noteWidth / 2; // Center the note horizontally
      const y = e.clientY - top - noteHeight / 2; // Center the note vertically

      createNote(x, y);
    }
  };

  // Handle note edit
  const handleEditNote = (noteId, content) => {
    setEditingNoteId(noteId);
    setEditingContent(content);
  };

  // Handle note pin toggle
  const handlePinToggle = async (noteId, pinned) => {
    try {
      const response = await axios.put(
        `${config.REACT_APP_LOCAL_NOTE_EDIT_URL}/${selectedCollectionId}/notes/${noteId}`,
        { pinned },
        axiosConfig
      );
      
      // Update the note in state
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.noteId === noteId ? { ...note, pinned: response.data.pinned } : note
        )
      );
    } catch (error) {
      console.error("Error toggling pin status:", error.message);
    }
  };

  // Handle note deletion
  const handleDeleteNote = async (noteId) => {
    try {
      await axios.delete(
        `${config.REACT_APP_LOCAL_NOTE_EDIT_URL}/${selectedCollectionId}/notes/${noteId}`,
        axiosConfig
      );
      
      // Remove the note from state
      setNotes((prevNotes) => prevNotes.filter((note) => note.noteId !== noteId));
      
      // If we were editing this note, clear the editing state
      if (editingNoteId === noteId) {
        setEditingNoteId(null);
        setEditingContent("");
      }
    } catch (error) {
      console.error("Error deleting note:", error.message);
    }
  };

  // Handle drag stop to update note position
  const handleDragStop = async (noteId, x, y) => {
    try {
      await axios.put(
        `${config.REACT_APP_LOCAL_NOTE_EDIT_URL}/${selectedCollectionId}/notes/${noteId}`,
        { x, y },
        axiosConfig
      );
    } catch (error) {
      console.error("Error updating note position:", error.message);
    }
  };

  // Auto-save edited content after a delay
  useEffect(() => {
    if (editingNoteId) {
      setIsSaving(true);
      const autoSave = setTimeout(async () => {
        try {
          const response = await axios.put(
            `${config.REACT_APP_LOCAL_NOTE_EDIT_URL}/${selectedCollectionId}/notes/${editingNoteId}`,
            { content: editingContent },
            axiosConfig
          );
          setNotes((prevNotes) =>
            prevNotes.map((note) =>
              note.noteId === editingNoteId ? { ...note, content: response.data.content } : note
            )
          );
          setIsSaving(false);
        } catch (error) {
          console.error("Error saving edited note:", error.message);
          setIsSaving(false);
        }
      }, 1000);

      return () => clearTimeout(autoSave);
    }
  }, [editingContent, editingNoteId, selectedCollectionId]);

  return (
    <div className="h-screen w-screen flex">
      <Sidebar onCollectionClick={handleCollectionClick} />
      <div
        className="flex-1 p-4 bg-gray-100 relative overflow-hidden"
        onDoubleClick={handleDoubleClick}
        ref={dashboardRef}
      >
        {showModal && (
          <Modal
            onClose={() => setShowModal(false)}
          />
        )}
        {selectedCollectionId && (
          <div className="h-full w-full relative">
            {notes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <FontAwesomeIcon 
                    icon={faThumbtack} 
                    className="text-4xl text-yellow-500"
                  />
                </div>
                <h2>
                  Ready to Capture Your Ideas?
                </h2>
                <p>
                  Double-click anywhere on the canvas to create your first sticky note. 
                  Start organizing your thoughts, tasks, or inspirations right away!
                </p>
                <div className="empty-state-hint">
                  <FontAwesomeIcon icon={faThumbtack} className="mr-2" />
                  <span>Double-click to begin</span>
                </div>
              </div>
            ) : (
              notes.map((note) => (
                <Note
                  key={note.noteId}
                  note={note}
                  isEditing={editingNoteId === note.noteId}
                  editingContent={editingContent}
                  onEdit={handleEditNote}
                  onPinToggle={handlePinToggle}
                  onDelete={handleDeleteNote}
                  onContentChange={(e) => setEditingContent(e.target.value)}
                  onDragStop={handleDragStop}
                  isSaving={isSaving}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;