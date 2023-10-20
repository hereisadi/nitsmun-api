import { Response } from "express";
import { AuthRequest } from "../../utils/types/AuthRequest";
import { User } from "../../models/localAuthentication/User";
import { verifyToken } from "../../middlewares/VerifyToken";
import { yp } from "../../models/events/yp";

export const confirmRegistration = (req: AuthRequest, res: Response) => {
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

      if (role === "admin" || role === "superadmin") {
        const { regID } = req.body;
        const reg = await yp.findById(regID);
        if (!reg) {
          return res.status(401).json({
            error: "No such registration exists",
          });
        }
        const { status } = reg;

        if (status === "pending") {
          reg.status = "confirmed";
          await reg.save();
          res.status(200).json({
            success: true,
            message: "Registration confirmed",
          });
        } else {
          res.status(401).json({
            error: "No such status exists",
          });
        }
      } else {
        return res.status(401).json({
          error: "Not authorized to access this endpoint",
        });
      }
    } catch (e) {
      console.error(e);
    }
  });
};
