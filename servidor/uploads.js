const { randomUUID } = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const multer = require("multer");
const { invalid } = require("./validation");

const receiveImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 30, fieldSize: 128 * 1024 },
}).single("imagem");

function imageType(buffer) {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return ["jpg", "image/jpeg"];
  if (buffer.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"))) return ["png", "image/png"];
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return ["webp", "image/webp"];
  }
  return null;
}

function imageStore(root, folder) {
  const prefix = "/uploads/" + folder + "/";
  const directory = path.join(root, folder);
  const filenamePattern = /^[a-z0-9-]+\.(?:jpe?g|png|webp)$/i;
  function owns(url) {
    return typeof url === "string" && url.startsWith(prefix) && filenamePattern.test(url.slice(prefix.length));
  }
  return {
    owns,
    async save(file) {
      if (!file) return null;
      const type = imageType(file.buffer);
      if (!type || file.mimetype !== type[1]) throw invalid("Envie uma imagem JPG, PNG ou WebP válida.");
      const filename = randomUUID() + "." + type[0];
      await fs.mkdir(directory, { recursive: true });
      await fs.writeFile(path.join(directory, filename), file.buffer, { flag: "wx" });
      return prefix + filename;
    },
    async remove(url) {
      if (!owns(url)) return;
      try {
        await fs.unlink(path.join(directory, url.slice(prefix.length)));
      } catch (error) {
        if (error.code !== "ENOENT") console.error("Falha ao limpar imagem MKM:", error.code);
      }
    },
  };
}

async function transaction(db, run) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const result = await run(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { receiveImage, imageStore, transaction };
