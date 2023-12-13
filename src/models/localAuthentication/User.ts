import mongoose, { Document } from "mongoose";

type UserDocument = Document & {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  deleteAccount: string;
  token: string | undefined;
  tokenExpiresAt: string | undefined;
  isVerified: boolean;
  isStudentOfNITS: boolean;
  instituteEmail: string;
  branch: string;
  scholarID: string;
  year: string;
};

const userSchema = new mongoose.Schema<UserDocument>({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  isStudentOfNITS: {
    type: Boolean,
    required: true,
  },
  // only for NITS student
  instituteEmail: {
    type: String,
    unique: true,
  },
  scholarID: {
    type: String,
    unique: true,
  },
  branch: {
    type: String,
  },
  year: {
    type: String,
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
  token: {
    type: String,
    default: undefined,
  },
  tokenExpiresAt: {
    type: String,
    default: undefined,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

export const User = mongoose.model<UserDocument>(
  "localAuthenticationSignup",
  userSchema
);
