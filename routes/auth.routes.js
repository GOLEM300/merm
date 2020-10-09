const { Router } = require("express");
const config = require("config");
const bcrypt = require("bcrypt");
const User = require("../modals/user");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const router = Router();

// /api/auth/register
router.post(
  "/register",
  [
    check("email", "email wrong").isEmail(),
    check("password", "uncorrect password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ errors: errors.array(), message: "uncorrect data" });
      }

      const { email, password } = req.body;

      const candidate = await User.findOne({ email });

      if (candidate) {
        return res.status(400).json({ message: "user exist" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({ email, password: hashedPassword });

      await user.save();

      res.status(201).json({ message: "user was created" });
    } catch (e) {
      res.status(500).json({ message: "something wrong here" });
    }
  }
);

// /api/auth/login
router.post(
  "/login",
  [
    check("email", "uncorrect email").isEmail(),
    check("password", "uncorrect password").exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: errors.array(),
          message: "uncorrect data while into to system",
        });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ message: "user was not found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "password wrong try again" });
      }

      const token = jwt.sign({ userId: user.id }, config.get("jwtSecret"), {
        expiresIn: "1h",
      });

      res.json({ token, userId: user.id });
    } catch (e) {
      res.status(500).json({ message: "something wrong" });
    }
  }
);

module.exports = router;
