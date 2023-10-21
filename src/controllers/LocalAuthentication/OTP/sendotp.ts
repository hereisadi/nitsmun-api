import { Request, Response } from "express";
import { sendEmail } from "../../../utils/EmailService";
import { OTP } from "../../../models/localAuthentication/OTP/otpmodel";

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || !/@/.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    sendEmail(email, "OTP for SignUp", `Your OTP is ${otp}`);

    await OTP.findOneAndUpdate({ email }, { otp }, { upsert: true });

    res.status(200).json({
      message: "OTP sent successfully",
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Something went wrong on the server side",
    });
  }
};
