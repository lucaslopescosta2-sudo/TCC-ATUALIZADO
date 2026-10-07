import os
from flask import Flask, render_template, request, redirect, session
import mysql.connector
import bcrypt

 
app = Flask(__name__)

# Chave necessária para o Flask conseguir usar sessão (guardar quem está logado)
app.secret_key = "chave_secreta_tcc_almoxarifado"


# ==============================
# CONFIGURAÇÃO DAS FOTOS
# ==============================

UPLOAD_FOLDER = os.path.join(
    'static',
    'uploads'
)


if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)



# ==============================
# CONEXÃO COM BANCO
# ==============================


def obter_conexao():

    return mysql.connector.connect(

        host="localhost",

        user="root",

        password="",

        database="db_almox",

        port=3306

    )



# ==============================
# PERMISSÃO DISPONÍVEL EM TODOS OS TEMPLATES
# (evita ter que passar "permissao" manualmente
# em cada render_template do site)
# ==============================


@app.context_processor
def injetar_permissao():

    return {
        "permissao_atual": session.get("permissao")
    }



# ==============================
# LOGIN
# ==============================


@app.route('/')
def LOGIN():

    return render_template(
        "LOGIN.html"
    )



@app.route('/login_invalido')
def LOGIN_INVALIDO():

    return render_template(
        "LOGIN_invalido.html"
    )



@app.route('/controle', methods=["GET","POST"])
def CONTROLE():


    conexao = obter_conexao()

    cursor = conexao.cursor(
        buffered=True
    )



    if request.method == "POST":


        usuario = request.form.get(
            "usuario"
        )


        senha = request.form.get(
            "senha"
        )



        cursor.execute(

            """
            SELECT usuario, senha, permissao
            FROM usuarios
            WHERE usuario=%s
            """,

            (usuario,)

        )



        resultado = cursor.fetchone()



        if resultado is None:


            cursor.close()

            conexao.close()


            return render_template(
                "LOGIN_invalido.html"
            )



        senha_correta = bcrypt.checkpw(

            senha.encode("utf-8"),

            resultado[1].encode("utf-8")

        )



        if not senha_correta:


            cursor.close()

            conexao.close()


            return render_template(
                "LOGIN_invalido.html"
            )



        # Login validado: guarda o usuário e a permissão na sessão
        session["usuario"] = resultado[0]
        session["permissao"] = resultado[2]



    cursor.execute(
        "SELECT * FROM estoque"
    )


    produtos = cursor.fetchall()



    cursor.close()

    conexao.close()



    return render_template(

        "CONTROLE.html",

        resultado=produtos

    )

# ==============================
# ESTOQUE
# ==============================


@app.route('/estoque')
def ESTOQUE():


    conexao = obter_conexao()

    cursor = conexao.cursor(
        buffered=True
    )


    cursor.execute(
        "SELECT * FROM estoque"
    )


    produtos = cursor.fetchall()



    cursor.close()

    conexao.close()



    return render_template(
        "CONTROLE.html",
        resultado=produtos
    )





# ==============================
# MOVIMENTAÇÃO
# ==============================


@app.route('/movimentacao')
def MOVIMENTACAO():


    conexao = obter_conexao()

    cursor = conexao.cursor(
        buffered=True
    )



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



    cursor.close()

    conexao.close()



    return render_template(

        "MOVIMENTACAO.html",

        produtos=produtos,

        historico=historico

    )





# ==============================
# SALVAR MOVIMENTAÇÃO
# ==============================


