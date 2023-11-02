import { User } from "../../models/localAuthentication/User";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { CError } from "../../utils/ChalkCustomStyles";
// import { check, validationResult } from "express-validator";
// import { sanitizeInput, Globals } from "../../utils/Sanitize";
import { isEmail } from "../../utils/isEmail";
// Globals();

export const signup = async (req: Request, res: Response) => {
  isEmail(req, res, async () => {
    const { name, email, password, confirmPassword } = req.body;

    // // validation using express-validator
    // check(name).trim().notEmpty().withMessage("Name is required").run(req);
    // check(email).trim().isEmail().withMessage("Email is invalid").run(req);
    // check(password)
    //   .trim()
    //   .isLength({ min: 8 })
    //   .withMessage("Password should be at least 8 characters long")
    //   .run(req);
    // check(confirmPassword)
    //   .trim()
    //   .custom((value, { req }) => {
    //     if (value !== req.body.password) {
    //       throw new Error("Passwords do not match");
    //     }
    //     return true;
    //   })
    //   .run(req);

    // // throw errors with 400 status code
    // const validationErrors = validationResult(req);
    // if (!validationErrors.isEmpty()) {
    //   return res.status(400).json({ errors: validationErrors.array() });
    // }

    // sanitizing the user input
    // const Semail = sanitizeInput(email);
    // const Sname = sanitizeInput(name);
    // const Spassword = sanitizeInput(password);
    // const SconfirmPassword = sanitizeInput(confirmPassword);

    const Semail = email.toString().trim();
    const Sname = name.toString().trim();
    const Spassword = password.toString().trim();
    const SconfirmPassword = confirmPassword.toString().trim();

    try {
      if (!Sname || !Semail || !Spassword || !SconfirmPassword) {
        return res
          .status(400)
          .json({ error: "Please fill all required fields" });
      }

      if (Spassword.length < 8) {
        return res
          .status(400)
          .json({ error: "Password should not be less than 8 characters" });
      }

      if (Spassword !== SconfirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
      }

      const existingUser = await User.findOne({ email: Semail });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(Spassword, 10);
      const user = new User({
        name: Sname,
        email: Semail,
        password: hashedPassword,
      });

      await user.save();
      res.status(200).json({ message: "User account created successfully" });
    } catch (error) {
      CError("Failed to sign up");
      res.status(500).json({ error: "Failed to sign up" });
      console.error(error);
    }
  });
};
