import express from "express";
import { loadAppData } from "../controller/configs.js";

const routes = express.Router();

routes.post("/appData", loadAppData);

export default routes;
