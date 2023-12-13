import { Request, Response, NextFunction } from "express";

export const isvalidScholarID = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { scholarID } = req.body as { scholarID: string };
  if (!scholarID) {
    return res.status(400).json({ error: "ScholarID is required" });
  }

  scholarID = scholarID?.trim();

  if (/^\d{7}$/.test(scholarID)) {
    next();
  } else {
    return res.status(400).json({ error: "Invalid scholarID" });
  }
};
