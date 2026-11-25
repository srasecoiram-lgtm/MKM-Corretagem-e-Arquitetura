const tables = [
  `CREATE TABLE IF NOT EXISTS administradores (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        nome       VARCHAR(100)  NOT NULL,
        email      VARCHAR(150)  UNIQUE NOT NULL,
        senha      VARCHAR(255)  NOT NULL,
        role       VARCHAR(20)   DEFAULT 'admin',
        ativo      TINYINT(1)    DEFAULT 1,
        criado_em  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
        ultimo_login TIMESTAMP   NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS imoveis (
        id             INT AUTO_INCREMENT PRIMARY KEY,
        cep            VARCHAR(20),
        uf             VARCHAR(5),
        cidade         VARCHAR(100),
        bairro         VARCHAR(100),
        logradouro     VARCHAR(150),
        numero         VARCHAR(20),
        complemento    VARCHAR(100),
        tipo_imovel    VARCHAR(50),
        finalidade     VARCHAR(50),
        edificio       VARCHAR(100),
        responsavel    VARCHAR(100),
        captador       VARCHAR(100),
        tipo_contrato  VARCHAR(50),
        valor          DECIMAL(12,2),
        data_contrato  DATE,
        frente         DECIMAL(10,2),
        largura        DECIMAL(10,2),
        profundidade   DECIMAL(10,2),
        area_total     DECIMAL(10,2),
        quartos        TINYINT,
        banheiros      TINYINT,
        vagas          TINYINT,
        descricao      TEXT,
        link_maps      TEXT,
        imagem         VARCHAR(255),
        ativo          TINYINT(1) DEFAULT 1,
        criado_em      TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
        atualizado_em  TIMESTAMP  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS posts (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      secao         ENUM('blog','arquitetura') NOT NULL DEFAULT 'blog',
      titulo        VARCHAR(255) NOT NULL,
      resumo        TEXT,
      conteudo      LONGTEXT,
      categoria     VARCHAR(100),
      imagem_url    VARCHAR(500),
      tempo_leitura VARCHAR(20),
      destaque      TINYINT(1) DEFAULT 0,
      publicado     TINYINT(1) DEFAULT 1,
      criado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS admin_sessoes (
  id CHAR(36) PRIMARY KEY,
  admin_id INT NOT NULL,
  refresh_hash CHAR(64) NOT NULL UNIQUE,
  expira_em DATETIME NOT NULL,
  INDEX (expira_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

async function createSchema(db) {
  for (const sql of tables) await db.query(sql);
}

module.exports = { createSchema };
