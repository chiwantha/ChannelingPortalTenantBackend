import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const getPasswd = (req, res) => {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(req.body.password);

  return res.status(200).json({ passwordsh: hashedPassword });
};

export const userAuthentication = (req, res) => {
  // console.log(req.body);
  const username = req.body.username;
  const passkey = req.body.password;
  const role = req.body.role;

  let query = "";
  if (role === "0") {
    query = ``;
  } else if (role === 1) {
    query = `SELECT * FROM super_users WHERE state=1 AND username = ?`;
  } else {
    return res.status(500).json("Internal Server Error !");
  }

  db.query(query, [username], (err, data) => {
    if (err) return res.status(500).json("error :" + err);

    if (data.length === 0) return res.status(401).json("Invalid Credentials !");

    const comparePassword = bcrypt.compareSync(passkey, data[0].password);

    if (!comparePassword) return res.status(401).json("Invalid Credentials !");

    const token = jwt.sign({ id: data[0].id }, "secretkey");

    const {
      password,
      created_at,
      created_by,
      state,
      id,
      last_attempt_at,
      ...otheruserdata
    } = data[0];

    return res
      .cookie("accesstoken", token, {
        httpOnly: true,
      })
      .status(200)
      .json(otheruserdata);
  });
};

export const userdeAuthentication = (req, res) => {
  return res
    .clearCookie("accesstoken", {
      secure: true,
      sameSite: "none",
    })
    .status(200)
    .json("User Logged Out !");
};
