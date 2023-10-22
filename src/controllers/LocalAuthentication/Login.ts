import { User } from "../../models/localAuthentication/User";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { CError, CSuccess } from "../../utils/ChalkCustomStyles";
import jwt from "jsonwebtoken";
import dotEnv from "dotenv";
import { check, validationResult } from "express-validator";
dotEnv.config();
// import crypto from "crypto";
import rateLimit from "express-rate-limit";

const YOUR_SECRET_KEY = process.env.JWT_SECRET_KEY;
// const YOUR_SECRET_KEY =
//   process.env.JWT_SECRET_KEY || crypto.randomBytes(64).toString("hex");

// when using export const login; we have to use import like: import {login} from './Login'
// when exporting like export default login; we have to use import like: import login from './Login'

const emailLimiter = rateLimit({
  windowMs: 15 * 1000, //15s
  max: 5, // limit each IP to 5 requests per windowMs
  keyGenerator: (req: Request) => req.body.email,
  handler: (req: Request, res: Response) => {
    res
      .status(429)
      .json({ error: "Too many requests, please try again later." });
  },
});

export const login = async (req: Request, res: Response) => {
  emailLimiter(req, res, async () => {
    const { email, password } = req.body;

    // validation using express-validator
    check("email").trim().isEmail().withMessage("Email is invalid").run(req);
    check("password")
      .trim()
      .isLength({ min: 8 })
      .withMessage("Password should be at least 8 characters long")
      .run(req);

    // throw errors with 400 status code
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    // sanitizing the email and password
    // const sanitizedEmail = sanitizeInput(email);
    // const sanitizedPassword = sanitizeInput(password);

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "No account found" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email },
        YOUR_SECRET_KEY!,
        { algorithm: "ES512", expiresIn: "720h" }
      );

      // res.cookie("token", token, {
      //   httpOnly: true,
      //   secure: true, //turn to true for prod
      //   sameSite: "strict",
      //   maxAge: 1000 * 60 * 60 * 150, // 150 hours
      // });

      res.status(200).json({ message: "Login successful", token });
      CSuccess("login successful");
    } catch (error) {
      CError("Failed to log in");
      res.status(500).json({ error: "Failed to log in" });
      console.error(error);
    }
  });
};
