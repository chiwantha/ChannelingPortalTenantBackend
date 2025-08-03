import express from "express";
import {
  loadAdminAppointmentList,
  loadMyAppointments,
  makeAppointment,
  updateAppointment,
} from "../controller/appointments.js";

const routes = express.Router();

routes.post("/new", makeAppointment);
routes.post("/reach", loadMyAppointments);
routes.post("/reachAdmin", loadAdminAppointmentList);
routes.put("/update", updateAppointment);

export default routes;
