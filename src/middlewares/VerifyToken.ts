import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
// import crypto from "crypto";

const YOUR_SECRET_KEY = process.env.JWT_SECRET_KEY as string;

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // const token = req.cookies.token;
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  // try {
  //   const decodedToken = jwt.verify(token, YOUR_SECRET_KEY);
  //   if (typeof decodedToken !== "string") {
  //     req.user = {
  //       userId: decodedToken.userId,
  //       email: decodedToken.email,
  //     };
  //   }
  //   next();
  // } catch (error) {
  //   return res.status(401).json({ error: "something went wrong" });
  // }

  try {
    const decoded = jwt.verify(token.split(" ")[1], YOUR_SECRET_KEY) as {
      userId: string;
      email: string;
    };
    req.user = decoded;
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };
    next();
  } catch (error) {
    console.error("Failed to verify token", error);
    res.status(401).json({ error: "Invalid token" });
  }
};
