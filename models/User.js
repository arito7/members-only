const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { first: { type: String }, last: { type: String } },
  username: { type: String, minlength: 5, required: true, lowercase: true },
  hash: { type: String, required: true },
  salt: { type: String, required: true },
  membershipStatus: { type: String, default: 'regular' },
});

UserSchema.virtual('full_name').get(function () {
  return `${this.name.first} ${this.name.last}`;
});
module.exports = mongoose.model('User', UserSchema);
