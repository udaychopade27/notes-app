
import React, { useState, useEffect } from 'react';
import axios from 'axios';
/* The line `const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/notes';` is
setting the API URL for the application. */
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/notes';
function NoteForm({ fetchNotes, editingNote, setEditingNote }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
    }
  }, [editingNote]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingNote) {
      await axios.put(`${API_URL}/${editingNote._id}`, { title, content });
      setEditingNote(null);
    } else {
      await axios.post(`${API_URL}`, { title, content });
    }
    setTitle('');
    setContent('');
    fetchNotes();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
      <textarea placeholder="Content" value={content} onChange={e => setContent(e.target.value)} required />
      <button type="submit">{editingNote ? 'Update' : 'Add'} Note</button>
    </form>
  );
}

export default NoteForm;
