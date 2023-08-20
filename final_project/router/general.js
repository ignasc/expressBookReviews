const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User " + username + " has been successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //ORIGINAL CODE WITHOUT PROMISES
  /*let allBooks = JSON.stringify(books, null, 4);
  return res.send(allBooks);*/

  //UPDATED CODE WITH PROMISES
  let allBooksPromise = new Promise((resolve, reject) => {
    let allBooks = JSON.stringify(books, null, 4);
    if(allBooks){
      resolve(allBooks);
    }else{
      reject("There was a problem retrieving the list of books.")
    };
  })

  allBooksPromise
  .then((success) => {
    return res.send(success);
  })
  .catch((err) => {
    return res.status(404).json({"message": err})
  })
  
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //ORIGINAL CODE WITHOUT PROMISES
  /*let selectedBook = books[req.params.isbn];
  if(selectedBook){
    return res.send(JSON.stringify(selectedBook, null, 4));
  }else{
    return res.status(300).json({message: "ISBN number not found in the database"});
  };*/

  //UPDATED CODE WITH PROMISES
  let bookDetails = new Promise((resolve, reject) => {
    let selectedBook = books[req.params.isbn];
    if(selectedBook){
      resolve(selectedBook);
    }else{
      reject(req.params.isbn)
    };
  })

  bookDetails
  .then((success) => {
    return res.send(success);
  })
  .catch((err) => {
    return res.status(404).json({"message": "There was a problem retrieving the details of the book or there is no such book under the ISBN number " + err})
  })
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //ORIGINAL CODE WITHOUT PROMISES
  /*let listOfBookKeys = Object.keys(books);
  let selectedByAuthor = {};
    for(let index = 0; index < listOfBookKeys.length; index++){
      if(req.params.author == books[listOfBookKeys[index]]["author"]){
        selectedByAuthor[listOfBookKeys[index]] = books[listOfBookKeys[index]];
      };
    };
    
  if(Object.keys(selectedByAuthor).length == 0){
    return res.status(300).json({"message": "No books found by author " + req.params.author})
  }else{
    return res.send(JSON.stringify(selectedByAuthor));
  };*/

  //UPDATED CODE WITH PROMISES
  let bookDetails = new Promise((resolve, reject) => {
    let listOfBookKeys = Object.keys(books);
    let selectedByAuthor = {};
    for(let index = 0; index < listOfBookKeys.length; index++){
      if(req.params.author == books[listOfBookKeys[index]]["author"]){
        selectedByAuthor[listOfBookKeys[index]] = books[listOfBookKeys[index]];
      };
    };
    
    if(Object.keys(selectedByAuthor).length == 0){
      reject(req.params.author);
    }else{
      resolve(JSON.stringify(selectedByAuthor));
    };
  })

  bookDetails
  .then((success) => {
    return res.send(success);
  })
  .catch((err) => {
    return res.status(404).json({"message": "No books found by author " + err})
  })
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //ORIGINAL CODE WITHOUT PROMISES
  /*let listOfBookKeys = Object.keys(books);
  let selectedByTitle = {};
    for(let index = 0; index < listOfBookKeys.length; index++){
      if(req.params.title == books[listOfBookKeys[index]]["title"]){
        selectedByTitle[listOfBookKeys[index]] = books[listOfBookKeys[index]];
      };
    };
    
  if(Object.keys(selectedByTitle).length == 0){
    return res.status(300).json({"message": "No books found named " + req.params.title})
  }else{
    return res.send(JSON.stringify(selectedByTitle));
  };*/

  //UPDATED CODE WITH PROMISES
  let listOfBooksByTitlePromise = new Promise((resolve, reject) => {
    let listOfBookKeys = Object.keys(books);
    let selectedByTitle = {};
    for(let index = 0; index < listOfBookKeys.length; index++){
      if(req.params.title == books[listOfBookKeys[index]]["title"]){
        selectedByTitle[listOfBookKeys[index]] = books[listOfBookKeys[index]];
      };
    };
    
    if(Object.keys(selectedByTitle).length == 0){
      reject(req.params.title);
    }else{
      resolve(JSON.stringify(selectedByTitle));
    };
})

listOfBooksByTitlePromise
  .then((success) => {
    return res.send(success);
  })
  .catch((err) => {
    return res.status(300).json({"message": "No books found named " + err})
  })
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  let selectedBook = books[req.params.isbn];
  if(selectedBook){
    return res.send(JSON.stringify(selectedBook["reviews"], null, 4));
  }else{
    return res.status(300).json({message: "ISBN number not found in the database"});
  };
});

module.exports.general = public_users;
