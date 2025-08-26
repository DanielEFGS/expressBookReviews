const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');
const BASE_URL = process.env.BOOKS_API || 'http://localhost:5000'; 

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


// -------------------------
// Task 10: Get all books
// -------------------------
// With Promises
function getBooksPromise() {
    axios.get(`${BASE_URL}/`)
      .then(response => {
        console.log("Books (Promise):", response.data);
      })
      .catch(err => console.error(err.message));
  }
  
  // With async/await
  async function getBooksAsync() {
    try {
      const response = await axios.get(`${BASE_URL}/`);
      console.log("Books (Async):", response.data);
    } catch (err) {
      console.error(err.message);
    }
  }
  
  // -------------------------
  // Task 11: Get book by ISBN
  // -------------------------
  function getBookByIsbnPromise(isbn) {
    axios.get(`${BASE_URL}/isbn/${isbn}`)
      .then(response => {
        console.log(`Book ${isbn} (Promise):`, response.data);
      })
      .catch(err => console.error(err.message));
  }
  
  async function getBookByIsbnAsync(isbn) {
    try {
      const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
      console.log(`Book ${isbn} (Async):`, response.data);
    } catch (err) {
      console.error(err.message);
    }
  }
  
  // -------------------------
  // Task 12: Get book by Author
  // -------------------------
  function getBookByAuthorPromise(author) {
    axios.get(`${BASE_URL}/author/${author}`)
      .then(response => {
        console.log(`Books by ${author} (Promise):`, response.data);
      })
      .catch(err => console.error(err.message));
  }
  
  async function getBookByAuthorAsync(author) {
    try {
      const response = await axios.get(`${BASE_URL}/author/${author}`);
      console.log(`Books by ${author} (Async):`, response.data);
    } catch (err) {
      console.error(err.message);
    }
  }
  
  // -------------------------
  // Task 13: Get book by Title
  // -------------------------
  function getBookByTitlePromise(title) {
    axios.get(`${BASE_URL}/title/${title}`)
      .then(response => {
        console.log(`Books with title ${title} (Promise):`, response.data);
      })
      .catch(err => console.error(err.message));
  }
  
  async function getBookByTitleAsync(title) {
    try {
      const response = await axios.get(`${BASE_URL}/title/${title}`);
      console.log(`Books with title ${title} (Async):`, response.data);
    } catch (err) {
      console.error(err.message);
    }
  }
  
  module.exports = {
    getBooksPromise,
    getBooksAsync,
    getBookByIsbnPromise,
    getBookByIsbnAsync,
    getBookByAuthorPromise,
    getBookByAuthorAsync,
    getBookByTitlePromise,
    getBookByTitleAsync
  };
  
  if (require.main === module) {
    getBooksPromise();
    getBooksAsync();
  
    getBookByIsbnPromise(1);
    getBookByIsbnAsync(2);
  
    getBookByAuthorPromise("Jane Austen");
    getBookByAuthorAsync("Unknown");
  
    getBookByTitlePromise("Pride and Prejudice");
    getBookByTitleAsync("Fairy tales");
  }

module.exports.general = public_users;
