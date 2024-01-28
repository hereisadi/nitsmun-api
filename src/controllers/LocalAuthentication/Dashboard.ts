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

      if (user.isStudentOfNITS === true) {
        const {
          name,
          email,
          role,
          isStudentOfNITS,
          deleteAccount,
          isVerified,
          instituteEmail,
          scholarID,
          branch,
          year,
          _id,
          phone,
        } = user;
        res.status(200).json({
          _id,
          name,
          email,
          phone,
          isStudentOfNITS,
          instituteEmail,
          year,
          branch,
          scholarID,
          role,
          isVerified,
          deleteAccount,
        });
      } else if (user.isStudentOfNITS === false) {
        const {
          _id,
          phone,
          name,
          email,
          photo,
          role,
          isStudentOfNITS,
          deleteAccount,
          isVerified,
        } = user;
        res.status(200).json({
          _id,
          name,
          email,
          photo,
          phone,
          isStudentOfNITS,
          role,
          isVerified,
          deleteAccount,
        });
      }
    } catch (error) {
      CError("Failed to load user details");
      return res.status(500).json({ error: "Failed to load user details" });
    }
  });
};
