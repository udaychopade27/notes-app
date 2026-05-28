import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NotesList from './components/NotesList';
import NoteForm from './components/NoteForm';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function App() {
  const [notes, setNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);

  const fetchNotes = async () => {
    try {
      const res = await axios.get(`${API_URL}/notes`);
      console.log(res.data);

      if (Array.isArray(res.data)) {
        setNotes(res.data);
      } else {
        console.error("API did not return array:", res.data);
        setNotes([]);
      }

    } catch (error) {
      console.error("Error fetching notes:", error);
      setNotes([]);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div>
      <h1>Notes App</h1>

      <NoteForm
        fetchNotes={fetchNotes}
        editingNote={editingNote}
        setEditingNote={setEditingNote}
      />

      <NotesList
        notes={notes}
        fetchNotes={fetchNotes}
        setEditingNote={setEditingNote}
      />
    </div>
  );
}

export default App;