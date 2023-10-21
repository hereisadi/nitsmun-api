import { Response } from "express";
import { verifyToken } from "../../middlewares/VerifyToken";
import { AuthRequest } from "../../utils/types/AuthRequest";
import { CSuccess } from "../../utils/ChalkCustomStyles";
import { User } from "../../models/localAuthentication/User";
import bcrypt from "bcrypt";

export const editProfile = (req: AuthRequest, res: Response) => {
  verifyToken(req, res, async () => {
    try {
      CSuccess("Edit Profile API route hit");

      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { newName, newPwd, confirmNewPwd } = req.body; // entries subject to change

      if (!newName && !newPwd && !confirmNewPwd) {
        return res.status(400).json({ error: "No entries to update" });
      }

      if (newPwd.length < 8) {
        return res
          .status(400)
          .json({ error: "Password should not be less than 8 characters" });
      }

      if (newPwd !== confirmNewPwd) {
        return res.status(400).json({ error: "Passwords do not match" });
      }

      const newHashedPassword = await bcrypt.hash(newPwd, 10);

      if (newPwd) {
        user.password = newHashedPassword;
      }

      if (newName) {
        user.name = newName;
      }

      // all user can edit their profile irrespective of their role
      await user.save();
      res.status(200).json({
        success: true,
        message: "Profile edited successfully",
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({
        success: false,
        error: "Something went wrong on the server side, profile update failed",
      });
    }
  });
};
