import express from "express";
import cors from "cors";

import doctor from "./routes/doctor.js";
import appointment from "./routes/appointment.js";
import dashboard from "./routes/dashboard.js";
import auth from "./routes/auth.js";
import config from "./routes/config.js";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.use(
  cors({
    origin: [
      "http://192.168.8.101:5173",
      "https://portal.aoryahospitals.lk",
      "https://prime.kchord.com",
    ],
  })
);

const checkAPIKey = (req, res, next) => {
  const token = req.headers["k-chord-api-key"];
  if (token !== "kchord_7c1f4b6e2d5a45ffaf9a8f0e4bdc3c17") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

app.use("/server/doctors/", checkAPIKey, doctor);
app.use("/server/appointment/", checkAPIKey, appointment);
app.use("/server/dashboard/", checkAPIKey, dashboard);
app.use("/server/auth/", checkAPIKey, auth);
app.use("/server/config/", checkAPIKey, config);

app.listen(8800, () => {
  console.log("Server Running !");
});
