import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "./Sidebar.css";
import config from "../../config";
import ConfirmationModal from "./ConfirmationModal"; // Import the modal

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
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [editCollectionId, setEditCollectionId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility
  const [collectionToDelete, setCollectionToDelete] = useState(null); // State for the collection to delete
  const navigate = useNavigate(); // Initialize useNavigate

  // Fetch collections from the backend
  const fetchCollections = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(config.REACT_APP_LOCAL_COLLECTIONS_URL, {
        headers: {
          "x-api-key": "your-secret-api-key",
          Authorization: `Bearer ${token}`,
        },
      });
      setCollections(response.data);
    } catch (error) {
      console.error(
        "Error fetching collections:",
        error.response ? error.response.data : error.message
      );
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
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <i
                        className="fa-solid fa-folder-open"
                        style={{ marginRight: 10, marginLeft: 10 }}
                      />
                      {collection.title}
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
                        <i
                          className="fa-solid fa-trash"
                          style={{
                            color: "rgb(255 0 0 / 51%)",
                            cursor: "pointer",
                            marginRight: 10,
                          }} // Change cursor to pointer
                          onClick={() =>
                            showDeleteConfirmation(collection.collectionId)
                          } // Show modal
                        />
                        <i
                          className="fa fa-fa-solid fa-user-pen"
                          style={{ marginRight: 10 }}
                          onClick={() => {
                            setEditCollectionId(collection.collectionId);
                            setTitle(collection.title);
                          }}
                        />
                        {/* <i
                          className="fa-solid fa-share"
                          style={{ color: "blue", cursor: "pointer" }} 
                          onClick={() =>
                            showShareConfirmation(collection.collectionId)
                          } 
                        /> */}
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
                className="TextareaNote"
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </form>
          </li>
          <li className="nav__items">
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
    </div>
  );
};

export default Sidebar;
