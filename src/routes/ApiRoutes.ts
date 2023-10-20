import express, { Request, Response } from "express";
import home from "../controllers/Home";
import passport from "passport";
import swaggerJsdoc from "swagger-jsdoc";
import { signup } from "../controllers/LocalAuthentication/Signup";
import { login } from "../controllers/LocalAuthentication/Login";
import { dashboard } from "../controllers/LocalAuthentication/Dashboard";
import { AuthRequest } from "../utils/types/AuthRequest";
import { ypController } from "../controllers/eventssignup/yp";
import { allEvents } from "../controllers/ClientAllEventsFetch/allevents";
import { getAllEvents } from "../controllers/admin/GetEvents";
import { getAllCreatedAccounts } from "../controllers/superadmin/FetchAllSignedupAccount";

const router = express.Router();

const Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NITSMUN API",
      version: "1.0.0",
      description: "Backend for account and registration for NITSMUN events",
    },
    servers: [{ url: "/v1/api" }],
  },
  apis: ["./routes/ApiRoutes"],
};

export const swaggerSpec = swaggerJsdoc(Options);

// /**
//  * @swagger
//  * /:
//  *   get:
//  *     summary: Get the homepage.
//  *     responses:
//  *       200:
//  *         description: The homepage.
//  */

// home route
router.get("/", home);

// Passport-GoogleSignIn routes
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/auth/google/success",
    failureRedirect: "/auth/google/failure",
  })
);

// basic account creation and login endpoint
router.post("/signup", signup);
router.post("/login", login);

// dashboard route
const dashboardReqHandler = (req: Request, res: Response) => {
  dashboard(req as AuthRequest, res);
};

router.get("/dashboard", dashboardReqHandler);

// yp event regsitration
const ypControllerHandler = (req: Request, res: Response) => {
  ypController(req as AuthRequest, res);
};
router.post("/reg/yp", ypControllerHandler);

// all events route for client side
const AllEventsHandler = (req: Request, res: Response) => {
  allEvents(req as AuthRequest, res);
};
router.post("/client/allevents", AllEventsHandler);

// fetch all events registered by all the users for admin side
const AdminAllEventHandler = (req: Request, res: Response) => {
  getAllEvents(req as AuthRequest, res);
};
router.get("/admin/getregistered/:eventName", AdminAllEventHandler);

// fetch all created accounts for superadmin side
const SuperAdminAllSignedUpHandler = (req: Request, res: Response) => {
  getAllCreatedAccounts(req as AuthRequest, res);
};
router.get("/superadmin/getallaccounts", SuperAdminAllSignedUpHandler);

export default router;
