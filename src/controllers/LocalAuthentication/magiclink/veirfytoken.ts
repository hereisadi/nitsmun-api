import { Request, Response } from "express";
import { User } from "../../../models/localAuthentication/User";
import moment from "moment-timezone";

// access: public
// method: PUT
// payload : token as string
// endpoint: /verifytoken

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body as { token: string };
    if (!token) {
      return res.status(400).json({ message: "Token is missing" });
    }

    const user = await User.findOne({
      token,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // console.log(user)

    const tokenExpiresAt = user.tokenExpiresAt as string;
    const currentTime = moment
      .tz("Asia/Kolkata")
      .format("DD-MM-YY h:mma") as string;

    if (currentTime > tokenExpiresAt) {
      return res.status(400).json({
        error: "token expired. please try again later",
      });
    } else {
      user.isVerified = true;
      user.token = undefined;
      user.tokenExpiresAt = undefined;
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Email verified successfully",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server Error", success: false });
  }
};
