import express from "express";
import {
  loadFullProfileData,
  loadList,
  loadProfile,
  loadSessions,
  loadSpecialization,
} from "../controller/doctors.js";
const routes = express.Router();

routes.post("/list", loadList);
routes.get("/specialization", loadSpecialization);
routes.get("/profile", loadProfile);
routes.get("/sessions", loadSessions);
routes.post("/fullprofile", loadFullProfileData);

export default routes;
