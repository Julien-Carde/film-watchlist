// App.js
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import Watchlist from './components/Watchlist';
import Login from './components/Login';
import axios from 'axios';
import MoviePage from './components/MoviePage';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [watchlist, setWatchlist] = useState([]);
  const [isGrid, setIsGrid] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Check for existing login session
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    if (token && savedUsername) {
      setIsLoggedIn(true);
      setUsername(savedUsername);
      // Fetch user's watchlist from MongoDB
      fetchWatchlist(token);
    }
  }, []);

  // Fetch watchlist from MongoDB
  const fetchWatchlist = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/api/watchlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWatchlist(response.data.movies || []);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      setWatchlist([]);
    }
  };

  const handleLogin = async (username) => {
    setIsLoggedIn(true);
    setUsername(username);
    const token = localStorage.getItem('token');
    await fetchWatchlist(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
    setWatchlist([]);
  };

  const addToWatchlist = async (movie) => {
    // Ensure watchlist is an array
    const currentWatchlist = Array.isArray(watchlist) ? watchlist : [];
    
    if (!currentWatchlist.some(item => item.id === movie.id)) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${API_URL}/api/watchlist/add`,
          { movie },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Ensure we're setting an array
        setWatchlist(response.data.movies || []);
      } catch (error) {
        console.error('Error adding to watchlist:', error.response?.data || error);
        // Set empty array on error
        setWatchlist([]);
      }
    }
  };

  const removeFromWatchlist = async (movieId) => {
    // Also add type checking here
    const currentWatchlist = Array.isArray(watchlist) ? watchlist : [];
    setWatchlist(currentWatchlist.filter(movie => movie.id !== movieId));
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

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/watchlist`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setWatchlist(response.data);
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      }
    };

    fetchWatchlist();
  }, []);

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      {isLoggedIn ? (
        <>
          <Header toggleView={toggleView} username={username} onLogout={handleLogout} />
          <SearchBar 
            addToWatchlist={addToWatchlist} 
            onMovieSelect={handleMovieSelect}
            watchlist={watchlist || []}
          />
          {selectedMovie ? (
            <MoviePage
              movie={selectedMovie}
              onBack={() => setSelectedMovie(null)}
              onAddToWatchlist={addToWatchlist}
              onRemoveFromWatchlist={removeFromWatchlist}
              isInWatchlist={watchlist.some(m => m.id === selectedMovie.id)}
              onMovieSelect={handleMovieSelect}
            />
          ) : (
            <Watchlist
              watchlist={watchlist || []}
              onRemove={removeFromWatchlist}
              isGrid={isGrid}
              onMovieSelect={handleMovieSelect}
            />
          )}
        </>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;