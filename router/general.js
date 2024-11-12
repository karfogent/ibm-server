const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


async function getBooks() {
    if (books) {
      return books;
    } else {
      throw new Error("Books data not available");
    }
};

async function getBookByISBN(isbn) {
    const book = books[isbn];
    if (book) {
      return book;
    } else {
      throw new Error("Book not found");
    }
}

async function getBooksByAuthor(author) {
    const filteredBooks = Object.values(books).filter(
        book => book.author === author);
    if (filteredBooks.length > 0) {
      return filteredBooks;
    } else {
      throw new Error("No books found by this author");
    }
}

async function getBooksByTitle(title) {
    const filteredBooks = Object.values(books).filter(
        book => book.title === title);
    if (filteredBooks.length > 0) {
      return filteredBooks;
    } else {
      throw new Error("No books found with this title");
    }
}
  
public_users.get('/title/:title', async (req, res) => {
    const { title } = req.params;
    try {
      const booksByTitle = await getBooksByTitle(title);
      res.send(booksByTitle); 
    } catch (error) {
      res.status(404).send({ message: error.message }); 
    }
});
  
public_users.get('/author/:author', async (req, res) => {
    const { author } = req.params;
    try {
      const booksByAuthor = await getBooksByAuthor(author);
      res.send(booksByAuthor); 
    } catch (error) {
      res.status(404).send({ message: error.message }); 
    }
});

// Get the list of books available in the shop
public_users.get('/', async (req, res) => {
    try {
      const booksList = await getBooks();
      res.send(booksList); 
    } catch (error) {
      res.status(500).send({ message: error.message }); 
    }
});
  
public_users.get('/isbn/:isbn', async (req, res) => {
    const { isbn } = req.params;
    try {
      const book = await getBookByISBN(isbn);
      res.send(book); 
    } catch (error) {
      res.status(404).send({ message: error.message }); 
    }
});

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;

  const book = books[isbn];
  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  const { author } = req.params;

  const filteredBooks = Object.values(books).filter(book => book.author === author);
  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  } else {
    return res.status(404).json({ message: "No books found by this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const { title } = req.params;

  const filteredBooks = Object.values(books).filter(book => book.title === title);
  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
  const { isbn } = req.params;

  const book = books[isbn];
  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "No reviews found for this book" });
  }
});

module.exports.general = public_users;