import express from "express";
import { getPasswd, userAuthentication } from "../controller/authcontrol.js";

const routes = express.Router();

routes.post("/login", userAuthentication);
routes.post("/gtp", getPasswd);

export default routes;
