const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const uname = String(username).trim();
    if (!isValid(uname)) {
        return res.status(409).json({ message: "Username already exists or is invalid" });
    }

    users.push({ username: uname, password: String(password) });
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    res.send(JSON.stringify(books));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {

    const isbn = req.params.isbn;
    if (isbn) {
        const book = books[isbn];
        if (book) {
            res.json(book);
        } else {
            res.status(404).json({ message: 'Book not found' });

        }
    } else {
        res.status(422).json({ message: 'Missing param isbn' });
    }

    return res.status(300).json({ message: "Yet to be implemented" });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const authorQuery = req.params.author.toLowerCase();
    const results = [];

    for (const [id, book] of Object.entries(books)) {
        if (book.author.toLowerCase().includes(authorQuery)) {
            results.push({ id, ...book });
        }
    }

    if (results.length === 0) {
        return res.status(404).json({ message: "No books found for this author" });
    }

    return res.json(results);
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const titleQuery = req.params.title.toLowerCase();
    const results = [];

    for (const [id, book] of Object.entries(books)) {
        if (book.title.toLowerCase().includes(titleQuery)) {
            results.push({ id, ...book });
        }
    }

    if (results.length === 0) {
        return res.status(404).json({ message: "No books found for this title" });
    }

    return res.json(results);
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    // validar si existe el libro
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    const reviews = books[isbn].reviews;

    // si no hay reviews
    if (!reviews || Object.keys(reviews).length === 0) {
        return res.status(404).json({ message: "No reviews found for this book" });
    }

    return res.json({
        isbn,
        reviews
    });
});

module.exports.general = public_users;
