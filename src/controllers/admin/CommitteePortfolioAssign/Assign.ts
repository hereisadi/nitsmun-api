import { Response } from "express";
import { AuthRequest } from "../../../utils/types/AuthRequest";
import { verifyToken } from "../../../middlewares/VerifyToken";
import { User } from "../../../models/localAuthentication/User";
import { yp } from "../../../models/events/yp";
import { sendEmail } from "../../../utils/EmailService";

// PUT
// payload : eventID, portfolio, committee
// access: private
// role: admin
// desc: assigning portfolios and committees confirmed event registration
// route: /admin/assign/portfolios

export const assignPortfolios = async (req: AuthRequest, res: Response) => {
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
        let { eventID, portfolio, committee } = req.body as {
          eventID: string;
          portfolio: string;
          committee: string;
        };
        if (!eventID || !portfolio || !committee) {
          return res.status(400).json({ error: "payload is missing" });
        }
        eventID = eventID?.trim();
        portfolio = portfolio?.trim();
        committee = committee?.trim();
        const event = await yp.findById(eventID);
        if (!event) {
          return res.status(404).json({ error: "No such event exists" });
        }

        if (event.status === "pending" || event.status === "declined") {
          return res.status(401).json({
            error: "Event registartion confirmation is still pending",
          });
        }

        if (event.assignedPortfolio !== "") {
          return res
            .status(401)
            .json({ message: "Portfolio already assigned" });
        }

        if (event.assignedCommittee !== "") {
          return res
            .status(401)
            .json({ message: "Committee already assigned" });
        }

        if (portfolio) {
          event.assignedPortfolio = portfolio;
        }

        if (committee) {
          event.assignedCommittee = committee;
        }
        await event.save();
        sendEmail(
          event.email,
          "[NITSMUN] Committee and Portfolio assigned",
          `Hi ${event.name},\n
          We are glad to inform you that you have been assigned ${committee} and ${committee} for the ${event.eventName}. \n Thanks,
          \n\n Team NITSMUN`
        );
        return res
          .status(200)
          .json({ success: true, message: "Portfolio and committee updated" });
      } else {
        return res.status(401).json({ error: "Not authorized" });
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Something went wrong" });
    }
  });
};
