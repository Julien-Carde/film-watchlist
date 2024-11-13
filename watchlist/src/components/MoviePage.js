import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MoviePage.css';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const formatCountryName = (countryName) => {
    const countryMappings = {
        'United States of America': 'USA',
        'Soviet Union': 'USSR',
        'United Kingdom': 'UK',
    };
    
    return countryMappings[countryName] || countryName;
};

export default function MoviePage({ movie, onBack, onAddToWatchlist, onRemoveFromWatchlist, isInWatchlist, onMovieSelect }) {
    const [movieDetails, setMovieDetails] = useState(null);
    const [cast, setCast] = useState([]);
    const [trailer, setTrailer] = useState(null);
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                const [detailsRes, creditsRes, videosRes, recommendationsRes] = await Promise.all([
                    axios.get(`${BASE_URL}/movie/${movie.id}`, {
                        params: { api_key: API_KEY }
                    }),
                    axios.get(`${BASE_URL}/movie/${movie.id}/credits`, {
                        params: { api_key: API_KEY }
                    }),
                    axios.get(`${BASE_URL}/movie/${movie.id}/videos`, {
                        params: { api_key: API_KEY }
                    }),
                    axios.get(`${BASE_URL}/movie/${movie.id}/recommendations`, {
                        params: { api_key: API_KEY }
                    })
                ]);

                setMovieDetails(detailsRes.data);
                setCast(creditsRes.data.cast.slice(0, 20));
                
                const trailer = videosRes.data.results.find(
                    video => video.type === "Trailer" && video.site === "YouTube"
                );
                setTrailer(trailer);

                setRecommendations(recommendationsRes.data.results.slice(0, 10));
            } catch (error) {
                console.error("Error fetching movie details:", error);
            }
        };

        fetchMovieDetails();
    }, [movie.id]);

    const scrollContainer = (direction, containerId) => {
        const container = document.getElementById(containerId);
        const itemWidth = containerId === 'castSlider' ? 170 : 220;
        const scrollAmount = direction === 'left' ? -itemWidth * 3 : itemWidth * 3;
        
        const start = container.scrollLeft;
        const target = start + scrollAmount;
        
        // Smooth scroll animation
        const duration = 1000; // milliseconds
        const startTime = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth acceleration and deceleration
            const easeInOutCubic = progress => progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            const currentPosition = start + (target - start) * easeInOutCubic(progress);
            container.scrollLeft = currentPosition;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    };

    const handleRecommendationClick = async (recommendation, event) => {
        // Ensure we're clicking the recommendation item itself
        const clickedElement = event.target.closest('.recommendation-item');
        if (!clickedElement) return;

        try {
            const creditsRes = await axios.get(`${BASE_URL}/movie/${recommendation.id}/credits`, {
                params: {
                    api_key: API_KEY
                }
            });
            const director = creditsRes.data.crew.find(member => member.job === 'Director');
            const movieWithDirector = { 
                ...recommendation, 
                director: director ? director.name : 'Unknown' 
            };
            
            onMovieSelect(movieWithDirector);
            window.scrollTo(0, 0);
        } catch (error) {
            console.error("Error fetching director data:", error);
        }
    };

    if (!movieDetails) return <div>Loading...</div>;

    return (
        <div className="movie-page">
            <div className="movie-page-navigation">
                <button className="back-button" onClick={onBack}>← Back to Watchlist</button>
                {isInWatchlist ? (
                    <button 
                        className="watchlist-action-button remove" 
                        onClick={() => onRemoveFromWatchlist(movie.id)}
                    >
                        Remove from Watchlist
                    </button>
                ) : (
                    <button 
                        className="watchlist-action-button add" 
                        onClick={() => onAddToWatchlist(movie)}
                        disabled={isInWatchlist}
                    >
                        Add to Watchlist
                    </button>
                )}
            </div>

            <div className="movie-page-header">
                <img 
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="movie-poster"
                />
                <div className="movie-header-info">
                    <h1>{movie.title}</h1>
                    <p className="movie-meta">
                        {movieDetails.release_date.split('-')[0]} <span>•</span> 
                        {movieDetails.runtime} min <span>•</span> 
                        {movieDetails.production_countries && movieDetails.production_countries[0] && (
                            <>{formatCountryName(movieDetails.production_countries[0].name)} <span>•</span></>
                        )}
                        {' '}{movieDetails.genres.map(g => g.name).join(', ')}
                    </p>
                    <p className="director">Director: {movie.director}</p>
                    <p className="overview">{movie.overview}</p>
                    <div className="rating">
                        <span>★</span> {movieDetails.vote_average.toFixed(1)}/10
                    </div>
                </div>
            </div>

            {trailer && (
                <div className="trailer-section">
                    <h2>Trailer</h2>
                    <div className="trailer-container">
                        <iframe
                            src={`https://www.youtube.com/embed/${trailer.key}`}
                            title="Movie Trailer"
                            frameBorder="0"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}

            <div className="slider-section">
                <h2>Cast</h2>
                <div className="slider-container">
                    <button 
                        className="scroll-button left" 
                        onClick={() => scrollContainer('left', 'castSlider')}
                    >
                        ‹
                    </button>
                    <div className="slider-content" id="castSlider">
                        {cast.map(actor => (
                            <div key={actor.id} className="cast-member">
                                <img 
                                    src={actor.profile_path 
                                        ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                                        : 'https://cdn.vectorstock.com/i/preview-1x/77/72/person-gray-photo-placeholder-man-vector-24547772.jpg'
                                    }
                                    alt={actor.name}
                                />
                                <p className="actor-name">{actor.name}</p>
                                <p className="character-name">{actor.character}</p>
                            </div>
                        ))}
                    </div>
                    <button 
                        className="scroll-button right" 
                        onClick={() => scrollContainer('right', 'castSlider')}
                    >
                        ›
                    </button>
                </div>
            </div>

            <div className="slider-section">
                <h2>Similar Movies</h2>
                <div className="slider-container">
                    <button 
                        className="scroll-button left" 
                        onClick={() => scrollContainer('left', 'recommendationsSlider')}
                    >
                        ‹
                    </button>
                    <div className="slider-content" id="recommendationsSlider">
                        {recommendations.map(rec => (
                            <div 
                                key={rec.id} 
                                className="recommendation-item"
                                onClick={(e) => handleRecommendationClick(rec, e)}
                            >
                                <img 
                                    src={rec.poster_path ? `https://image.tmdb.org/t/p/w300${rec.poster_path}` : '/no_image_movies.png'}
                                    alt={rec.title}
                                    draggable="false"
                                />
                                <p className="recommendation-title">{rec.title}</p>
                                <p className="recommendation-year">
                                    {rec.release_date ? rec.release_date.split('-')[0] : 'N/A'}
                                </p>
                            </div>
                        ))}
                    </div>
                    <button 
                        className="scroll-button right" 
                        onClick={() => scrollContainer('right', 'recommendationsSlider')}
                    >
                        ›
                    </button>
                </div>
            </div>
        </div>
    );
} 