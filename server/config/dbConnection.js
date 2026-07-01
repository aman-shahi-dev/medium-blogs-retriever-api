import mongoose from "mongoose";
import { Post } from "../models/Post.js";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected Successfully ✅");

    // Clean up any legacy duplicate entries that contain query parameters in their links
    const cleanupResult = await Post.deleteMany({ link: { $regex: /\?/ } });
    if (cleanupResult.deletedCount > 0) {
      console.log(`🧹 Database Cleanup: Removed ${cleanupResult.deletedCount} legacy duplicate entries.`);
    }
  } catch (error) {
    console.error("Error while connecting to MongoDB ❌", error.message);
    process.exit(1);
  }
}
