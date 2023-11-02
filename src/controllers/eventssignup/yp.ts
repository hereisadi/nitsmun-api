import { Response } from "express";
import { yp } from "../../models/events/yp";
import { CError } from "../../utils/ChalkCustomStyles";
import { verifyToken } from "../../middlewares/VerifyToken";
import { User } from "../../models/localAuthentication/User";
import { AuthRequest } from "../../utils/types/AuthRequest";
export const ypController = async (req: AuthRequest, res: Response) => {
  verifyToken(req, res, async () => {
    try {
      // no need to get name and email from the frontend. use verifyToken to get it from the token
      const { college, scholarid, batch, payment, eventName } = req.body;

      //  first find the name and email by decoding the token
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { email, name, role, isVerified } = user;

      if (!college || !scholarid || !batch || !payment || !eventName) {
        return res
          .status(400)
          .json({ error: "Please fill all required fields" });
      }

      // check if that email exists for that eventName if yes, then decline the registration
      const existingSignup = await yp.findOne({ email, eventName });
      const indexes = await yp.collection.getIndexes();
      console.log(indexes);

      if (existingSignup) {
        return res.status(400).json({
          error: `Signup with this email for the event already exists`,
        });
      } else {
        console.log(
          `Signup with this ${email} for the event ${eventName} does not exists in the schema`
        );
      }
      console.log(existingSignup);
      if (role === "client") {
        if (isVerified === true) {
          const eventsignup = new yp({
            name,
            email,
            batch,
            payment,
            college,
            scholarid,
            eventName,
          });
          // console.log(eventsignup);
          await eventsignup.save();
          res.status(200).json({ message: "Event registration completed" });
        } else {
          return res.status(401).json({
            error: "You need to verify your email first",
          });
        }
      } else {
        return res.status(401).json({
          error:
            "Admins and SuperAdmins are not allowed to register for an event",
        });
      }
    } catch (e) {
      console.error(e);
      CError("Failed to register");
      res
        .status(500)
        .json({ error: "Something went wrong on the server side" });
    }
  });
};
