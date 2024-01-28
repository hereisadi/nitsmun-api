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
  photo: string;
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
  },
  isStudentOfNITS: {
    type: Boolean,
    required: true,
  },
  // only for NITS student
  instituteEmail: {
    type: String,
  },
  scholarID: {
    type: String,
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
  photo: {
    type: String,
    default:
      "https://res.cloudinary.com/dlx4meooj/image/upload/v1702566250/user_1_hntf9t.jpg?_s=public-apps",
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

userSchema.index({ email: 1 }, { unique: true });

export const User = mongoose.model<UserDocument>(
  "localAuthenticationSignup",
  userSchema
);
