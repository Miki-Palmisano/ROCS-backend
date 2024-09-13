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
    return response.data.results.map((serie) => {
        return {
            type: "series", 
            id: serie.id, 
            title: serie.name, 
            description: serie.overview, 
            year: serie.first_air_date, 
            genres: serie.genre_ids,
            rating: serie.vote_average, 
            img: serie.poster_path === null ? null : "https://image.tmdb.org/t/p/w780" + serie.poster_path,
        };
    });
}

const getSerieInfo = async (req, res) => { 
    try {
        const infoResponse = await getSerieInfoById(req, res);
        const videoResponse = await getSerieVideoById(req, res);
        const providerResponse = await getSeriesProvidersById(req, res);

        const info = {...infoResponse, video: videoResponse, provider: providerResponse};
        res.json(info);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
} 

const getSerieInfoById = async (req, res) => {
    try {
        const infoResponse = await makeRequest(`https://api.themoviedb.org/3/tv/${req.params.seriesId}`, {language: 'it-IT'});
        const serie = infoResponse.data;
        return({
            type: "series",
            id: serie.id,
            title: serie.name,
            genres: serie.genres,
            description: serie.overview,
            release_date: serie.first_air_date+'/'+serie.last_air_date,
            rating: serie.vote_average,
            creator: serie.created_by,
            seasons: serie.number_of_seasons,
            episodes: serie.number_of_episodes,
            episodes_duration: serie.episode_run_time,
            production_companies: serie.production_companies,
            img: "https://image.tmdb.org/t/p/w780"+serie.poster_path,
            tagline: serie.tagline,
            status: serie.status
        });
    }catch(error){
        console.error(error);
    }
}

const getSerieVideoById = async (req, res) => {
    try {
        const videoResponse = await makeRequest(`https://api.themoviedb.org/3/tv/${req.params.seriesId}/videos`, { language: 'it-IT' });
        const video = videoResponse.data.results.filter((video) => video.type === 'Trailer');
        return(video.length === 0 ? {key: null, site: null} : {key: video[0].key, site: video[0].site});
    }
    catch(error){
        console.error(error);
    } 
}

const getSeriesProvidersById = async (req, res) => {
    try {
        const providersResponse = await makeRequest(`https://api.themoviedb.org/3/tv/${req.params.seriesId}/watch/providers`, {watch_region: 'IT', language: 'it-IT'});
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

const searchSerie = async (req, res) => {
    try {
        const { keywords } = req.query;
        let response = await makeRequest('https://api.themoviedb.org/3/search/tv', {query: keywords, watch_region:'IT', language: 'it-IT'});
        res.json(dataTemplate(response));
    }
    catch(error){
        console.error(error);
    }
}


const getSeriesGenre = async (req, res) => {
    try {
        const genreResponse = await makeRequest('https://api.themoviedb.org/3/genre/tv/list', {language: 'it-IT', watch_region: 'IT'});
        res.json(genreResponse.data.genres.map((genre) => { return {id: genre.id, name: genre.name}; }));
    }
    catch(error){
        console.error(error);
    }
}

const getProviders = async (req, res) => {
    try {
      const response = await makeRequest('https://api.themoviedb.org/3/watch/providers/tv', {watch_region: 'IT', language: 'it-IT'});
      res.json(response.data.results.map((provider) => { return {id: provider.provider_id, name: provider.provider_name, logo: "https://image.tmdb.org/t/p/w780"+provider.logo_path}; }));
    }
    catch(error){
      console.error(error);
    }
}

const getSeries = async (req, res) => {
    try {
        const { providerId, genreId } = req.query;
        const params = {
            watch_region: 'IT',
            language: 'it-IT',
            sort_by: 'popularity.desc'
        };

        providerId ? params.with_watch_providers = providerId : null;
        genreId ? params.with_genres = genreId : null;

        const response = await makeRequest('https://api.themoviedb.org/3/discover/tv', params);
        res.json(dataTemplate(response));
    }
    catch(error){
        console.error(error);
    }
}


module.exports = {
    getSerieInfo,
    searchSerie,
    getSeriesGenre,
    getProviders,
    getSeries
}