import { db } from "../db.js";

export const loadAppData = (req, res) => {
  const hostname = req.body.hostname;
  console.log(hostname);

  const query = `SELECT color_palette.* , hospital.* FROM hospital
  INNER JOIN color_palette ON color_palette.id = hospital.color_palette_id
  WHERE hospital.hostname = ?`;

  db.query(query, [hostname], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json(`No Hospital Found !`);
    return res.status(200).json(data[0]);
  });
};
