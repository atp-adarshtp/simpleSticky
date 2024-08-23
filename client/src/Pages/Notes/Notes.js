// import React, { useState } from "react";
// import axios from "axios";
// import Sidebar from "../SideBar/Sidebar";
// import "./Dashboard.css";
// import config from "../../config";

// function Dashboard() {
//   const [selectedCollectionId, setSelectedCollectionId] = useState(null);
//   const [notes, setNotes] = useState([]);
//   const [content, setContent] = useState("");

//   const handleCollectionClick = async (collectionId) => {
//     setSelectedCollectionId(collectionId);
//     const token = localStorage.getItem("token");
//       try {
//         const response = await axios.get(
//           `${config.REACT_APP_LOCAL_COLLECTIONS_URL}/${collectionId}/notes`,
//           {
//             headers: {
//               "x-api-key": "your-secret-api-key",
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         setNotes(response.data);
//       } catch (localError) {
//         console.error(
//           "Error fetching notes with local URL:",
//           localError.response ? localError.response.data : localError.message
//         );
//       }
    
//   };

//   const handleAddNote = async (e) => {
//     e.preventDefault();
//     const token = localStorage.getItem("token");
//       try {
//         const response = await axios.post(
//           `${config.REACT_APP_LOCAL_COLLECTIONS_URL}/${selectedCollectionId}/notes`,
//           {
//             content,
//           },
//           {
//             headers: {
//               "x-api-key": "your-secret-api-key",
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         setNotes([...notes, response.data]);
//         setContent("");
//       } catch (localError) {
//         console.error(
//           "Error adding note with local URL:",
//           localError.response ? localError.response.data : localError.message
//         );
//       }
    
//   };

//   return (
//     <div className="DashboardBody">
//       <div className="notes-section">
//         <Sidebar onCollectionClick={handleCollectionClick} />
//         {selectedCollectionId && (
//           <div>
//             <div className="sticky-notes-body">
//               <div className="sticky-notes">
//               <div className="create-note">
//                 <form onSubmit={handleAddNote}>
//               <input
//                     type="text"
//                     placeholder="Add a note"
//                     value={content}
//                     onChange={(e) => setContent(e.target.value)}
//                     required
//                   />
//                 <button type="submit">Add Note</button>
//               </form>
//                 </div>
//                 {notes.map((note) => (
//                   <div className="note-container" key={note.noteId}>
//                     <div className="note-content">{note.content}</div>
//                     <div className="note-actions">
//                     <div
//                         className="note-sidebar">
//                         +
//                       </div>
//                     </div>
//                   </div>
//                 ))}              
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Dashboard;