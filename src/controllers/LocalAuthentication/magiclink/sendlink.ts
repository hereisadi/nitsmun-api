import { Response } from "express";
import { verifyToken } from "../../../middlewares/VerifyToken";
import { AuthRequest } from "../../../utils/types/AuthRequest";
import crypto from "crypto";
import { User } from "../../../models/localAuthentication/User";
import moment from "moment-timezone";
import { sendEmail } from "../../../utils/EmailService";

export const sendLink = async (req: AuthRequest, res: Response) => {
  verifyToken(req, res, async () => {
    try {
      const userId = req.user?.userId as string;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const Email = user.email.toString().trim() as string;

      const token = crypto.randomBytes(48).toString("hex") as string;

      const tokenExpiresAt = moment
        .tz("Asia/Kolkata")
        .add(1, "hour")
        .format("DD-MM-YY h:mma") as string;

      if (!token || !tokenExpiresAt) {
        return res
          .status(400)
          .json({ message: "Either token or tokenExpires at is missing" });
      }

      user.token = token;
      user.tokenExpiresAt = tokenExpiresAt;
      await user.save();
      const verifyEmailLink = `${
        process.env.website as string
      }/verifyemail/${token}`;

      sendEmail(
        Email,
        "[NITSMUN] Verify Email",
        `Click on this link to verify your email: ${verifyEmailLink} \n Link is valid for 60 minutes \n\n Team NITSMUN`
      );
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server Error", success: false });
    }
  });
};
