const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: Number
  },
  otp:{
    type: Number
  },
  otp_expiry:{
    type: Date
  },
  company_name: {
    type: String
  },
  user_id: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  last_login: {
    type: Date
  },
  otp_status: {
    type: String,
    enum: ['Verified', 'Not Verified'],
    default: 'Not Verified'
  },
});

// export model user with UserSchema
module.exports = mongoose.model("user", UserSchema);