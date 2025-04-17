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
    userName: {
      type: String,
      required: false,
    },
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._-]+@qodeleaf\.com$/,
        "Email must be a valid @qodeleaf.com address",
      ],
    },
    password: {
      type: String,
      required: function () {
        return this.provider === "credentials";
      },
      minlength: [8, "Password must be at least 8 characters long"],
    },
    provider: {
      type: String,
      enum: ["credentials", "google", "github"],
      required: true,
    },
    image: {
      type: String,
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
