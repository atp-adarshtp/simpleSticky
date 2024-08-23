import React, { useState, useEffect } from "react";
import axios from "axios";
import Draggable from "react-draggable";
import Sidebar from "../SideBar/Sidebar";
import "./Dashboard.css";
import config from "../../config";

function Dashboard() {
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const axiosConfig = {
    headers: {
      "x-api-key": "your-secret-api-key",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  const fetchNotes = async (collectionId) => {
    try {
      const response = await axios.get(
        `${config.REACT_APP_LOCAL_COLLECTIONS_URL}/${collectionId}/notes`,
        axiosConfig
      );
      setNotes(response.data);
    } catch (error) {
      console.error(
        "Error fetching notes:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleCollectionClick = (collectionId) => {
    setSelectedCollectionId(collectionId);
    fetchNotes(collectionId);
  };

  const handleDoubleClick = async (e) => {
    if (selectedCollectionId) {
      const x = e.clientX;
      const y = e.clientY;
      setMousePosition({ x, y });
      try {
        const response = await axios.post(
          `${config.REACT_APP_LOCAL_COLLECTIONS_URL}/${selectedCollectionId}/notes`,
          { content: "", x, y },
          axiosConfig
        );
        setNotes((prevNotes) => [...prevNotes, response.data]);
      } catch (error) {
        console.error(
          "Error adding note:",
          error.response ? error.response.data : error.message
        );
      }
    }
  };

  const handleEditNote = (noteId, currentContent) => {
    setEditingNoteId(noteId);
    setEditingContent(currentContent);
  };

  const handleDeleteNote = async (noteId) => {
    if (selectedCollectionId && noteId) {
      try {
        await axios.delete(
          `${config.REACT_APP_LOCAL_NOTE_EDIT_URL}/${selectedCollectionId}/notes/${noteId}`,
          axiosConfig
        );
        setNotes((prevNotes) =>
          prevNotes.filter((note) => note.noteId !== noteId)
        );
      } catch (error) {
        console.error(
          "Error deleting note:",
          error.response ? error.response.data : error.message
        );
      }
    }
  };

  const handleDragStop = async (e, data, noteId) => {
    try {
      await axios.put(
        `${config.REACT_APP_LOCAL_NOTE_EDIT_URL}/${selectedCollectionId}/notes/${noteId}`,
        { x: data.x, y: data.y },
        axiosConfig
      );
    } catch (error) {
      console.error(
        "Error updating note position:",
        error.response ? error.response.data : error.message
      );
    }
  };

  useEffect(() => {
    if (editingNoteId) {
      const autoSave = setTimeout(async () => {
        try {
          const response = await axios.put(
            `${config.REACT_APP_LOCAL_NOTE_EDIT_URL}/${selectedCollectionId}/notes/${editingNoteId}`,
            { content: editingContent },
            axiosConfig
          );

          setNotes((prevNotes) =>
            prevNotes.map((note) =>
              note.noteId === editingNoteId
                ? { ...note, content: response.data.content }
                : note
            )
          );
        } catch (error) {
          console.error(
            "Error saving edited note:",
            error.response ? error.response.data : error.message
          );
        }
      }, 1000);

      return () => clearTimeout(autoSave);
    }
  }, [editingContent, editingNoteId, selectedCollectionId]);

  return (
    <div className="DashboardBody1">
          <Sidebar onCollectionClick={handleCollectionClick} />
      <div className="DashboardBody" onDoubleClick={handleDoubleClick}>
      {/* <h style={{ textAlign: "right" }}>{name}</h> */}
        <div className="notes-section">
          {selectedCollectionId && (
            <div>
              <div className="sticky-notes-body">
                <div className="sticky-notes">
                  {notes.length === 0 ? (
                    <div className="empty-state">No notes available</div>
                  ) : (
                    notes.map((note) => (
                      <Draggable
                        key={note.noteId}
                        defaultPosition={{ x: note.x || 0, y: note.y || 0 }}
                        onStop={(e, data) =>
                          handleDragStop(e, data, note.noteId)
                        }
                      >
                        <div className="note-container">
                          {editingNoteId === note.noteId ? (
                            <div className="edit-note-container">
                              <i
                                className="fa fa-remove"
                                onClick={() => handleDeleteNote(note.noteId)}
                                style={{
                                  fontSize: "10px",
                                  color: "red",
                                  position: "absolute",
                                  top: "5px",
                                  right: "5px",
                                  cursor: "pointer",
                                }}
                              ></i>
                              <textarea
                                className="edit-note-textarea"
                                placeholder="New Note"
                                value={editingContent}
                                onChange={(e) =>
                                  setEditingContent(e.target.value)
                                }
                                required
                                style={{ paddingRight: "20px" }}
                              />
                            </div>
                          ) : (
                            <div
                              className="note-content"
                              onClick={() =>
                                handleEditNote(note.noteId, note.content)
                              }
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                }}
                              >
                                <i
                                  className="fa fa-remove"
                                  onClick={() => handleDeleteNote(note.noteId)}
                                  style={{
                                    fontSize: "10px",
                                    color: "red",
                                    position: "absolute",
                                    top: "5px",
                                    right: "5px",
                                    cursor: "pointer",
                                  }}
                                ></i>
                              </div>
                              <div>
                                <textarea
                                  className="set-note-textarea"
                                  style={{ paddingRight: "20px" }}
                                  placeholder="New Note"
                                >
                                  {note.content}
                                </textarea>
                              </div>
                            </div>
                          )}
                        </div>
                      </Draggable>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
