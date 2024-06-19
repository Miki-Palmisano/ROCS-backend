

const express = require('express')
const cors = require('cors')
const axios = require('axios')
const CONTENT_SERVICE_URL = process.env.CONTENT_SERVICE;
const FRONTEND_URL = process.env.FRONTEND_URL;

const app = express()

const corsOptions = {
    origin: `${FRONTEND_URL}`,
    optionsSuccessStatus: 200
}

app.use(cors())

app.all('/content/*', async (req, res) => {
    let rocsContentServiceUrl = `${CONTENT_SERVICE_URL}${req.originalUrl}`;
    
    try {
        const response = await axios({
            method: req.method,
            url: rocsContentServiceUrl,
            data: req.body,
            headers: {
                ...req.headers,
            }
        });
        res.status(response.status).send(response.data);
    } catch (e) {
        res.status(e.response.status).send(e.response.data);
    }
});


app.listen(3000, () => {
    console.log("Gateway listening on port 3000")
})