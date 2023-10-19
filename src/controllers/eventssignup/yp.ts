import { Request, Response } from "express";
import { yp } from "../../models/events/yp";
import { CError } from "../../utils/ChalkCustomStyles";

export const ypController = async (req: Request, res: Response) => {
  const { college, scholarid, batch, payment, name, email } = req.body;

  try {
    if (!college || !scholarid || !batch || !payment || !name || !email) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    const existingSignup = await yp.findOne({ email });

    if (existingSignup) {
      return res
        .status(400)
        .json({ error: "Signup with this email already exists" });
    }

    const eventsignup = new yp({
      name,
      email,
      batch,
      payment,
      college,
      scholarid,
    });

    await eventsignup.save();
    res.status(200).json({ message: "Event registration completed" });
  } catch (e) {
    console.error(e);
    CError("Failed to register");
    res.status(500).json({ error: "Something went wrong on the server side" });
  }
};
