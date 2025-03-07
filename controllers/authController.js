const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


exports.user_register = async (req, res) => {
  try {
    const { username, email, password, isAdmin } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (!isMatch)
        return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign(
        { id: existingUser._id, isAdmin: existingUser.isAdmin },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
      );

      return res.json({
        message: "User already exists, logged in successfully",
        token,
        user: {
          id: existingUser._id,
          username: existingUser.username,
          email: existingUser.email,
          isAdmin: existingUser.isAdmin,
        },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false,
    });

    await newUser.save();
    
    return res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.user_login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
