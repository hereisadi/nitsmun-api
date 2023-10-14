import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  googleId: String,
  displayName: String,
  email: String,
});

const User = mongoose.model("googlePassportSignIn", userSchema);

export default User;
