import { Response } from "express";
import { User } from "../../models/localAuthentication/User";
import { verifyToken } from "../../middlewares/VerifyToken";
import { CError, CInfo } from "../../utils/ChalkCustomStyles";
import { AuthRequest } from "../../utils/types/AuthRequest";

export const dashboard = async (req: AuthRequest, res: Response) => {
  CInfo("Dashboard route hit");
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

      const { name, email, role } = user;
      res.status(200).json({
        name,
        email,
        role,
      });
    } catch (error) {
      CError("Failed to load user details");
      res.status(500).json({ error: "Failed to load user details" });
    }
  });
};
