import { Response } from "express";
import { AuthRequest } from "../../utils/types/AuthRequest";
import { verifyToken } from "../../middlewares/VerifyToken";
import { User } from "../../models/localAuthentication/User";

export const demoteRole = async (req: AuthRequest, res: Response) => {
  verifyToken(req, res, async () => {
    try {
      //finding role of logged in user
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
        const { accountID } = req.body;
        const account = await User.findById(accountID);
        if (!account) {
          return res.status(401).json({
            error: "No such account exists",
          });
        }

        const { role } = account;

        if (role === "admin") {
          account.role = "client";
          await account.save();
          res.status(200).json({
            success: true,
            message: "Role demoted to client",
          });
        } else {
          res.status(401).json({
            error: "No such role exists",
          });
        }
      } else {
        res.status(401).json({
          error: "Not authorized to use this api endpoint",
        });
      }
    } catch (e) {
      console.error(e);
    }
  });
};
