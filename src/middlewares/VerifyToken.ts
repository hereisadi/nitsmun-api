import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const YOUR_SECRET_KEY =
  process.env.JWT_SECRET_KEY || crypto.randomBytes(64).toString("hex");

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const decodedToken = jwt.verify(token, YOUR_SECRET_KEY);
    if (typeof decodedToken !== "string") {
      req.user = {
        userId: decodedToken.userId,
        email: decodedToken.email,
      };
    }
    next();
  } catch (error) {
    return res.status(401).json({ error: "something went wrong" });
  }
};
