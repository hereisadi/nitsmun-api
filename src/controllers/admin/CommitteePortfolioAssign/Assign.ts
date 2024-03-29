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

        const ibWpGrp = "https://chat.whatsapp.com/CkmW628dU1c6kxsctt98GJ";
        const mahabharatWpGrp =
          "https://chat.whatsapp.com/L24IHRg4kueKmbdMpG9fWf";
        const unhrcWpGrp = "https://chat.whatsapp.com/IwQiJMKGfrFJta8QrAS5bd";
        const ipcWpGrp = "https://chat.whatsapp.com/Fo9tj6KaRqH9iuy5IvwiNV";

        const ibBgGuide =
          "https://drive.google.com/file/d/1zli9QADoLhmT-s9PYAj5r0b--SOR3MhH/view?usp=drive_link";
        const mahabharatBgGuide =
          "https://drive.google.com/file/d/19-6zDrWK1m4-ehJciQxeFJZdRKSA3Um-/view";
        const unhrcBgGuide =
          "https://drive.google.com/file/d/1q4V4wiAMEzeG84k9z8CGsIzWL3ew3F8X/view?usp=drive_link";
        // const ipcBgGuide = "ipc";

        if (committee === "Mahabharat" || committee === "mahabharat") {
          sendEmail(
            event.email,
            "[NITSMUN] Committee and Portfolio assigned",
            `Hi ${event.name},\n
            We are glad to inform you that you have been assigned ${committee}/Hastinapur Special Council committee and ${portfolio} portfolio for the ${event.eventName}. \n\n Please join the Hastinapur Special Council/Mahabharat Whatsapp group: ${mahabharatWpGrp} \n\n Below is the Background guide of the Hastinapur Special Council/Mahabharat Committee: \n${mahabharatBgGuide} \n Thanks,
            \n\n Team NITSMUN`
          );
        } else if (
          committee === "IB" ||
          committee === "ib" ||
          committee === "Ib"
        ) {
          sendEmail(
            event.email,
            "[NITSMUN] Committee and Portfolio assigned",
            `Hi ${event.name},\n
            We are glad to inform you that you have been assigned ${committee} committee and ${portfolio} portfolio for the ${event.eventName}. \n\n Please join the IB Committee Whatsapp group: ${ibWpGrp} \n\n Below is the Background guide of the IB Committee: \n${ibBgGuide} \n Thanks,
            \n\n Team NITSMUN`
          );
        } else if (
          committee === "IPC" ||
          committee === "ipc" ||
          committee === "Ipc"
        ) {
          sendEmail(
            event.email,
            "[NITSMUN] Committee and Portfolio assigned",
            `Hi ${event.name},\n
            We are glad to inform you that you have been assigned ${committee} committee and ${portfolio} portfolio for the ${event.eventName}. \n\n Please join the IPC Committee Whatsapp group: ${ipcWpGrp} \n Thanks,
            \n\n Team NITSMUN`
          );
        } else if (
          committee === "UNHRC" ||
          committee === "unhrc" ||
          committee === "Unhrc"
        ) {
          sendEmail(
            event.email,
            "[NITSMUN] Committee and Portfolio assigned",
            `Hi ${event.name},\n
            We are glad to inform you that you have been assigned ${committee} committee and ${portfolio} portfolio for the ${event.eventName}. \n\n Please join the UNHRC Committee Whatsapp group: ${unhrcWpGrp} \n\n Below is the Background guide of the UNHRC Committee: \n${unhrcBgGuide} \n Thanks,
            \n\n Team NITSMUN`
          );
        } else {
          sendEmail(
            event.email,
            "[NITSMUN] Committee and Portfolio assigned",
            `Hi ${event.name},\n
            We are glad to inform you that you have been assigned ${committee} committee and ${portfolio} portfolio for the ${event.eventName}. \n Thanks,
            \n\n Team NITSMUN`
          );
        }

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
