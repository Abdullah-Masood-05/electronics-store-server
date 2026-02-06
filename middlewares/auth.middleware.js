import admin from "../config/firebase.js";
import User from "../models/User.js";

export const authCheck = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decodedUser = await admin.auth().verifyIdToken(token);

    const user = await User.findOne({ firebaseUid: decodedUser.uid });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
