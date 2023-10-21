import { Response } from "express";
import { AuthRequest } from "../../utils/types/AuthRequest";
import { verifyToken } from "../../middlewares/VerifyToken";

export const logout = (req: AuthRequest, res: Response) => {
  verifyToken(req, res, async () => {
    try {
      console.log("logout controller function below");
    } catch (e) {
      console.error(e);
    }
  });
};
