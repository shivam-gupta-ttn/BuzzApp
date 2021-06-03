const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const passport = require("passport");
const bodyParser = require("body-parser");
const session = require('express-session')
const cors = require('cors')

const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");

const app = express();
dotenv.config();

mongoose.connect('mongodb+srv://shivamttn:shivam123@cluster0.kg8bx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useNewUrlParser: true }, () => {
    console.log("connect to MongoDB")
});
require("./passport-setup")

//middlewares

app.use(bodyParser.json());
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/buzz', (req, res, next) => {
    console.log("reached")
    next();
},
    passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login', successRedirect: 'http://localhost:3000/home' }),
);

app.get('/', isLoggedIn, (req, res) => {
    res.send("Successfully logged in")
})
app.get('/logout', (req, res) => {
    req.session.destroy(function (err) {
        res.redirect('http://localhost:3000/login');
    });
})

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);



function isLoggedIn(req, res, next) {
    console.log(req.isAuthenticated())
    req.isAuthenticated() ? next() : res.sendStatus(401)
}

app.listen(5500, () => {
    console.log("server is running!")
})