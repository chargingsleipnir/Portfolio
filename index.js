// Main dependencies
const express = require("express");
const app = express();
const server = require("http").Server(app);

// References
const ejs = require("ejs");
var fs = require("fs");
const convertToStatic = require("ejs-static-converter")

// Declare ejs, JSON formatting and set static files folder.
app.set("view engine", "ejs");
app.set("json spaces", 2);
app.use(express.static("public"));

// Home
app.get("/", (req, res) => {
    res.redirect("/landing");
});

// Landing
app.get("/landing", (req, res) => {
    res.render("index");
});

// Contact
app.get("/contact", (req, res) => {
    res.render("contact");
});

// Initialise the server on port 3000.
server.listen(3000);


//
// Convert to static site
//

// List the names of all .ejs files in the '/views' directory.
const pages = ["index", "contact"];

// Remove what already exists where the static content will go.
for(const pageStr of pages) {
    if(fs.existsSync(`./public/${pageStr}`)) {
        fs.rmSync(`./public/${pageStr}`, { recursive: true, force: true });
    }
}

// Run the function
convertToStatic(pages)