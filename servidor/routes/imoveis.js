const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

//listar imóveis
router.get('/', auth, (req, res) => {
  db.query('SELECT * FROM imoveis', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

//adicionar imóvel
router.post('/', auth, (req, res) => {
  const { titulo, status } = req.body;
  db.query('INSERT INTO imoveis (titulo, status) VALUES (?, ?)', [titulo, status], (err, result) => {
    if (err) return res.status(500).send(err);
    const newImovel = { id: result.insertId, titulo, status };
    res.json(newImovel);
  });
});

//remover imóvel
router.delete('/:id', auth, (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM imoveis WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(204);
  });
});

module.exports = router;
