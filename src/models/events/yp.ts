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
  previousMunExperience: string;
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
  college: {
    type: String,
    required: true,
  },

  // for nits guys only starts here
  scholarid: {
    type: String,
  },
  batch: {
    type: String,
  },
  // for nits guys only ends here

  previousMunExperience: {
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

ypSchema.index({ eventName: 1, email: 1 }, { unique: true });

export const yp = mongoose.model<UserDocument>("ypRegistrations", ypSchema);
