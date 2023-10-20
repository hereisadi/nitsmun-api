import { Response } from "express";
import { verifyToken } from "../../middlewares/VerifyToken";
import { AuthRequest } from "../../utils/types/AuthRequest";
import { User } from "../../models/localAuthentication/User";
import { yp } from "../../models/events/yp";
// import { CError } from "../../utils/ChalkCustomStyles";

export const getAllEvents = (req: AuthRequest, res: Response) => {
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

      if (role === "admin") {
        const { eventName } = req.params;
        console.log(eventName);

        const allSuchEvents = await yp.find({ eventName: eventName });

        res.status(200).json({
          success: true,
          allSuchEvents,
        });
      } else {
        return res.status(400).json({
          error: "You are not authorized to access this endpoint",
        });
      }
    } catch (e) {
      console.error(e);
    }
  });
};
