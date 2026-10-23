import os
import time
import bcrypt
import mysql.connector
from flask import Flask, render_template, request, redirect, session, jsonify
from flask_cors import CORS


# ==============================
# CONFIGURAÇÃO DO FLASK
# ==============================

app = Flask(__name__)
CORS(app)

app.secret_key = os.environ.get("FLASK_SECRET_KEY",
    "chave_secreta_tcc_almoxarifado"
)


# ==============================
# CONFIGURAÇÃO DAS FOTOS
# ==============================

UPLOAD_FOLDER = os.path.join("static", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ==============================
# CONEXÃO COM O BANCO DE DADOS
# ==============================

def obter_conexao():
    return mysql.connector.connect(
        host="db",
        user="root",
        password="mysql_root",
        database="db_almox",
        port=3306,
    )


# ==============================
# PERMISSÃO DISPONÍVEL NOS TEMPLATES
# ==============================

@app.context_processor
def injetar_permissao():
    return {
        "permissao_atual": session.get("permissao")
    }


# ==============================
# LOGIN
# ==============================

@app.route("/")
def LOGIN():
    return render_template("LOGIN.html")


@app.route("/login_invalido")
def LOGIN_INVALIDO():
    return render_template("LOGIN_invalido.html")


@app.route("/controle", methods=["GET", "POST"])
def CONTROLE():
    conexao = obter_conexao()
    cursor = conexao.cursor(buffered=True)

    try:
        if request.method == "POST":
            usuario = request.form.get("usuario")
            senha = request.form.get("senha")

            cursor.execute(
                """
                SELECT usuario, senha, permissao
                FROM usuarios
                WHERE usuario = %s
                """,
                (usuario,),
            )

            resultado = cursor.fetchone()

            if resultado is None:
                return render_template("LOGIN_invalido.html")

            senha_correta = bcrypt.checkpw(
                senha.encode("utf-8"),
                resultado[1].encode("utf-8"),
            )

            if not senha_correta:
                return render_template("LOGIN_invalido.html")

            session["usuario"] = resultado[0]
            session["permissao"] = resultado[2]

        cursor.execute("SELECT * FROM estoque")
        produtos = cursor.fetchall()

        return render_template(
            "ESTOQUE.html",
            resultado=produtos,
        )

    finally:
        cursor.close()
        conexao.close()


# ==============================
# API DE LOGIN PARA O APP MOBILE
# ==============================

@app.route("/api/login", methods=["POST"])
def API_LOGIN():
    dados = request.get_json(silent=True) or {}

    usuario = request.form.get("usuario") or dados.get("usuario")
    senha = request.form.get("senha") or dados.get("senha")

    if not usuario or not senha:
        return jsonify({
            "status": "erro",
            "mensagem": "Usuário e senha são obrigatórios.",
        }), 400

    conexao = obter_conexao()
    cursor = conexao.cursor(buffered=True)

    try:
        cursor.execute(
            """
            SELECT usuario, senha, permissao
            FROM usuarios
            WHERE usuario = %s
            """,
            (usuario,),
        )

        resultado = cursor.fetchone()

    finally:
        cursor.close()
        conexao.close()

    if resultado is None:
        return jsonify({
            "status": "erro",
            "mensagem": "Usuário ou senha inválidos.",
        }), 401

    senha_correta = bcrypt.checkpw(
        senha.encode("utf-8"),
        resultado[1].encode("utf-8"),
    )

    if not senha_correta:
        return jsonify({
            "status": "erro",
            "mensagem": "Usuário ou senha inválidos.",
        }), 401

    return jsonify({
        "status": "sucesso",
        "usuario": resultado[0],
        "permissao": resultado[2],
    }), 200


# ==============================
# ESTOQUE
# ==============================

@app.route("/estoque")
def ESTOQUE():
    conexao = obter_conexao()
    cursor = conexao.cursor(buffered=True)

    try:
        cursor.execute("SELECT * FROM estoque")
        produtos = cursor.fetchall()

        return render_template(
            "ESTOQUE.html",
            resultado=produtos,
        )

    finally:
        cursor.close()
        conexao.close()

# ==============================
# MOVIMENTAÇÃO
# ==============================

@app.route("/movimentacao")
def MOVIMENTACAO():
    conexao = obter_conexao()
    cursor = conexao.cursor(buffered=True)

    try:
        cursor.execute(
            """
            SELECT
                id,
                nome,
                quantidade_disponivel
            FROM estoque
            ORDER BY nome
            """
        )

        produtos = cursor.fetchall()

        cursor.execute(
            """
            SELECT
                id,
                nome_produto,
                tipo,
                quantidade,
                usuario,
                DATE_FORMAT(
                    data_registro,
                    '%d/%m/%Y %H:%i'
                )
            FROM historico
            ORDER BY id DESC
            """
        )

        historico = cursor.fetchall()

        return render_template(
            "MOVIMENTACAO.html",
            produtos=produtos,
            historico=historico,
        )

    finally:
        cursor.close()
        conexao.close()


# ==============================
# SALVAR MOVIMENTAÇÃO
# ==============================

@app.route("/salvar_movimentacao", methods=["POST"])
def SALVAR_MOVIMENTACAO():
    try:
        id_produto = request.form.get("produto")
        tipo = request.form.get("tipo")
        quantidade = int(request.form.get("quantidade", "0"))

        if tipo not in ("Entrada", "Saida"):
            return "Tipo de movimentação inválido.", 400

        if quantidade <= 0:
            return "A quantidade deve ser maior que zero.", 400

    except (TypeError, ValueError):
        return "Quantidade inválida.", 400

    usuario = session.get("usuario", "Administrador")

    conexao = obter_conexao()
    cursor = conexao.cursor(buffered=True)

    try:
        cursor.execute(
            """
            SELECT nome, quantidade_disponivel
            FROM estoque
            WHERE id = %s
            FOR UPDATE
            """,
            (id_produto,),
        )

        produto = cursor.fetchone()

        if produto is None:
            return "Produto não encontrado.", 404

        nome_produto = produto[0]
        estoque_atual = produto[1]

        if tipo == "Entrada":
            novo_estoque = estoque_atual + quantidade

        else:
            if quantidade > estoque_atual:
                return (
                    f"Estoque insuficiente. "
                    f"Disponível: {estoque_atual}"
                ), 400

            novo_estoque = estoque_atual - quantidade

        cursor.execute(
            """
            UPDATE estoque
            SET quantidade_disponivel = %s
            WHERE id = %s
            """,
            (novo_estoque, id_produto),
        )

        cursor.execute(
            """
            INSERT INTO historico (
                nome_produto,
                tipo,
                quantidade,
                usuario,
                data_registro
            )
            VALUES (%s, %s, %s, %s, NOW())
            """,
            (nome_produto, tipo, quantidade, usuario),
        )

        conexao.commit()

    except Exception as erro:
        conexao.rollback()
        app.logger.exception("Erro ao salvar movimentação.")
        return "Erro ao salvar a movimentação no banco de dados.", 500

    finally:
        cursor.close()
        conexao.close()

    return redirect("/movimentacao")


# ==============================
# ADICIONAR NOVOS ITENS
# ==============================

@app.route("/adicionar", methods=["GET", "POST"])
def ADICIONAR():
    if request.method == "POST":
        nome = request.form.get("produto")
        categoria = request.form.get("categoria")
        quantidade = request.form.get("quantidade")
        quantidade_minima = request.form.get("minimo")
        preco = request.form.get("preco")
        descricao = request.form.get("descricao")

        if preco:
            preco = preco.replace(",", ".")

        foto = request.files.get("foto")

        imagem = (
            "https://encrypted-tbn0.gstatic.com/"
            "images?q=tbn:ANd9GcT1lD3czkr0cNGl"
            "MHlhaDziIT-ITO4Nm79glIl185Ew&s=10"
        )

        if foto and foto.filename:
            from werkzeug.utils import secure_filename

            nome_foto = secure_filename(foto.filename)

            if not nome_foto:
                return "Nome de arquivo inválido.", 400

            caminho_foto = os.path.join(
                UPLOAD_FOLDER,
                nome_foto,
            )

            foto.save(caminho_foto)
            imagem = f"/static/uploads/{nome_foto}"

        conexao = obter_conexao()
        cursor = conexao.cursor(buffered=True)

        try:
            cursor.execute(
                """
                INSERT INTO estoque (
                    nome,
                    quantidade_disponivel,
                    quantidade_minima,
                    preco,
                    descricao,
                    categoria,
                    imagem
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    nome,
                    quantidade,
                    quantidade_minima,
                    preco,
                    descricao,
                    categoria,
                    imagem,
                ),
            )

            conexao.commit()

        except Exception:
            conexao.rollback()
            app.logger.exception("Erro ao adicionar produto.")
            return "Erro ao adicionar produto.", 500

        finally:
            cursor.close()
            conexao.close()

        return redirect("/estoque")

    return render_template("ADICIONAR.html")


# ==============================
# USUÁRIOS
# ==============================

@app.route("/usuarios")
def USUARIOS():
    conexao = obter_conexao()
    cursor = conexao.cursor(buffered=True)

    try:
        cursor.execute(
            """
            SELECT id, usuario, senha, permissao
            FROM usuarios
            ORDER BY id
            """
        )

        usuarios = cursor.fetchall()

        return render_template(
            "USUARIOS.html",
            usuarios=usuarios,
        )

    finally:
        cursor.close()
        conexao.close()


# ==============================
# CADASTRAR USUÁRIO
# ==============================

@app.route("/cadastrar_usuario", methods=["POST"])
def CADASTRAR_USUARIO():
    usuario = request.form.get("usuario")
    senha = request.form.get("senha")
    permissao = request.form.get("permissao")

    if not usuario or not senha:
        return "Usuário e senha são obrigatórios.", 400

    if permissao not in ("Administrador", "Funcionário"):
        return "Permissão inválida.", 400

    conexao = obter_conexao()
    cursor = conexao.cursor(buffered=True)

    try:
        cursor.execute(
            """
            SELECT id
            FROM usuarios
            WHERE usuario = %s
            """,
            (usuario,),
        )

        if cursor.fetchone():
            return "Usuário já cadastrado.", 409

        senha_hash = bcrypt.hashpw(
            senha.encode("utf-8"),
            bcrypt.gensalt(),
        ).decode("utf-8")

        cursor.execute(
            """
            INSERT INTO usuarios (
                usuario,
                senha,
                permissao
            )
            VALUES (%s, %s, %s)
            """,
            (usuario, senha_hash, permissao),
        )

        conexao.commit()

    except Exception:
        conexao.rollback()
        app.logger.exception("Erro ao cadastrar usuário.")
        return "Erro ao cadastrar usuário.", 500

    finally:
        cursor.close()
        conexao.close()

    return redirect("/usuarios")


# ==============================
# EXCLUIR USUÁRIO
# ==============================

@app.route("/excluir_usuario/<int:id>", methods=["POST"])
def EXCLUIR_USUARIO(id):
    conexao = obter_conexao()
    cursor = conexao.cursor()

    try:
        cursor.execute(
            """
            DELETE FROM usuarios
            WHERE id = %s
            """,
            (id,),
        )

        conexao.commit()

    except Exception:
        conexao.rollback()
        app.logger.exception("Erro ao excluir usuário.")
        return "Erro ao excluir usuário.", 500

    finally:
        cursor.close()
        conexao.close()

    return redirect("/usuarios")


# ==============================
# EDITAR USUÁRIO
# ==============================

@app.route(
    "/editar_usuario/<int:id>",
    methods=["GET", "POST"],
)
def EDITAR_USUARIO(id):
    conexao = obter_conexao()
    cursor = conexao.cursor(buffered=True)

    try:
        if request.method == "POST":
            usuario = request.form.get("usuario")
            senha = request.form.get("senha")
            permissao = request.form.get("permissao")

            if not usuario:
                return "O usuário é obrigatório.", 400

            if permissao not in ("Administrador", "Funcionário"):
                return "Permissão inválida.", 400

            if senha:
                senha_hash = bcrypt.hashpw(
                    senha.encode("utf-8"),
                    bcrypt.gensalt(),
                ).decode("utf-8")

                cursor.execute(
                    """
                    UPDATE usuarios
                    SET usuario = %s,
                        senha = %s,
                        permissao = %s
                    WHERE id = %s
                    """,
                    (usuario, senha_hash, permissao, id),
                )

            else:
                cursor.execute(
                    """
                    UPDATE usuarios
                    SET usuario = %s,
                        permissao = %s
                    WHERE id = %s
                    """,
                    (usuario, permissao, id),
                )

            conexao.commit()
            return redirect("/usuarios")

        cursor.execute(
            """
            SELECT id, usuario, permissao
            FROM usuarios
            WHERE id = %s
            """,
            (id,),
        )

        dados_usuario = cursor.fetchone()

        if dados_usuario:
            return render_template(
                "EDITAR.html",
                usuario=dados_usuario,
            )

        return "Usuário não encontrado.", 404

    except Exception:
        conexao.rollback()
        app.logger.exception("Erro ao editar usuário.")
        return "Erro ao editar usuário.", 500

    finally:
        cursor.close()
        conexao.close()


# ==============================
# CRIAR BANCO E TABELAS
# ==============================

def inicializar_banco():
    conexao = None
    cursor = None
    tentativas = 10

    while tentativas > 0:
        try:
            conexao = mysql.connector.connect(
                host="db",
                user="root",
                password="mysql_root",
                database="db_almox",
                port=3306,
            )

            print("Conectado ao MySQL com sucesso!")
            break

        except mysql.connector.Error:
            print(
                "Aguardando o MySQL inicializar... "
                f"Tentativas restantes: {tentativas}"
            )

            tentativas -= 1
            time.sleep(3)

    if conexao is None:
        raise RuntimeError(
            "Não foi possível conectar ao banco de dados."
        )

    try:
        cursor = conexao.cursor()

        cursor.execute(
            """
            CREATE DATABASE IF NOT EXISTS db_almox
            CHARACTER SET utf8mb4
            COLLATE utf8mb4_unicode_ci
            """
        )

        cursor.execute("USE db_almox")

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario VARCHAR(100) NOT NULL UNIQUE,
                senha VARCHAR(255) NOT NULL,
                permissao ENUM(
                    'Administrador',
                    'Funcionário'
                ) DEFAULT 'Funcionário'
            )
            """
        )

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS estoque (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                quantidade_disponivel INT NOT NULL DEFAULT 0,
                quantidade_minima INT NOT NULL DEFAULT 0,
                preco DECIMAL(10, 2) NOT NULL,
                descricao VARCHAR(255),
                categoria VARCHAR(100),
                imagem VARCHAR(255)
            )
            """
        )

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS historico (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome_produto VARCHAR(100) NOT NULL,
                tipo ENUM('Entrada', 'Saida') NOT NULL,
                quantidade INT NOT NULL,
                usuario VARCHAR(100) NOT NULL,
                data_registro DATETIME NOT NULL
                    DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        conexao.commit()
        print("Banco e tabelas verificados com sucesso.")

    finally:
        if cursor is not None:
            cursor.close()

        if conexao is not None and conexao.is_connected():
            conexao.close()


# ==============================
# EXECUÇÃO DO APLICATIVO
# ==============================

if __name__ == "__main__":
    inicializar_banco()
    app.run(host="0.0.0.0",port=5000,debug=False,)
