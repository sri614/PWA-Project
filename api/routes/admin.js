const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const nodemailer = require('nodemailer');
const User = require('../models/User');



const hubHeader = {
    "headers":{
        'Authorization': `Bearer ${process.env.HUBSPOT_TOKEN}`
    }
}

router.get('/',(req,res)=>{
    res.send('admin - success')
})
const generateUID = (length = 16)=>{
    return crypto.randomBytes(length).toString('hex');
}
const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

const getPropertyOptions = async () => {
    try {
        const fetchProperty = await axios.get('https://api.hubapi.com/crm/v3/properties/contacts/sales_representative',hubHeader);
        console.log(fetchProperty.data);
        return fetchProperty.data.options;
    } catch (error) {
         console.log(error);
         throw error;
    }
}
const updateHubSpotProperties = async (options) => {
    console.log("final options ", options);
    const payload = {
        "options":options
    }
    try {
        const updateContactProperty = await axios.patch('https://api.hubapi.com/crm/v3/properties/contacts/sales_representative',payload,hubHeader);
        console.log("contact property updated", updateContactProperty.data)
        const updateDealProperty = await axios.patch('https://api.hubapi.com/crm/v3/properties/deals/sales_representative',payload,hubHeader);
        console.log("deal property updated", updateDealProperty.data)
        return true;
    } catch (error) {
        console.log("Error updating property", error)
    }
}
router.post('/create',async(req,res)=>{
    const {email,name,company_name,phone} = req.body;
    if(!email || !name ){
        res.status(400).json({"msg":"One of the required fields are missing (email and name)"})
    }
    if(!isValidEmail(email)){
        res.status(400).json({"msg":"Email is not valid"})
    }
    const options = await getPropertyOptions();
    const UID = await generateUID();
    const createNewUser = new User({
        email,
        name,
        company_name,
        phone,
        "user_id": UID
    });
    const newOption = {
        label: `${name} (${email})`,
        value: UID,
        hidden: false
    }
    options.push(newOption)
    await updateHubSpotProperties(options);
    await createNewUser.save();
    res.status(200).json(createNewUser);
})

router.get('/users',async(req,res)=>{
    const getUsers = await User.find();
    res.json({users:getUsers})
})

function generateOTP() {
return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(recipientEmail, res) {
try {
    const user = await User.findOne({ email: recipientEmail });

    if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if OTP is already sent and not expired
    if (user.otp && user.otp_expiry && new Date(user.otp_expiry) > new Date()) {
    return res.status(429).json({
        success: false,
        message: "OTP already sent. Please wait before requesting again.",
    });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otp_expiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

    // Send email
    let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "ma.bo@blu-edge.ai",
        pass: "zovs jiod krlm znhu",
    },
    });

    const mailOptions = {
    from: '"Saleslite" <ma.bo@blu-edge.ai>',
    to: recipientEmail,
    subject: "Your OTP Code",
    text: `Your verification code is ${otp}`,
    html: `<p>Your verification code is <strong>${otp}</strong>. It is valid for 2 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);
    await User.updateOne({ email: recipientEmail }, { $set: { otp, otp_expiry } });

    return res.status(200).json({ success: true, message: "OTP sent successfully" });

} catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
}
}

router.post('/send-otp',async(req,res)=>{
    const {email} = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
      }
    await sendOTPEmail(email,res);
})

router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Email and OTP are required',
    });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });


    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const now = new Date();
    const expiry = new Date(user.otp_expiry);

    if (
      user.otp !== Number(otp) ||
      !user.otp_expiry ||
      expiry < now
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // OTP is valid — update user
    user.otp = null;
    user.otp_expiry = null;
    user.otp_status = 'Verified';
    user.last_login = now;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
    });

  } catch (error) {
    console.error('Error in /verify-otp:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router