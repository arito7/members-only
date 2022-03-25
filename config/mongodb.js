require('dotenv').config();
const mongoose = require('mongoose');

const mongodburi = process.env.MONGODB_URI;
const mongodboptions = { useUnifiedTopology: true, useNewUrlParser: true };
mongoose.connect(mongodburi, mongodboptions);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'mongo connection error'));
