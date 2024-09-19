const axios = require('axios');
const jwt = require('jsonwebtoken');
const user = require('../models/userModel');
const bcrypt = require('bcrypt');

const generateJWT = (user) => {
    const payload = {
        id: user.id,
        username: user.username
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingEmail = await user.User.findOne({ email });
        if (existingEmail) {
            return res.status(409).json({ message: 'Email già esistente' });
        }
        
        const existingUsername = await user.User.findOne({ username });
        if (existingUsername) {
            return res.status(409).json({ message: 'Username già in uso' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = new user.User({
            username,
            email,
            passwordHash: passwordHash
        });

        const savedUser = await newUser.save();
        res.status(201).json({ message: 'Account Created' });
    } catch (error) {
        if(error.response && error.response.status === 409) res.status(409).json({ message: error.response.data.message});
        else res.status(500).json({ message: 'Errore del server', error: error.message });
        console.log(error)
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await user.User.findOne({ email });
        if (!existingUser) {
            return res.status(401).json({message: 'Email o Password errati' });
        }
        const passwordMatch = await bcrypt.compare(password, existingUser.passwordHash);
        if (!passwordMatch) {
            return res.status(401).json({message: 'Email o Password errati' });
        }
        const token = generateJWT({ id: existingUser._id, username: existingUser.username });
        res.cookie('token', token, { 
            httpOnly: true, 
            secure: true, 
            sameSite: 'Lax', 
            domain: '.render.com',
            maxAge: 24 * 60 * 60 * 1000 }).json({ username: existingUser.username });
    } catch (error) {
        if (error.response && error.response.status === 401) {
            res.status(401).json({ message: error.response.data.message , error: error});
        } else {
            res.status(500).json({ message: 'Errore del server', error: error.message });
        }
    }
}

const logoutUser = async (req, res) => {
    res.clearCookie('token');
    res.clearCookie('username');
    res.status(200).json({ message: 'Logout effettuato' });
}

const authUser = async (req, res) => {
    const { email, username } = req.body;

    try {
        const existingUser = await user.User.findOne({ email });
        if (!existingUser) {
            const newUser = new user.User({
                username,
                email
            });
            const savedUser = await newUser.save();
            console.log('Utente creato');
        } else {
            console.log(email, 'Utente già esistente, login');
        }
        const token = generateJWT({ id: existingUser._id, username: existingUser.username });
        res.cookie('token', token, { 
            httpOnly: true, 
            secure: true, 
            sameSite: 'Lax', 
            domain: '.render.com',
            maxAge: 24 * 60 * 60 * 1000 }).json({ username: existingUser.username });
        console.log('Cookie impostati');
        //res.status(200).json({ token: token, username: existingUser.username});
    } catch (error) {
        if (error.response && error.response.status === 401) {
            res.status(401).json({ message: error.response.data.message });
        } else {
            res.status(500).json({ message: 'Errore del server', error: error.message });
        }
    }
}

const favorite = async (req, res) => {
    const userId = req.userId;
    const { itemId, type, image } = req.body;
    try {
        const findUser = await user.User.findOne({ _id: userId });

        if (!findUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const filmIndex = findUser.favoriteList.find(item => item.id === itemId.toString());

        if (filmIndex) {
            await user.User.findByIdAndUpdate(
                userId,
                { $pull: { favoriteList: { id: itemId } } }
            ); 
            console.log("Elemento rimosso dalla lista dei preferiti");
            res.status(200).json({ message: 'Elemento rimosso dalla lista dei preferiti'});
        } else {
            await user.User.findByIdAndUpdate(
                userId,
                { $addToSet: { favoriteList: { id: itemId, type: type, img: image } } }
            );
            console.log("Elemento aggiunto alla lista dei preferiti");
            res.status(200).json({ message: 'Elemento aggiunto alla lista dei preferiti'});
        }
    } catch (error) {
        if (error.response && error.response.status === 401) {
            // Gestione dell'errore
        }
    }
};

const getFavoriteState = async (req, res) => {
    const userId = req.userId;
    const { itemId, type } = req.query;
    try {
        const findUser = await user.User.findOne({ _id: userId });

        if (!findUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const favoriteItem = findUser.favoriteList.find(item => item.id === itemId && item.type === type);

        if (favoriteItem) {
            console.log('Elemento preferito trovato');
            res.status(200).json(favoriteItem);
        } else {
            console.log('Elemento preferito non trovato');
            res.status(404).json({ message: 'Favorite item not found' });
        }
    } catch (error) {
        console.error('Errore durante il recupero dello stato del contenuto:', error);
        res.status(500).json({ error: 'Errore durante il recupero dello stato del contenuto' });
    }
}

const changeList = async (req, res) => {
    const userId = req.userId;
    const { itemId, type, image, status, vote } = req.body;
    try {
        const findUser = await user.User.findOne({ _id: userId });

        if (!findUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if(type === 'films') {
            const findItem = findUser.filmList.some(item => item.filmId === itemId);

            if (findItem) {
                await user.User.findOneAndUpdate(
                    { _id: userId, 'filmList.filmId': itemId },
                    { $set: { 'filmList.$.status': status, 'filmList.$.vote': vote } }
                )
                console.log('Film aggiornato con successo')
                res.status(200).json({ message: 'Film aggiornato con successo' });
            } else {
                await user.User.findByIdAndUpdate(
                    userId,
                    { $addToSet: { filmList: { id: itemId, img: image, status: status, vote: vote, type: 'films' } } }
                )
                console.log('Film aggiunto con successo')
                res.status(200).json({ message: 'Film aggiunto con successo' });
            }
        } else if (type === 'series') {
            const findItem = findUser.serieList.some(item => item.serieId === itemId);

            if (findItem) {
                await user.User.findOneAndUpdate(
                    { _id: userId, 'serieList.serieId': itemId },
                    { $set: { 'serieList.$.status': status, 'serieList.$.vote': vote } }
                )
                console.log('Serie aggiornata con successo')
                res.status(200).json({ message: 'Serie aggiornata con successo' });
            } else {
                await user.User.findByIdAndUpdate(
                    userId,
                    { $addToSet: { serieList: { id: itemId, img: image, status: status, vote: vote, type: 'series' } } }
                )
                console.log('Serie aggiunta con successo')
                res.status(200).json({ message: 'Serie aggiunta con successo' });
            }
        }
    } catch (error) {
        console.error('Errore durante il recupero dello stato del contenuto:', error);
        res.status(500).json({ error: 'Errore durante il recupero dello stato del contenuto' });
    }
}

const getListState = async (req, res) => {
    const userId = req.userId;
    const { itemId, type } = req.query;
    try {
        const findUser = await user.User.findOne({ _id: userId });

        if (!findUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if(type === 'films') {
            const filmItem = findUser.filmList.find(item => item.id === itemId);

            if (filmItem) {
                console.log('Film trovato');
                res.status(200).json(filmItem);
            } else {
                console.log('Film non trovato');
                res.status(404).json({ message: 'Film non trovato' });
            }
        } else if (type === 'series') {
            const serieItem = findUser.serieList.find(item => item.id === itemId);

            if (serieItem) {
                console.log('Serie trovata');
                res.status(200).json(serieItem);
            } else {
                console.log('Serie non trovata');
                res.status(404).json({ message: 'Serie non trovata' });
            }
        }
    } catch (error) {
        console.error('Errore durante il recupero dello stato del contenuto:', error);
        res.status(500).json({ error: 'Errore durante il recupero dello stato del contenuto' });
    }
}

const getList = async (req, res) => {
    const userId = req.userId;
    const { listId } = req.query;
    try {
        const findUser = await user.User.findOne({ _id: userId });

        if (!findUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(findUser[listId]);
    } catch (error) {
        console.error('Errore durante il recupero della lista utente:', error);
        res.status(500).json({ error: 'Errore durante il recupero della lista utente' });
    }
}

const removeFromList = async (req, res) => {
    const userId = req.userId;
    const { itemId, type } = req.body;
    try {
        const findUser = await user.User.findOne({ _id: userId });

        if (!findUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if(type === 'films') {
            await user.User.findByIdAndUpdate(
                userId,
                { $pull: { filmList: { id: itemId } } }
            );
            console.log('Film rimosso con successo');
            res.status(200).json({ message: 'Film rimosso con successo' });
        } else if (type === 'series') {
            await user.User.findByIdAndUpdate(
                userId,
                { $pull: { serieList: { id: itemId } } }
            );
            console.log('Serie rimossa con successo');
            res.status(200).json({ message: 'Serie rimossa con successo' });
        }
    } catch (error) {
        console.error('Errore durante la rimozione del contenuto:', error);
        res.status(500).json({ error: 'Errore durante la rimozione del contenuto' });
    }
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    authUser,
    favorite,
    getFavoriteState,
    changeList,
    getListState,
    getList,
    removeFromList
}