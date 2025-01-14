const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'livros.db'); // Caminho para o banco de dados

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Conectar ao banco de dados
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

// Rota para atualizar o status de um livro (empréstimo ou devolução)
app.post('/livros/:id', (req, res) => {
    const { id } = req.params;
    const { borrowedTo } = req.body; // Nome da pessoa que pegou o livro emprestado

    if (!id) {
        res.status(400).send('ID do livro é obrigatório.');
        return;
    }

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
