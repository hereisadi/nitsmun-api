import { Response, Request } from "express";
import bcrypt from "bcrypt";
import { User } from "../../../models/localAuthentication/User";
import moment from "moment-timezone";
import { sendEmail } from "../../../utils/EmailService";

// access: public
// method: PUT
// desc: reset password
// role: all
// payload : token, newpwd, cnewpwd
// route: /resetpassword

export const resetPwd = async (req: Request, res: Response) => {
  try {
    const { token, newpwd, cnewpwd } = req.body as {
      token: string;
      newpwd: string;
      cnewpwd: string;
    };

    if (!token || !newpwd || !cnewpwd) {
      return res.status(400).json({
        error: "payload is missing",
      });
    }

    const Token = token?.trim();
    const newPwd = newpwd?.trim();
    const newCPwd = cnewpwd?.trim();

    const user = await User.findOne({
      token: Token,
    });

    if (!user) {
      return res.status(404).json({
        error: "no user found",
      });
    }

    // console.log(user)

    const tokenExpiresAt = user.tokenExpiresAt as string;
    const currentTime = moment
      .tz("Asia/Kolkata")
      .format("DD-MM-YY h:mma") as string;

    console.log(tokenExpiresAt, currentTime);

    if (newPwd !== newCPwd) {
      return res.status(400).json({
        error: "passwords do not match",
      });
    } else {
      if (newPwd.length < 8) {
        return res.status(400).json({
          error: "New password should be atleast 8 characters long",
        });
      } else {
        const hashedPwd = await bcrypt.hash(newPwd, 10);
        user.password = hashedPwd;
        user.token = undefined;
        user.tokenExpiresAt = undefined;
        await user.save();

        // sending email to user that their password has been changed

        sendEmail(
          user.email,
          "[NITSMUN] Password Reset Successfully",
          `Hi ${user.name},\nYour password has been reset Successfully.\n You can now login with the new updated password. \n\n Team NITSMUN`
        );
        return res.status(200).json({
          success: true,
          message: "Password reset successfully",
        });
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server Error", success: false });
  }
};
