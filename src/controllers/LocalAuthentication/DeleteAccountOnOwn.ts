import { Response } from "express";
import { AuthRequest } from "../../utils/types/AuthRequest";
import { verifyToken } from "../../middlewares/VerifyToken";
import { User } from "../../models/localAuthentication/User";
import { sendEmail } from "../../utils/EmailService";

// access: private
// method: DELETE
// desc: delete the account of the user
// role: client
// payload : none
// route: /client/deleteaccount

export const deleteAccountOnOwn = (req: AuthRequest, res: Response) => {
  verifyToken(req, res, async () => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { role, email, deleteAccount, _id } = user;

      // get the emails of all the super admins
      const superAdmins = await User.find({ role: "superadmin" });
      const superAdminEmails = superAdmins.map((admin) => admin.email);
      // console.log(superAdminEmails);
      // console.log(typeof superAdminEmails);

      if (role === "client") {
        if (deleteAccount === "no") {
          await User.findByIdAndUpdate(_id, { deleteAccount: "scheduled" });
          sendEmail(
            email,
            "[NITSMUN] Account Deletion Schedule",
            `Hi ${user.name},\nWe have received your request of account deletion. Your account will be deleted within 15 days. \n If you want to cancel the deletion, Please contact the NITSMUN web team. \n Thank you.`
          );

          // send email to all the super admins
          superAdminEmails.forEach((adminEmail) => {
            sendEmail(
              adminEmail,
              "[NITSMUN] Account Deletion update",
              `Hi ${adminEmail},\n ${user.name} with the email id ${user.email} has scheduled his/her account for deletion. \n\n Team NITSMUN`
            );
          });

          res.status(200).json({
            message: "Account deletion scheduled successfully",
          });
        } else if (deleteAccount === "scheduled") {
          return res.status(401).json({
            error: "Account deletion already scheduled",
          });
        }
      } else {
        res.status(401).json({
          success: false,
          error: "Only users with the client role can be deleted. ",
        });
      }
    } catch (e) {
      console.error(e);
      res
        .status(500)
        .json({ error: "Something went wrong on the server side" });
    }
  });
};
