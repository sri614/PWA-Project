const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  engagementType: String, // TASK
  contactId: String,
  dealId: String,
  title: String,
  dueDate: Date,
  description: String,
  user_id: String,
  hubspotId: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);