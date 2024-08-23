import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Sidebar.css";
import config from "../../config";

const Sidebar = ({ onCollectionClick }) => {
  const [title, setTitle] = useState("");
  const [collections, setCollections] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [editCollectionId, setEditCollectionId] = useState(null);

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
      setCollections([...collections, response.data]);
      setTitle("");
    } catch (error) {
      console.error(
        "Error creating collection:",
        error.response ? error.response.data : error.message
      );
    }
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
              {collections.map((collection) => (
                <li key={collection.collectionId} className="stickyNote">
                  <div
                    onClick={() => onCollectionClick(collection.collectionId)}
                  >
                    {collection.title}
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
                        <i
                          className="fa fa-edit"
                          onClick={() => {
                            setEditCollectionId(collection.collectionId);
                            setTitle(collection.title);
                          }}
                        />
                        <i
                          className="fa fa-remove"
                          style={{ color: "red" }}
                          onClick={() =>
                            handleDeleteCollection(collection.collectionId)
                          }
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
                className="TextareaNote"
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              {/* <button type="submit">Create Collection</button> */}
            </form>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
