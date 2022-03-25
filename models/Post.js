const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, required: true, length: { min: 3 } },
  timestamp: { type: Date, default: Date.now() },
  body: { type: String, required: true, length: { min: 3, max: 200 } },
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

PostSchema.virtual('formatted_date').get(function () {
  return new Date(this.timestamp).toLocaleDateString();
});

module.exports = mongoose.model('Post', PostSchema);
