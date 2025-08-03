import mysql2 from "mysql2";

// create the pool with recommended stability options
export const db = mysql2.createPool({
  host: "194.233.65.197",
  user: "kchord",
  password: "Kchordgroup*789789", // change before production!
  database: "channeling",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // 10 sec connect timeout
  enableKeepAlive: true, // send TCP keepalives
  keepAliveInitialDelay: 0, // start keepalives immediately
});

// verify initial connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Initial DB connection failed:", err);
    return;
  }
  console.log("✅ DB connected successfully");
  connection.release();
});

// global error handler for the pool
db.on("error", (err) => {
  console.error("❌ MySQL pool error:", err);
  // optionally send alert / restart server if fatal
});

// keep the pool warm to prevent idle timeouts
setInterval(() => {
  db.query("SELECT 1", (err) => {
    if (err) {
      console.error("❌ DB ping error:", err);
    }
  });
}, 60000); // every 60 seconds

// (optional) export a promise-based wrapper
export const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};
