import mongoose, { Document } from "mongoose";

type UserDocument = Document & {
  name: string;
  email: string;
  password: string;
  role: string;
  deleteAccount: string;
};

const userSchema = new mongoose.Schema<UserDocument>({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    required: true,
    default: "client",
  },
  password: {
    type: String,
    required: true,
  },
  deleteAccount: {
    type: String,
    default: "no",
  },
});

export const User = mongoose.model<UserDocument>(
  "localAuthenticationSignup",
  userSchema
);