@app.route('/salvar_movimentacao', methods=["POST"])
def SALVAR_MOVIMENTACAO():


    id_produto = request.form.get(
        "produto"
    )


    tipo = request.form.get(
        "tipo"
    )


    quantidade = int(
        request.form.get(
            "quantidade"
        )
    )



    usuario = "Administrador"



    conexao = obter_conexao()

    cursor = conexao.cursor(
        buffered=True
    )



    try:


        cursor.execute(
            """
            SELECT 
            nome,
            quantidade_disponivel

            FROM estoque

            WHERE id=%s

            """,

            (id_produto,)
        )



        produto = cursor.fetchone()



        if produto is None:

            return "Produto não encontrado"



        nome_produto = produto[0]

        estoque_atual = produto[1]




        if tipo == "Entrada":


            novo_estoque = (
                estoque_atual + quantidade
            )


        else:


            if quantidade > estoque_atual:


                return (
                    f"Estoque insuficiente. "
                    f"Disponível: {estoque_atual}"
                )



            novo_estoque = (
                estoque_atual - quantidade
            )




        cursor.execute(

            """
            UPDATE estoque

            SET quantidade_disponivel=%s

            WHERE id=%s

            """,

            (
                novo_estoque,
                id_produto
            )

        )




        cursor.execute(

            """
            INSERT INTO historico

            (
            nome_produto,
            tipo,
            quantidade,
            usuario,
            data_registro
            )


            VALUES

            (%s,%s,%s,%s,NOW())

            """,

            (
                nome_produto,
                tipo,
                quantidade,
                usuario
            )

        )



        conexao.commit()



    except Exception as erro:


        conexao.rollback()


        return f"Erro no banco: {erro}"



    finally:


        cursor.close()

        conexao.close()



    return redirect(
        "/movimentacao"
    )

# ==============================
# ADICIONAR NOVOS ITENS
# ==============================


@app.route('/adicionar', methods=["GET","POST"])
def ADICIONAR():


    if request.method == "POST":


        nome = request.form.get(
            "produto"
        )


        categoria = request.form.get(
            "categoria"
        )


        quantidade = request.form.get(
            "quantidade"
        )


        quantidade_minima = request.form.get(
            "minimo"
        )


        preco = request.form.get(
            "preco"
        )


        descricao = request.form.get(
            "descricao"
        )



        # Corrigir preço com vírgula

        if preco:

            preco = preco.replace(
                ",",
                "."
            )




        # ==============================
        # FOTO DO PRODUTO
        # ==============================


        foto = request.files.get(
            "foto"
        )



        imagem = (
            "https://encrypted-tbn0.gstatic.com/"
            "images?q=tbn:ANd9GcT1lD3czkr0cNGl"
            "MHlhaDziIT-ITO4Nm79glIl185Ew&s=10"
        )



        if foto and foto.filename != "":


            nome_foto = foto.filename



            caminho_foto = os.path.join(

                UPLOAD_FOLDER,

                nome_foto

            )



            foto.save(
                caminho_foto
            )



            imagem = (
                f"/static/uploads/{nome_foto}"
            )






        conexao = obter_conexao()

        cursor = conexao.cursor(
            buffered=True
        )



        try:


            cursor.execute(

                """

                INSERT INTO estoque

                (

                nome,

                quantidade_disponivel,

                quantidade_minima,

                preco,

                descricao,

                categoria,

                imagem

                )


                VALUES

                (%s,%s,%s,%s,%s,%s,%s)

                """,


                (

                nome,

                quantidade,

                quantidade_minima,

                preco,

                descricao,

                categoria,

                imagem

                )

            )



            conexao.commit()



        except Exception as erro:


            conexao.rollback()


            return (
                f"Erro ao adicionar produto: {erro}"
            )



        finally:


            cursor.close()

            conexao.close()




        return redirect(
            "/controle"
        )




    return render_template(
        "ADICIONAR.html"
    )

# ==============================
# USUÁRIOS
# ==============================


@app.route('/usuarios')
def USUARIOS():


    conexao = obter_conexao()

    cursor = conexao.cursor(
        buffered=True
    )



    cursor.execute(

        """

        SELECT

        id,

        usuario,

        senha,

        permissao


        FROM usuarios


        ORDER BY id

        """

    )



    usuarios = cursor.fetchall()



    cursor.close()

    conexao.close()



    return render_template(

        "USUARIOS.html",

        usuarios=usuarios

    )





# ==============================
# CADASTRAR USUÁRIO
# ==============================


