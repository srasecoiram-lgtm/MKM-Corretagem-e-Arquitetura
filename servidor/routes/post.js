const express = require("express");
const { text, webUrl, id, invalid } = require("../validation");
const { receiveImage, imageStore, transaction } = require("../uploads");

function section(value) {
  const result = text(value, "Seção", 20);
  if (result && !["blog", "arquitetura"].includes(result)) throw invalid("Seção inválida.");
  return result;
}

function flag(value, fallback) {
  if (value == null) return fallback;
  if ([true, 1, "1", "true"].includes(value)) return 1;
  if ([false, 0, "0", "false"].includes(value)) return 0;
  throw invalid("Status de publicação inválido.");
}

function post(body) {
  return {
    secao: section(body.secao) || "blog",
    titulo: text(body.titulo, "Título", 255, true),
    resumo: text(body.resumo, "Resumo", 4000),
    conteudo: text(body.conteudo, "Conteúdo", 64000),
    categoria: text(body.categoria, "Categoria", 100),
    tempo_leitura: text(body.tempo_leitura, "Tempo de leitura", 20),
    destaque: flag(body.destaque, 0),
    publicado: flag(body.publicado, 1),
  };
}

function createPostRouter({ db, requireAdmin, uploadsDir }) {
  const router = express.Router();
  const images = imageStore(uploadsDir, "posts");
  const listFields = "id, secao, titulo, resumo, categoria, imagem_url, tempo_leitura, destaque, criado_em";

  function list(admin) {
    return async (req, res, next) => {
      try {
        const selected = section(req.query.secao);
        const where = admin ? "1 = 1" : "publicado = 1";
        const fields = admin ? "*" : listFields;
        const order = admin ? "" : "destaque DESC, ";
        const [rows] = await db.execute(
          "SELECT " + fields + " FROM posts WHERE " + where + (selected ? " AND secao = ?" : "") +
          " ORDER BY " + order + "criado_em DESC, id DESC", selected ? [selected] : []
        );
        res.json(rows);
      } catch (error) { next(error); }
    };
  }

  router.get("/", list(false));
  router.get("/admin", requireAdmin, list(true));
  router.get("/:id", async (req, res, next) => {
    try {
      const [rows] = await db.execute(
        "SELECT " + listFields + ", conteudo FROM posts WHERE id = ? AND publicado = 1", [id(req.params.id)]
      );
      if (!rows[0]) return res.status(404).json({ erro: "Post não encontrado." });
      res.json(rows[0]);
    } catch (error) { next(error); }
  });

  router.post("/", requireAdmin, receiveImage, async (req, res, next) => {
    let image;
    try {
      const body = req.body || {};
      const data = post(body);
      image = await images.save(req.file);
      data.imagem_url = image || webUrl(body.imagem_url, "URL da imagem", 500);
      const [result] = await db.query("INSERT INTO posts SET ?", data);
      res.status(201).json({ success: true, id: result.insertId, imagem_url: data.imagem_url });
    } catch (error) {
      await images.remove(image);
      next(error);
    }
  });

  router.put("/:id", requireAdmin, receiveImage, async (req, res, next) => {
    let image;
    try {
      const code = id(req.params.id);
      const body = req.body || {};
      const data = post(body);
      image = await images.save(req.file);
      const oldImage = await transaction(db, async (connection) => {
        const [rows] = await connection.execute("SELECT imagem_url FROM posts WHERE id = ? FOR UPDATE", [code]);
        if (!rows[0]) return undefined;
        const previous = rows[0].imagem_url;
        const requested = body.imagem_url;
        data.imagem_url = image || (requested === undefined || requested === previous
          ? previous : webUrl(requested, "URL da imagem", 500));
        await connection.query("UPDATE posts SET ? WHERE id = ?", [data, code]);
        return previous;
      });
      if (oldImage === undefined) {
        await images.remove(image);
        return res.status(404).json({ erro: "Post não encontrado." });
      }
      if (oldImage !== data.imagem_url) await images.remove(oldImage);
      res.json({ success: true, imagem_url: data.imagem_url });
    } catch (error) {
      await images.remove(image);
      next(error);
    }
  });

  router.patch("/:id/status", requireAdmin, async (req, res, next) => {
    try {
      const published = flag(req.body?.publicado, null);
      if (published === null) throw invalid("Informe o status de publicação.");
      const [result] = await db.execute("UPDATE posts SET publicado = ? WHERE id = ?", [published, id(req.params.id)]);
      if (!result.affectedRows) return res.status(404).json({ erro: "Post não encontrado." });
      res.json({ success: true });
    } catch (error) { next(error); }
  });

  router.delete("/:id", requireAdmin, async (req, res, next) => {
    try {
      const code = id(req.params.id);
      const image = await transaction(db, async (connection) => {
        const [rows] = await connection.execute("SELECT imagem_url FROM posts WHERE id = ? FOR UPDATE", [code]);
        if (!rows[0]) return undefined;
        await connection.execute("DELETE FROM posts WHERE id = ?", [code]);
        return rows[0].imagem_url;
      });
      if (image === undefined) return res.status(404).json({ erro: "Post não encontrado." });
      await images.remove(image);
      res.json({ success: true });
    } catch (error) { next(error); }
  });

  return router;
}

module.exports = { createPostRouter };
