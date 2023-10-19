import { Response } from "express";
import { yp } from "../../models/events/yp";
import dotEnv from "dotenv";
import { CError } from "../../utils/ChalkCustomStyles";
import { verifyToken } from "../../middlewares/VerifyToken";
import { User } from "../../models/localAuthentication/User";
import { AuthRequest } from "../../utils/types/AuthRequest";
dotEnv.config();

export const allEvents = async (req: AuthRequest, res: Response) => {
  verifyToken(req, res, async () => {
    const { id, pwd } = req.body;

    if (id === process.env.id && pwd === process.env.pwd) {
      try {
        // finding email of the user
        const userId = req.user?.userId;
        if (!userId) {
          return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await User.findById(userId);

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        const { email } = user;

        // finding registered events of the user
        const ypEvents = await yp.find({ email: email });
        res.status(200).json({
          success: true,
          ypEvents,
        });
      } catch (error) {
        res.status(400).json({
          success: false,
          error,
        });
      }
    } else {
      CError("Something went wrong");
    }
  });
};