@app.route(
    '/cadastrar_usuario',
    methods=["POST"]
)
def CADASTRAR_USUARIO():


    usuario = request.form.get(
        "usuario"
    )


    senha = request.form.get(
        "senha"
    )


    permissao = request.form.get(
        "permissao"
    )



    conexao = obter_conexao()

    cursor = conexao.cursor(
        buffered=True
    )



    try:


        # Verifica se já existe

        cursor.execute(

            """

            SELECT id

            FROM usuarios

            WHERE usuario=%s

            """,

            (usuario,)

        )



        existe = cursor.fetchone()



        if existe:


            cursor.close()

            conexao.close()


            return (
                "Usuário já cadastrado!"
            )




        # Criptografa senha

        senha_hash = bcrypt.hashpw(

            senha.encode("utf-8"),

            bcrypt.gensalt()

        ).decode("utf-8")






        cursor.execute(

            """

            INSERT INTO usuarios

            (

            usuario,

            senha,

            permissao

            )


            VALUES

            (%s,%s,%s)

            """,


            (

            usuario,

            senha_hash,

            permissao

            )

        )



        conexao.commit()



    except Exception as erro:


        conexao.rollback()


        return (
            f"Erro ao cadastrar usuário: {erro}"
        )



    finally:


        cursor.close()

        conexao.close()




    return redirect(
        "/usuarios"
    )






# ==============================
# EXCLUIR USUÁRIO
# ==============================


@app.route(
    '/excluir_usuario/<int:id>'
)
def EXCLUIR_USUARIO(id):


    conexao = obter_conexao()

    cursor = conexao.cursor()



    try:


        cursor.execute(

            """

            DELETE FROM usuarios

            WHERE id=%s

            """,

            (id,)

        )


        conexao.commit()



    except Exception as erro:


        conexao.rollback()


        return (
            f"Erro ao excluir usuário: {erro}"
        )



    finally:


        cursor.close()

        conexao.close()




    return redirect(
        "/usuarios"
    )

# ==============================
# EDITAR USUÁRIO (ATUALIZADA)
# ==============================


@app.route('/editar_usuario/<int:id>', methods=["GET", "POST"])
def EDITAR_USUARIO(id):
    conexao = obter_conexao()
    cursor = conexao.cursor(buffered=True)

    if request.method == "POST":
        usuario = request.form.get("usuario")
        senha = request.form.get("senha")
        permissao = request.form.get("permissao")

        try:
            if senha: # Se o administrador preencher uma nova senha, criptografa
                senha_hash = bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
                cursor.execute(
                    """
                    UPDATE usuarios 
                    SET usuario=%s, senha=%s, permissao=%s 
                    WHERE id=%s
                    """,
                    (usuario, senha_hash, permissao, id)
                )
            else: # Se deixar a senha em branco, não altera a senha antiga
                cursor.execute(
                    """
                    UPDATE usuarios 
                    SET usuario=%s, permissao=%s 
                    WHERE id=%s
                    """,
                    (usuario, permissao, id)
                )
            conexao.commit()
            return redirect("/usuarios")
        except Exception as erro:
            conexao.rollback()
            return f"Erro ao editar usuário: {erro}"
        finally:
            cursor.close()
            conexao.close()
            
    else: # Método GET: Busca os dados atuais do usuário para exibir na tela
        cursor.execute("SELECT id, usuario, permissao FROM usuarios WHERE id=%s", (id,))
        dados_usuario = cursor.fetchone()
        cursor.close()
        conexao.close()

        if dados_usuario:
            return render_template("EDITAR.html", usuario=dados_usuario)
            # dados_usuario[0] = id, dados_usuario[1] = e-mail, dados_usuario[2] = permissao
        return "Usuário não encontrado."





# ==============================
# CRIA O BANCO/TABELAS AUTOMATICAMENTE
# Toda vez que o app.py é executado, ele confere
# se o banco "db_almox" e as tabelas existem.
# Se não existirem, cria sozinho (sem apagar
# dados que já estejam salvos).
# ==============================


def inicializar_banco():

    conexao = mysql.connector.connect(

        host="localhost",

        user="root",

        password="",

        port=3306

    )


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

            permissao ENUM('Administrador','Funcionário')
            DEFAULT 'Funcionário'

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

            preco DECIMAL(10,2) NOT NULL,

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

            tipo ENUM('Entrada','Saida') NOT NULL,

            quantidade INT NOT NULL,

            usuario VARCHAR(100) NOT NULL,

            data_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP

        )
        """

    )


    conexao.commit()

    cursor.close()

    conexao.close()



# ==============================
# EXECUTAR SISTEMA
# ==============================

#EDITAR PAGINA ======================#

@app.route('/')
def home():
    return 'Olá, bem-vindo à minha página inicial!'

if __name__ == "__main__":


    inicializar_banco()


    app.run(
        debug=True
    )