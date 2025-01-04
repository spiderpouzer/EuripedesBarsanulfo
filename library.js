// Frontend - Novo library.js atualizado

let books = [];
let filteredBooks = [];
let selectedBookIndex = null;

// Carregar os livros do servidor automaticamente no carregamento da página
window.onload = function () {
    fetch('https://atual-cd4paackg-matheus-silva-de-medeiros-projects.vercel.app')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar os livros do servidor.');
            }
            return response.text();
        })
        .then(csv => {
            parseCSV(csv);
            alert('Livros carregados do servidor com sucesso!');
        })
        .catch(error => {
            console.error('Erro ao carregar os livros:', error);
            alert('Não foi possível carregar os livros do servidor.');
        });
};

function parseCSV(csv) {
    const rows = csv.split("\n");
    books = rows.slice(1).map(row => {
        const [title, author, location, borrowedTo] = row.split(",");
        return {
            title: title?.trim(),
            author: author?.trim(),
            location: location?.trim(),
            borrowedTo: borrowedTo?.trim()
        };
    });
}

function searchBooks() {
    const searchInput = document.getElementById("searchInput").value.toLowerCase();
    filteredBooks = books.filter(book =>
        book.title?.toLowerCase().includes(searchInput) || book.author?.toLowerCase().includes(searchInput)
    );

    displayResults(filteredBooks);
}

function displayResults(results) {
    const resultsTable = document.getElementById("resultsTable").getElementsByTagName("tbody")[0];
    resultsTable.innerHTML = "";

    if (results.length === 0) {
        const row = resultsTable.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 5;
        cell.textContent = "Nenhum resultado encontrado.";
        return;
    }

    results.forEach((book, index) => {
        const row = resultsTable.insertRow();
        row.insertCell(0).textContent = book.title;
        row.insertCell(1).textContent = book.author;
        row.insertCell(2).textContent = book.location;
        row.insertCell(3).textContent = book.borrowedTo || "Disponível";

        const actionCell = row.insertCell(4);
        if (!book.borrowedTo || book.borrowedTo.toLowerCase() === "disponível") {
            const loanButton = document.createElement("button");
            loanButton.textContent = "Solicitar Empréstimo";
            loanButton.classList.add("action-button");
            loanButton.onclick = () => selectBookForLoan(index);
            actionCell.appendChild(loanButton);
        } else {
            const returnButton = document.createElement("button");
            returnButton.textContent = "Devolver";
            returnButton.classList.add("action-button");
            returnButton.onclick = () => returnBook(index);
            actionCell.appendChild(returnButton);
        }
    });
}

function selectBookForLoan(index) {
    const book = filteredBooks[index];
    selectedBookIndex = books.findIndex(b => b.title === book.title && b.author === book.author);
    document.getElementById("selectedBook").textContent = book.title;
    document.getElementById("loanSection").style.display = "block";
}

function submitLoan() {
    const borrowerName = document.getElementById("borrowerName").value.trim();
    if (!borrowerName) {
        alert("Por favor, insira seu nome.");
        return;
    }

    if (selectedBookIndex !== null) {
        books[selectedBookIndex].borrowedTo = borrowerName;
        updateCSV();
        alert(`Empréstimo confirmado para: ${books[selectedBookIndex].title}`);
        document.getElementById("loanSection").style.display = "none";
        searchBooks();
    }
}

function returnBook(index) {
    const book = filteredBooks[index];
    const bookIndex = books.findIndex(b => b.title === book.title && b.author === book.author);
    if (bookIndex !== -1) {
        books[bookIndex].borrowedTo = "Disponível";
        updateCSV();
        alert(`O livro '${books[bookIndex].title}' foi devolvido com sucesso.`);
        searchBooks();
    }
}

function updateCSV() {
    fetch('https://atual-cd4paackg-matheus-silva-de-medeiros-projects.vercel.app', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ livros: books })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao atualizar o arquivo no servidor.');
        }
        return response.text();
    })
    .then(message => {
        console.log(message);
        alert("Arquivo atualizado com sucesso no servidor!");
    })
    .catch(error => {
        console.error("Erro ao atualizar o arquivo no servidor:", error);
        alert("Não foi possível atualizar o arquivo no servidor.");
    });
}
