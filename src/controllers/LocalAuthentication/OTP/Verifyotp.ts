import { Request, Response } from "express";
import { OTP } from "../../../models/localAuthentication/OTP/otpmodel";

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const enteredOtp = req.body.otp.toString().trim(); // client should send otp as payload
    const email = req.body.email; // client should send email as payload

    const generatedOtpData = await OTP.findOne({ email }).exec();
    const generatedOtp = generatedOtpData?.otp.toString().trim();

    if (!enteredOtp) {
      return res.status(400).json({
        error: "No otp provided from client",
      });
    }

    if (!generatedOtp) {
      return res.status(400).json({
        error: "OTP not found for this email",
      });
    }

    if (enteredOtp !== generatedOtp) {
      return res.status(400).json({
        error: "OTP does not match",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "OTP and email verified successfully",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Something went wrong on the server side",
    });
  }
};
