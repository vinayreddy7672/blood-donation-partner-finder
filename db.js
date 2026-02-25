const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "@Vinay1234",
  database: "life_saver_db"
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL Connected ✅");
});

module.exports = db;