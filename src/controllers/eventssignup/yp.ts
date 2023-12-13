import { Response } from "express";
import { yp } from "../../models/events/yp";
import { CError } from "../../utils/ChalkCustomStyles";
import { verifyToken } from "../../middlewares/VerifyToken";
import { User } from "../../models/localAuthentication/User";
import { AuthRequest } from "../../utils/types/AuthRequest";
import { sendEmail } from "../../utils/EmailService";

// access: private
// method: POST
// desc: register for an event
// role: client
// payload : { payment, eventName, previousMunExperience } and college only for NITS
// route: /reg/yp

export const ypController = async (req: AuthRequest, res: Response) => {
  verifyToken(req, res, async () => {
    try {
      const { payment, eventName, previousMunExperience } = req.body as {
        payment: string;
        eventName: string;
        previousMunExperience: string;
      };

      if (!payment || !eventName || !previousMunExperience) {
        return res
          .status(400)
          .json({ error: "Please fill all required fields" });
      }

      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { email, name, role, isVerified, isStudentOfNITS } = user;

      // check if that email exists for that eventName if yes, then decline the registration
      const existingSignup = await yp.findOne({ email, eventName });
      // const indexes = await yp.collection.getIndexes();
      // console.log(indexes);

      if (existingSignup) {
        return res.status(400).json({
          error: `Signup with this email for the event already exists`,
        });
      } else {
        console.log(
          `Signup with this ${email} for the event ${eventName} does not exists in the schema`
        );
      }

      // console.log(existingSignup);

      if (role === "client") {
        if (isVerified === true) {
          if (isStudentOfNITS === false) {
            let { college } = req.body as { college: string };
            if (!college) {
              return res
                .status(400)
                .json({ error: "Please fill all required fields" });
            }
            college = college?.trim();

            const eventsignup = new yp({
              name,
              email,
              payment,
              eventName,
              college,
              previousMunExperience,
            });

            await eventsignup.save();

            sendEmail(
              email,
              "[NITSMUN] ${eventName} Registration Completed",
              `Hi ${user.name},\n
              Congratulations, You have successfully registered for the ${eventName}. \n
              \n\n Team NITSMUN`
            );
            res.status(200).json({ message: "Event registration completed" });
          } else if (isStudentOfNITS === true) {
            const eventsignup = new yp({
              name,
              email,
              payment,
              eventName,
              college: "NIT Silchar",
              previousMunExperience,
              scholarid: user.scholarID,
              batch: user.year,
            });

            await eventsignup.save();
            sendEmail(
              email,
              "[NITSMUN] ${eventName} Registration Completed",
              `Hi ${user.name},\n
              Congratulations, You have successfully registered for the ${eventName}. \n
              \n\n Team NITSMUN`
            );
            res.status(200).json({ message: "Event registration completed" });
          }
        } else {
          return res.status(401).json({
            error: "You need to verify your email first",
          });
        }
      } else {
        return res.status(401).json({
          error:
            "Admins and SuperAdmins are not allowed to register for an event",
        });
      }
    } catch (e) {
      console.error(e);
      CError("Failed to register");
      res
        .status(500)
        .json({ error: "Something went wrong on the server side" });
    }
  });
};
