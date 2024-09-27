const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true }, 
  subscriptionStatus: { type: String, default: 'inactive' },
  subscriptionEnd: { type: Date },
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
