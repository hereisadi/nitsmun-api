import app from "./app";
import { CSuccess } from "./utils/ChalkCustomStyles";
const PORT = process.env.PORT || 3880;
app.listen(PORT, () => {
  CSuccess(`Server is running on the port ${PORT}`);
});
