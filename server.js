import dotenv from "dotenv";
dotenv.config();
// console.log("PORT:", process.env.PORT);
// console.log("MONGO_URI:", process.env.MONGO_URI);
// console.log("FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);
// console.log("FIREBASE_CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL);
// Avoid printing private keys in production!
console.log("FIREBASE_PRIVATE_KEY exists:", !!process.env.FIREBASE_PRIVATE_KEY);
import app from "./app.js";
import connectDB from "./config/db.js";



const PORT = process.env.PORT;


connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
