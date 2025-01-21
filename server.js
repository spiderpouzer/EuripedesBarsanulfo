const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'livros.db');
const USERS_CSV = path.join(__dirname, 'usuario.csv');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Conectar ao banco de dados
const db = new sqlite3.Database(DB_PATH);

// Função para verificar as credenciais no arquivo CSV
const authenticateUser = (username, password, callback) => {
    const users = [];
    fs.createReadStream(USERS_CSV)
        .pipe(csv())
        .on('data', (row) => {
            users.push(row);
        })
        .on('end', () => {
            const user = users.find(u => u.usuario === username && u.senha === password);
            callback(!!user); // Retorna true se o usuário for encontrado
        });
};

// Middleware de autenticação
const authMiddleware = (req, res, next) => {
    const { username, password } = req.headers;

    if (!username || !password) {
        return res.status(401).send('Credenciais ausentes.');
    }

    authenticateUser(username, password, (isAuthenticated) => {
        if (!isAuthenticated) {
            return res.status(403).send('Credenciais inválidas.');
        }
        next();
    });
};

// Rota protegida para buscar todos os livros
app.get('/livros', authMiddleware, (req, res) => {
    db.all('SELECT * FROM livros', [], (err, rows) => {
        if (err) {
            console.error('Erro ao consultar o banco:', err);
            res.status(500).send('Erro ao buscar livros.');
        } else {
            res.json(rows);
        }
    });
});

// Rota protegida para atualizar o status de um livro
app.post('/livros/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    const { borrowedTo } = req.body;

    db.run(
        'UPDATE livros SET borrowedTo = ? WHERE id = ?',
        [borrowedTo || 'Disponível', id],
        function (err) {
            if (err) {
                console.error('Erro ao atualizar o livro:', err);
                res.status(500).send('Erro ao atualizar o livro.');
            } else if (this.changes > 0) {
                res.send('Livro atualizado com sucesso.');
            } else {
                res.status(404).send('Livro não encontrado.');
            }
        }
    );
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
