import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import './SearchBar.css';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export default function SearchBar({ addToWatchlist, onMovieSelect, watchlist = [] }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const searchBarRef = useRef(null);
    const resultsRef = useRef(null);

    const searchDirector = async (query) => {
        try {
            // Search for people (directors)
            const personResponse = await axios.get(`${BASE_URL}/search/person`, {
                params: {
                    api_key: API_KEY,
                    query: query
                }
            });

            // Filter for directors only
            const directors = personResponse.data.results.filter(person => 
                person.known_for_department === "Directing"
            );

            // Get movies for each director
            const directorMovies = await Promise.all(directors.map(async (director) => {
                const creditsResponse = await axios.get(`${BASE_URL}/person/${director.id}/movie_credits`, {
                    params: {
                        api_key: API_KEY
                    }
                });
                
                // Get movies where they were director
                return creditsResponse.data.crew
                    .filter(credit => credit.job === "Director")
                    .map(movie => ({
                        ...movie,
                        director: director.name,
                        isFromDirectorSearch: true
                    }));
            }));

            return directorMovies.flat();
        } catch (error) {
            console.error("Error searching directors:", error);
            return [];
        }
    };

    const searchMovies = async (query) => {
        try {
            const response = await axios.get(`${BASE_URL}/search/movie`, {
                params: {
                    api_key: API_KEY,
                    query: query
                }
            });
            return response.data.results.map(movie => ({
                ...movie,
                isFromDirectorSearch: false
            }));
        } catch (error) {
            console.error("Error searching movies:", error);
            return [];
        }
    };

    const performSearch = async (searchQuery) => {
        try {
            // Perform both searches
            const [directorResults, movieResults] = await Promise.all([
                searchDirector(searchQuery),
                searchMovies(searchQuery)
            ]);

            // Combine and deduplicate results
            const combinedResults = [...directorResults];
            
            // Add movies that aren't already included from director search
            movieResults.forEach(movie => {
                if (!combinedResults.some(m => m.id === movie.id)) {
                    combinedResults.push(movie);
                }
            });

            // Sort results: director matches first, then by popularity
            const sortedResults = combinedResults.sort((a, b) => {
                if (a.isFromDirectorSearch && !b.isFromDirectorSearch) return -1;
                if (!a.isFromDirectorSearch && b.isFromDirectorSearch) return 1;
                return b.popularity - a.popularity;
            });

            setResults(sortedResults);
        } catch (error) {
            console.error("Error performing search:", error);
        }
    };

    const handleInputChange = (event) => {
        const newQuery = event.target.value;
        setQuery(newQuery);
        if (newQuery) {
            performSearch(newQuery);
        } else {
            setResults([]);
        }
    };

    const handleClickOutside = (event) => {
        if (
            resultsRef.current &&
            !resultsRef.current.contains(event.target) &&
            !searchBarRef.current.contains(event.target)
        ) {
            setResults([]);
        }
    };

    const handleMovieSelect = (movie) => {
        onMovieSelect(movie);
        setResults([]); // Clear results when a movie is selected
    };

    const isInWatchlist = (movieId) => {
        return Array.isArray(watchlist) && watchlist.some(item => item.id === movieId);
    };

    const handleSearchBarClick = () => {
        if (query) {  // Only perform search if there's an existing query
            performSearch(query);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="search-bar" ref={searchBarRef}>
            <div className="search-container">
                <img 
                    src="/search-button-svgrepo-com.svg"
                    alt="Search Icon" 
                    className="search-icon" 
                />
                <input
                    type="text" 
                    placeholder="Search for a movie"
                    value={query}
                    onChange={handleInputChange}
                    onClick={handleSearchBarClick}
                />
                {results.length > 0 && (
                    <div className="search-results" ref={resultsRef}>
                        {results.map((result) => (
                            <div 
                                key={result.id} 
                                className="search-result-item"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleMovieSelect(result);
                                }}
                            >
                                <img 
                                    src={result.poster_path ? `https://image.tmdb.org/t/p/w92${result.poster_path}` : '/no_image_movies.png'} 
                                    alt={result.title} 
                                    className="result-poster"
                                />
                                <div className="result-details">
                                    <div className="result-title">{result.title}</div>
                                    <div className="result-date">
                                        {result.release_date ? result.release_date.split('-')[0] : 'N/A'}
                                    </div>
                                </div>
                                <button 
                                    className={`add-to-watchlist-button ${isInWatchlist(result.id) ? 'disabled' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isInWatchlist(result.id)) {
                                            addToWatchlist(result);
                                        }
                                    }}
                                    disabled={isInWatchlist(result.id)}
                                >
                                    +
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}