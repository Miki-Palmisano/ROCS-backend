const axios = require('axios');

const getFilmInfo = async (req, res) => { 
    try {
        const [infoResponse, videoResponse] = await Promise.all([
            axios.get(`${process.env.CONTENT_SERVICE}/films/info/${req.params.filmId}`),
            axios.get(`${process.env.CONTENT_SERVICE}/films/video/${req.params.filmId}`)
        ]);

        const info = {...infoResponse.data, video: videoResponse.data};
        res.json(info);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
}

module.exports = {
    getFilmInfo
}