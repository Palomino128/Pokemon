import React, { useState, useEffect } from 'react';
import './Cartas_style.css';

const Cartas = () => {
    const [cards, setCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedCards, setMatchedCards] = useState([]);
    const [moves, setMoves] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [loadingImages, setLoadingImages] = useState(false);
    const [selectedPokemons, setSelectedPokemons] = useState([]);
    const [gameTime, setGameTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [score, setScore] = useState(0); // Puntuación que se acumula durante el juego

    // Lista de Pokémon populares y confiables (primeras generaciones)
    const POPULAR_POKEMON_IDS = [
        1, 4, 7, 25, 133, 39, 52, 16, 19, 129,
        150, 151, 6, 9, 3, 94, 143, 131, 149, 130,
        26, 59, 65, 68, 76, 78, 80, 89, 91, 103,
        107, 113, 122, 124, 131, 134, 135, 136, 143, 144,
        145, 146, 150, 151, 249, 250, 251, 382, 383, 384
    ];

    // Función para obtener la mejor imagen disponible de un Pokémon
    const getPokemonImage = (pokemonData) => {
        return (
            pokemonData.sprites?.other?.dream_world?.front_default ||
            pokemonData.sprites?.other?.['official-artwork']?.front_default ||
            pokemonData.sprites?.other?.home?.front_default ||
            pokemonData.sprites?.front_default ||
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/0.png'
        );
    };

    // Función para obtener detalles completos de un Pokémon por ID
    const fetchPokemonDetails = async (pokemonId) => {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
            if (!response.ok) {
                throw new Error(`Pokémon ${pokemonId} no encontrado`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching Pokémon details:', error);
            return null;
        }
    };

    // Función para obtener Pokémon aleatorios de forma confiable
    const fetchRandomPokemons = async (count = 8) => {
        try {
            console.log("🎲 Seleccionando Pokémon aleatorios...");
            
            const shuffledIds = [...POPULAR_POKEMON_IDS]
                .sort(() => Math.random() - 0.5)
                .slice(0, count);

            console.log("IDs seleccionados:", shuffledIds);

            const pokemonPromises = shuffledIds.map(id => fetchPokemonDetails(id));
            const pokemonResults = await Promise.all(pokemonPromises);

            const successfulPokemons = pokemonResults
                .filter(pokemon => pokemon !== null)
                .map(pokemon => ({
                    name: pokemon.name,
                    image: getPokemonImage(pokemon),
                    id: pokemon.id
                }));

            console.log("✅ Pokémon cargados exitosamente:", successfulPokemons.map(p => p.name));

            if (successfulPokemons.length < count) {
                console.log("⚠️ No hay suficientes Pokémon, agregando de respaldo...");
                const backupPokemons = [
                    { name: "pikachu", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png", id: 25 },
                    { name: "bulbasaur", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png", id: 1 },
                    { name: "charmander", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png", id: 4 },
                    { name: "squirtle", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png", id: 7 },
                    { name: "eevee", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png", id: 133 },
                    { name: "jigglypuff", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png", id: 39 },
                    { name: "meowth", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png", id: 52 },
                    { name: "psyduck", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png", id: 54 }
                ];

                const needed = count - successfulPokemons.length;
                const additionalPokemons = backupPokemons
                    .slice(0, needed)
                    .filter(backup => !successfulPokemons.some(p => p.name === backup.name));

                successfulPokemons.push(...additionalPokemons);
            }

            return successfulPokemons.slice(0, count);
        } catch (error) {
            console.error('Error fetching random Pokémon:', error);
            
            const backupPokemons = [
                { name: "pikachu", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png", id: 25 },
                { name: "bulbasaur", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png", id: 1 },
                { name: "charmander", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png", id: 4 },
                { name: "squirtle", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png", id: 7 },
                { name: "eevee", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png", id: 133 },
                { name: "jigglypuff", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png", id: 39 },
                { name: "meowth", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png", id: 52 },
                { name: "psyduck", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png", id: 54 }
            ];

            return backupPokemons.slice(0, 8);
        }
    };

    // Timer del juego
    useEffect(() => {
        let interval;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setGameTime(prevTime => prevTime + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    // Función para limpiar TODOS los datos del localStorage
    const cleanAllGameData = () => {
        console.log("🧹 Limpiando TODOS los datos del juego...");
        
        // Eliminar todas las claves relacionadas con el juego usando delete
        delete localStorage.selectedPokemons;
        delete localStorage.matchedCards;
        delete localStorage.gameProgress;
        delete localStorage.currentGame;
        delete localStorage.pokemonMemoryScore;
        
        console.log("✅ TODOS los datos eliminados del localStorage");
    };

    // Cargar Pokémon aleatorios automáticamente
    useEffect(() => {
        const loadRandomPokemons = async () => {
            setLoadingImages(true);
            
            try {
                // PRIMERO limpiar todos los datos anteriores
                cleanAllGameData();
                
                // Resetear todo el estado a cero
                setScore(0);
                setMoves(0);
                setGameTime(0);
                setFlippedCards([]);
                setMatchedCards([]);
                
                const randomPokemons = await fetchRandomPokemons(8);
                
                if (randomPokemons.length > 0) {
                    console.log("🎯 Pokémon finales para el juego:", randomPokemons.map(p => p.name));
                    setSelectedPokemons(randomPokemons);
                    setCards(generateCards(randomPokemons));
                    setGameStarted(true);
                    
                    // Iniciar timer
                    setIsTimerRunning(true);
                } else {
                    console.error("❌ No se pudieron cargar Pokémon");
                    alert('Error al cargar Pokémon. Intenta recargar la página.');
                }
            } catch (error) {
                console.error('Error loading random Pokémon:', error);
                alert('Error de conexión. Verifica tu internet y recarga la página.');
            } finally {
                setLoadingImages(false);
            }
        };

        loadRandomPokemons();
    }, []);

    // Generar las cartas duplicadas y barajadas
    const generateCards = (pokemons) => {
        const shuffledPokemons = [...pokemons, ...pokemons]
            .map((pokemon, index) => ({
                ...pokemon,
                uniqueId: `${pokemon.id}-${index}`,
                flipped: false,
                matched: false
            }))
            .sort(() => Math.random() - 0.5);

        console.log("🃏 Cartas generadas:", shuffledPokemons.length);
        return shuffledPokemons;
    };

    // Calcular puntos cuando se encuentra un par
    const calculatePairScore = () => {
        const basePoints = 50; // Puntos base por encontrar un par
        const timeBonus = Math.max(10, 30 - Math.floor(gameTime / 10)); // Bonus por tiempo
        const movesBonus = Math.max(5, 20 - Math.floor(moves / 5)); // Bonus por eficiencia
        
        const pairScore = basePoints + timeBonus + movesBonus;
        console.log(`🎯 Par encontrado! +${pairScore} puntos (base:${basePoints} + tiempo:${timeBonus} + movimientos:${movesBonus})`);
        
        return pairScore;
    };

    const handleCardClick = (clickedCard) => {
        if (flippedCards.length === 2 || 
            clickedCard.flipped || 
            clickedCard.matched) {
            return;
        }

        const updatedCards = cards.map(card =>
            card.uniqueId === clickedCard.uniqueId ? { ...card, flipped: true } : card
        );
        setCards(updatedCards);

        const newFlippedCards = [...flippedCards, clickedCard];
        setFlippedCards(newFlippedCards);

        if (newFlippedCards.length === 2) {
            setMoves(moves + 1);
            const [firstCard, secondCard] = newFlippedCards;

            if (firstCard.name === secondCard.name) {
                // PAR ENCONTRADO - Sumar puntos inmediatamente
                const pairScore = calculatePairScore();
                setScore(prevScore => prevScore + pairScore);

                setTimeout(() => {
                    const matchedUpdatedCards = updatedCards.map(card =>
                        card.name === firstCard.name ? { ...card, matched: true } : card
                    );
                    setCards(matchedUpdatedCards);
                    const newMatchedCards = [...matchedCards, firstCard, secondCard];
                    setMatchedCards(newMatchedCards);
                    setFlippedCards([]);

                    if (newMatchedCards.length === cards.length) {
                        setIsTimerRunning(false);
                        // Bonus por completar el juego
                        const completionBonus = 100;
                        setScore(prevScore => prevScore + completionBonus);
                        console.log(`🏆 Juego completado! Bonus de completación: +${completionBonus} puntos`);
                    }
                }, 500);
            } else {
                setTimeout(() => {
                    const resetCards = updatedCards.map(card =>
                        newFlippedCards.some(flipped => flipped.uniqueId === card.uniqueId) && !card.matched
                            ? { ...card, flipped: false } 
                            : card
                    );
                    setCards(resetCards);
                    setFlippedCards([]);
                }, 1000);
            }
        }
    };

    const resetGame = async () => {
        setLoadingImages(true);
        
        try {
            console.log("🔄 Reiniciando juego COMPLETO...");
            const newRandomPokemons = await fetchRandomPokemons(8);
            
            if (newRandomPokemons.length > 0) {
                console.log("✅ Nuevos Pokémon:", newRandomPokemons.map(p => p.name));
                
                // LIMPIAR TODO completamente
                cleanAllGameData();
                
                // Resetear todo el estado
                setSelectedPokemons(newRandomPokemons);
                setCards(generateCards(newRandomPokemons));
                setFlippedCards([]);
                setMatchedCards([]);
                setMoves(0);
                setGameTime(0);
                setScore(0); // Resetear puntuación a 0
                setIsTimerRunning(true);
                
                console.log("🎮 Juego reiniciado completamente - Puntuación: 0");
            }
        } catch (error) {
            console.error('Error resetting game:', error);
            alert('Error al reiniciar. Intenta de nuevo.');
        } finally {
            setLoadingImages(false);
        }
    };

    // Formatear tiempo en minutos y segundos
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getRandomPokemonTheme = () => {
        const themes = [
            { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#667eea' },
            { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: '#f5576c' },
            { background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#4facfe' },
            { background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#43e97b' },
            { background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: '#fa709a' }
        ];
        return themes[Math.floor(Math.random() * themes.length)];
    };

    const [currentTheme, setCurrentTheme] = useState(getRandomPokemonTheme());

    const renderCard = (card) => {
        const isFlipped = card.flipped || card.matched;
        
        return (
            <div
                key={card.uniqueId}
                className={`card ${isFlipped ? 'flipped' : ''} ${card.matched ? 'matched' : ''}`}
                onClick={() => handleCardClick(card)}
            >
                <div className="card-inner">
                    <div className="card-front">
                        <div className="pokeball-icon">
                            <div className="pokeball-top"></div>
                            <div className="pokeball-center"></div>
                            <div className="pokeball-bottom"></div>
                        </div>
                        <span className="card-number">?</span>
                    </div>
                    <div className="card-back">
                        <img 
                            src={card.image} 
                            alt={card.name}
                            className="carta-pokemon-image"
                            onError={(e) => {
                                console.log(`Error cargando imagen de ${card.name}, usando respaldo`);
                                e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/0.png';
                            }}
                        />
                        <p className="carta-pokemon-name">{card.name}</p>
                    </div>
                </div>
            </div>
        );
    };

    if (!gameStarted || loadingImages) {
        return (
            <div className="cartas-container" style={{ background: currentTheme.background }}>
                <div className="loading-message">
                    <h2>🎮 Juego de Cartas Pokémon</h2>
                    <p>{loadingImages ? '🎲 Buscando Pokémon aleatorios...' : 'Preparando el juego...'}</p>
                    <div className="pokeball-loading"></div>
                    {loadingImages && (
                        <div className="loading-details">
                            <p className="loading-subtext">Conectando con el mundo Pokémon...</p>
                            <div className="loading-animation">
                                <div className="pokemon-hunt">🔍</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="cartas-container" style={{ background: currentTheme.background }}>
            <div className="game-header">
                <h1>🎮 Encuentra los Pares Pokémon</h1>
                
                <div className="pokemon-list-preview">
                    <h4>Pokémon en este juego:</h4>
                    <div className="pokemon-tags">
                        {selectedPokemons.map((pokemon, index) => (
                            <span key={index} className="pokemon-tag">
                                {pokemon.name}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="game-stats">
                    <div className="stat">
                        <span className="stat-label">Tiempo:</span>
                        <span className="stat-value">{formatTime(gameTime)}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Movimientos:</span>
                        <span className="stat-value">{moves}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Pares:</span>
                        <span className="stat-value">{matchedCards.length / 2} / {selectedPokemons.length}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Puntuación:</span>
                        <span className="stat-value">{score}</span>
                    </div>
                </div>

                <button className="reset-button" onClick={resetGame}>
                    🎲 Nuevo Juego
                </button>
            </div>

            <div className="cards-grid">
                {cards.map(card => renderCard(card))}
            </div>

            {matchedCards.length === cards.length && cards.length > 0 && (
                <div className="victory-message">
                    <div className="victory-content">
                        <h2>🎉 ¡Felicidades! 🎉</h2>
                        <p>Has encontrado todos los pares Pokémon</p>
                        <p className="victory-stats">
                            Tiempo: <strong>{formatTime(gameTime)}</strong><br />
                            Movimientos totales: <strong>{moves}</strong><br />
                            Puntuación final: <strong>{score}</strong>
                        </p>
                        <p className="victory-details">
                            ¡Encontraste {selectedPokemons.length} Pokémon diferentes!<br />
                            <strong>🎯 ¡Juego completado con éxito!</strong>
                        </p>
                        <button className="play-again-button" onClick={resetGame}>
                            🎮 Juego Nuevo
                        </button>
                    </div>
                </div>
            )}

            <div className="game-instructions">
                <h3>🎯 ¡Juego Aleatorio de Pokémon!</h3>
                <ul>
                    <li>✨ <strong>8 Pokémon aleatorios</strong> en cada juego</li>
                    <li>⏱️ <strong>Tiempo medido</strong> - completa más rápido para más puntos</li>
                    <li>💰 <strong>Puntos por pares</strong> - Gana puntos cada vez que encuentres un par</li>
                    <li>⚡ <strong>Bonus por eficiencia</strong> - Menos movimientos = más puntos</li>
                    <li>🏆 <strong>Bonus final</strong> - Puntos extra por completar el juego</li>
                    <li>🔄 <strong>Reinicio completo</strong> - Cada juego comienza desde cero</li>
                </ul>
                <div className="fun-fact">
                    <strong>💡 Dato curioso:</strong> ¡Encuentra los pares rápidamente para maximizar tu puntuación!
                </div>
            </div>
        </div>
    );
};

export default Cartas;