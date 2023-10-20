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

      const { email, name } = user;

      if (!college || !scholarid || !batch || !payment || !eventName) {
        return res
          .status(400)
          .json({ error: "Please fill all required fields" });
      }

      const existingSignup = await yp.findOne({ email });

      if (existingSignup) {
        return res
          .status(400)
          .json({ error: "Signup with this email already exists" });
      }

      const eventsignup = new yp({
        name,
        email,
        batch,
        payment,
        college,
        scholarid,
        eventName,
      });

      await eventsignup.save();
      res.status(200).json({ message: "Event registration completed" });
    } catch (e) {
      console.error(e);
      CError("Failed to register");
      res
        .status(500)
        .json({ error: "Something went wrong on the server side" });
    }
  });
};
