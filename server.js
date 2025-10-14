import express from "express";
import axios from "axios";
import 'dotenv/config';
import querystring from "querystring";
import session, { Cookie } from "express-session";
import path from "path";
import { fileURLToPath } from "url";

//convert path which is currently in URL format to conventional path format
const __filename = fileURLToPath(import.meta.url);

///used to reference current directory, necessary when serving files like in line 30
const __dirname = path.dirname(__filename)

const API_KEY = process.env.LASTFM_API_KEY;

if (!API_KEY) {
  console.error("Missing API key");
  process.exit(1);
}

//init express 
const app = express(); //init express
const port = 3000; //set port

//init ejs for variable display in html
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '/views/index.html'));
});

//start express server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});