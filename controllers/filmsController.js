const axios = require('axios');
const API_KEY = process.env.TMDB_API_KEY;

const options = {
  method: 'GET',
  url: 'https://api.themoviedb.org/3/discover/movie',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }, 
  params: {
    //with_watch_providers: '8|9', // Netflix and Amazon Prime
    watch_region: 'IT',
    language: 'it-IT',
    sort_by: 'popularity.desc',
  }
};

const getAllFilms = async (req, res) => {
    try {
        const response = await axios.request(options);
        const films = response.data.results.map((film) => {
            return {
                type: "movie", 
                id: film.id, 
                title: film.title, 
                description: film.overview, 
                year: film.releaseYear, 
                genres: film.genre_ids,
                rating: film.vote_average, 
                img: "https://image.tmdb.org/t/p/w780" + film.poster_path,
            };
        });
        res.json(films);
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    getAllFilms
}