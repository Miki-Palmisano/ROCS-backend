const axios = require('axios');
const API_KEY = process.env.TMDB_API_KEY;

const makeRequest = async (url, params) => {
    try {
        const response = await axios.request({
            method: 'GET',
            url: url,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${API_KEY}`
            },
            params: params
        });
        return response;
    }
    catch(error){
        console.error(error);
    }
}
  
const dataTemplate = (response) => {
    return response.data.results.map((film) => {
        return {
            type: "films", 
            id: film.id, 
            title: film.title, 
            description: film.overview, 
            year: film.releaseYear, 
            genres: film.genre_ids,
            rating: film.vote_average, 
            img: film.poster_path === null ? null : "https://image.tmdb.org/t/p/w780" + film.poster_path,
        };
    });
}

const getFilmInfo = async (req, res) => { 
    try {
        const infoResponse = await getFilmInfoById(req, res);
        const videoResponse = await getFilmVideoById(req, res);
        const providerResponse = await getFilmProvidersById(req, res);

        const info = {...infoResponse, video: videoResponse, provider: providerResponse};
        res.json(info);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
}

const getFilmInfoById = async (req, res) => {
    try {
      const infoResponse = await axios.request({
        method: 'GET',
        url: `https://api.themoviedb.org/3/movie/${req.params.filmsId}`,
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${API_KEY}`
        }, 
        params: {
          watch_region: 'IT',
          language: 'it-IT',
          sort_by: 'popularity_desc'
        }
      });
      const film = infoResponse.data;
      return({
        type: "films",
        id: film.id,
        title: film.title,
        genres: film.genres,
        description: film.overview,
        release_date: film.release_date,
        rating: film.vote_average,
        production_companies: film.production_companies,
        img: "https://image.tmdb.org/t/p/w780"+film.poster_path,
        tagline: film.tagline,
        status: film.status
    });
    }catch(error){
      console.error(error);
    }
}
  
const getFilmVideoById = async (req, res) => {
    try {
      const videoResponse = await makeRequest(`https://api.themoviedb.org/3/movie/${req.params.filmsId}/videos`, { watch_region: 'IT', language: 'it-IT' });
      const video = videoResponse.data.results.filter((video) => video.type === 'Trailer');
      return(video.length === 0 ? {key: null, site: null} : {key: video[0].key, site: video[0].site});
    }catch(error){
      console.error(error);
    }
}
  
const getFilmProvidersById = async (req, res) => {
    try {
      const providersResponse = await makeRequest(`https://api.themoviedb.org/3/movie/${req.params.filmsId}/watch/providers`, {watch_region: 'IT', language: 'it-IT'});
  
      return(
        providersResponse.data.results.length === 0 || !providersResponse.data.results.IT
        ? null
        : {
            flatrate: providersResponse.data.results.IT.flatrate || null,
            rent: providersResponse.data.results.IT.rent || null,
            buy: providersResponse.data.results.IT.buy || null
        }
      );
    }
    catch(error){
      console.error(error);
    }
}

const searchFilm = async (req, res) => {
    let list = [];
    for(let i = 1 ; list.length < 20; i++){
      try {
        const { genreId, keywords } = req.query;
        let response = await makeRequest('https://api.themoviedb.org/3/search/movie', {query: keywords, page: i, watch_region: 'IT'});
        let templated = dataTemplate(response);
        if(genreId) templated = templated.filter((film) => film.genres.includes(parseInt(genreId.split(','))))
        list = [...list, ...templated];
        if(response.data.total_pages === i) break;
      }
      catch(error){
        console.error(error);
      }
    }
    res.json(list);
}

const getFilmGenre = async (req, res) => {
    try {
      const response = await makeRequest('https://api.themoviedb.org/3/genre/movie/list', {language: 'it-IT', watch_region: 'IT'});
      res.json(response.data.genres.map((genre) => { return {id: genre.id, name: genre.name}; }));
    }
    catch(error){
      console.error(error);
    }
}

const getProviders = async (req, res) => {
    try {
      const response = await makeRequest('https://api.themoviedb.org/3/watch/providers/movie', {language: 'it-IT', watch_region: 'IT'});
      res.json(response.data.results.map((provider) => { return {id: provider.provider_id, name: provider.provider_name, logo: "https://image.tmdb.org/t/p/w780"+provider.logo_path}; }));
    }
    catch(error){
      console.error(error);
    }
}

const getFilms = async (req, res) => {
    try {
      const { providerId, genreId } = req.query;
      const params = {
        watch_region: 'IT',
        language: 'it-IT',
        sort_by: 'popularity.desc'
      };
  
      providerId ? params.with_watch_providers = providerId : null;
      genreId ? params.with_genres = genreId : null;
  
      const response = await makeRequest('https://api.themoviedb.org/3/discover/movie', params);
      
      res.json(dataTemplate(response));
    }
    catch(error){
      console.error(error);
    }
}

module.exports = {
    getFilmInfo,
    searchFilm,
    getFilmGenre,
    getProviders,
    getFilms
}