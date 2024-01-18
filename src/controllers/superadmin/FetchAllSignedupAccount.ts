import { Response } from "express";
import { AuthRequest } from "../../utils/types/AuthRequest";
import { verifyToken } from "../../middlewares/VerifyToken";
import { User } from "../../models/localAuthentication/User";

// access: private
// method: GET
// desc: get all accounts
// role: superadmin
// payload : none
// route: /superadmin/getallaccounts

export const getAllCreatedAccounts = async (
  req: AuthRequest,
  res: Response
) => {
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
        const allAccounts = await User.find({});
        res.status(200).json({
          success: true,
          allAccounts,
        });
      } else {
        res.status(401).json({
          error: "Not authorised to access this api endpoint",
        });
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        error: "Something went wrong",
      });
    }
  });
};
