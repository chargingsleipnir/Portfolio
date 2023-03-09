// Main dependencies
const express = require("express");
const app = express();
const server = require("http").Server(app);

// References
const ejs = require("ejs");
var fs = require("fs");
const { cwd } = require('node:process');

// Declare ejs, JSON formatting and set static files folder.
app.set("view engine", "ejs");
app.set("json spaces", 2);
app.use(express.static("docs"));

// Redirects to landing
app.get("/", (req, res) => res.redirect("/landing"));
app.get("/index", (req, res) => res.redirect("/landing"));

// Landing
app.get("/landing", (req, res) => res.render("index"));

// Contact
app.get("/contact", (req, res) => res.render("contact"));

// Initialise the server on port 3000.
server.listen(3000);


// List the names of all .ejs files in the '/views' directory.
const pages = ["index", "contact"];


// Main function to convert pages to static
function convertSite(pages) {

    // For each page given by the user
    for (var i = 0; i < pages.length; i++) {

        // Render the .ejs file as a string.
        ejs.renderFile("./views/" + pages[i].toLowerCase() + ".ejs", (err, str) => {

            handleStaticErrors(err);

            fs.writeFileSync(cwd() + `/docs/${pages[i].toLowerCase()}.html`, str);
        });
    }
}

// Handle errors when making a static file.
function handleStaticErrors(err) {
    if (err) {
        console.log(err);
        return false;
    }
    return true;
}


// Run the function
convertSite(pages)