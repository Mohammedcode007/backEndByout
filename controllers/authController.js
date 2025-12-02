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
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && await user.matchPassword(password)) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        token: generateToken(user._id)
      });
    }

    res.status(401).json({ message: 'Invalid email or password' });

  } catch (err) {
    next(err);
  }
};

module.exports = { registerUser, authUser };
