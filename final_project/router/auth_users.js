const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: username,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let book = books[isbn];
  const currDate = new Date();
  const comment = req.body.comment;
  const rating = req.body.rating;
  if (book) {
    let review = book.reviews[req.user.data];
    if (review) {
      if (comment) review["comment"] = comment;
      if (rating) review["rating"] = rating;
      return res.send(
        "The review from " + " " + req.user.data + " Has been updated!"
      );
    } else {
      book.reviews[req.user.data] = {
        comment: comment,
        rating: rating,
        date: currDate.toString(),
      };
      return res.send(
        "The review from " + " " + req.user.data + " Has been added!"
      );
    }
  }
  return res.send("Unable to find the book for the particular ISBN");
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let book = books[isbn];
  if (book) {
    let review = book.reviews[req.user.data];
    if (review) {
      delete books[isbn].reviews[req.user.data];
      res.send(`the review has been successfully deleted.`);
    } else {
      res.send(`unable to find your comment in this book review`);
    }
  }
  res.send(`Unable to find the book for the particular ISBN.`);
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
