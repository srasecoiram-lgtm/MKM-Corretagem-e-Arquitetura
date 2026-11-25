const express = require("express");
const { text, number, date, webUrl, id, invalid } = require("../validation");
const { receiveImage, imageStore, transaction } = require("../uploads");

const publicFields = [
  "id", "cep", "uf", "cidade", "bairro", "logradouro", "numero", "tipo_imovel", "finalidade", "edificio",
  "valor", "frente", "largura", "profundidade", "area_total", "quartos", "banheiros", "vagas",
  "descricao", "link_maps", "imagem", "criado_em", "atualizado_em",
].join(", ");

function property(body) {
  const cep = text(body.cep, "CEP", 20, true);
  if (!/^\d{5}-?\d{3}$/.test(cep)) throw invalid("CEP inválido.");
  const uf = text(body.uf, "UF", 2, true).toUpperCase();
  if (!/^[A-Z]{2}$/.test(uf)) throw invalid("UF inválida.");

  const data = { cep, uf, cidade: text(body.cidade, "Cidade", 100, true) };
  const textFields = {
    bairro: 100, logradouro: 150, numero: 20, complemento: 100, tipo_imovel: 50, finalidade: 50,
    edificio: 100, responsavel: 100, captador: 100, tipo_contrato: 50, descricao: 12000,
  };
  for (const [field, limit] of Object.entries(textFields)) data[field] = text(body[field], field, limit);
  for (const field of ["frente", "largura", "profundidade", "area_total"]) {
    data[field] = number(body[field], field, { max: 99999999.99 });
  }
  for (const field of ["quartos", "banheiros", "vagas"]) {
    data[field] = number(body[field], field, { integer: true, max: 127 });
  }
  data.valor = number(body.valor, "Valor");
  data.data_contrato = date(body.data_contrato);
  data.link_maps = webUrl(body.link_maps, "Link do mapa", 2000);
  return data;
}

function filters(query) {
  const conditions = ["ativo = 1"];
  const values = [];
  const add = (condition, ...params) => { conditions.push(condition); values.push(...params); };
  for (const [name, column] of Object.entries({ tipo: "tipo_imovel", finalidade: "finalidade", status: "tipo_contrato" })) {
    const value = text(query[name], name, 50);
    if (value && value !== "todos") add(column + " = ?", value);
  }

  const city = text(query.cidade, "Cidade", 100);
  if (city) add("cidade LIKE ?", "%" + city + "%");
  const q = text(query.q, "Busca", 150);
  if (q) {
    const columns = ["edificio", "bairro", "cidade", "logradouro", "tipo_imovel", "descricao"];
    add("(" + columns.map((column) => column + " LIKE ?").join(" OR ") + ")", ...columns.map(() => "%" + q + "%"));
  }

  for (const [key, column] of Object.entries({ metragem: "area_total", preco: "valor" })) {
    const min = number(query[key + "Min"], key + " mínima");
    const max = number(query[key + "Max"], key + " máxima");
    if (min !== null && max !== null && min > max) throw invalid("O mínimo deve ser menor ou igual ao máximo.");
    if (min !== null) add(column + " >= ?", min);
    if (max !== null) add(column + " <= ?", max);
  }
  for (const column of ["quartos", "vagas"]) {
    const filter = text(query[column], column, 20);
    if (!filter) continue;
    const choices = [...new Set(filter.split(","))];
    if (choices.some((item) => !["1", "2", "3", "4+"].includes(item))) throw invalid("Filtro de " + column + " inválido.");
    const exact = choices.filter((item) => item !== "4+");
    const options = exact.length ? [column + " IN (" + exact.map(() => "?").join(", ") + ")"] : [];
    if (choices.includes("4+")) options.push(column + " >= 4");
    add("(" + options.join(" OR ") + ")", ...exact.map(Number));
  }
  return { where: conditions.join(" AND "), values };
}

function createPropertyRouter({ db, requireAdmin, uploadsDir }) {
  const router = express.Router();
  const images = imageStore(uploadsDir, "imoveis");

  router.get("/", async (req, res, next) => {
    try {
      const { where, values } = filters(req.query);
      const [rows] = await db.execute(
        "SELECT " + publicFields + " FROM imoveis WHERE " + where + " ORDER BY criado_em DESC, id DESC",
        values
      );
      res.json(rows);
    } catch (error) { next(error); }
  });

  router.get("/admin", requireAdmin, async (_req, res, next) => {
    try {
      const [rows] = await db.query("SELECT * FROM imoveis ORDER BY criado_em DESC, id DESC");
      res.json(rows);
    } catch (error) { next(error); }
  });

  function detail(admin) {
    return async (req, res, next) => {
      try {
        const select = admin ? "* FROM imoveis WHERE id = ?" : publicFields + " FROM imoveis WHERE id = ? AND ativo = 1";
        const [rows] = await db.execute("SELECT " + select, [id(req.params.id)]);
        if (!rows[0]) return res.status(404).json({ erro: "Imóvel não encontrado." });
        res.json(rows[0]);
      } catch (error) { next(error); }
    };
  }

  router.get("/admin/:id", requireAdmin, detail(true));
  router.get("/:id", detail(false));

  router.post("/", requireAdmin, receiveImage, async (req, res, next) => {
    let image;
    try {
      const data = property(req.body || {});
      image = await images.save(req.file);
      const [result] = await db.query("INSERT INTO imoveis SET ?", { ...data, imagem: image });
      res.status(201).json({ success: true, id: result.insertId, imagem: image });
    } catch (error) {
      await images.remove(image);
      next(error);
    }
  });

  router.put("/:id", requireAdmin, receiveImage, async (req, res, next) => {
    let image;
    try {
      const code = id(req.params.id);
      const data = property(req.body || {});
      image = await images.save(req.file);
      const removeImage = [true, "true"].includes(req.body?.removerImagem);
      const oldImage = await transaction(db, async (connection) => {
        const [rows] = await connection.execute("SELECT imagem FROM imoveis WHERE id = ? FOR UPDATE", [code]);
        if (!rows[0]) return undefined;
        if (image || removeImage) data.imagem = image;
        await connection.query("UPDATE imoveis SET ? WHERE id = ?", [data, code]);
        return rows[0].imagem;
      });
      if (oldImage === undefined) {
        await images.remove(image);
        return res.status(404).json({ erro: "Imóvel não encontrado." });
      }
      if (image || removeImage) await images.remove(oldImage);
      res.json({ success: true });
    } catch (error) {
      await images.remove(image);
      next(error);
    }
  });

  router.delete("/:id", requireAdmin, async (req, res, next) => {
    try {
      const code = id(req.params.id);
      const image = await transaction(db, async (connection) => {
        const [rows] = await connection.execute("SELECT imagem FROM imoveis WHERE id = ? FOR UPDATE", [code]);
        if (!rows[0]) return undefined;
        await connection.execute("DELETE FROM imoveis WHERE id = ?", [code]);
        return rows[0].imagem;
      });
      if (image === undefined) return res.status(404).json({ erro: "Imóvel não encontrado." });
      await images.remove(image);
      res.json({ success: true });
    } catch (error) { next(error); }
  });

  return router;
}

module.exports = { createPropertyRouter };
