
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NotesList from './components/NotesList';
import NoteForm from './components/NoteForm';

function App() {
  const [notes, setNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);

  const fetchNotes = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/notes`);
    setNotes(res.data);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div>
      <h1>Notes App</h1>
      <NoteForm fetchNotes={fetchNotes} editingNote={editingNote} setEditingNote={setEditingNote} />
      <NotesList notes={notes} fetchNotes={fetchNotes} setEditingNote={setEditingNote} />
    </div>
  );
}

export default App;
