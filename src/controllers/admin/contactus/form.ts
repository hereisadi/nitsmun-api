import { Request, Response } from "express";
import moment from "moment-timezone";
import { conatctus } from "../../../models/contactus/contact";
export const form = async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;
    const Name = name.toString().trim();
    const Email = email.toString().trim();
    const Message = message.toString().trim();
    if (!Name || !Email || !Message) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    const newMessage = {
      name: Name,
      email: Email,
      message: Message,
      contactedAt: moment.tz("Asia/Kolkata").format("DD-MM-YY h:mma"),
    };

    const contactUs = new conatctus(newMessage);
    await contactUs.save();
    return res.status(200).json({
      success: true,
      message: "Thank you for contacting us. We will get back to you soon",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "something went wrong",
    });
  }
};
