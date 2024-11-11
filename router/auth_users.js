const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username is valid (unique in this case)
const isValid = (username) => {
    return !users.some(user => user.username === username);
};

// Check if username and password match the records
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Only registered users can log in
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token if authentication is successful
    const token = jwt.sign({ username }, "fingerprint_customer", { expiresIn: '1h' });
    return res.status(200).json({ message: "Login successful", token });
});

// Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const review = req.query.review;  // Extracting review from query parameter
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Verify JWT token
    jwt.verify(token, "fingerprint_customer", (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token." });
        }

        const username = decoded.username;  // Get the username from decoded token

        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Add or update the review by this user for the specified ISBN
        books[isbn].reviews = books[isbn].reviews || {};
        books[isbn].reviews[username] = review;

        return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
    });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Verify JWT token
    jwt.verify(token, "fingerprint_customer", (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token." });
        }

        const username = decoded.username;
        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (!books[isbn].reviews || !books[isbn].reviews[username]) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Delete the review by the user
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;