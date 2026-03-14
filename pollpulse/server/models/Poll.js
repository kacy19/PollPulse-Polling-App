const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
  question:  { type: String, required: true, trim: true },
  options: [{
    text:  { type: String, required: true },
    votes: { type: Number, default: 0 }
  }],
  creator:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  voters:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  expiresAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Poll', PollSchema);
