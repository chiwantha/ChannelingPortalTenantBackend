import { db } from "../db.js";
import { sendWhatsappMessage } from "../services/whatsapp.js";

export const makeAppointment = (req, res) => {
  const {
    session_id,
    patient,
    contact,
    alternate_contact,
    date,
    email,
    note,
    whatsapp_send,
    hospital_id,
  } = req.body;

  if (
    whatsapp_send === null ||
    whatsapp_send === "" ||
    hospital_id === null ||
    hospital_id === "" ||
    session_id === null ||
    session_id === "" ||
    patient === null ||
    patient === "" ||
    contact === null ||
    contact === "" ||
    date === null ||
    date === ""
  ) {
    return res.status(404).json("Data Missing!");
  }

  // Normalize optional fields once so we don't repeat ternaries.
  const altContact =
    alternate_contact === null || alternate_contact === ""
      ? "0"
      : alternate_contact;
  const safeEmail = email === null || email === "" ? "None" : email;
  const safeNote = note === null || note === "" ? "None" : note;

  const query = `INSERT INTO appointment (hospital_id, session_id, patient, contact, alternate_contact, date, email, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    hospital_id,
    session_id,
    patient,
    contact,
    altContact,
    date,
    safeEmail,
    safeNote,
  ];

  db.query(query, values, async (err, data) => {
    if (err) return res.status(500).json(err);
    if (data) {
      loadAndSendAppointment(data.insertId, whatsapp_send);
      return res.status(200).json(data);
    }
  });
};

export const loadMyAppointments = (req, res) => {
  const my_number = req.body.contact;
  const hospital_id = req.body.hospital_id;

  const query = `
    SELECT 
      appointment.id, 
      appointment.session_id, 
      doctors.name AS doctor_name, 
      session_type.name AS session_type, 
      session.start_time, 
      session.end_time, 
      session.fee, 
      appointment.patient, 
      appointment.contact, 
      appointment.alternate_contact, 
      appointment.date, 
      appointment.email, 
      appointment.note, 
      appointment.created_at,
      appointment.is_confirmed 
    FROM appointment 
    INNER JOIN session ON appointment.session_id = session.id 
    INNER JOIN doctors ON session.doctor_id = doctors.id 
    INNER JOIN session_type ON session.type_id = session_type.id 
    WHERE ( appointment.contact LIKE ? 
    OR appointment.alternate_contact LIKE ? )
    AND appointment.state = 1 AND appointment.hospital_id = ?;
  `;

  // Add wildcards to the search terms
  const searchTerm = `%${my_number}%`;

  db.query(query, [searchTerm, searchTerm, hospital_id], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const loadAdminAppointmentList = (req, res) => {
  const hospital_id = req.body.hospital_id;
  const query = `
    SELECT 
      appointment.id, 
      appointment.session_id, 
      doctors.name AS doctor_name, 
      session_type.name AS session_type, 
      session.start_time, 
      session.end_time, 
      session.fee, 
      appointment.patient, 
      appointment.contact, 
      appointment.alternate_contact, 
      appointment.date, 
      appointment.email, 
      appointment.note, 
      appointment.created_at,
      appointment.is_printed,
      appointment.is_confirmed 
    FROM appointment 
    INNER JOIN session ON appointment.session_id = session.id 
    INNER JOIN doctors ON session.doctor_id = doctors.id 
    INNER JOIN session_type ON session.type_id = session_type.id 
    WHERE appointment.state = 1 AND appointment.hospital_id = ?
    ORDER BY 
      CASE 
        WHEN appointment.is_printed = 0 THEN 0
        WHEN appointment.is_printed = 1 AND appointment.is_confirmed = 0 THEN 1
        ELSE 2
      END,
      appointment.created_at DESC
    LIMIT 120;
  `;

  db.query(query, [hospital_id], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const updateAppointment = (req, res) => {
  // console.log(req.body);
  const appointment_id = req.body.id;
  const action = req.body.action;

  let updates = [];

  if (action == "approve") {
    updates.push(`is_confirmed = 1`);
  } else if (action == "reject") {
    updates.push(`is_confirmed = 0`);
  }

  if (action === "remove") {
    updates.push(`state = 0`);
  }

  if (action === "print") {
    updates.push(`is_printed = 1`);
  }

  // If no valid update, return error
  if (updates.length === 0) {
    return res.status(400).json({ error: "Invalid action" });
  }

  const query = `UPDATE appointment SET ${updates.join(", ")} WHERE id = ?`;

  db.query(query, [appointment_id], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const loadAndSendAppointment = (appointment_id, to) => {
  const query = `
    SELECT 
      appointment.id, 
      appointment.session_id, 
      doctors.name AS doctor_name, 
      session_type.name AS session_type, 
      session.start_time, 
      session.fee, 
      appointment.patient, 
      appointment.contact, 
      appointment.alternate_contact, 
      appointment.date, 
      appointment.email, 
      appointment.note, 
      appointment.created_at,
      appointment.is_printed,
      appointment.is_confirmed 
    FROM appointment 
    INNER JOIN session ON appointment.session_id = session.id 
    INNER JOIN doctors ON session.doctor_id = doctors.id 
    INNER JOIN session_type ON session.type_id = session_type.id 
    WHERE appointment.id = ?
  `;

  db.query(query, [appointment_id], (err, data) => {
    if (err) return res.status(500).json(err);
    if (!data || data.length === 0)
      return res.status(404).json("Appointment not found!");

    const ap = data[0];

    // Guaranteed non-null, but may be Date or string depending on MySQL config.
    const toYMD = (d) => {
      if (d instanceof Date) return d.toISOString().slice(0, 10);
      const s = String(d);
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10); // covers DATE + DATETIME strings
      const parsed = new Date(s);
      return parsed.toISOString().slice(0, 10); // will throw if invalid; fine since column is NOT NULL + valid
    };

    const date = toYMD(ap.date);
    const createdAt = toYMD(ap.created_at);

    // Build message (no leading spaces)
    const lines = [
      `*Appointment #${ap.id}*`,
      "===========================",
      `Status: ${ap.is_confirmed ? "Approved" : "Pending"}`,
      "---------------------------",
      "*Session Info -*",
      `Doctor: ${ap.doctor_name}`,
      `Session: ${ap.session_type}`,
      `Time: ${ap.start_time}`,
      `Fee: LKR ${ap.fee}`,
      `Date: ${date}`,
      "---------------------------",
      "*Patient Info -*",
      `Name: ${ap.patient}`,
      `Contact: ${ap.contact}`,
      `Alt Contact: ${ap.alternate_contact || "0"}`,
      `Email: ${ap.email || "None"}`,
      "---------------------------",
      `Note: ${ap.note || "None"}`,
      "===========================",
      "_Powered by Kchord (Pvt) Ltd_",
      `Entry on ${createdAt}`,
    ];

    const message = lines.join("\n");
    sendWhatsappMessage(to, message);
    // sendWhatsappMessage("761294262", message);
  });
};
