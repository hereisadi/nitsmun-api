import { User } from "../../models/localAuthentication/User";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { CError, CSuccess } from "../../utils/ChalkCustomStyles";
import jwt from "jsonwebtoken";
import dotEnv from "dotenv";
// import { check, validationResult } from "express-validator";
dotEnv.config();
// import crypto from "crypto";
import rateLimit from "express-rate-limit";
import { isEmail } from "../../utils/isEmail";

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

// access: public
// method: POST
// desc: login user
// role: all
// payload : { email, password }
// route: /login

export const login = async (req: Request, res: Response) => {
  emailLimiter(req, res, async () => {
    isEmail(req, res, async () => {
      let { email, password } = req.body as {
        email: string;
        password: string;
      };

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Please fill all required fields" });
      }

      email = email?.toString().toLowerCase().trim();
      password = password?.toString().trim();

      try {
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(401).json({ error: "No account found" });
        }

        if (user.deleteAccount === "scheduled") {
          return res
            .status(401)
            .json({ error: "Your account has been scheduled for deletion." });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return res.status(401).json({ error: "Wrong email or password" });
        }

        const token = jwt.sign(
          { userId: user._id, email: user.email },
          YOUR_SECRET_KEY!,
          { expiresIn: "72000h" }
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
        console.error(error);
        return res.status(500).json({ error: "Failed to log in" });
      }
    });
  });
};
