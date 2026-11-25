const path = require("node:path");
const dotenv = require("dotenv");

const projectRoot = path.resolve(__dirname, "..");

function loadEnv() {
  dotenv.config({ path: path.join(projectRoot, ".env") });
  dotenv.config({ path: path.join(__dirname, ".env") });
}

module.exports = { loadEnv, projectRoot };
