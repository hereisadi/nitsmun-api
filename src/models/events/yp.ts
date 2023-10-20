import mongoose, { Document } from "mongoose";
import moment from "moment-timezone";

type UserDocument = Document & {
  college: string;
  scholarid: string;
  batch: string;
  payment: string;
  name: string;
  email: string;
  regsiteredat: string;
  status: string;
  cofirmedRegistrationAt: string;
  eventName: string;
};

const ypSchema = new mongoose.Schema<UserDocument>({
  eventName: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: false,
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
  regsiteredat: {
    type: String,
    default: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
    required: true,
  },
  status: {
    type: String,
    default: "pending",
    required: true,
  },
  cofirmedRegistrationAt: {
    type: String,
  },
});

export const yp = mongoose.model<UserDocument>("ypRegistrations", ypSchema);
