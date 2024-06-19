if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express')
const cors = require('cors')
const axios = require('axios')
const CONTENT_SERVICE_URL = process.env.CONTENT_SERVICE;
const FRONTEND_URL = process.env.FRONTEND_URL;
const PORT = process.env.PORT || 3000;

const app = express()

app.use(cors({
    origin: `${FRONTEND_URL}`
}))

app.use(express.json())

app.all('/content/*', async (req, res) => {
    let rocsContentServiceUrl = `${CONTENT_SERVICE_URL}${req.originalUrl}`;
    console.log(rocsContentServiceUrl);
    try {
        const response = await axios({
            method: req.method,
            url: rocsContentServiceUrl,
            data: req.body,
            headers: {
                accept: 'application/json',
                ...req.headers,
            }
        });
        res.status(response.status).send(response.data);
    } catch (e) {
        console.log(e);
        res.status(e.response.status).send(e.response.data);
    }
});


app.listen(PORT, () => {
    console.log(`Gateway listening on port ${PORT}`)
})