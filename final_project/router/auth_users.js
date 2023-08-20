const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  let usersWithTheSameName = users.filter((user) => {
    return user.username == username;
  });

  if(usersWithTheSameName.length > 0){
    return true;
  }else{
    return false;
  };
}

const authenticatedUser = (username,password)=>{ //returns boolean
let matchedUser = users.filter((user) => {
  return user["username"] == username && user["password"] == password;
})
return matchedUser.length > 0 ? true : false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  let username = req.body.username;
  let password = req.body.password;

  //Check if user has supplied both, username and password
  if(!username && !password){
    return res.status(404).json({"message": "Error logging in. Please check your username and password and try again."});
  };

  //Check if user has supplied the right credentials to login
  if(authenticatedUser(username, password)){
    let accessToken = jwt.sign(
      {
        "data": password,
      },
      "access",
      {"expiresIn": 60 * 60}
    );

    req.session.authorization = {
      accessToken, username
    };

    return res.status(200).json({"message": "User " + req.session.authorization.username + " logged in successfuly"});
  }else{
    return res.status(208).json({"message": "Error. Check your username and password"});
  };
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Check if book with requested isbn exists
  if(!books[req.params.isbn]){
    return res.status(404).json({"message": "The book with ISBN number " + req.params.isbn + " cannot be found."});
  };
  
  //add or modify review
  books[req.params.isbn]["reviews"][req.session.authorization.username] = req.body.review;
  return res.status(200).json({"message": req.session.authorization.username + ", your review has been added/updated. Your review: " + req.body.review})
});

// Delete users review
regd_users.delete("/auth/review/:isbn", (req, res) =>{
  //Check if book with requested isbn exists
  if(!books[req.params.isbn]){
    return res.status(404).json({"message": "The book with ISBN number " + req.params.isbn + " cannot be found."});
  };

  // Delete the review of a speciffic user
  let userReviewKeys = Object.keys(books[req.params.isbn].reviews)
  let newReviewList = {};
  // Iterate through user names and create a new review list with all users except the one to be deleted
  for(let i = 0; i < userReviewKeys.length; i++){
    if(userReviewKeys[i] != req.session.authorization.username){
      newReviewList[userReviewKeys[i]] = books[req.params.isbn]["reviews"][userReviewKeys[i]];
    };
  };

  books[req.params.isbn].reviews = newReviewList;
  return res.status(200).json({"message": req.session.authorization.username + ", your review has been deleted."})

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
