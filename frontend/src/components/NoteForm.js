import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

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

    try {

      if (editingNote) {

        await axios.put(
          `${API_URL}/notes/${editingNote._id}`,
          { title, content }
        );

        setEditingNote(null);

      } else {

        await axios.post(
          `${API_URL}/notes`,
          { title, content }
        );
      }

      setTitle('');
      setContent('');

      fetchNotes();

    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>

      <input
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />

      <textarea
        placeholder="Content"
        value={content}
        onChange={e => setContent(e.target.value)}
        required
      />

      <button type="submit">
        {editingNote ? 'Update' : 'Add'} Note
      </button>

    </form>
  );
}

export default NoteForm;