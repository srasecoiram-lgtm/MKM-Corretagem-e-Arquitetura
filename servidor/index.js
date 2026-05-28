const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Rota com filtros
app.get('/imoveis', async (req, res) => {
  try {
    const { status, metragemMin, metragemMax, precoMin, precoMax } = req.query;

    let sql = "SELECT * FROM imoveis WHERE 1=1";
    const values = [];

    if (status) {
      sql += " AND status = ?";
      values.push(status);
    }

    if (metragemMin) {
      sql += " AND metragem >= ?";
      values.push(Number(metragemMin));
    }

    if (metragemMax) {
      sql += " AND metragem <= ?";
      values.push(Number(metragemMax));
    }

    if (precoMin) {
      sql += " AND preco >= ?";
      values.push(Number(precoMin));
    }

    if (precoMax) {
      sql += " AND preco <= ?";
      values.push(Number(precoMax));
    }

    const [rows] = await db.query(sql, values);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar imóveis:", err);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
