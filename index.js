if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express')
const cors = require('cors')
const CONTENT_SERVICE_URL = process.env.CONTENT_SERVICE;
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const services = {
    content: CONTENT_SERVICE_URL
}

app.use(express.json());
app.use('/content', cors(corsOptions), createProxyMiddleware({ target: services.content, changeOrigin: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Gateway listening on port ${PORT}`)
})