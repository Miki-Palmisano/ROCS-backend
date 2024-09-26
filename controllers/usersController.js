const user = require('../models/userModel');

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
        res.status(200).json({ username: existingUser.username, id: existingUser._id });
    } catch (error) {
        if (error.response && error.response.status === 401) {
            res.status(401).json({ message: error.response.data.message });
        } else {
            res.status(500).json({ message: 'Errore del server', error: error.message });
        }
    }
}

const favorite = async (req, res) => {
    const id = req.headers["id"];
    const { itemId, type, image, title, year, description } = req.body;
    try {
        const findUser = await user.User.findOne({ _id: id });

        if (!findUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const filmIndex = findUser.favoriteList.find(item => item.id === itemId.toString());

        if (filmIndex) {
            await user.User.findByIdAndUpdate(
                id,
                { $pull: { favoriteList: { id: itemId } } }
            ); 
            console.log("Elemento rimosso dalla lista dei preferiti");
            res.status(200).json({ message: 'Elemento rimosso dalla lista dei preferiti'});
        } else {
            await user.User.findByIdAndUpdate(
                id,
                { $addToSet: { favoriteList: { id: itemId, type: type, img: image, title: title, year: year, description: description } } }
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
    const id = req.headers["id"];
    const { itemId, type } = req.query;
    try {
        const findUser = await user.User.findOne({ _id: id });

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
    const id = req.headers["id"];
    const { itemId, type, image, status, vote, title, year, description} = req.body;
    try {
        const findUser = await user.User.findOne({ _id: id });

        if (!findUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if(type === 'films') {
            const findItem = findUser.filmList.some(item => item.filmId === itemId);

            if (findItem) {
                await user.User.findOneAndUpdate(
                    { _id: id, 'filmList.filmId': itemId },
                    { $set: { 'filmList.$.status': status, 'filmList.$.vote': vote } }
                )
                console.log('Film aggiornato con successo')
                res.status(200).json({ message: 'Film aggiornato con successo' });
            } else {
                await user.User.findByIdAndUpdate(
                    id,
                    { $addToSet: { filmList: { id: itemId, img: image, status: status, vote: vote, type: 'films', title: title, description: description, year: year }}}
                )
                console.log('Film aggiunto con successo')
                res.status(200).json({ message: 'Film aggiunto con successo' });
            }
        } else if (type === 'series') {
            const findItem = findUser.serieList.some(item => item.serieId === itemId);

            if (findItem) {
                await user.User.findOneAndUpdate(
                    { _id: id, 'serieList.serieId': itemId },
                    { $set: { 'serieList.$.status': status, 'serieList.$.vote': vote } }
                )
                console.log('Serie aggiornata con successo')
                res.status(200).json({ message: 'Serie aggiornata con successo' });
            } else {
                await user.User.findByIdAndUpdate(
                    id,
                    { $addToSet: { serieList: { id: itemId, img: image, status: status, vote: vote, type: 'series', title: title, description: description, year: year } } }
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
    const id = req.headers["id"];
    const { itemId, type } = req.query;
    try {
        const findUser = await user.User.findOne({ _id: id });

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
    const id = req.headers["id"];
    const { listType, listState } = req.query;
    try {
        const findUser = await user.User.findOne({ _id: id });

        if (!findUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(findUser[listType === 'films' ? 'filmList' : 'serieList'].filter(item => item.status === listState).sort((a, b) => b.vote - a.vote));
    } catch (error) {
        console.error('Errore durante il recupero della lista utente:', error);
        res.status(500).json({ error: 'Errore durante il recupero della lista utente' });
    }
}

const removeFromList = async (req, res) => {
    const id = req.headers["id"];
    const { itemId, type } = req.body;
    try {
        const findUser = await user.User.findOne({ _id: id });

        if (!findUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if(type === 'films') {
            await user.User.findByIdAndUpdate(
                id,
                { $pull: { filmList: { id: itemId } } }
            );
            console.log('Film rimosso con successo');
            res.status(200).json({ message: 'Film rimosso con successo' });
        } else if (type === 'series') {
            await user.User.findByIdAndUpdate(
                id,
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
    authUser,
    favorite,
    getFavoriteState,
    changeList,
    getListState,
    getList,
    removeFromList
}