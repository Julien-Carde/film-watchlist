import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MovieCard.css';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export default function MovieCard({ movie, onRemove, onMovieSelect }) {
    const [isHovered, setIsHovered] = useState(false);
    const [alternateBackdrop, setAlternateBackdrop] = useState(null);

    const imageUrl = (path, type) => {
        if (!path) return ''; // Handle missing images
        return `https://image.tmdb.org/t/p/${type === 'backdrop' ? 'w1280' : 'w500'}${path}`;
    };

    useEffect(() => {
        const fetchAlternateBackdrop = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/movie/${movie.id}/images`, {
                    params: {
                        api_key: API_KEY
                    }
                });
                // Get all backdrops except the primary one
                const alternateBackdrops = response.data.backdrops
                    .filter(img => img.file_path !== movie.backdrop_path)
                    .sort((a, b) => b.vote_average - a.vote_average);
                
                if (alternateBackdrops.length > 0) {
                    setAlternateBackdrop(alternateBackdrops[0].file_path);
                }
            } catch (error) {
                console.error("Error fetching alternate backdrop:", error);
            }
        };

        if (movie.id) {
            fetchAlternateBackdrop();
        }
    }, [movie.id, movie.backdrop_path]);

    const handleClick = (e) => {
        if (!e.target.classList.contains('remove-button')) {
            onMovieSelect(movie);
        }
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        const card = e.currentTarget.closest('.movie-card');
        card.classList.add('removing');
        
        // Wait for animation to complete before actual removal
        setTimeout(() => {
            onRemove(movie.id);
        }, 300);
    };

    return (
        <div className="movie-card" onClick={handleClick}>
            <button className="remove-button" onClick={handleRemove}>×</button>
            <div 
                className="image-container"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <img 
                    src={imageUrl(movie.backdrop_path || movie.poster_path, 'backdrop')} 
                    alt={movie.title}
                    className={`grid-image ${isHovered ? 'fade-out' : 'fade-in'}`}
                />
                {alternateBackdrop && (
                    <img 
                        src={imageUrl(alternateBackdrop, 'backdrop')} 
                        alt={`${movie.title} alternate`}
                        className={`grid-image hover-image ${isHovered ? 'fade-in' : 'fade-out'}`}
                    />
                )}
            </div>
            <img 
                src={imageUrl(movie.poster_path, 'poster')} 
                alt={movie.title}
                className="list-image" 
            />
            <div className='movie-info'>
                <div className="movie-title">{movie.title}</div>
                <div className="movie-year">{movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</div>
                <div className='movie-director'>{movie.director}</div>
                <div className="movie-description">{movie.overview}</div>
            </div>
        </div>
    );
}