const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

const SECRET = process.env.JWT_SECRET || 'access';

let users = [];

const isValid = (username) => { //returns boolean
    if (typeof username !== 'string') return false;
    const uname = username.trim();
    if (!uname) return false;
    return !users.some(u => u.username === uname);
}

const authenticatedUser = (username, password) => {
    return users.some(u => u.username === username && u.password === password);
};

//only registered users can login
regd_users.post("/login", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: 'Invalid login. Check username and password' });
    }

    // JWT con datos mínimos, nunca la contraseña
    const accessToken = jwt.sign({ username }, SECRET, { expiresIn: '1h' });

    // Guardar en sesión como pide la consigna
    req.session.authorization = { accessToken, username };

    return res.status(200).json({ message: 'User successfully logged in', token: accessToken });
});

// Add a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
    const { isbn } = req.params;
    const username = req.session?.authorization?.username;
    const review = String(req.query?.review || '').trim();

    if (!username) return res.status(401).json({ message: 'Login required' });
    if (!books[isbn]) return res.status(404).json({ message: 'Book not found' });
    if (!review) return res.status(400).json({ message: 'Review text is required as query param ?review=' });

    const book = books[isbn];
    if (!book.reviews || typeof book.reviews !== 'object') book.reviews = {};

    const isUpdate = Object.prototype.hasOwnProperty.call(book.reviews, username);
    book.reviews[username] = review;

    return res.status(isUpdate ? 200 : 201).json({
        message: isUpdate ? 'Review updated' : 'Review added',
        isbn,
        author: book.author,
        title: book.title,
        reviews: book.reviews
    });
});

// Delete a book review by session user
regd_users.delete('/auth/review/:isbn', (req, res) => {
    const { isbn } = req.params;
    const username = req.session?.authorization?.username;

    if (!username) return res.status(401).json({ message: 'Login required' });
    if (!books[isbn]) return res.status(404).json({ message: 'Book not found' });

    const reviews = books[isbn].reviews;
    if (!reviews || typeof reviews !== 'object') {
        return res.status(404).json({ message: 'No reviews for this book' });
    }

    if (!Object.prototype.hasOwnProperty.call(reviews, username)) {
        return res.status(404).json({ message: 'No review by this user for this book' });
    }

    delete reviews[username];
    return res.status(200).json({
        message: 'Review deleted',
        isbn,
        reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
