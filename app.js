//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser= require("body-parser");
const ejs = require("ejs");
const mongoose= require("mongoose");
const { error } = require("console");
const encrypt = require("mongoose-encryption");
// const bcrypt = require('bcrypt');

const app = express();



console.log(process.env.ENCRYPTION_KEY);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));

const mongoURL = 'mongodb://localhost:27017/MyMongo2DB';
const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

mongoose.connect(mongoURL,mongoOptions)
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.log("Error connecting to MongoDB.", error.message);
});

// create schema

 const userSchema = new mongoose.Schema({
 email: String,
 password: String   
 });

 userSchema.plugin(encrypt, { secret: process.env.ENCRYPTION_KEY, encryptedFields: ['password']});

const User = new mongoose.model("User", userSchema);


app.get("/", function(req,res){
    res.render("home");
});

app.get("/login", function(req,res){
    res.render("login");
});

app.get("/register", function(req,res){
    res.render("register");
});

app.post("/register", function(req, res){

    // create new user

   const newUser = new User({
    email: req.body.username,
    password: req.body.password
   });

   newUser.save()
    .then(() => {
res.render("secrets");
    })
    .catch((error) =>{
        console.error("Error during registration:", error);
        res.render("register", {error: "Registration Failed. Please try again"});
    });
        
});

// The below code snippet is from Udemy by Angela Yu (Full Stack Web Development)

// app.post("/login", function(req, res){
//     const username = req.body.username;
//     const password = req.body.password;

//     User.findOne({email: username}, function(err, foundUser){
//         if(err){
//             console.log(err);
//         }else{
//             if(foundUser){ 
//                 if(foundUser.password === password){
//                    res.render("secrets");
//             }}
           
//         }
//     })
// })


// NOTE:From the above code:
// 1. The findOne function in mongoose ahs been updated to return a query instead of executing a call back.The latest mongoose version does not support this
//  2. 
// 
// 
//Below is the updated login post request from my research. 


app.post("/login", function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username })
        .then((foundUser) => {
            if (foundUser && foundUser.password === password) {
                res.render("secrets");
            } else {
                // Handle case where user is not found or password is incorrect
                res.render("login", {error: "Invalid username or password"});
            }
        })
        .catch((err) => {
            console.log(err);
        });
});

app.listen(3000, function(){
    console.log("Server is running on port 3000.");
});

