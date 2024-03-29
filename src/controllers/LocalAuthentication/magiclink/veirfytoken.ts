import { Request, Response } from "express";
import { User } from "../../../models/localAuthentication/User";
import moment from "moment-timezone";
import { sendEmail } from "../../../utils/EmailService";

// access: public
// method: PUT
// payload : token as string
// endpoint: /verifytoken

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params as { token: string };
    if (!token) {
      return res.status(400).json({ error: "Token is missing" });
    }

    const user = await User.findOne({
      token,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isVerified === true) {
      return res.status(400).json({ error: "email already verified" });
    }
    // console.log(user)

    // const tokenExpiresAt = user.tokenExpiresAt as string;
    // const currentTime = moment
    //   .tz("Asia/Kolkata")
    //   .format("DD-MM-YY h:mma") as string;

    user.isVerified = true;
    user.token = undefined;
    user.tokenExpiresAt = undefined;
    await user.save();
    sendEmail(
      user.email,
      "[NITSMUN] Email Verified",
      `Hi ${user.name},\nYour email has been Verified, and now you can register for the Annual Conference 2024.\n\n https://nitsmun.in/applynow\n\n\nFor any general query Contact: Ronak Jain (+918402822820)\nFor any registration related issues Contact: Aditya (+918210610167) \n\n Team NITSMUN`
    );
    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server Error", success: false });
  }
};
