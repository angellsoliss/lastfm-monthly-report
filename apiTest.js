import 'dotenv/config';

const API_KEY = process.env.LASTFM_API_KEY;
const USERNAME = "angelsolis";

if (!API_KEY) {
  console.error("Missing API key");
  process.exit(1);
}

//api calls are made through this url
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

const album_params = new URLSearchParams({
  method: 'user.gettopalbums',
  user: USERNAME,
  period: '1month',
  limit: '49',
  api_key: API_KEY,
  format: 'json'
});

const artist_params = new URLSearchParams({
  method: 'user.gettopartists',
  user: USERNAME,
  period: '1month',
  limit: '10',
  api_key: API_KEY,
  format: 'json'
});

const CONSTRUCTED_ALBUM_URL = `${BASE_URL}?${album_params.toString()}`
const CONSTRUCTED_ARTIST_URL = `${BASE_URL}?${artist_params.toString()}`

async function getAlbums() {
  const result = await fetch(CONSTRUCTED_ALBUM_URL);
  const data = await result.json();

  //fetch album array from json
  const albums = data.topalbums?.album || [];
  
  const formattedAlbums = albums.map(album => {
    const cover = album.image?.find(img => img.size === `extralarge`)?.[`#text`] || `no image available`;
    return {
      artist: album.artist.name,
      album: album.name,
      playcount: album.playcount,
      cover      
    };
  });

  formattedAlbums.forEach(a => {
    console.log(`${a.artist} - ${a.album}`);
    console.log(`${a.playcount} plays`);
    console.log(`${a.cover}`);
    console.log(`----------------------------------------------------------------------------------`);
  });
}

async function getArtists() {
  const result = await fetch(CONSTRUCTED_ARTIST_URL);
  const data = await result.json();
  
  const artists = data.topartists?.artist || [];

  const formattedArtists = artists.map(artist => ({
    name: artist.name,
    playcount: artist.playcount
  }));

  formattedArtists.forEach(ar => {
    console.log(`${ar.name} - ${ar.playcount} plays`);
    console.log(`----------------------------------------------------------------------------------`);
  });
}

async function main() {
  await getAlbums();
  await getArtists();
}

console.log(CONSTRUCTED_ALBUM_URL);
console.log(CONSTRUCTED_ARTIST_URL);
main().catch(console.error);