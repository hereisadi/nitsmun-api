import { Response } from "express";
import { AuthRequest } from "../../utils/types/AuthRequest";
import { verifyToken } from "../../middlewares/VerifyToken";
import { User } from "../../models/localAuthentication/User";
import { yp } from "../../models/events/yp";

// GET
// access: private
// params: eventName, status
// role: admin
// desc: get all registrations for an event
// route: /admin/getregs/:eventName/:status

export const getRegistrations = async (req: AuthRequest, res: Response) => {
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
        let { eventName, status } = req.body as {
          eventName: string;
          status: string;
        };

        if (!eventName) {
          return res.status(400).json({ error: "eventName is missing" });
        }

        if (!status) {
          return res.status(400).json({ error: "status is missing" });
        }
        eventName = eventName?.trim();
        status = status?.trim();

        // get confirmed registrations
        if (status) {
          const eventDetails = await yp.find({
            eventName: eventName,
            status: status,
          });
          if (!eventDetails) {
            return res.status(404).json({ error: "No such event exists" });
          }

          return res.status(200).json({ success: true, eventDetails });
        }
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Something went wrong" });
    }
  });
};
