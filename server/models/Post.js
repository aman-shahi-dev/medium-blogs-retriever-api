import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
    },
    link: {
      type: String,
      unique: true,
      required: true,
    },
    pubDate: {
      type: Date,
    },
    author: {
      type: String,
    },
    categories: {
      type: [String],
    },
    excerpt: {
      type: String,
    },
    thumbnail: {
      type: String,
    },
    content: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

postSchema.index({
  username: 1,
  pubDate: -1,
});

export const Post = mongoose.model("Post", postSchema);
