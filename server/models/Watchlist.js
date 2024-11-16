const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    movies: [{
        id: Number,
        title: String,
        poster_path: String,
        backdrop_path: String,
        release_date: String,
        overview: String,
        director: String,
        vote_average: Number
    }]
});

module.exports = mongoose.model('Watchlist', watchlistSchema); 