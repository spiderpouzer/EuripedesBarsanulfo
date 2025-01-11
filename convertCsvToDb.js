const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const csv = require('csv-parser');

const DB_PATH = path.join(__dirname, 'livros.db');
const CSV_PATH = path.join(__dirname, 'livros.csv');

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS livros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        location TEXT NOT NULL,
        borrowedTo TEXT DEFAULT 'Disponível'
    )`);

    db.run(`DELETE FROM livros`);

    fs.createReadStream(CSV_PATH)
        .pipe(csv())
        .on('data', (row) => {
            db.run(
                `INSERT INTO livros (title, author, location, borrowedTo) VALUES (?, ?, ?, ?)`,
                [row.Título, row.Autor, row.Localização, row["Emprestado para"] || "Disponível"]
            );
        })
        .on('end', () => {
            console.log('CSV convertido e banco de dados criado!');
            db.close();
        });
});
