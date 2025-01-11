const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Configurar o app
const app = express();
const PORT = process.env.PORT || 3000; // Render define a porta na variável de ambiente PORT

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Caminho para o banco de dados
const DB_PATH = path.join(__dirname, 'livros.db');

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database(DB_PATH);

// Rota para buscar todos os livros
app.get('/livros', (req, res) => {
    db.all('SELECT * FROM livros', [], (err, rows) => {
        if (err) {
            console.error('Erro ao consultar o banco:', err);
            res.status(500).send('Erro ao buscar livros.');
        } else {
            res.json(rows);
        }
    });
});

// Rota para atualizar o status de um livro
app.post('/livros/:id', (req, res) => {
    const { id } = req.params; // ID do livro
    const { borrowedTo } = req.body; // Nome da pessoa que pegou emprestado

    if (!id || !borrowedTo) {
        res.status(400).send('ID e nome do solicitante são obrigatórios.');
        return;
    }

    db.run(
        'UPDATE livros SET borrowedTo = ? WHERE id = ?',
        [borrowedTo, id],
        function (err) {
            if (err) {
                console.error('Erro ao atualizar o livro:', err);
                res.status(500).send('Erro ao atualizar o livro.');
            } else {
                if (this.changes > 0) {
                    res.send('Livro atualizado com sucesso.');
                } else {
                    res.status(404).send('Livro não encontrado.');
                }
            }
        }
    );
});


// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
