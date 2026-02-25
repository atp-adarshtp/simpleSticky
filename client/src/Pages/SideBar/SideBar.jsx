import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "./Sidebar.css";
import config from "../../config";
import ConfirmationModal from "./ConfirmationModal"; // Import the modal
import SharingModal from "./SharingModal"; // Import the sharing modal
import SettingsModal from "./SettingsModal"; // Import the settings modal

// Welcome Modal Component
const WelcomeModal = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Welcome to Sticky Notes!</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>Create your first collection by typing a name in the input box below and pressing Enter.</p>
          <div className="modal-highlight">
            <i className="fa fa-arrow-down"></i>
            <span>Type your collection name here</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const colors = [
  "#9ECD4C",
  "#85B9E9",
  "#FFCCCB",
  "#DDA0DD",
  "#FFD700",
  "#FFA07A",
  "#20B2AA",
  "#FF6347",
  "#98FB98",
];

const Sidebar = ({ onCollectionClick }) => {
  const [title, setTitle] = useState("");
  const [collections, setCollections] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(true); // Changed from false to true
  const [editCollectionId, setEditCollectionId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility
  const [collectionToDelete, setCollectionToDelete] = useState(null); // State for the collection to delete
  const [isSharingModalVisible, setIsSharingModalVisible] = useState(false); // State for sharing modal
  const [collectionToShare, setCollectionToShare] = useState(null); // Collection to share
  const [isSharing, setIsSharing] = useState(false); // Sharing loading state
  const [sharingError, setSharingError] = useState(null); // Sharing error state
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false); // State for settings modal
  const [collectionForSettings, setCollectionForSettings] = useState(null); // Collection for settings
  const [showWelcomeModal, setShowWelcomeModal] = useState(true); // Welcome modal for new users
  const [isCreating, setIsCreating] = useState(false); // Animation state for creation process

  const navigate = useNavigate(); // Initialize useNavigate

  // Fetch collections from the backend
  const fetchCollections = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, user may not be logged in");
      return;
    }
    
    try {
      // Fetch user's own collections
      const ownCollectionsResponse = await axios.get(config.REACT_APP_LOCAL_COLLECTIONS_URL, {
        headers: {
          "x-api-key": "your-secret-api-key",
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Fetch collections shared with the user
      try {
        console.log("Attempting to fetch shared collections...");
        const sharedCollectionsResponse = await axios.get(config.REACT_APP_LOCAL_COLLECTIONS_SHARED_URL, {
          headers: {
            "x-api-key": "your-secret-api-key",
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log("Shared collections response:", sharedCollectionsResponse.data);
        
        // Combine own collections and shared collections
        const ownCollections = ownCollectionsResponse.data.map(col => ({
          ...col,
          isSharedWithMe: col.isSharedWithMe // Use the server-provided value
        }));
        
        const sharedCollections = sharedCollectionsResponse.data.map(col => ({
          ...col,
          isSharedWithMe: col.isSharedWithMe // Use the server-provided value (should be true)
        }));
        
        console.log(`Found ${ownCollections.length} own collections and ${sharedCollections.length} shared collections`);
        
        // Combine both arrays
        const allCollections = [...ownCollections, ...sharedCollections];
        
        setCollections(allCollections);
      } catch (sharedError) {
        // If there's an error fetching shared collections, at least show own collections
        console.warn("Error fetching shared collections:", sharedError.message);
        console.warn("Shared collections error details:", sharedError.response?.data || sharedError);
        
        const ownCollections = ownCollectionsResponse.data.map(col => ({
          ...col,
          isSharedWithMe: col.isSharedWithMe // Use the server-provided value
        }));
        
        setCollections(ownCollections);
      }
    } catch (error) {
      console.error(
        "Error fetching collections:",
        error.response ? error.response.data : error.message
      );
      
      // If there's an error with own collections, try just getting shared ones
      try {
        console.log("Fetching shared collections as fallback...");
        const sharedCollectionsResponse = await axios.get(config.REACT_APP_LOCAL_COLLECTIONS_SHARED_URL, {
          headers: {
            "x-api-key": "your-secret-api-key",
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log("Fallback shared collections response:", sharedCollectionsResponse.data);
        
        const sharedCollections = sharedCollectionsResponse.data.map(col => ({
          ...col,
          isSharedWithMe: col.isSharedWithMe // Use the server-provided value (should be true)
        }));
        
        setCollections(sharedCollections);
      } catch (sharedError) {
        console.error("Error fetching both own and shared collections:", sharedError.message);
        console.error("Full error details:", sharedError.response?.data || sharedError);
        setCollections([]); // Set to empty array if both fail
      }
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  // Handle form submission to create a new collection
  const handleCollections = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Your session has expired. Please log in again.");
      navigate("/login"); // Redirect to login page
      return;
    }

    // Start animation during creation process
    setIsCreating(true);

    try {
      const response = await axios.post(
        config.REACT_APP_LOCAL_COLLECTIONS_URL,
        { title },
        {
          headers: {
            "x-api-key": "your-secret-api-key",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update collections state
      setCollections([...collections, response.data]);

      // Auto-click the newly created collection
      onCollectionClick(response.data.collectionId);

      // Reset the title input
      setTitle("");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("Session expired. Please log in again.");
        navigate("/login"); // Redirect to login page
      } else {
        console.error(
          "Error creating collection:",
          error.response ? error.response.data : error.message
        );
        alert("An error occurred while creating the collection.");
      }
    } finally {
      // Stop animation after creation attempt (success or failure)
      setIsCreating(false);
    }
  };

  // Show confirmation modal for delete
  const showDeleteConfirmation = (collectionId) => {
    setCollectionToDelete(collectionId);
    setIsModalVisible(true);
  };

  // Handle confirm deletion
  const confirmDelete = async () => {
    if (collectionToDelete) {
      await handleDeleteCollection(collectionToDelete);
    }
    setIsModalVisible(false);
    setCollectionToDelete(null);
  };

  // Handle delete collection
  const handleDeleteCollection = async (collectionId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `${config.REACT_APP_LOCAL_COLLECTIONS_URL}/${collectionId}`,
        {
          headers: {
            "x-api-key": "your-secret-api-key",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCollections(
        collections.filter(
          (collection) => collection.collectionId !== collectionId
        )
      );
    } catch (error) {
      console.error(
        "Error deleting collection:",
        error.response ? error.response.data : error.message
      );
    }
  };

  // Handle edit collection
  const handleEditCollection = async (e, collectionId) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await axios.put(
        `${config.REACT_APP_LOCAL_COLLECTIONS_URL}/${collectionId}`,
        { title },
        {
          headers: {
            "x-api-key": "your-secret-api-key",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCollections(
        collections.map((collection) =>
          collection.collectionId === collectionId ? response.data : collection
        )
      );
      setEditCollectionId(null);
      setTitle("");
    } catch (error) {
      console.error(
        "Error editing collection:",
        error.response ? error.response.data : error.message
      );
    }
  };



  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    navigate("/login"); // Redirect to login page
  };

  // Refresh collections
  const handleRefresh = async () => {
    await fetchCollections();
  };

  // Show sharing modal
  const showSharingModal = (collection) => {
    setCollectionToShare(collection);
    setIsSharingModalVisible(true);
    setSharingError(null);
  };

  // Show settings modal
  const showSettingsModal = (collection) => {
    setCollectionForSettings(collection);
    setIsSettingsModalVisible(true);
  };

  // Handle share collection
  const handleShareCollection = async (collectionId, email, permission) => {
    const token = localStorage.getItem("token");
    setIsSharing(true);
    setSharingError(null);

    try {
      const response = await axios.post(
        `${config.REACT_APP_LOCAL_COLLECTION_SHARE_URL}/${collectionId}/share`,
        { email, permission },
        {
          headers: {
            "x-api-key": "your-secret-api-key",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Close the modal
      setIsSharingModalVisible(false);
      
      // Show success message
      alert(`Collection shared successfully with ${email}!\n\nThe recipient will need to refresh their browser to see the shared collection.`);
    } catch (error) {
      console.error(
        "Error sharing collection:",
        error.response ? error.response.data : error.message
      );
      setSharingError(
        error.response?.data?.message || "An error occurred while sharing the collection."
      );
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className={`SidebarBody ${sidebarVisible ? "open" : ""}`}>
      <nav>
        <h1
          className="sidebarToggleBtn"
          onClick={() => setSidebarVisible(!sidebarVisible)}
        >
          &#9776;
        </h1>
        <ul className={`nav nav__cont ${sidebarVisible ? "show" : ""}`}>
          <li className="nav__items" style={{ paddingTop: 30 }}>
            <ul>
              {collections.map((collection, index) => (
                <li
                  key={collection.collectionId}
                  className="stickyNote"
                  style={{ backgroundColor: colors[index % colors.length] }} // Assign color
                >
                  <div
                    onClick={() => onCollectionClick(collection.collectionId)}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <i
                          className={collection.isSharedWithMe ? "fa-solid fa-folder" : "fa-solid fa-folder-open"}
                          style={{ marginRight: 10, marginLeft: 10 }}
                          title={collection.isSharedWithMe ? "Shared with you" : "Your collection"}
                        />
                        {collection.title}
                        {collection.isSharedWithMe && (
                          <span style={{ fontSize: "10px", marginLeft: "5px", fontStyle: "italic" }}>
                            (shared)
                          </span>
                        )}
                      </div>
                      <i
                        className="fa-solid fa-gear"
                        style={{
                          color: "#666",
                          cursor: "pointer",
                          fontSize: "14px",
                          padding: "5px",
                          borderRadius: "4px",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          showSettingsModal(collection);
                        }}
                        title="Collection settings"
                      />
                    </div>
                  </div>
                  <div>
                    {editCollectionId === collection.collectionId ? (
                      <form
                        onSubmit={(e) =>
                          handleEditCollection(e, collection.collectionId)
                        }
                      >
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                        />
                      </form>
                    ) : (
                      <>
                        <hr
                          style={{
                            borderColor: "#00000038",
                            borderWidth: "1px",
                            borderStyle: "solid",
                          }}
                        />


                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </li>
          <li className="nav__items">
            <form onSubmit={handleCollections}>
              <input
                style={{ marginLeft: 18, marginRight: 18 }}
                className={`TextareaNote ${isCreating ? 'creating' : ''}`}
                type="text"
                placeholder="Enter collection name..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </form>
          </li>
          <li className="nav__items">
            <i
              className="fa fa-sync"
              onClick={handleRefresh} // Refresh collections icon functionality
              style={{
                cursor: "pointer",
                color: "#4e4343",
                position: "fixed", 
                bottom: "40px",    
                left: "10px",      // Position from the left
                fontSize: "15px",  // Adjust size as needed
                zIndex: 200,       // Ensure it stays above other elements
              }}
              title="Refresh collections"
            />
            <i
              className="fa fa-sign-out"
              onClick={handleLogout} // Logout icon functionality
              style={{
                cursor: "pointer",
                color: "#4e4343",
                position: "fixed", 
                bottom: "10px",    
                left: "10px",      // Position from the left
                fontSize: "15px",  // Adjust size as needed
                zIndex: 200,       // Ensure it stays above other elements
              }}
            />
          </li>
        </ul>
      </nav>

      {/* Add the Confirmation Modal */}
      <ConfirmationModal
        isVisible={isModalVisible}
        onConfirm={confirmDelete}
        onCancel={() => setIsModalVisible(false)}
      />

      {/* Add the Settings Modal */}
      <SettingsModal
        isVisible={isSettingsModalVisible}
        onClose={() => setIsSettingsModalVisible(false)}
        collection={collectionForSettings}
        onShare={showSharingModal}
        onEdit={(collection) => {
          setEditCollectionId(collection.collectionId);
          setTitle(collection.title);
        }}
        onDelete={showDeleteConfirmation}
      />

      {/* Add the Sharing Modal */}
      <SharingModal
        isVisible={isSharingModalVisible}
        onClose={() => setIsSharingModalVisible(false)}
        onShare={handleShareCollection}
        collectionId={collectionToShare?.collectionId}
        collectionTitle={collectionToShare?.title}
        isSharing={isSharing}
        sharingError={sharingError}
      />
      
      {/* Welcome Modal */}
      <WelcomeModal
        isVisible={showWelcomeModal && collections.length === 0}
        onClose={() => setShowWelcomeModal(false)}
      />

    </div>
  );
};

export default Sidebar;
