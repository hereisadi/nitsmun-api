import mongoose, { Document } from "mongoose";

type UserDocument = Document & {
  college: string;
  scholarid: string;
  batch: string;
  payment: string;
  name: string;
  email: string;
};

const ypSchema = new mongoose.Schema<UserDocument>({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  scholarid: {
    type: String,
    required: true,
  },
  batch: {
    type: String,
    required: true,
  },
  college: {
    type: String,
    required: true,
  },
  payment: {
    type: String,
    required: true,
  },
});

export const yp = mongoose.model<UserDocument>("ypRegistrations", ypSchema);
