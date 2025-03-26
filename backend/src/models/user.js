import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    walletAddresses: {
      type: [String],
      default: [],
    },
    isWhitelistedAddresses: {
      type: [String],
      default: [],
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: [8, "Password must be at least 8 characters long"],
    },
    borrowedAmount: {
      type: Number,
      default: 0,
    },
    lastBorrowedTimestamp: {
      type: Date,
    },
    lentAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
