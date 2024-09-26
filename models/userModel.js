const e = require('express');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: false
    },
    filmList: [
        {
            title: {
                type: String
            },
            year: {
                type: String
            },
            description: {
                type: String
            },
            type: {
                type: String
            },
            id: {
                type: String
            },
            img: {
                type: String
            },
            status: {
                type: String,
                enum: ['Visto', 'Da Vedere', 'Sto Vedendo']
            },
            vote: {
                type: Number,
                min: 0,
                max: 10
            }
        }
    ],
    serieList: [
        {
            title: {
                type: String
            },
            year: {
                type: String
            },
            description: {
                type: String
            },
            type: {
                type: String,
            },
            id: {
                type: String
            },
            img: {
                type: String
            },
            status: {
                type: String,
                enum: ['Visto', 'Da Vedere', 'In Visione']
            },
            vote: {
                type: Number,
                min: 0,
                max: 10
            }
        }
    ],
    favoriteList: [
        {
            title: {
                type: String
            },
            year: {
                type: String
            },
            description: {
                type: String
            },
            id: {
                type: String
            },
            img: {
                type: String
            },
            type: {
                type: String,
                enum: ['films', 'series']
            }
        }
    ]
});

exports.User = mongoose.model('User', userSchema);