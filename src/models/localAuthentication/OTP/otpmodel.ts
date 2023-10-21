import mongoose, { Document } from "mongoose";

type OTPDocument = Document & {
  email: string;
  otp: string;
};

const OTPSchema = new mongoose.Schema<OTPDocument>({
  otp: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

export const OTP = mongoose.model<OTPDocument>("SignupOTP", OTPSchema);
