import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';

// Spotify configuration
const SPOTIFY_CLIENT_ID = '692f9e40f1cf4d1f99b49c78577bad71'; // Replace with your Spotify Client ID
const SPOTIFY_REDIRECT_URI = 'http://127.0.0.1:3000'; // Removed http:// prefix
const SPOTIFY_SCOPES = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state';

export default function MusicPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSong, setCurrentSong] = useState('');
    const [isVisible, setIsVisible] = useState(true);
    const [activeTab, setActiveTab] = useState('music'); // 'music' or 'radio' or 'spotify'
    const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
    const [spotifyPlayer, setSpotifyPlayer] = useState(null);
    const audioRef = useRef(null);

    const radioStations = [
        {
            name: "Classic Rock Radio",
            url: "https://streaming.radio.co/s8e9e7c5e9/listen",
            genre: "Rock"
        },
        {
            name: "Jazz FM",
            url: "https://jazz-wr06.ice.infomaniak.ch/jazz-wr06-128.mp3",
            genre: "Jazz"
        },
        {
            name: "Chill Radio",
            url: "https://streaming.radio.co/s8e9e7c5e9/listen",
            genre: "Chill"
        },
        {
            name: "Nature Sounds",
            url: "https://streaming.radio.co/s8e9e7c5e9/listen",
            genre: "Ambient"
        },
        {
            name: "Classical Radio",
            url: "https://streaming.radio.co/s8e9e7c5e9/listen",
            genre: "Classical"
        },
        {
            name: "Blues Radio",
            url: "https://streaming.radio.co/s8e9e7c5e9/listen",
            genre: "Blues"
        }
    ];

    // Handle Spotify authentication callback
    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get('access_token');
            const tokenType = params.get('token_type');
            const expiresIn = params.get('expires_in');
            
            if (accessToken) {
                // Store the token in localStorage
                localStorage.setItem('spotify_access_token', accessToken);
                localStorage.setItem('spotify_token_type', tokenType);
                localStorage.setItem('spotify_expires_in', expiresIn);
                localStorage.setItem('spotify_token_timestamp', Date.now());
                
                setIsSpotifyConnected(true);
                
                // Remove the hash from URL
                window.history.pushState('', document.title, window.location.pathname);
            }
        }
    }, []);

    // Check if token is expired
    const isTokenExpired = () => {
        const tokenTimestamp = localStorage.getItem('spotify_token_timestamp');
        const expiresIn = localStorage.getItem('spotify_expires_in');
        
        if (!tokenTimestamp || !expiresIn) return true;
        
        const elapsedTime = Date.now() - Number(tokenTimestamp);
        return elapsedTime / 1000 > Number(expiresIn);
    };

    // Handle Spotify login
    const handleSpotifyLogin = () => {
        const authEndpoint = 'https://accounts.spotify.com/authorize';
        const params = new URLSearchParams({
            client_id: SPOTIFY_CLIENT_ID,
            response_type: 'token',
            redirect_uri: SPOTIFY_REDIRECT_URI,
            scope: SPOTIFY_SCOPES,
            show_dialog: true
        });
        window.location.href = `${authEndpoint}?${params.toString()}`;
    };

    // Initialize Spotify Web Playback SDK
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const token = localStorage.getItem('spotify_access_token');
            if (!token || isTokenExpired()) {
                setIsSpotifyConnected(false);
                return;
            }

            const player = new window.Spotify.Player({
                name: 'ThreeJS Game Player',
                getOAuthToken: cb => { cb(token); },
                volume: 0.5
            });

            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                setSpotifyPlayer(player);
            });

            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            player.addListener('initialization_error', ({ message }) => {
                console.error('Failed to initialize:', message);
            });

            player.addListener('authentication_error', ({ message }) => {
                console.error('Failed to authenticate:', message);
                setIsSpotifyConnected(false);
            });

            player.addListener('account_error', ({ message }) => {
                console.error('Failed to validate Spotify account:', message);
            });

            player.connect();
        };
    }, []);

    const handleSpotifyPlay = async (trackUri) => {
        if (!spotifyPlayer) return;

        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/play', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('spotify_access_token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uris: [trackUri],
                }),
            });

            if (response.ok) {
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('Error playing track:', error);
        }
    };

    const handleSpotifyPause = async () => {
        if (!spotifyPlayer) return;

        try {
            await fetch('https://api.spotify.com/v1/me/player/pause', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('spotify_access_token')}`,
                },
            });
            setIsPlaying(false);
        } catch (error) {
            console.error('Error pausing track:', error);
        }
    };

    const handleSpotifyResume = async () => {
        if (!spotifyPlayer) return;

        try {
            await fetch('https://api.spotify.com/v1/me/player/play', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('spotify_access_token')}`,
                },
            });
            setIsPlaying(true);
        } catch (error) {
            console.error('Error resuming track:', error);
        }
    };

    const handlePlay = (url) => {
        if (audioRef.current) {
            audioRef.current.pause();
        }

        const audio = new Audio(url);
        audioRef.current = audio;
        audio.play()
            .then(() => {
                setIsPlaying(true);
                setCurrentSong(url);
            })
            .catch(error => {
                console.error('Error playing audio:', error);
            });
    };

    const handleStop = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
            setCurrentSong('');
        }
    };

    const handlePause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleResume = () => {
        if (audioRef.current) {
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(error => console.error('Error resuming audio:', error));
        }
    };

    const handleToggleVisibility = (e) => {
        e.stopPropagation();
        setIsVisible(!isVisible);
    };

    const handleClick = (e) => {
        e.stopPropagation();
    };

    if (!isVisible) {
        return (
            <div 
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 1000
                }}
                onClick={handleToggleVisibility}
            >
                <button 
                    style={{
                        padding: '10px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        cursor: 'pointer',
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    🎵
                </button>
            </div>
        );
    }

    return (
        <div 
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: '10px',
                borderRadius: '8px',
                color: 'white',
                zIndex: 1000,
                width: '300px'
            }}
            onClick={handleClick}
        >
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '10px'
            }}>
                <h3 style={{ margin: 0 }}>Music Player</h3>
                <button 
                    onClick={handleToggleVisibility}
                    style={{
                        padding: '5px 10px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: 'white',
                        cursor: 'pointer'
                    }}
                >
                    ×
                </button>
            </div>

            <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginBottom: '10px',
                borderBottom: '1px solid rgba(255,255,255,0.2)',
                paddingBottom: '10px'
            }}>
                <button
                    onClick={() => setActiveTab('music')}
                    style={{
                        padding: '5px 10px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: activeTab === 'music' ? '#4CAF50' : 'transparent',
                        color: 'white',
                        cursor: 'pointer'
                    }}
                >
                    Music
                </button>
                <button
                    onClick={() => setActiveTab('radio')}
                    style={{
                        padding: '5px 10px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: activeTab === 'radio' ? '#4CAF50' : 'transparent',
                        color: 'white',
                        cursor: 'pointer'
                    }}
                >
                    Radio
                </button>
                <button
                    onClick={() => setActiveTab('spotify')}
                    style={{
                        padding: '5px 10px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: activeTab === 'spotify' ? '#4CAF50' : 'transparent',
                        color: 'white',
                        cursor: 'pointer'
                    }}
                >
                    Spotify
                </button>
            </div>

            {activeTab === 'spotify' ? (
                <div>
                    {!isSpotifyConnected ? (
                        <button
                            onClick={handleSpotifyLogin}
                            style={{
                                padding: '10px',
                                borderRadius: '4px',
                                border: 'none',
                                backgroundColor: '#1DB954',
                                color: 'white',
                                cursor: 'pointer',
                                width: '100%'
                            }}
                        >
                            Connect to Spotify
                        </button>
                    ) : (
                        <div>
                            <p>Connected to Spotify!</p>
                            <button
                                onClick={() => handleSpotifyPlay('spotify:track:4iV5W9uYEdYUVa79Axb7Rh')}
                                style={{
                                    padding: '10px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    backgroundColor: '#1DB954',
                                    color: 'white',
                                    cursor: 'pointer',
                                    width: '100%',
                                    marginBottom: '10px'
                                }}
                            >
                                Play Sample Track
                            </button>
                            {isPlaying ? (
                                <button
                                    onClick={handleSpotifyPause}
                                    style={{
                                        padding: '10px',
                                        borderRadius: '4px',
                                        border: 'none',
                                        backgroundColor: '#f44336',
                                        color: 'white',
                                        cursor: 'pointer',
                                        width: '100%'
                                    }}
                                >
                                    Pause
                                </button>
                            ) : (
                                <button
                                    onClick={handleSpotifyResume}
                                    style={{
                                        padding: '10px',
                                        borderRadius: '4px',
                                        border: 'none',
                                        backgroundColor: '#1DB954',
                                        color: 'white',
                                        cursor: 'pointer',
                                        width: '100%'
                                    }}
                                >
                                    Resume
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ) : activeTab === 'music' ? (
                <>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <button 
                            onClick={() => handlePlay('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3')}
                            style={{
                                padding: '5px 10px',
                                borderRadius: '4px',
                                border: 'none',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            Play Forest Music
                        </button>
                        <button 
                            onClick={() => handlePlay('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3')}
                            style={{
                                padding: '5px 10px',
                                borderRadius: '4px',
                                border: 'none',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            Play Rain Music
                        </button>
                    </div>
                </>
            ) : (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {radioStations.map((station, index) => (
                        <div 
                            key={index}
                            style={{
                                padding: '10px',
                                marginBottom: '5px',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                            onClick={() => handlePlay(station.url)}
                        >
                            <div style={{ fontWeight: 'bold' }}>{station.name}</div>
                            <div style={{ fontSize: '0.8em', color: '#aaa' }}>{station.genre}</div>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {isPlaying ? (
                    <>
                        <button 
                            onClick={handlePause}
                            style={{
                                padding: '5px 10px',
                                borderRadius: '4px',
                                border: 'none',
                                backgroundColor: '#f44336',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            Pause
                        </button>
                        <button 
                            onClick={handleStop}
                            style={{
                                padding: '5px 10px',
                                borderRadius: '4px',
                                border: 'none',
                                backgroundColor: '#f44336',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            Stop
                        </button>
                    </>
                ) : currentSong ? (
                    <button 
                        onClick={handleResume}
                        style={{
                            padding: '5px 10px',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        Resume
                    </button>
                ) : null}
            </div>
        </div>
    );
} 