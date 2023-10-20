import mongoose, { Document } from "mongoose";

type UserDocument = Document & {
  name: string;
  email: string;
  password: string;
  role: string;
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
});

export const User = mongoose.model<UserDocument>(
  "localAuthenticationSignup",
  userSchema
);
