// controllers/userController.js

// مثال وظيفة بسيطة: إرجاع كل المستخدمين
const getUsers = async (req, res, next) => {
  try {
    res.json({ message: "Protected route works!" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers };
