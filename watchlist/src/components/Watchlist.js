// Watchlist.js
import React from "react";
import MovieCard from './MovieCard';
import './Watchlist.css';

export default function Watchlist({ watchlist, onRemove, isGrid, onMovieSelect }) {
    if (watchlist.length === 0) {
        return (
            <div className="empty-watchlist">
                <p>Your watchlist</p>
                <p>Use the search bar above to find and add movies</p>
            </div>
        );
    }

    return (
        <div className={`watchlist ${isGrid ? "grid" : "list"}`}>
            {watchlist.map((movie) => (
                <MovieCard 
                    key={movie.id} 
                    movie={movie} 
                    onRemove={onRemove}
                    onMovieSelect={onMovieSelect}
                />
            ))}
        </div>
    );
}