import { Response } from "express";
import { verifyToken } from "../../middlewares/VerifyToken";
import { AuthRequest } from "../../utils/types/AuthRequest";
import { User } from "../../models/localAuthentication/User";

// GET
// params: accountID
// access: private
// role = superadmin
// desc: get individual account
// route: /superadmin/getindividualaccount/:accountID

export const getIndividualAccount = async (req: AuthRequest, res: Response) => {
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

      if (user.role === "superadmin") {
        let { accountID } = req.params as { accountID: string };
        if (!accountID) {
          return res.status(400).json({ error: "Account ID is required" });
        }

        accountID = accountID?.trim();

        const individualAccountData = await User.findById(accountID);
        if (!individualAccountData) {
          return res.status(404).json({ error: "Account not found" });
        }

        return res.status(200).json({ success: true, individualAccountData });
      } else {
        return res.status(401).json({ error: "Not authorized" });
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Something went wrong" });
    }
  });
};
