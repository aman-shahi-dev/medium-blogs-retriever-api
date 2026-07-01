import mongoose from "mongoose";
import { Post } from "../models/Post.js";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected Successfully ✅");

    // Wiping the entire database once to clear out legacy schemas and apply unique postId indexes cleanly
    await Post.deleteMany({});
    console.log("🧹 Database Wiped: Legacy entries cleared to apply new schema index.");
  } catch (error) {
    console.error("Error while connecting to MongoDB ❌", error.message);
    process.exit(1);
  }
}
