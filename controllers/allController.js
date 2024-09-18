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
    return response.data.results.map((all) => {
        return {
            type: all.media_type === 'movie' ? 'films' : 'series',
            id: all.id,
            title: all.title || all.name,
            description: all.overview,
            year: all.release_date || all.first_air_date,
            genres: all.genre_ids,
            rating: all.vote_average,
            img: !all.poster_path ? null : "https://image.tmdb.org/t/p/w780" + all.poster_path,
        };
    }).filter((all) => all.img !== null);
}

const getPopular = async (req, res) => {
    const { page } = req.query;
    const url = `https://api.themoviedb.org/3/trending/all/week`;
    const params = {language: 'it-IT', watch_region: 'IT', page: page};
    const response = await makeRequest(url, params);
    console.log(page);
    res.json({content: dataTemplate(response), totalPages: response.data.total_pages});
}

const search = async (req, res) => {
    const { keywords, page } = req.query;
    const url = `https://api.themoviedb.org/3/search/multi`;
    const params = {language: 'it-IT', watch_region: 'IT', query: keywords, page: page};
    const response = await makeRequest(url, params);
    res.json({content: dataTemplate(response), totalPages: response.data.total_pages});
}

module.exports = {
    getPopular,
    search
}