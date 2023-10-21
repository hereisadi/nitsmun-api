import { Response } from "express";
import { AuthRequest } from "../../utils/types/AuthRequest";
import { verifyToken } from "../../middlewares/VerifyToken";
import { User } from "../../models/localAuthentication/User";
import cron from "node-cron";
import { sendEmail } from "../../utils/EmailService";
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

      const { role, email } = user;

      sendEmail(
        email,
        "Account Deletion Schedule",
        `Your account will be deleted after 15 days. /n If you want to cancel the deletion, please contact the nitsmun web team. /n Thank you.`
      );

      // delete the account after 15 days
      cron.schedule("0 0 */15 * *", async () => {
        if (role === "client") {
          await User.findOneAndDelete({ email });
          res
            .status(200)
            .json({ message: "User deleted successfully", success: true });
          sendEmail(
            email,
            "Account Deleted",
            `Your account has been deleted successfully`
          );
        } else {
          res.status(401).json({
            success: false,
            error: "Only users with the client role can be deleted. ",
          });
        }
      });
    } catch (e) {
      console.error(e);
      res
        .status(500)
        .json({ error: "Something went wrong on the server side" });
    }
  });
};
