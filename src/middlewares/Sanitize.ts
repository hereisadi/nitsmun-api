import mongoSanitize from "mongo-sanitize";
import express, { Request, Response, NextFunction } from "express";
const mSanitize = express();

mSanitize.use((req: Request, res: Response, next: NextFunction) => {
  for (const key in req.body) {
    req.body[key] = mongoSanitize(req.body[key]);
  }
  next();
});

export default mSanitize;
