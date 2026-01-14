// components/Clima.js
import React, { useState, useEffect } from 'react';
import './Clima_style.css';

const Clima = () => {
    const [climaData, setClimaData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [ciudad, setCiudad] = useState('Lima');
    const [usingMockData, setUsingMockData] = useState(false);

    // Función para obtener datos mock (simulados) cuando la API falle
    const getMockClimaData = (ciudadNombre) => {
        const mockData = {
            'lima': {
                name: 'Lima',
                sys: { country: 'PE' },
                main: {
                    temp: 22,
                    feels_like: 24,
                    humidity: 78,
                    pressure: 1013
                },
                weather: [{ 
                    description: 'parcialmente nublado',
                    icon: '02d'
                }],
                wind: { speed: 3.5 },
                visibility: 10000
            },
            'london': {
                name: 'London',
                sys: { country: 'GB' },
                main: {
                    temp: 15,
                    feels_like: 14,
                    humidity: 82,
                    pressure: 1012
                },
                weather: [{ 
                    description: 'ligera llovizna',
                    icon: '09d'
                }],
                wind: { speed: 4.2 },
                visibility: 8000
            },
            'tokyo': {
                name: 'Tokyo',
                sys: { country: 'JP' },
                main: {
                    temp: 18,
                    feels_like: 19,
                    humidity: 65,
                    pressure: 1015
                },
                weather: [{ 
                    description: 'soleado',
                    icon: '01d'
                }],
                wind: { speed: 2.1 },
                visibility: 12000
            }
        };

        return mockData[ciudadNombre.toLowerCase()] || mockData['lima'];
    };

    const fetchClima = async () => {
        setLoading(true);
        setError(null);
        setUsingMockData(false);
        
        try {
            // Intentar con API real primero
            const API_KEY = 'demo_key'; // Clave demo - usar una real en producción
            const URL = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${API_KEY}&units=metric&lang=es`;
            
            const response = await fetch(URL);
            
            if (!response.ok) {
                throw new Error('API no disponible, usando datos de demostración');
            }
            
            const data = await response.json();
            setClimaData(data);
            
        } catch (err) {
            console.log('Usando datos mock:', err.message);
            // Si falla la API, usar datos mock
            const mockData = getMockClimaData(ciudad);
            setClimaData(mockData);
            setUsingMockData(true);
            setError('Modo demostración: Datos simulados');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClima();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (ciudad.trim()) {
            fetchClima();
        }
    };

    const ciudadesPopulares = ['Lima', 'London', 'Tokyo', 'New York', 'Madrid', 'Paris'];

    return (
        <div className="clima-container">
            <div className="clima-header">
                <h1>🌤️ Clima Actual</h1>
                
                {usingMockData && (
                    <div className="clima-demo-warning">
                        ⚠️ Modo demostración - Datos simulados
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="clima-form">
                    <div className="input-group">
                        <input
                            type="text"
                            value={ciudad}
                            onChange={(e) => setCiudad(e.target.value)}
                            placeholder="Ingresa una ciudad..."
                            className="clima-input"
                        />
                        <button type="submit" className="clima-button">
                            🔍 Buscar
                        </button>
                    </div>
                </form>

                <div className="ciudades-rapidas">
                    <p>Ciudades rápidas:</p>
                    <div className="ciudades-botones">
                        {ciudadesPopulares.map(ciudadPopular => (
                            <button
                                key={ciudadPopular}
                                type="button"
                                className="ciudad-rapida-btn"
                                onClick={() => {
                                    setCiudad(ciudadPopular);
                                    setTimeout(() => fetchClima(), 100);
                                }}
                            >
                                {ciudadPopular}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading && (
                <div className="clima-loading">
                    <div className="spinner"></div>
                    <p>Cargando información del clima...</p>
                </div>
            )}

            {error && !usingMockData && (
                <div className="clima-error">
                    <p>❌ {error}</p>
                </div>
            )}

            {climaData && !loading && (
                <div className="clima-info">
                    <div className="clima-ciudad">
                        <h2>{climaData.name}, {climaData.sys.country}</h2>
                        {usingMockData && (
                            <span className="demo-badge">DEMO</span>
                        )}
                    </div>
                    
                    <div className="clima-temperatura">
                        <span className="temp-actual">
                            {Math.round(climaData.main.temp)}°C
                        </span>
                        <span className="temp-sensacion">
                            Sensación: {Math.round(climaData.main.feels_like)}°C
                        </span>
                    </div>
                    
                    <div className="clima-descripcion">
                        <img
                            src={`https://openweathermap.org/img/wn/${climaData.weather[0].icon}@2x.png`}
                            alt={climaData.weather[0].description}
                            onError={(e) => {
                                e.target.src = `https://via.placeholder.com/100x100/4A90E2/FFFFFF?text=🌤️`;
                            }}
                        />
                        <p>{climaData.weather[0].description}</p>
                    </div>
                    
                    <div className="clima-detalles">
                        <div className="detalle-item">
                            <span>💧 Humedad</span>
                            <span>{climaData.main.humidity}%</span>
                        </div>
                        <div className="detalle-item">
                            <span>💨 Viento</span>
                            <span>{climaData.wind.speed} m/s</span>
                        </div>
                        <div className="detalle-item">
                            <span>📊 Presión</span>
                            <span>{climaData.main.pressure} hPa</span>
                        </div>
                        <div className="detalle-item">
                            <span>👀 Visibilidad</span>
                            <span>{(climaData.visibility / 1000).toFixed(1)} km</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clima;