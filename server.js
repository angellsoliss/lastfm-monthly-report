import express from "express";
import 'dotenv/config';
import path from "path";
import { fileURLToPath } from "url";
import { Vibrant } from "node-vibrant/node";

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

//serve files statically
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "views")));

//used to parse form submissions
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//init ejs for variable display in html
app.set("view engine", "ejs");

//needed for gradient
function rgbToHex(r, g, b) {
  const toHex = (x) => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '/views/index.html'));
});

//handle POST from html form
app.post("/api/username", async (req, res) => {
    const { username } = req.body;
    console.log("Username received:", username);

    const topSelection = req.body.TopSelection;
    const timeframe = req.body.timeFrame;

    if (topSelection === "artists"){
      console.log("you chose artists");
    } else if (topSelection === "tracks") {
      console.log("you chose tracks");
    } else {
      console.log("you chose albums");
    }

    if (timeframe === "one-month"){
      console.log("you chose one month");
    } else if (timeframe === "three-months"){
      console.log("you chose three months");
    } else {
      console.log("you chose one year");
    }

    //construct urls for api calls
    const albumParams = new URLSearchParams({
        method: 'user.gettopalbums',
        user: username,
        period: '1month',
        limit: '55',
        api_key: API_KEY,
        format: 'json'
    });
    const artistParams = new URLSearchParams({
        method: 'user.gettopartists',
        user: username,
        period: '1month',
        limit: '10',
        api_key: API_KEY,
        format: 'json'
    });
    const CONSTRUCTED_ALBUM_URL = `https://ws.audioscrobbler.com/2.0/?${albumParams.toString()}`;
    const CONSTRUCTED_ARTIST_URL = `https://ws.audioscrobbler.com/2.0/?${artistParams.toString()}`;

    try {
        //fetch albums
        const albumResponse = await fetch(CONSTRUCTED_ALBUM_URL);
        const albumData = await albumResponse.json();
        const albums = albumData.topalbums?.album || [];

        const formattedAlbums = albums
          .filter(album => {
            //exclude albums with no art
            const cover = album.image?.find(img => img.size === 'extralarge')?.['#text'];
            return cover && cover !== '';
          })
          .map(album => ({
            cover: album.image.find(img => img.size === 'extralarge')['#text'],
            artist: album.artist.name,
            album: album.name,
            playcount: album.playcount
          }));

          //get top album cover for gradient color
          const topAlbumCover = formattedAlbums.length > 0 ? formattedAlbums[0].cover : null;
          let vibrantHex = "#d1170e"
          
          if (topAlbumCover){
            //console.log(topAlbumCover);
            const palette = await Vibrant.from(topAlbumCover).getPalette();
            const rgb = palette.Vibrant._rgb;
            
            if (rgb){
                vibrantHex = rgbToHex(rgb[0], rgb[1], rgb[2])
            }
            //console.log(vibrantHex);
            //console.log(palette);
          }

        //fetch artists
        const artistResponse = await fetch(CONSTRUCTED_ARTIST_URL);
        const artistData = await artistResponse.json();
        const artists = artistData.topartists?.artist || [];

        const formattedArtists = artists.map(artist => ({
            name: artist.name,
            playcount: artist.playcount
        }));

        //display date
        const today = new Date();
        let reportMonth;

        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const currentDay = today.getDate();

        //if the current day of the month is >= 20, report month is the current month, previous month otherwise
        if (currentDay >= 20){
            reportMonth = new Date(currentYear, currentMonth, 1).toLocaleString('default', { month: 'long' });
        } else {
            const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
            reportMonth = prevMonthDate.toLocaleString('default', { month: 'long' });
        }

        //pass data to ejs
        res.render("profile", { 
            username, 
            albums: formattedAlbums, 
            artists: formattedArtists,
            reportMonth: reportMonth,
            color : vibrantHex
        });

    } catch (err) {
        console.error(err);
        res.send("Error fetching data from Last.fm");
    }
});

//start express server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});