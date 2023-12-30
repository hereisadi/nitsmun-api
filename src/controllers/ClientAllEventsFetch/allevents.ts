import { Response } from "express";
import { yp } from "../../models/events/yp";
import dotEnv from "dotenv";
// import { CError } from "../../utils/ChalkCustomStyles";
import { verifyToken } from "../../middlewares/VerifyToken";
import { User } from "../../models/localAuthentication/User";
import { AuthRequest } from "../../utils/types/AuthRequest";

dotEnv.config();

// access: private
// method: GET
// desc: fetch all the events registered by the user
// role: client
// payload : none
// route: /client/allevents

export const allEvents = async (req: AuthRequest, res: Response) => {
  verifyToken(req, res, async () => {
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

      const { email, role } = user;

      // finding registered events of the user with the role: client
      if (role === "client") {
        const ypEvents = await yp.find({ email: email });
        res.status(200).json({
          success: true,
          ypEvents,
        });
      } else {
        return res
          .status(400)
          .json({ error: "not authorized to access this endpoint" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: "Something went wrong",
      });
    }
  });
};
