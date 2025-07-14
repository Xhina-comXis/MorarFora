# app.py
import os
from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
from flask_cors import CORS

# Carrega variáveis de ambiente do arquivo .env
load_dotenv() 

app = Flask(__name__)

# Configurar CORS para permitir que seu frontend (no GitHub Pages)
# se comunique com este backend.
# **IMPORTANTE:** Substitua 'https://xhina-comxis.github.io' pelo URL EXATO do seu site no GitHub Pages.
# Para testes LOCAIS, se você estiver usando Live Server (ex: porta 5500), pode adicionar:
# "http://127.0.0.1:5500", ou "http://localhost:5500"
CORS(app, resources={r"/*": {"origins": ["https://xhina-comxis.github.io", "http://127.0.0.1:5500", "http://localhost:5500"]}})

# Configuração do banco de dados MySQL
app.config['MYSQL_HOST'] = os.getenv('DB_HOST')
app.config['MYSQL_USER'] = os.getenv('DB_USER')
app.config['MYSQL_PASSWORD'] = os.getenv('DB_PASSWORD')
app.config['MYSQL_DB'] = os.getenv('DB_NAME')
app.config['MYSQL_PORT'] = int(os.getenv('DB_PORT', 3306)) # Adiciona porta, padrão 3306

mysql = MySQL(app)
bcrypt = Bcrypt(app)

# --- Teste de Conexão ao Banco de Dados (opcional, mas bom para depurar) ---
# Este bloco se conecta ao banco de dados uma vez quando o aplicativo é iniciado.
with app.app_context():
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT 1")
        print("Conectado ao banco de dados MySQL!")
        cur.close()
    except Exception as e:
        print(f"ERRO: Não foi possível conectar ao banco de dados MySQL: {e}")
# --- Fim do Teste de Conexão ---


# Rota de Registro de Usuário
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'message': 'Todos os campos são obrigatórios.'}), 400

    # Gera o hash da senha de forma segura
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    try:
        cur = mysql.connection.cursor()
        cur.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)",
            (username, email, hashed_password)
        )
        mysql.connection.commit() # Confirma a transação no banco de dados
        cur.close()
        return jsonify({'message': 'Usuário registrado com sucesso!'}), 201
    except Exception as e:
        # Verifica se o erro é de entrada duplicada (username ou email já existem)
        if 'Duplicate entry' in str(e):
            return jsonify({'message': 'Usuário ou e-mail já existe.'}), 409
        print(f"Erro no registro: {e}")
        return jsonify({'message': 'Erro interno do servidor.'}), 500

# Rota de Login de Usuário
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username') # Pode ser email ou username, dependendo de como você quer que o usuário faça login
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Nome de usuário e senha são obrigatórios.'}), 400

    try:
        cur = mysql.connection.cursor()
        # No login, você pode procurar pelo username ou email
        # Aqui, estamos procurando por 'username'. Se quiser procurar por email, mude a coluna aqui.
        cur.execute("SELECT id, username, password_hash FROM users WHERE username = %s OR email = %s", (username, username))
        user = cur.fetchone() # Pega a primeira linha de resultado
        cur.close()

        if not user:
            return jsonify({'message': 'Usuário ou senha inválidos.'}), 401

        user_id, user_username, stored_password_hash = user # Desempacota os dados do usuário

        # Compara a senha fornecida com o hash armazenado
        if bcrypt.check_password_hash(stored_password_hash, password):
            # Login bem-sucedido. Em um app real, aqui você geraria um token de sessão (JWT)
            return jsonify({'message': 'Login bem-sucedido!', 'userId': user_id, 'username': user_username}), 200
        else:
            return jsonify({'message': 'Usuário ou senha inválidos.'}), 401
    except Exception as e:
        print(f"Erro no login: {e}")
        return jsonify({'message': 'Erro interno do servidor.'}), 500

# Ponto de entrada do aplicativo Flask
if __name__ == '__main__':
    # Define a porta do servidor, pega do .env ou usa 5000 como padrão
    port = int(os.getenv('PORT', 5000))
    app.run(debug=True, port=port) # debug=True ativa o modo de depuração para desenvolvimento