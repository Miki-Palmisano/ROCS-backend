const axios = require('axios');
const jwt = require('jsonwebtoken');

const services = {
    content: process.env.CONTENT_SERVICE,
    database: process.env.DATABASE_SERVICE
}

const generateJWT = (user) => {
    const payload = {
        id: user.id,
        username: user.username
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1m' });
};

const registerUser = async (req, res) => {
    try {
        const response = await axios.post(`${services.database}/user/register`, req.body);
        res.status(200).json(response.data);
    } catch (error) {
        if(error.response && error.response.status === 409) res.status(409).json({ message: error.response.data.message});
        else res.status(500).json({ message: 'Errore del server', error: error.message });
        console.log(error)
    }
}

const loginUser = async (req, res) => {
    try {
        const response = await axios.post(`${services.database}/user/login`, req.body);
        const user = response.data;
        const token = generateJWT(user);
        res.status(200).json({ token: token , username: user.username});
    } catch (error) {
        if (error.response && error.response.status === 401) {
            res.status(401).json({ message: error.response.data.message , error: error});
        } else {
            res.status(500).json({ message: 'Errore del server', error: error.message });
        }
    }
}

const authUser = async (req, res) => {
    try {
        const response = await axios.post(`${services.database}/user/auth`, req.body);
        if(response.status === 200) {
            const user = response.data;
            const token = generateJWT(user);
            res.status(200).json({ token: token, username: user.username});
        }
    } catch (error) {
        if (error.response && error.response.status === 401) {
            res.status(401).json({ message: error.response.data.message });
        } else {
            res.status(500).json({ message: 'Errore del server', error: error.message });
        }
    }
}

module.exports = {
    registerUser,
    loginUser,
    authUser
}