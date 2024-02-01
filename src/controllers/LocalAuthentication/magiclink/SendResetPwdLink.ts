import { Response, Request } from "express";
import crypto from "crypto";
import { User } from "../../../models/localAuthentication/User";
import moment from "moment-timezone";
import { sendEmail } from "../../../utils/EmailService";
import { isEmail } from "../../../utils/isEmail";

// access: public
// method: POST
// desc: send reset password link to the user's email
// role: all
// payload : email
// route: /sendresetpwdlink

export const sendResetPwdLink = async (req: Request, res: Response) => {
  isEmail(req, res, async () => {
    try {
      const { email } = req.body as { email: string };

      if (!email) {
        return res.status(400).json({
          error: "email is missing",
        });
      }

      const Email = email?.toLowerCase().trim() as string;

      const user = await User.findOne({
        email: Email,
      });

      if (!user) {
        return res.status(404).json({
          error: "no user found",
        });
      }

      if (user.isVerified === false) {
        return res.status(404).json({
          error: "Please verify your email first",
          success: false,
        });
      }

      const token = crypto.randomBytes(48).toString("hex") as string;

      const tokenExpiresAt = moment
        .tz("Asia/Kolkata")
        .add(1, "hour")
        .format("DD-MM-YY h:mma") as string;

      if (!token || !tokenExpiresAt) {
        return res
          .status(400)
          .json({ error: "Either token or tokenExpiresAt is missing" });
      }

      user.token = token;
      user.tokenExpiresAt = tokenExpiresAt;
      await user.save();
      const verifyEmailLink = `${
        process.env.website as string
      }/resetpassword/${token}`;

      sendEmail(
        Email,
        "[NITSMUN] Reset Password",
        `Hi ${user.name},\nWe have received a request to reset your password. If this is really you, Please Click on the following link to reset your password:\n ${verifyEmailLink} \n\n Link is valid for 60 minutes \n\n Team NITSMUN`
      );

      return res.status(200).json({
        success: true,
        message: "Reset password link sent successfully",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server Error", success: false });
    }
  });
};
