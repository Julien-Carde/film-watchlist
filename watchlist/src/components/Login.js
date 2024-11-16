import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const API_URL = process.env.REACT_APP_API_URL;

console.log('Using API URL:', API_URL);

export default function Login({ onLogin }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            console.log('Attempting to connect to:', API_URL);
            const endpoint = isRegistering ? '/api/register' : '/api/login';
            const response = await axios.post(`${API_URL}${endpoint}`, {
                username,
                password
            });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', username);
            onLogin(username);
        } catch (error) {
            console.error('Auth error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            setError(isRegistering ? 'Registration failed' : 'Login failed');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>{isRegistering ? 'Register' : 'Login'}</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">
                        {isRegistering ? 'Register' : 'Login'}
                    </button>
                </form>
                <p className="toggle-form">
                    {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button 
                        className="toggle-button"
                        onClick={() => setIsRegistering(!isRegistering)}
                    >
                        {isRegistering ? 'Login' : 'Register'}
                    </button>
                </p>
            </div>
        </div>
    );
}