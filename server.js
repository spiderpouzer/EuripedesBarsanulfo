const fs = require("fs");
const path = require("path");

const CSV_PATH = path.join(__dirname, "livros.csv");

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            const data = fs.readFileSync(CSV_PATH, "utf8");
            res.setHeader("Content-Type", "text/plain");
            res.status(200).send(data);
        } catch (error) {
            res.status(500).send("Erro ao carregar o arquivo CSV.");
        }
    } else if (req.method === "POST") {
        try {
            const { livros } = req.body;
            if (!livros || !Array.isArray(livros)) {
                res.status(400).send("Formato inválido.");
                return;
            }

            const csvContent = "Título,Autor,Localização,Emprestado para\n" +
                livros.map(livro =>
                    `${livro.title},${livro.author},${livro.location},${livro.borrowedTo || "Disponível"}`
                ).join("\n");

            fs.writeFileSync(CSV_PATH, csvContent, "utf8");
            res.status(200).send("Arquivo atualizado com sucesso.");
        } catch (error) {
            res.status(500).send("Erro ao atualizar o arquivo CSV.");
        }
    } else {
        res.setHeader("Allow", ["GET", "POST"]);
        res.status(405).send("Método não permitido.");
    }
}
