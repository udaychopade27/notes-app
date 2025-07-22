
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const notesRoutes = require('./routes/notes');

const app = express();
app.use(cors());
app.use(express.json());
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/notesapp';
mongoose.connect(`${MONGO_URI}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/notes', notesRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
