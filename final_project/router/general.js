const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require("axios").default;
const public_users = express.Router();

const findByAuthor = (dictionary, author) => {
  let listMatch = [];
  for (let isbn in dictionary) {
    if (dictionary[isbn].author.includes(author)) {
      listMatch.push(dictionary[isbn]);
    }
  }
  let result = {};
  result["booksbyauthor"] = listMatch;

  return JSON.stringify(result);
};

const findByTitles = (dictionary, title) => {
  let listMatch = [];
  for (let isbn in dictionary) {
    if (dictionary[isbn].title.includes(title)) {
      let match = dictionary[isbn];
      listMatch.push(match);
    }
  }
  let result = {};
  result["booksbytitle"] = listMatch;
  return JSON.stringify(result);
};

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({
          message: "Customer successfully registred. Now you can login",
        });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});
// Get the book list available in the shop
public_users.get("/", function (req, res) {
  const data = new Promise((resolve, reject) => {
    resolve(books);
  });

  data
    .then((result) => {
      return res.send(JSON.stringify(result, null, 4));
    })
    .catch((error) => {
      return res
        .status(422)
        .json({ message: "error while processing the request" });
    });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const data = new Promise((resolve, reject) => {
    const isbn = req.params.isbn;
    let book = books[isbn];
    resolve(book);
  });

  data
    .then((result) => {
      return res.send(result);
    })
    .catch((error) => {
      return res
        .status(422)
        .json({ message: "error while processing the request" });
    });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  const data = new Promise((resolve, reject) => {
    resolve(findByAuthor(books, author));
  });

  data
    .then((result) => {
      return res.send(result);
    })
    .catch((error) => {
      console.log(error);
      return res
        .status(422)
        .json({ message: "error while processing the request" });
    });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  const data = new Promise((resolve, reject) => {
    resolve(findByTitles(books, title));
  });

  data
    .then((result) => {
      return res.send(result);
    })
    .catch((error) => {
      console.log(error);
      return res
        .status(422)
        .json({ message: "error while processing the request" });
    });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const data = new Promise((resolve, reject) => {
    const isbn = req.params.isbn;
    resolve(books[isbn].reviews);
  });

  data
    .then((result) => {
      return res.send(JSON.stringify(result));
    })
    .catch((error) => {
      console.log(error);
      return res
        .status(422)
        .json({ message: "error while processing the request" });
    });
});

module.exports.general = public_users;
