// App.js
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import Watchlist from './components/Watchlist';
import axios from 'axios';
import MoviePage from './components/MoviePage';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

function App() {
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('watchlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [isGrid, setIsGrid] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    console.log('Saving watchlist to local storage:', watchlist);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = (movie) => {
    if (watchlist.some(item => item.id === movie.id)) {
        return;
    }
    
    setWatchlist(prev => {
        const newWatchlist = [...prev, movie];
        localStorage.setItem('watchlist', JSON.stringify(newWatchlist));
        return newWatchlist;
    });
  };

  const removeFromWatchlist = (movieId) => {
    setWatchlist((prevWatchlist) => prevWatchlist.filter(movie => movie.id !== movieId));
  };

  const toggleView = (grid) => {
    setIsGrid(grid);
  };

  const handleMovieSelect = async (movie) => {
    setIsTransitioning(true);
    try {
      const creditsRes = await axios.get(`${BASE_URL}/movie/${movie.id}/credits`, {
        params: {
          api_key: API_KEY
        }
      });
      const director = creditsRes.data.crew.find(member => member.job === 'Director');
      const movieWithDirector = {
        ...movie,
        director: director ? director.name : 'Unknown'
      };
      
      setTimeout(() => {
        setSelectedMovie(movieWithDirector);
        setIsTransitioning(false);
      }, 150);
    } catch (error) {
      console.error("Error fetching director:", error);
      setIsTransitioning(false);
    }
  };

  const isMovieInWatchlist = (movieId) => {
    return watchlist.some(movie => movie.id === movieId);
  };

  const handleBackToWatchlist = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedMovie(null);
      setIsTransitioning(false);
    }, 150);
  };

  return (
    <>
      <Header toggleView={toggleView} />
      <SearchBar 
        addToWatchlist={addToWatchlist}
        onMovieSelect={handleMovieSelect}
        watchlist={watchlist}
      />
      <div className={`content ${isTransitioning ? 'transitioning' : ''}`}>
        {!selectedMovie ? (
          <Watchlist 
            watchlist={watchlist} 
            onRemove={removeFromWatchlist} 
            isGrid={isGrid}
            onMovieSelect={handleMovieSelect} 
          />
        ) : (
          <MoviePage 
            movie={selectedMovie} 
            onBack={handleBackToWatchlist}
            onAddToWatchlist={addToWatchlist}
            onRemoveFromWatchlist={removeFromWatchlist}
            isInWatchlist={isMovieInWatchlist(selectedMovie.id)}
            onMovieSelect={handleMovieSelect}
          />
        )}
      </div>
    </>
  );
}

export default App;