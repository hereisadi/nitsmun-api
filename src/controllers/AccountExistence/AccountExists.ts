import { Request, Response } from "express";
import { User } from "../../models/localAuthentication/User";

export const accountExists = async (req: Request, res: Response) => {
  try {
    let { email } = req.params as { email: string };

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    email = email?.toLowerCase().trim();
    if (!email.includes("@")) {
      return res.status(400).json({
        error: "not the correct email format",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: "no account found",
      });
    } else {
      return res.status(200).json({
        message: "accounts exists",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
