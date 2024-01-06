import { Response } from "express";
import { AuthRequest } from "../../utils/types/AuthRequest";
import { verifyToken } from "../../middlewares/VerifyToken";
import { User } from "../../models/localAuthentication/User";
import { yp } from "../../models/events/yp";

// GET
// access: private
// params : eventID
// role: admin
// desc: get individual event registration
// route: /admin/getindividualregistration/:eventID

export const getIndividualEventRegistration = async (
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

      if (user.role === "admin") {
        let { eventID } = req.params as {
          eventID: string;
        };

        if (!eventID) {
          return res.status(400).json({ error: "eventID is missing" });
        }
        eventID = eventID?.trim();

        const eventDetails = await yp.findById(eventID);
        if (!eventDetails) {
          return res.status(404).json({ error: "No such event exists" });
        }

        return res.status(200).json({ success: true, eventDetails });
      } else {
        return res.status(401).json({ error: "Not authorized" });
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Something went wrong" });
    }
  });
};
