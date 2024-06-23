const axios = require('axios');

const getSerieInfo = async (req, res) => { 
    try {
        const [infoResponse, videoResponse, providerResponse] = await Promise.all([
            axios.get(`${process.env.CONTENT_SERVICE}/series/info/${req.params.serieId}`),
            axios.get(`${process.env.CONTENT_SERVICE}/series/video/${req.params.serieId}`),
            axios.get(`${process.env.CONTENT_SERVICE}/series/providers/${req.params.serieId}`)
        ]);

        const info = {...infoResponse.data, video: videoResponse.data, provider: providerResponse.data};
        res.json(info);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
}

module.exports = {
    getSerieInfo
}