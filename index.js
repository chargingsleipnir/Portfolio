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


// Main function to convert pages to static
function convertSite(pages) {
    // For each page given by the user
    for (var i = 0; i < pages.length; i++) {
        // Replace any multi-word views that have a '-' with a space
        var titleName = pages[i].replaceAll("-", " ");

        // Render the .ejs file as a string.
        ejs.renderFile("./views/" + pages[i].toLowerCase() + ".ejs", (err, str) => {

            handleStaticErrors(err);

            //
            // Don't create a directory for the index page.
            // For the rest, create a directory inside the users '/public' directory.
            if (pages[i] == "index") {
                fs.writeFileSync(cwd() + "/public/index.html", str, function () {
                    handleStaticErrors(newErr);
                });
            } else {
                fs.mkdirSync(cwd() + "/public/" + pages[i].toLowerCase());
                fs.writeFileSync(cwd() + "/public/" + pages[i].toLowerCase() + "/index.html", str, function () {
                    handleStaticErrors(newErr);
                });
            }
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