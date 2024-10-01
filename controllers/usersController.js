const user = require('../models/userModel');

const authUser = async (req, res) => {
    const { email, username, sub } = req.body;

    try {
        let existingUser = await user.User.findOne({ sub: sub });

        if (existingUser === null) {
            await user.User.create({
                    sub: sub,
                    username: username,
                    email: email
            })
            existingUser = await user.User.findOne({ sub: sub });
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

const favourite = async (req, res) => {
    const id = req.headers["id"];
    const { itemId, type, image, title, year, description } = req.body;
    try {
        const findUser = await user.User.findOne({ _id: id });

        if (!findUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const contentIndex = findUser.contentList.find(item => item.id === itemId.toString());

        if (contentIndex) {
            await user.User.findOneAndUpdate(
                { _id: id, 'contentList.id': itemId },
                { $set: { 'contentList.$.favourite': !contentIndex.favourite } }
            )
            console.log("Elemento rimosso dalla lista dei preferiti");
            res.status(200).json({ message: 'Elemento rimosso dalla lista dei preferiti'});
        } else {
            await user.User.updateOne(
                { _id: id },
                { $push:
                        { contentList:
                            {
                                id: itemId,
                                type: type,
                                img: image,
                                title: title,
                                year: year,
                                description: description,
                                favourite: true
                            }
                        }
                }
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

        const favoriteItem = findUser.contentList.find(item => item.id === itemId && item.favourite === true);

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

        const existingContent = findUser.contentList.find(item => item.id === itemId);

        if (existingContent) {
            console.log('Contenuto trovato');
            await user.User.updateOne(
                { _id: id, 'contentList.id': itemId },
                {
                    $set: {
                        'contentList.$.img': image,
                        'contentList.$.status': status,
                        'contentList.$.vote': vote,
                        'contentList.$.title': title,
                        'contentList.$.description': description,
                        'contentList.$.year': year,
                        'contentList.$.type': type
                    }
                }
            );
            res.status(200).json({ message: 'Contenuto aggiornato con successo' });
        } else {
            await user.User.updateOne(
                { _id: id },
                {
                    $push: {
                        contentList: {
                            id: itemId,
                            img: image,
                            status: status,
                            vote: vote,
                            type: type,
                            title: title,
                            description: description,
                            year: year,
                            favourite: false
                        }
                    }
                }
            );
            res.status(200).json({ message: 'Contenuto aggiunto con successo' });
        }
    } catch (error) {
        console.error('Errore durante il recupero dello stato del contenuto:', error);
        res.status(500).json({ error: 'Errore durante il recupero dello stato del contenuto' });
    }
}

const getListState = async (req, res) => {
    const id = req.headers["id"];
    const { itemId } = req.query;
    try {
        const findUser = await user.User.findOne({ _id: id });

        if (!findUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const contentItem = findUser.contentList.find(item => item.id === itemId);

        if(contentItem) res.status(200).json(contentItem);
        else res.status(404).json({ message: 'Contenuto non trovato' });
    } catch (error) {
        console.error('Errore durante il recupero dello stato del contenuto:', error);
        res.status(500).json({ error: 'Errore durante il recupero dello stato del contenuto' });
    }
}

const getList = async (req, res) => {
    const id = req.headers["id"];
    const { listType, listState, listFavourite } = req.query;
    try {
        const findUser = await user.User.findOne({ _id: id });

        if (!findUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        let response = [];

        if(listFavourite === 'true') response = findUser.contentList.filter(item => item.status === listState && item.type === listType && item.favourite === true).sort((a, b) => b.vote - a.vote);
        else response = findUser.contentList.filter(item => item.status === listState && item.type === listType).sort((a, b) => b.vote - a.vote);

        res.status(200).json(response);
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
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        await user.User.findByIdAndUpdate(
            id,
            { $pull: { contentList: { id: itemId } } }
        );

        console.log('Contenuto rimosso con successo');
        res.status(200).json({ message: 'Film rimosso con successo' });

    } catch (error) {
        console.error('Errore durante la rimozione del contenuto:', error);
        res.status(500).json({ error: 'Errore durante la rimozione del contenuto' });
    }
}

const setProfileImage = async (req, res) => {
    const id = req.headers["id"];
    const { image, selection, radius } = req.body;

    try{
        const findUser = await user.User.findOne({ _id: id });

        if (!findUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.User.updateOne(
            { _id: id },
            {
                $set: {
                    'kingContent.img': image,
                    'kingContent.crop.selection.x': selection.x,
                    'kingContent.crop.selection.y': selection.y,
                    'kingContent.crop.radius': radius
                }
            }
        );

        console.log('Immagine profilo aggiornata con successo');

        res.status(200).json({ message: 'Immagine profilo aggiornata con successo' });

    }catch (error) {
        console.error('Errore durante il recupero dello stato del contenuto:', error);
        res.status(500).json({ error: 'Errore durante il recupero dello stato del contenuto' });
    }
}

const getProfileImage = async (req, res) => {
    const id = req.headers["id"];
    try {
        const findUser = await user.User.findOne({ _id: id });

        if (!findUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('Immagine profilo trovata');
        res.status(200).json(findUser.kingContent);
    } catch (error) {
        console.error('Errore durante il recupero dello stato del contenuto:', error);
        res.status(500).json({ error: 'Errore durante il recupero dello stato del contenuto' });
    }
}

module.exports = {
    authUser,
    favourite,
    getFavoriteState,
    changeList,
    getListState,
    getList,
    removeFromList,
    setProfileImage,
    getProfileImage
}