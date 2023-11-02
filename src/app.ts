import express from "express";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import { v4 as uuidv4 } from "uuid";
import bodyParser from "body-parser";
import dotEnv from "dotenv";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";
// import ApiRoutes from "./routes/passport-models/ApiRoutes";
import ApiRoutes from "./routes/ApiRoutes";
import redirect from "./middlewares/Redirect";
import connectToDb from "./config/db";
import { swaggerSpec } from "./routes/ApiRoutes";
import mSanitize from "./middlewares/Sanitize";

const app = express();
dotEnv.config();
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(express.json({ limit: "5mb" }));
app.use(morgan("combined"));
app.use(cookieParser());
app.use(cors());
app.use(redirect);
app.use(mSanitize);

// enable session support
const sessionSecret = uuidv4();
app.use(
  session({
    secret: sessionSecret,
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.session());
app.use(passport.initialize());

// conenction of db
connectToDb();

// setting the app to use /v1/api to use as default
app.use("/v1/api", ApiRoutes);
app.use("/v1/api/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
