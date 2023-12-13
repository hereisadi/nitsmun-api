import { Response } from "express";
import { verifyToken } from "../../../middlewares/VerifyToken";
import { AuthRequest } from "../../../utils/types/AuthRequest";
import { User } from "../../../models/localAuthentication/User";
import { conatctus } from "../../../models/contactus/contact";

// access: private
// method: GET
// desc: get all responses
// role: superadmin || admin
// payload : none
// route: /getcontactusres

export const getResponses = async (req: AuthRequest, res: Response) => {
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

      if (user.role === "admin" || user.role === "superadmin") {
        const allResponses = await conatctus.find({});
        res.status(200).json({
          success: true,
          allResponses,
        });
      } else {
        return res.status(401).json({
          success: false,
          error: "You are not authorized to access this endpoint",
        });
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        error: "Something went wrong",
      });
    }
  });
};
