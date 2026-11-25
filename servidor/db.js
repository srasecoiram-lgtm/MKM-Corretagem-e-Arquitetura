const mysql = require("mysql2/promise");

function createPool(env = process.env) {
  return mysql.createPool({
    host: env.DB_HOST || "127.0.0.1",
    port: Number(env.DB_PORT || 3306),
    user: env.DB_USER || "root",
    password: env.DB_PASSWORD || "",
    database: env.DB_NAME || "MKM",
    charset: "utf8mb4",
    dateStrings: ["DATE"],
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 50,
  });
}

module.exports = { createPool };
