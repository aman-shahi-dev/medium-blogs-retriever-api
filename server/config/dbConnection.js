import mongoose from "mongoose";
import { Post } from "../models/Post.js";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected Successfully ✅");=
  } catch (error) {
    console.error("Error while connecting to MongoDB ❌", error.message);
    process.exit(1);
  }
}
