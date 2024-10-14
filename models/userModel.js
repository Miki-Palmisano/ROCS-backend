const e = require('express');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    sub: {
        type: String,
        required: true,
        unique: true
    },
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
    kingContent: {
        img: {
            type: String
        },
        crop: {
            selection: {
                x: {
                    type: Number
                },
                y: {
                    type: Number
                }
            },
            radius: {
                type: Number,
                default: 50
            }
        }
    },
    contentList: [
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
                enum: ['Visto', 'Da Vedere', 'Sto Vedendo'],
                default: 'Visto'
            },
            vote: {
                type: Number,
                min: 0,
                max: 10
            },
            favourite:
            {
                type: Boolean
            }
        }
    ]
});

exports.User = mongoose.model('User', userSchema);