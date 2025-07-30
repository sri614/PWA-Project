const User = require('../models/User'); // Adjust path as needed

async function validateUserId(req, res, next) {
  const userId = req.headers['x-api-key'];
  console.log("user id ",userId)

  if (!userId) {
    return res.status(401).json({ success: false, message: "Missing x-api-key header" });
  }

  try {
    const user = await User.findOne({"user_id":userId});
    console.log(user)
    if (!user) {
      return res.status(403).json({ success: false, message: "Invalid API key or user not found" });
    }

    // Attach user object for use in route if needed
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error validating user ID" });
  }
}

module.exports = validateUserId;
