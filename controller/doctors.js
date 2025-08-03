import { db } from "../db.js";

export const loadList = (req, res) => {
  const hospital_id = req.body.hospital_id;
  const query = `SELECT doctor_assignments.doctor_id AS id, doctors.name, specialization.specialization, doctors.image FROM 
    doctor_assignments
    inner join doctors on doctors.id = doctor_assignments.doctor_id
     inner join specialization on doctors.specialization_id = specialization.id
     where doctor_assignments.hospital_id = ?`;
  db.query(query, [hospital_id], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const loadSpecialization = (req, res) => {
  const query = `SELECT id, specialization, icon FROM specialization;`;
  db.query(query, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const loadProfile = (req, res) => {
  const doctor_id = req.query.doctor_id;
  const query = `SELECT doctors.id, doctors.name, specialization.specialization, doctors.description, doctors.image, hospital.name AS hospital FROM doctors
  INNER JOIN specialization ON doctors.specialization_id = specialization.id
  INNER JOIN hospital ON doctors.hospital_id = hospital.id
  WHERE doctors.id = ?`;
  db.query(query, [doctor_id], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length > 0) {
      return res.status(200).json(data[0]);
    } else {
      return res.status(404).json("Doctor Not Found !");
    }
  });
};

export const loadSessions = (req, res) => {
  const session_id = req.query.session_id;
  const query = `SELECT session.id, day.day, session.start_time, session.end_time,
    session_type.name AS type, session.fee
    FROM session
    INNER JOIN session_type ON session.type_id = session_type.id
    INNER JOIN day ON session.day_id = day.id
    WHERE session.id = ?`;
  db.query(query, [session_id], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const loadFullProfileData = (req, res) => {
  const hospital_id = req.body.hospital_id;
  const doctor_id = req.body.doctor_id;

  const profileQuery = `
    SELECT doctor_assignments.doctor_id AS id, doctors.name, specialization.specialization, doctors.description,
     doctors.image, incharge.name AS hospital
    FROM doctor_assignments
    INNER JOIN doctors ON doctor_assignments.doctor_id = doctors.id
    INNER JOIN specialization ON doctors.specialization_id = specialization.id
    INNER JOIN incharge ON doctors.hospital_id = incharge.id
    WHERE doctors.id = ? AND doctor_assignments.hospital_id = ?
  `;

  const sessionsQuery = `
    SELECT session.id, day.day, session.start_time, session.end_time,
    session_type.name AS type, session.fee
    FROM session
    INNER JOIN session_type ON session.type_id = session_type.id
    INNER JOIN day ON session.day_id = day.id
    WHERE session.doctor_id = ? AND session.hospital_id = ?
  `;

  db.query(profileQuery, [doctor_id, hospital_id], (err, profileData) => {
    if (err) return res.status(500).json(err);

    if (profileData.length === 0) {
      return res.status(404).json("Doctor Not Found !");
    }

    db.query(sessionsQuery, [doctor_id, hospital_id], (err, sessionsData) => {
      if (err) return res.status(500).json(err);

      // send as a single array [profile, sessions]
      return res.status(200).json([
        profileData[0], // profile data as object
        sessionsData, // sessions as array
      ]);
    });
  });
};
