/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/


/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const expressLayouts = require("express-ejs-layouts")
const livereload = require("livereload")
const connectLiveReload = require("connect-livereload")

 

/* ***********************
 * LiveReload Server Setup
 *************************/
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(__dirname + "/public");
liveReloadServer.server.once("connection", () => {
  setTimeout( () => {
    liveReloadServer.refresh("/")
  }, 100);
});


/* ***********************
 * View Engine Templates
 *************************/
app.set("view engine", "ejs") 
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // path to find all layouts


/* ***********************
 * Middleware for LiveReload
 *************************/
app.use(connectLiveReload())


/* ***********************
 * Routes
 *************************/
app.use(static)

// Index route
app.get("/", function(req, res) {
  res.render('index', {title: "Home"})
})



/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST



/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
