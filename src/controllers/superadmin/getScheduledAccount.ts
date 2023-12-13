import { Response } from "express";
import { AuthRequest } from "../../utils/types/AuthRequest";
import { verifyToken } from "../../middlewares/VerifyToken";
import { User } from "../../models/localAuthentication/User";

// access: private
// method: GET
// desc: get all accounts scheduled for deletion
// role: superadmin
// payload : none
// route: /superadmin/getscheduleddeleteaccount

export const getScheduledAccount = (req: AuthRequest, res: Response) => {
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

      const { role } = user;

      if (role === "superadmin") {
        const allDeletionScheduledAccounts = await User.find({
          deleteAccount: "scheduled",
        });

        res.status(200).json({
          success: true,
          allDeletionScheduledAccounts,
        });
      } else {
        res.status(401).json({
          error: "Not authorized to use this api endpoint",
          success: false,
        });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Something went wrong on the server side" });
    }
  });
};
