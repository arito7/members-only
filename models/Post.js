const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, required: true, length: { min: 3 } },
  timestamp: { type: Date, default: Date.now() },
  body: { type: String, required: true, length: { min: 3, max: 200 } },
  creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Post', PostSchema);
