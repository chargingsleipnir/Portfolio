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



// Web Applications
app.get("/webApps", (req, res) => res.render("webApps"));

// Animations
app.get("/anims", (req, res) => res.render("anims"));

// Contact
app.get("/contact", (req, res) => res.render("contact"));

// Initialise the server on port 3000.
server.listen(3000);

// Data for tornadoom:
const engineCodeFiledata = fs.readFileSync(`./json/engineComponents.json`);
const engineCodeJson = JSON.parse(engineCodeFiledata);

// List that clearly defines the conversion process, denoting that the ejs is comprised of, and when static content should be made of it.
const conversionObjects = [
    {
        ejs: { file: "index", data: {} },
        static: "index"
    },
    {
        ejs: { file: "games", data: { gamePg: "metroid", gamePgData: undefined } },
        static: "games-metroid"
    },
    {
        ejs: { file: "games", data: { gamePg: "ffBattle", gamePgData: undefined } },
        static: "games-ffBattle"
    },
    {
        ejs: { file: "games", data: { gamePg: "frostByte", gamePgData: undefined } },
        static: "games-frostByte"
    },
    {
        ejs: { file: "games", data: { gamePg: "flippinOut", gamePgData: undefined } },
        static: "games-flippinOut"
    },
    {
        ejs: { file: "games", data: { gamePg: "tornadoom", gamePgData: engineCodeJson } },
        static: "games-tornadoom"
    },
    {
        ejs: { file: "games", data: { gamePg: "doomLagoon", gamePgData: undefined } },
        static: "games-doomLagoon"
    },
    {
        ejs: { file: "webApps", data: {} },
        static: "webApps"
    },
    {
        ejs: { file: "anims", data: {} },
        static: "anims"
    },    
    {
        ejs: { file: "contact", data: {} },
        static: "contact"
    }    
];

// For each page given by the user
for (const obj of conversionObjects) {

    // Render the .ejs file as a string.
    ejs.renderFile(`./views/${obj.ejs.file.toLowerCase()}.ejs`, obj.ejs.data, (err, str) => {

        if (err) console.error(err);

        // ! Might need to handle folder ceration here, if it's not innately handled.
        fs.writeFileSync(cwd() + `/docs/${obj.static.toLowerCase()}.html`, str);
    });
}