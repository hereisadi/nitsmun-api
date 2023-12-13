import { Request, Response, NextFunction } from "express";

export const isEmailOfNITS = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { instituteEmail } = req.body as { instituteEmail: string };
  if (!instituteEmail) {
    return res.status(400).json({ error: "NITS Institute Email is required" });
  }

  instituteEmail = instituteEmail?.toLowerCase().trim();

  const emailValidatorRegex = RegExp(
    /^[a-zA-Z0-9._-]+@([a-z]+\.)?nits\.ac\.in$/
  );

  if (!emailValidatorRegex.test(instituteEmail)) {
    return res.status(400).json({ error: "not valid nits institute email" });
  } else {
    next();
  }
};
