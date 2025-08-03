import express from "express";
import { loadCounts, loadPannels } from "../controller/dashboards.js";

const routes = express.Router();

routes.post("/counts", loadCounts);
routes.get("/pannels", loadPannels);

export default routes;
