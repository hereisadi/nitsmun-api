import express from "express";
import home from "../controllers/Home";
import passport from "passport";
import swaggerJsdoc from "swagger-jsdoc";
import { signup } from "../controllers/LocalAuthentication/Signup";
import { login } from "../controllers/LocalAuthentication/Login";

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

router.post("/signup", signup);
router.post("/login", login);
export default router;
