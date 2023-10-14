import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import User from "../../models/passport_models/User";
import { CSuccess } from "../../utils/ChalkCustomStyles";
// import express from 'express';
// const app = express()
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL as string;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    (profile: any, done: any) => {
      CSuccess(profile);
      User.findOne({ googleId: profile.id }, (err: any, existingUser: any) => {
        if (err) {
          return done(err);
        } else if (existingUser) {
          return done(null, existingUser);
        } else {
          const newUser = new User({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
          });

          // newUser.save((err:any) => {
          //   if (err) {
          //     return done(err);
          //   }
          //   return done(null, newUser);
          // }); // remove the empty object argument

          CSuccess(newUser);
        }
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((id: any, done: any) => {
  User.findById(id, (err: any, user: any) => {
    done(err, user);
  });
});
