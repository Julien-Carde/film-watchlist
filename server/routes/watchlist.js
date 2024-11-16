const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Watchlist = require('../models/Watchlist');

// Add a movie to watchlist
router.post('/add', authMiddleware, async (req, res) => {
    try {
        const { movie } = req.body;
        const userId = req.user.id;

        let watchlist = await Watchlist.findOne({ userId });
        if (!watchlist) {
            watchlist = new Watchlist({ userId, movies: [movie] });
        } else {
            if (!watchlist.movies.some(m => m.id === movie.id)) {
                watchlist.movies.push(movie);
            }
        }

        await watchlist.save();
        res.status(200).json({ movies: watchlist.movies || [] });
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).json({ movies: [], message: 'Server error' });
    }
});

// Get watchlist
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const watchlist = await Watchlist.findOne({ userId });
        res.json({ movies: watchlist?.movies || [] });
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ movies: [], message: 'Server error' });
    }
});

module.exports = router; 