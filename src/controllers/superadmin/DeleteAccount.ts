import { Response } from "express";
import { AuthRequest } from "../../utils/types/AuthRequest";
import { verifyToken } from "../../middlewares/VerifyToken";
import { User } from "../../models/localAuthentication/User";

// access: private
// method: DELETE
// desc: delete any account
// role: superadmin
// payload : accountID
// route: /superadmin/deleteaccount

export const deleteAnyAccount = (req: AuthRequest, res: Response) => {
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
        if (!accountID) {
          return res.status(401).json({
            error: "No such account exists",
          });
        }

        const account = await User.findById({ accountID });

        if (!account) {
          return res.status(401).json({
            error: "No such account exists",
          });
        }

        const { role } = account;

        if (role === "client") {
          await User.findOneAndDelete({ _id: accountID });
        } else {
          res.status(401).json({
            success: false,
            error: "Only users with the role client can be deleted",
          });
        }

        res
          .status(200)
          .json({ message: "User deleted successfully", success: true });
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
