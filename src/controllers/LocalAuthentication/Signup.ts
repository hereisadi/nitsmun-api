import { User } from "../../models/localAuthentication/User";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { CError } from "../../utils/ChalkCustomStyles";

export const signup = async (req: Request, res: Response) => {
  const { name, email, password, confirmPassword } = req.body;

  try {
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    if (typeof name !== "string") {
      return res.status(400).json({ error: "Name should be a string" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password should not be less than 8 characters" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(200).json({ message: "User account created successfully" });
  } catch (error) {
    CError("Failed to sign up");
    res.status(500).json({ error: "Failed to sign up" });
  }
};
