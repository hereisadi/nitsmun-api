import mongoose from "mongoose";
import { CError, CSuccess } from "../utils/ChalkCustomStyles";
import dotEnv from "dotenv";
dotEnv.config();
const connectToDb = async () => {
  try {
    const mongodbUrl = process.env.MONGODB_URL;

    if (!mongodbUrl) {
      throw new Error("MONGODB_URL environment variable is not defined");
    }

    await mongoose.connect(mongodbUrl);

    CSuccess("MongoDB database connected successfully");
  } catch (error) {
    CError(
      `Establishing connection to the database encountered an error: ${error}`
    );
  }
};

export default connectToDb;
