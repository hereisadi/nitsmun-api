import { User } from "../../models/localAuthentication/User";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { CError } from "../../utils/ChalkCustomStyles";
import { check, validationResult } from "express-validator";

export const signup = async (req: Request, res: Response) => {
  const { name, email, password, confirmPassword } = req.body;

  // validation using express-validator
  check(name).trim().notEmpty().withMessage("Name is required").run(req);
  check(email).trim().isEmail().withMessage("Email is invalid").run(req);
  check(password)
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password should be at least 8 characters long")
    .run(req);
  check(confirmPassword)
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    })
    .run(req);

  // throw errors with 400 status code
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(400).json({ errors: validationErrors.array() });
  }

  // sanitizing the user input
  // const email = sanitizeInput(email);
  // const name = sanitizeInput(name);
  // const password = sanitizeInput(password);
  // const confirmPassword = sanitizeInput(confirmPassword);

  try {
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "Please fill all required fields" });
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
    console.error(error);
  }
};
