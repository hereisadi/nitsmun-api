import { Response } from "express";
import { verifyToken } from "../../middlewares/VerifyToken";
import { AuthRequest } from "../../utils/types/AuthRequest";
import { CSuccess } from "../../utils/ChalkCustomStyles";
import { User } from "../../models/localAuthentication/User";
import bcrypt from "bcrypt";

// access: private
// method: PUT
// desc: edit profile
// role: all
// payload : newName, newPwd, confirmNewPwd, phone
// route: /all/edit/profile

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

      let { newName, newPwd, confirmNewPwd, phone } = req.body;
      const { photo } = req.body;

      phone = phone?.toString().trim();
      newName = newName?.toString().trim();
      newPwd = newPwd?.toString().trim();
      confirmNewPwd = confirmNewPwd?.toString().trim();

      if (!newName && !newPwd && !confirmNewPwd && !phone && !photo) {
        return res.status(400).json({ error: "No entries to update" });
      }

      if (newPwd !== "" && newPwd.length < 8) {
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

      if (newName && newName !== user.name) {
        user.name = newName;
      }

      if (phone && phone !== user.phone) {
        user.phone = phone;
      }

      if (photo && photo !== user.photo) {
        user.photo = photo;
      }

      // all user can edit their profile irrespective of their role
      await user.save();
      res.status(200).json({
        success: true,
        message: "Profile edited successfully",
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        success: false,
        error: "Something went wrong on the server side, profile update failed",
      });
    }
  });
};
