-- ==========================================
-- APAGA E CRIA O BANCO
-- ==========================================
SET NAMES 'utf8mb4';

DROP DATABASE IF EXISTS db_almox;

CREATE DATABASE db_almox
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE db_almox;


-- ==========================================
-- TABELA DE USUÁRIOS
-- ==========================================

CREATE TABLE usuarios (

    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario VARCHAR(100) NOT NULL UNIQUE,

    senha VARCHAR(255) NOT NULL,

    permissao ENUM('Administrador','Funcionário')
    DEFAULT 'Funcionário'

);


-- ==========================================
-- TABELA DE ESTOQUE
-- ==========================================

CREATE TABLE estoque (

    id INT AUTO_INCREMENT PRIMARY KEY,

    nome VARCHAR(100) NOT NULL,

    quantidade_disponivel INT NOT NULL DEFAULT 0,

    quantidade_minima INT NOT NULL DEFAULT 0,

    preco DECIMAL(10,2) NOT NULL,

    descricao VARCHAR(255),

    categoria VARCHAR(100),

    imagem VARCHAR(255)

);


-- ==========================================
-- TABELA DE HISTÓRICO
-- ==========================================

CREATE TABLE historico (

    id INT AUTO_INCREMENT PRIMARY KEY,

    nome_produto VARCHAR(100) NOT NULL,

    tipo ENUM('Entrada','Saida') NOT NULL,

    quantidade INT NOT NULL,

    usuario VARCHAR(100) NOT NULL,

    data_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP

);


-- ==========================================
-- USUÁRIOS PADRÃO
-- Senha dos três = 123456
-- ==========================================

INSERT INTO usuarios (usuario, senha, permissao)
VALUES
(
'eduardo@gmail.com',
'$2a$12$19EXc7/LxkZsxW/nSJy4g.VfUTYIhkvDfcGHaDImlPGjq5hkdxTYm',
'Administrador'
);

INSERT INTO usuarios (usuario, senha, permissao)
VALUES
(
'vitor@gmail.com',
'$2a$12$5ao9WA7RjHyhyRN.W0b9oO5Px20NAhM/YsormQN.XfFe2Wu/PHtsO',
'Administrador'
);

INSERT INTO usuarios (usuario, senha, permissao)
VALUES
(
'lucas@gmail.com',
'$2a$12$hEuZMsE/GaTxAJxCbyv6EuN1p3cp310kWyO/PDhfr.ZPBIvVZR0G2',
'Funcionário'
);


-- ==========================================
-- PRODUTOS
-- ==========================================

INSERT INTO estoque
(nome, quantidade_disponivel, quantidade_minima, preco, descricao, categoria, imagem)
VALUES
('Martelo',32,2,53.90,'Para pregar','Ferramenta','https://cdn.leroymerlin.com.br/products/martelo_unha_cabo_de_plastico_28,8cm_dexter_90114150_0001_300x300.jpg'),

('Chave de Fenda',22,2,22.90,'Para apertar parafusos','Ferramenta','https://cdn.leroymerlin.com.br/products/chave_de_fenda_7_32x4_dexter_89573295_8dbf_300x300.jpeg'),

('Chave Phillips',20,2,18.90,'Para parafusos Phillips','Ferramenta','https://cdn.leroymerlin.com.br/products/chave_phillips_ph1x80mm_dexter__89680150_0001_300x300.jpg'),

('Parafusadeira',11,2,300.75,'Parafusar e desparafusar','Ferramenta','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1lDfl3czkr0cNGlMHlhaDziIT-ITO4Nm79glIl185Ew&s=10'),

('Furadeira',8,2,831.90,'Para furar superfícies','Ferramenta','https://cdn.leroymerlin.com.br/products/martelete_sds_plus_820w_gbh_2_24_d_com_maleta_220v_bosch_89974934_16ac_300x300.jpg'),

('Capacete',40,2,97.90,'Proteção da cabeça','EPIs','https://cdn.leroymerlin.com.br/products/capacete_de_seguranca_h_701_branco_3m_91960001_ea5f_300x300.jpg'),

('Óculos de Proteção',42,2,7.19,'Proteção dos olhos','EPIs','https://cdn.leroymerlin.com.br/products/oculos_de_seguranca_incolor_spectra_2000_carbografite_89257924_e881_300x300.jpg'),

('Luva',26,2,4.99,'Proteção das mãos','EPIs','https://cdn.leroymerlin.com.br/products/luva_servicos_gerais_grande_flextactil_danny_92345813_e573_300x300.jpg'),

('Calçado de Segurança',38,2,139.90,'Proteção dos pés','EPIs','https://cdn.leroymerlin.com.br/products/bota_de_seguranca_em_cadarco_no40_biqueira_plastica_dexter_90976515_3e61_300x300.jpg'),

('Colete de Segurança',72,2,39.90,'Sinalização visual','EPIs','https://cdn.leroymerlin.com.br/products/colete_faixa_sinalizador_refletivo_seguranca_trabalho_epi_blu_1568662138_d9b6_300x300.jpg');


-- ==========================================
-- CONSULTAS
-- ==========================================

SELECT * FROM usuarios;

SELECT * FROM estoque;

SELECT * FROM historico;