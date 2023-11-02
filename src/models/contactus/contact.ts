import mongoose, { Document } from "mongoose";

type UserDocument = Document & {
  name: string;
  email: string;
  message: string;
  contactedAt: string;
};

const contactUsSchema = new mongoose.Schema<UserDocument>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  contactedAt: {
    type: String,
  },
});

export const conatctus = mongoose.model<UserDocument>(
  "contact us resposnes",
  contactUsSchema
);
