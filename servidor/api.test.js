const assert = require("node:assert/strict");
const { randomBytes, randomUUID } = require("node:crypto");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const mysql = require("mysql2/promise");
const { createApp } = require("./server");
const { createSchema } = require("./schema");
const { insertAdmin } = require("./routes/auth");

const image = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+nwX8AAAAASUVORK5CYII=", "base64");

test("API MKM com MySQL: sessão, imóveis, mídia e publicação", {
  skip: !process.env.MKM_TEST_DB_HOST,
  timeout: 60000,
}, async (t) => {
  const credentials = {
    host: process.env.MKM_TEST_DB_HOST,
    port: Number(process.env.MKM_TEST_DB_PORT || 3306),
    user: process.env.MKM_TEST_DB_USER || "root",
    password: process.env.MKM_TEST_DB_PASSWORD || "",
  };
  const database = "mkm_test_" + randomBytes(8).toString("hex");
  const owner = await mysql.createConnection(credentials);
  t.after(() => owner.end());
  await owner.query("CREATE DATABASE " + database + " CHARACTER SET utf8mb4");
  const db = mysql.createPool({ ...credentials, database, dateStrings: ["DATE"] });
  const uploadsDir = await fs.mkdtemp(path.join(os.tmpdir(), "mkm-test-uploads-"));
  let server;
  t.after(async () => {
    if (server?.listening) await new Promise((resolve) => server.close(resolve));
    await db.end();
    const cleanup = await mysql.createConnection(credentials);
    try {
      await cleanup.query("DROP DATABASE " + database);
    } finally {
      await cleanup.end();
    }
    await fs.rm(uploadsDir, { recursive: true, force: true });
  });

  await createSchema(db);
  await createSchema(db);
  const account = { nome: "Administrador de teste", email: "teste@example.org", senha: randomUUID() };
  const adminId = await insertAdmin(db, account);
  await createSchema(db);
  const origin = "http://localhost:3000";
  const app = createApp({ db, jwtSecret: randomBytes(32).toString("hex"), frontendUrl: origin, uploadsDir });
  await new Promise((resolve, reject) => {
    server = app.listen(0, "127.0.0.1", resolve);
    server.once("error", reject);
  });
  const address = "http://127.0.0.1:" + server.address().port;

  async function request(route, status, options = {}) {
    const headers = new Headers(options.headers);
    let body = options.body;
    if (body && !(body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(body);
    }
    const res = await fetch(address + route, { method: options.method, headers, body });
    if (status !== res.status) {
      assert.fail(route + " retornou " + res.status + " em vez de " + status + ": " + await res.text());
    }
    return res;
  }
  const json = async (...args) => (await request(...args)).json();

  await request("/health", 200);
  await request("/setup", 404);
  await request("/admin/register", 401, { method: "POST", body: account });
  await request("/imoveis/admin", 401);
  await request("/posts/admin", 401);
  await request("/login", 403, { method: "POST", body: account, headers: { Origin: "https://example.net" } });
  await request("/login", 401, { method: "POST", body: { email: account.email, senha: randomUUID() } });
  const login = await request("/login", 200, { method: "POST", body: account, headers: { Origin: origin } });
  const cookie = login.headers.get("set-cookie");
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Strict/i);
  assert.match(cookie, /Path=\//i);
  assert.equal(login.headers.get("cache-control"), "no-store");
  const loggedIn = await login.json();
  assert.equal(loggedIn.id, adminId);
  assert.equal(loggedIn.role, "admin");
  const sessionCookie = { Cookie: cookie.split(";")[0], Origin: origin };
  const refreshed = await json("/auth/refresh", 200, { method: "POST", headers: sessionCookie });
  const headers = { Authorization: "Bearer " + refreshed.token };
  assert.equal((await json("/auth/me", 200, { headers })).id, adminId);

  const property = { cep: "11700-000", uf: "sp", cidade: "Praia Grande", logradouro: "Rua do Teste",
    finalidade: "Venda", tipo_imovel: "Casa", valor: 300000, area_total: 55, quartos: 4, vagas: 0,
    responsavel: "Interno", complemento: "Unidade 9", data_contrato: "2026-03-19" };
  await request("/imoveis", 401, { method: "POST", body: property });
  await request("/imoveis", 400, { method: "POST", body: { ...property, preco: 0, valor: "inválido" }, headers });
  const upload = new FormData();
  for (const [key, value] of Object.entries(property)) upload.set(key, value);
  const invalid = new FormData();
  for (const [key, value] of upload) invalid.set(key, value);
  invalid.set("imagem", new Blob(["não é uma imagem"], { type: "image/png" }), "invalida.png");
  await request("/imoveis", 400, { method: "POST", body: invalid, headers });
  upload.set("imagem", new Blob([image], { type: "image/png" }), "imovel.png");
  const created = await json("/imoveis", 201, { method: "POST", body: upload, headers });
  const propertyRoute = "/imoveis/" + created.id;
  const uploadResponse = await request(created.imagem, 200);
  assert.equal(uploadResponse.headers.get("cross-origin-resource-policy"), "cross-origin");
  await uploadResponse.arrayBuffer();
  const detail = await json(propertyRoute, 200);
  assert.equal(detail.uf, "SP");
  assert.equal(detail.vagas, 0);
  assert.equal(detail.responsavel, undefined);
  assert.equal(detail.complemento, undefined);
  const privateDetail = await json("/imoveis/admin/" + created.id, 200, { headers });
  assert.equal(privateDetail.responsavel, "Interno");
  assert.equal(privateDetail.data_contrato, "2026-03-19");
  const found = await json("/imoveis?tipo=todos&q=Rua%20do%20Teste&precoMin=200000&quartos=4%2B", 200);
  assert.deepEqual(found.map(({ id }) => id), [created.id]);
  assert.deepEqual(await json("/imoveis?metragemMin=100", 200), []);
  await request("/imoveis?precoMin=100&precoMax=0", 400);
  await request(propertyRoute, 200, { method: "PUT", headers, body: { ...property, removerImagem: true } });
  assert.equal((await json(propertyRoute, 200)).imagem, null);
  await request(created.imagem, 404);
  await request(propertyRoute, 200, { method: "DELETE", headers });
  await request(propertyRoute, 404);
  await request(propertyRoute, 404, { method: "PUT", headers, body: property });

  const post = await json("/posts", 201, { method: "POST", headers, body: {
    secao: "arquitetura", titulo: "Artigo de teste", resumo: "Resumo", conteudo: "## Texto", publicado: false,
  } });
  const postRoute = "/posts/" + post.id;
  await request(postRoute, 404);
  assert.deepEqual(await json("/posts?secao=arquitetura", 200), []);
  assert.equal((await json("/posts/admin?secao=arquitetura", 200, { headers }))[0].publicado, 0);
  await request(postRoute + "/status", 200, { method: "PATCH", headers, body: { publicado: true } });
  assert.equal((await json(postRoute, 200)).conteudo, "## Texto");
  assert.equal((await json("/posts?secao=arquitetura", 200))[0].titulo, "Artigo de teste");
  assert.deepEqual(await json("/posts?secao=blog", 200), []);
  await request(postRoute, 200, { method: "DELETE", headers });
  await request(postRoute, 404);

  await request("/auth/logout", 200, { method: "POST", headers: sessionCookie });
  await request("/auth/refresh", 401, { method: "POST", headers: sessionCookie });
  await request("/auth/me", 401, { headers });
});
