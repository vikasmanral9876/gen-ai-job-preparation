const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @name registerUserController
 * @description Register a new user, expects username, email and password in the request body
 * @access Public
 */

async function registerUserController(req, res) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({
      message: "Please provide username, email and password",
    });
  }

  const isUserAlreadyExists = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (isUserAlreadyExists) {
    return res.status(404).json({
      message: "Account already exists with this email address or username",
    });
  }
  const hash = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    username,
    email,
    password: hash,
    isFirstLogin: true,
    loginCount: 1,
  });

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  res.cookie("token", token);

  res.status(201).json({
    message: "User registered successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      isFirstLogin: true,
      loginCount: 1,
    },
  });
}

/**
 * @name loginUserController
 * @description login a new user, expects email and password in the request body
 * @access Public
 */

async function loginUserController(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(404).json({
      message: "Invalid email or password",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(404).json({
      message: "Invalid email or password",
    });
  }

  // Returning user logging in: increment login count and mark isFirstLogin as false
  const count = typeof user.loginCount === "number" ? user.loginCount : 1;
  user.loginCount = count + 1;
  user.isFirstLogin = false;
  await user.save();

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  res.cookie("token", token);
  res.status(200).json({
    message: "User loggedIn successfully.",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar || null,
      isFirstLogin: false,
      loginCount: user.loginCount,
    },
  });
}

/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist 
 * @access Public
 */
async function logoutUserController(req, res) {
  const token = req.cookies.token

  if (token) {
    await tokenBlacklistModel.create({ token })
  }
  res.clearCookie("token")

  res.status(200).json({
    message: "User logged out successfully"
  })
}

/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access Public
 */
async function getMeController(req, res) {
  const user = await userModel.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  const isFirst =
    typeof user.isFirstLogin === "boolean"
      ? user.isFirstLogin
      : typeof user.loginCount === "number"
      ? user.loginCount <= 1
      : true;

  res.status(200).json({
    message: "User detail fetched successfully.",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar || null,
      isFirstLogin: isFirst,
      loginCount: user.loginCount || 1,
    },
  });
}

/**
 * @name googleAuthController
 * @description Verify Google ID token and login or create user
 * @access Public
 */
async function googleAuthController(req, res) {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({
      message: "Google ID token is required.",
    });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({
        message: "Invalid Google token payload.",
      });
    }

    const { sub: googleId, email, name, picture } = payload;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Look for existing user by googleId or email
    let user = await userModel.findOne({
      $or: [{ googleId }, { email: normalizedEmail }],
    });

    let isFirstTime = false;

    if (user) {
      // If user exists by email but googleId was not yet linked, link it
      let needsSave = false;
      if (!user.googleId) {
        user.googleId = googleId;
        needsSave = true;
      }
      if (!user.avatar && picture) {
        user.avatar = picture;
        needsSave = true;
      }

      // Check if user has already logged in before
      const count = typeof user.loginCount === "number" ? user.loginCount : 1;
      user.loginCount = count + 1;
      user.isFirstLogin = false;
      needsSave = true;

      if (needsSave) {
        await user.save();
      }
      isFirstTime = false;
    } else {
      // 2. New user: determine unique username
      let candidateUsername = name ? name.trim() : normalizedEmail.split("@")[0];
      const existingUsername = await userModel.findOne({ username: candidateUsername });
      if (existingUsername) {
        candidateUsername = `${candidateUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
      }

      user = await userModel.create({
        username: candidateUsername,
        email: normalizedEmail,
        googleId,
        avatar: picture || null,
        isFirstLogin: true,
        loginCount: 1,
      });
      isFirstTime = true;
    }

    // 3. Generate standard HirePilot JWT
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token);

    return res.status(200).json({
      message: "Google login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar || null,
        isFirstLogin: isFirstTime,
        loginCount: user.loginCount || 1,
      },
    });
  } catch (error) {
    console.error("Google auth verification failed:", error);
    return res.status(401).json({
      message: "Google authentication failed. Invalid or expired token.",
    });
  }
}

module.exports = {
  registerUserController,
  loginUserController,
  logoutUserController,
  getMeController,
  googleAuthController,
};
