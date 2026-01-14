import React, { useState, useEffect } from 'react';
import './Pokemon_style.css';

const Pokemon = () => {
    const [allPokemon, setAllPokemon] = useState([]);
    const [currentPageData, setCurrentPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pokemonDetails, setPokemonDetails] = useState(null);

    const POKEMON_PER_PAGE = 10;

    const fetchAllPokemon = async () => {
        setLoading(true);
        try {
            const initialResponse = await fetch('https://pokeapi.co/api/v2/pokemon/?limit=1');
            const initialData = await initialResponse.json();
            const totalCount = initialData.count;

            const allResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/?limit=${totalCount}`);
            const allData = await allResponse.json();

            const sortedPokemon = allData.results.sort((a, b) => 
                a.name.localeCompare(b.name)
            );

            setAllPokemon(sortedPokemon);
            setTotalPages(Math.ceil(sortedPokemon.length / POKEMON_PER_PAGE));
            loadPage(1, sortedPokemon);
            setLoading(false);

        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const loadPage = (pageNumber, pokemonList = allPokemon) => {
        const startIndex = (pageNumber - 1) * POKEMON_PER_PAGE;
        const endIndex = startIndex + POKEMON_PER_PAGE;
        const pageData = pokemonList.slice(startIndex, endIndex);
        
        setCurrentPageData(pageData);
        setCurrentPage(pageNumber);
    };

    const fetchPokemonDetails = (url) => {
        setLoading(true);
        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al obtener los detalles del Pokémon');
                }
                return response.json();
            })
            .then((data) => {
                setPokemonDetails(data);
                setLoading(false);
            })
            .catch((error) => {
                setError(error.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchAllPokemon();
    }, []);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            loadPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            loadPage(currentPage - 1);
        }
    };

    const handlePokemonClick = (url) => {
        fetchPokemonDetails(url);
    };

    const renderPageNumbers = () => {
        const pages = [];
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => loadPage(i)}
                    className={`page-number-button ${currentPage === i ? 'active' : ''}`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    // Función para obtener la mejor imagen disponible
    const getPokemonImage = (pokemon) => {
        return (
            pokemon.sprites?.other?.dream_world?.front_default ||
            pokemon.sprites?.other?.['official-artwork']?.front_default ||
            pokemon.sprites?.other?.home?.front_default ||
            pokemon.sprites?.front_default ||
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/0.png'
        );
    };

    if (loading && !currentPageData) {
        return (
            <div className="pokedex-container">
                <div className="loading-state">
                    <h2>🔄 Cargando todos los Pokémon...</h2>
                    <p>Esto puede tomar unos segundos</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pokedex-container">
                <div className="error-state">
                    <h2>❌ Error: {error}</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="pokedex-container">
            <div className="pokedex-left">
                <div className="pokeball-inside-circle"></div>
                
                <h2>Lista de Pokémon</h2>

                <div className="page-info">
                    Página {currentPage} de {totalPages}
                    <br />
                    <small>Total: {allPokemon.length} Pokémon</small>
                </div>

                <ul className="pokemon-list">
                    {currentPageData &&
                        currentPageData.map((pokemon, index) => (
                            <li 
                                key={pokemon.name} 
                                className="pokemon-item"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <button
                                    onClick={() => handlePokemonClick(pokemon.url)}
                                    className="pokemon-link"
                                >
                                    {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                                </button>
                            </li>
                        ))}
                </ul>

                <div className="pagination">
                    <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="pagination-button prev-next-button"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                        </svg>
                        Anterior
                    </button>

                    <div className="page-numbers">
                        {renderPageNumbers()}
                    </div>

                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="pagination-button prev-next-button"
                    >
                        Siguiente
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                        </svg>
                    </button>
                </div>

                <div className="page-range">
                    Mostrando {((currentPage - 1) * POKEMON_PER_PAGE) + 1} - {Math.min(currentPage * POKEMON_PER_PAGE, allPokemon.length)} de {allPokemon.length}
                </div>
            </div>

            <div className="pokedex-right">
                {pokemonDetails ? (
                    <div className="detail-box">
                        <h3 className="pokemon-detail-name">{pokemonDetails.name}</h3>
                        
                        {/* Imagen mejorada con respaldos */}
                        <div className="pokemon-image-container">
                            <img
                                src={getPokemonImage(pokemonDetails)}
                                alt={pokemonDetails.name}
                                className="pokemon-detail-image"
                                onError={(e) => {
                                    e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/0.png';
                                    e.target.style.filter = 'grayscale(0.3)';
                                }}
                            />
                            {!pokemonDetails.sprites?.other?.dream_world?.front_default && (
                                <div className="image-quality-note">
                                    <small>Imagen alternativa</small>
                                </div>
                            )}
                        </div>
                        
                        <div className="pokemon-stats">
                            <div className="stat-item">
                                <span className="stat-label">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="stat-icon">
                                        <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2Z"/>
                                    </svg>
                                    Altura
                                </span>
                                <span className="stat-value">{pokemonDetails.height * 10} cm</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="stat-icon">
                                        <path d="M12,3A4,4 0 0,1 16,7C16,7.73 15.81,8.41 15.46,9H18C18.95,9 19.75,9.67 19.95,10.56C21.96,18.57 22,18.78 22,19A2,2 0 0,1 20,21H4A2,2 0 0,1 2,19C2,18.78 2.04,18.57 4.05,10.56C4.25,9.67 5.05,9 6,9H8.54C8.19,8.41 8,7.73 8,7A4,4 0 0,1 12,3Z"/>
                                    </svg>
                                    Peso
                                </span>
                                <span className="stat-value">{pokemonDetails.weight / 10} kg</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="stat-icon">
                                        <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C14.8,13.1 13.4,14.7 12,14.7C10.6,14.7 9.2,13.1 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,9.5V11.5C10.5,12.3 11.2,12.8 12,12.8C12.8,12.8 13.5,12.3 13.5,11.5V9.5C13.5,8.7 12.8,8.2 12,8.2Z"/>
                                    </svg>
                                    Experiencia Base
                                </span>
                                <span className="stat-value">{pokemonDetails.base_experience || 'N/A'}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="stat-icon">
                                        <path d="M10,17L5,12L6.41,10.58L10,14.17L17.59,6.58L19,8M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                                    </svg>
                                    ID
                                </span>
                                <span className="stat-value">#{pokemonDetails.id}</span>
                            </div>
                        </div>

                        <div className="types-section">
                            <h4 className="section-title">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="section-icon">
                                    <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2Z"/>
                                </svg>
                                Tipos
                            </h4>
                            <ul className="pokemon-types-list">
                                {pokemonDetails.types.map((typeInfo, index) => (
                                    <li 
                                        key={typeInfo.type.name} 
                                        className="pokemon-type-item"
                                        style={{ animationDelay: `${index * 0.2}s` }}
                                    >
                                        {typeInfo.type.name}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="abilities-section">
                            <h4 className="section-title">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="section-icon">
                                    <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
                                </svg>
                                Habilidades
                            </h4>
                            <ul className="pokemon-abilities-list">
                                {pokemonDetails.abilities.map((abilityInfo, index) => (
                                    <li 
                                        key={abilityInfo.ability.name} 
                                        className="pokemon-ability-item"
                                        style={{ animationDelay: `${index * 0.15}s` }}
                                    >
                                        {abilityInfo.ability.name}
                                        {abilityInfo.is_hidden && " (Oculta)"}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="detail-box">
                        <div className="pokemon-image-container">
                            {/* CÍRCULO DE PREGUNTA CENTRADO */}
                            <div className="pokemon-question-circle">
                                ❓
                            </div>
                        </div>
                        <h3 className="pokemon-detail-name">Selecciona un Pokémon</h3>
                        <p className="selection-message">
                            Haz clic en cualquier Pokémon de la lista para ver sus detalles
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Pokemon;