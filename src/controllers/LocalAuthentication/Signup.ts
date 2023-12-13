import { User } from "../../models/localAuthentication/User";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { CError } from "../../utils/ChalkCustomStyles";
// import { check, validationResult } from "express-validator";
// import { sanitizeInput, Globals } from "../../utils/Sanitize";
import { isEmail } from "../../utils/isEmail";
import { isEmailOfNITS } from "../../utils/isNITSEmail";
import { isvalidScholarID } from "../../utils/isScholarID";
import { sendEmail } from "../../utils/EmailService";
// Globals();

export const signup = async (req: Request, res: Response) => {
  isEmail(req, res, async () => {
    const { name, email, phone, password, confirmPassword, isStudentOfNITS } =
      req.body;

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

    if (
      !email ||
      !name ||
      !password ||
      !phone ||
      !confirmPassword ||
      isStudentOfNITS === undefined ||
      isStudentOfNITS === null ||
      isStudentOfNITS === ""
    ) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    const Semail = email?.toString().toLowerCase().trim();
    const Sname = name?.toString().trim();
    const Spassword = password?.toString().trim();
    const SconfirmPassword = confirmPassword?.toString().trim();
    const Sphone = phone?.toString().trim();

    if (Spassword.length < 8) {
      return res
        .status(400)
        .json({ error: "Password should not be less than 8 characters" });
    }

    if (Spassword !== SconfirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(Spassword, 10);

    // for nits student
    try {
      // IMPORTANT
      // user's primmary email is email and instituteEmail is secondary email for NITS student
      // that means nits student can login with both EMAIL only and not with instituteEmail

      if (isStudentOfNITS === true) {
        let { instituteEmail, scholarID, branch, year } = req.body;
        if (!instituteEmail || !scholarID || !branch || !year) {
          return res.status(400).json({
            error: "Please fill all additional NITS related required fields",
          });
        }

        instituteEmail = instituteEmail?.toString().toLowerCase().trim();
        scholarID = scholarID?.toString().trim();
        branch = branch?.toString().trim();
        year = year?.toString().trim();

        isEmailOfNITS(req, res, async () => {
          isvalidScholarID(req, res, async () => {
            const existingUser = await User.findOne({ email: Semail });
            if (existingUser) {
              return res.status(400).json({ error: "Email already exists" });
            }

            const user = new User({
              name: Sname,
              email: Semail,
              password: hashedPassword,
              isStudentOfNITS,
              instituteEmail,
              scholarID,
              branch,
              year,
              phone: Sphone,
            });

            await user.save();

            // send welcome email to the user
            sendEmail(
              Semail,
              "Welcome to NITSMUN",
              `Hi ${Sname},\n
              Welcome to NITSMUN. We are glad to have you on board. \n
              \n\n Team NITSMUN`
            );
            res
              .status(200)
              .json({ message: "User account created successfully" });
          });
        });
      }
      // for outside nits student
      else if (isStudentOfNITS === false) {
        const existingUser = await User.findOne({ email: Semail });
        if (existingUser) {
          return res.status(400).json({ error: "Email already exists" });
        }

        const user = new User({
          name: Sname,
          email: Semail,
          password: hashedPassword,
          isStudentOfNITS,
          phone: Sphone,
        });

        await user.save();

        sendEmail(
          Semail,
          "Wlcome to NITSMUN",
          `Hi ${Sname},\n
          Welcome to NITSMUN. We are glad to have you on board. \n
          \n\n Team NITSMUN`
        );
        res.status(200).json({ message: "User account created successfully" });
      }
    } catch (error) {
      CError("Failed to sign up");
      res.status(500).json({ error: "Failed to sign up" });
      console.error(error);
    }
  });
};
