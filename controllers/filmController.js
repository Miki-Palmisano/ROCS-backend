const axios = require('axios');

const options = {
  method: 'GET',
  url: 'https://streaming-availability.p.rapidapi.com/shows/search/filters',
  params: {
    country: 'it',
  },
  headers: {
    'x-rapidapi-key': '6bdf8b45aemsha36144461e95eb5p193fbajsnbb6ee96e9e88',
    'x-rapidapi-host': 'streaming-availability.p.rapidapi.com'
  }
};

const getAllFilms = async (req, res) => {
    try {
        const response = await axios.request(options);
        const films = response.data.shows.map((film) => {
            return {
                type: film.showType, 
                id: film.id, 
                title: film.title, 
                description: film.overview, 
                year: film.releaseYear, 
                genres: film.genres, 
                directors: film.directors, 
                cast: film.cast, 
                rating: film.rating, 
                img: film.imageSet.verticalPoster.w720,
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