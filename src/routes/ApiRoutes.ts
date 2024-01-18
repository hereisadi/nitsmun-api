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
import { elevateRole } from "../controllers/superadmin/ElevateRole";
import { demoteRole } from "../controllers/superadmin/DemoteRole";
import { confirmRegistration } from "../controllers/admin/ConfirmRegistration";
import { declineRegistration } from "../controllers/admin/DeclineRegistration";
import { editProfile } from "../controllers/LocalAuthentication/EditProfile";
// import { getPendingRegistrations } from "../controllers/admin/GetPendingRegistrations";
// import { getConfirmedRegistrations } from "../controllers/admin/GetConfirmedRegistrations";
// import { getDeclinedRegistrations } from "../controllers/admin/GetDeclinedRegistrations";
import { sendOtp } from "../controllers/LocalAuthentication/OTP/sendotp";
import { verifyOtp } from "../controllers/LocalAuthentication/OTP/Verifyotp";
import { deleteAnyAccount } from "../controllers/superadmin/DeleteAccount";
import { deleteAccountOnOwn } from "../controllers/LocalAuthentication/DeleteAccountOnOwn";
import { form } from "../controllers/admin/contactus/form";
import { getResponses } from "../controllers/admin/contactus/fetch";
import { sendLink } from "../controllers/LocalAuthentication/magiclink/sendlink";
import { verifyToken } from "../controllers/LocalAuthentication/magiclink/veirfytoken";
import { sendResetPwdLink } from "../controllers/LocalAuthentication/magiclink/SendResetPwdLink";
import { resetPwd } from "../controllers/LocalAuthentication/magiclink/resetpassword";
import { getScheduledAccount } from "../controllers/superadmin/getScheduledAccount";
import { accountExists } from "../controllers/AccountExistence/AccountExists";
import { getIndividualAccount } from "../controllers/superadmin/IndividualAccount";
import { getIndividualEventRegistration } from "../controllers/admin/IndividualEvent";
import { getRegistrations } from "../controllers/admin/GetRegistrations";
import { assignPortfolios } from "../controllers/admin/CommitteePortfolioAssign/Assign";

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

// magic link (verify email through token)
const sendLinkHandler = (req: Request, res: Response) => {
  sendLink(req as AuthRequest, res);
};
router.post("/sendlink", sendLinkHandler);
router.put("/verifytoken", verifyToken); // client wil send token as payload in body

// yp event regsitration
const ypControllerHandler = (req: Request, res: Response) => {
  ypController(req as AuthRequest, res);
};
router.post("/reg/yp", ypControllerHandler);

// all events route for client side
const AllEventsHandler = (req: Request, res: Response) => {
  allEvents(req as AuthRequest, res);
};
router.get("/client/allevents", AllEventsHandler);

// fetch all events registered by all the users for admin side
const AdminAllEventHandler = (req: Request, res: Response) => {
  getAllEvents(req as AuthRequest, res);
};
router.get("/admin/getregistered", AdminAllEventHandler);

// individual registered event
const AdminIndividualEventHandler = (req: Request, res: Response) => {
  getIndividualEventRegistration(req as AuthRequest, res);
};
router.get("/admin/reg/:eventID", AdminIndividualEventHandler);

// fetch all created accounts for superadmin side
const SuperAdminAllSignedUpHandler = (req: Request, res: Response) => {
  getAllCreatedAccounts(req as AuthRequest, res);
};
router.get("/superadmin/getallaccounts", SuperAdminAllSignedUpHandler);

// fetch individual account for superadmin side
const SuperAdminIndividualAccount = (req: Request, res: Response) => {
  getIndividualAccount(req as AuthRequest, res);
};
router.get("/superadmin/getprofile/:accountID", SuperAdminIndividualAccount);

// elevate user role to admin's route
const ElevateRoleHandler = (req: Request, res: Response) => {
  elevateRole(req as AuthRequest, res);
};
router.put("/elevate/admin", ElevateRoleHandler);

// demote user role to client's route
const DemoteRoleHandler = (req: Request, res: Response) => {
  demoteRole(req as AuthRequest, res);
};
router.put("/demote/client", DemoteRoleHandler);

// confirm the registration
const ConfirmRegHandler = (req: Request, res: Response) => {
  confirmRegistration(req as AuthRequest, res);
};
router.put("/confirm/reg", ConfirmRegHandler);

// decline the registration
const DeclineRegHandler = (req: Request, res: Response) => {
  declineRegistration(req as AuthRequest, res);
};
router.put("/decline/reg", DeclineRegHandler);

// assign the portfolios
const AssignPortfolioHandler = (req: Request, res: Response) => {
  assignPortfolios(req as AuthRequest, res);
};
router.put("/admin/assign/portfolios", AssignPortfolioHandler);

// edit profile
const EditProfileHandler = (req: Request, res: Response) => {
  editProfile(req as AuthRequest, res);
};
router.put("/all/edit/profile", EditProfileHandler);

// fetch registration bases on status and eventName
const FetchRegistrationsHandler = (req: Request, res: Response) => {
  getRegistrations(req as AuthRequest, res);
};
router.get("/admin/getregs/:eventName/:status", FetchRegistrationsHandler);

// // fetch confirmed registration
// const FetchConfirmedEventRegistrationsHandler = (
//   req: Request,
//   res: Response
// ) => {
//   getConfirmedRegistrations(req as AuthRequest, res);
// };
// router.get(
//   "/admin/getconfirmedreg/:eventName",
//   FetchConfirmedEventRegistrationsHandler
// );

// // fetch declined registration
// const FetchDeclinedEventRegistrationsHandler = (
//   req: Request,
//   res: Response
// ) => {
//   getDeclinedRegistrations(req as AuthRequest, res);
// };
// router.get(
//   "/admin/getdeclinedreg/:eventName",
//   FetchDeclinedEventRegistrationsHandler
// );

//send otp
router.post("/sendotp", sendOtp);

//verify otp
router.post("/verifyotp", verifyOtp);

// Delete any account only for superadmin, only client role can be deleted
const DeleteAnyAccountHandler = (req: Request, res: Response) => {
  deleteAnyAccount(req as AuthRequest, res);
};
router.delete("/superadmin/deleteaccount", DeleteAnyAccountHandler);

// get scheduled account deletion
const getScheduledDeleteAccount = (req: Request, res: Response) => {
  getScheduledAccount(req as AuthRequest, res);
};
router.get("/superadmin/getscheduleddeleteaccount", getScheduledDeleteAccount);

// delete account on its own after 15 days, after request has made
const DeleteAnyAccountByClientHandler = (req: Request, res: Response) => {
  deleteAccountOnOwn(req as AuthRequest, res);
};
router.put("/client/deleteaccount", DeleteAnyAccountByClientHandler);

// contact us form
const ContactUsHandler = (req: Request, res: Response) => {
  getResponses(req as AuthRequest, res);
};
router.get("/getcontactusres", ContactUsHandler);
router.post("/contactus", form);

// forgot password
router.post("/sendresetpwdlink", sendResetPwdLink);
router.put("/resetpassword", resetPwd);

router.get("/accounttest/:email", accountExists);

export default router;
