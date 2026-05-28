import React from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function NotesList({ notes, fetchNotes, setEditingNote }) {

  const deleteNote = async (id) => {

    try {

      await axios.delete(`${API_URL}/notes/${id}`);
      fetchNotes();

    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  if (!Array.isArray(notes)) {
    return <p>Invalid notes data</p>;
  }

  return (
    <div>

      {notes.length === 0 ? (
        <p>No notes found</p>
      ) : (
        notes.map(note => (

          <div key={note._id}>

            <h3>{note.title}</h3>

            <p>{note.content}</p>

            <small>
              {new Date(note.createdAt).toLocaleString()}
            </small>

            <br />

            <button onClick={() => setEditingNote(note)}>
              Edit
            </button>

            <button onClick={() => deleteNote(note._id)}>
              Delete
            </button>

          </div>
        ))
      )}

    </div>
  );
}

export default NotesList;