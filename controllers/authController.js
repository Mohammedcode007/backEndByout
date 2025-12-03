const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// Register
const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // التحقق من وجود الإيميل
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // التحقق من وجود رقم الهاتف
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({ message: 'Phone number already used' });
    }

    const user = await User.create({ name, email, phone, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      token: generateToken(user._id)
    });
  } catch (err) {
    next(err);
  }
};

// Login
const authUser = async (req, res, next) => {
  try {
    console.log("=== Login Request Received ===");
    console.log("Request Body:", req.body);

    const { email, password } = req.body;

    console.log("Email Received:", email);
    console.log("Password Received:", password);

    // البحث عن المستخدم
    const user = await User.findOne({ email });
    console.log("User Found:", user ? "YES" : "NO");

    if (!user) {
      console.log("Login Failed: Email not found");
      return res.status(401).json({ message: "Invalid email or password (email)" });
    }

    // التأكد من كلمة المرور
    const isMatch = await user.matchPassword(password);
    console.log("Password Match:", isMatch ? "YES" : "NO");

    if (!isMatch) {
      console.log("Login Failed: Wrong password");
      return res.status(401).json({ message: "Invalid email or password (password)" });
    }

    // إذا تم النجاح
    console.log("Login Successful for user:", user.email);

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      token: generateToken(user._id)
    });

  } catch (err) {
    console.error("Login Error:", err);
    next(err);
  }
};

// Update User Profile
const updateUser = async (req, res, next) => {
  try {
    const userId = req.user._id; // يجب أن تكون Middleware JWT قد أضافت req.user
    const { name, phone, oldPassword, newPassword } = req.body;

    console.log("=== Update Profile Request ===");
    console.log("Request Body:", req.body);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // تعديل الاسم
    if (name) {
      user.name = name;
    }

    // تعديل رقم الهاتف
    if (phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists && phoneExists._id.toString() !== userId.toString()) {
        return res.status(400).json({ message: "Phone number already used" });
      }
      user.phone = phone;
    }

    // تعديل كلمة المرور
    if (oldPassword && newPassword) {
      const isMatch = await user.matchPassword(oldPassword);
      console.log("Old Password Match:", isMatch ? "YES" : "NO");

      if (!isMatch) {
        return res.status(401).json({ message: "Old password incorrect" });
      }

      user.password = newPassword; // سيتم عمل hash تلقائي في pre-save hook
    }

    await user.save();

    console.log("Profile Updated Successfully");

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      token: generateToken(user._id)
    });

  } catch (err) {
    console.error("Update User Error:", err);
    next(err);
  }
};

module.exports = { registerUser, authUser,updateUser };
