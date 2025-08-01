
import React from 'react';
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/notes';
function NotesList({ notes, fetchNotes, setEditingNote }) {
  const deleteNote = async (id) => {
    await axios.delete(`${API_URL}/notes/${id}`);
    fetchNotes();
  };

  return (
    <div>
      {notes.map(note => (
        <div key={note._id}>
          <h3>{note.title}</h3>
          <p>{note.content}</p>
          <small>{new Date(note.createdAt).toLocaleString()}</small>
          <br/>
          <button onClick={() => setEditingNote(note)}>Edit</button>
          <button onClick={() => deleteNote(note._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default NotesList;
